"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import { ContactItem } from "../Contacts/ContactItem";
import { ContactListHeader } from "../Contacts/ContactListHeader";
import { PaginationFooter } from "../Contacts/PaginationFooter";
import { ContactForm } from "../Contacts/ContactFormModal";
import { Spinner } from "../Contacts/Spinner";
import TagSidebar from "./TagSidebar";
import { useApi } from "@/lib/session_api";
import { ApiContact, Contact } from "../types/contacts";
import { TagIcon, X } from "lucide-react";

type Tag = string;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const mapApiContactToContact = (apiContact: ApiContact): Contact => {
  const fullName = apiContact.full_name || "Unknown";
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] || "Unknown";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    id: apiContact.conversation_id,
    firstName,
    lastName,
    email: apiContact.email || "",
    phone: apiContact.phone_number,
    company: undefined,
    country: apiContact.country || undefined,
    tags: apiContact.categories || [],
    platform: apiContact.platform,
    profile_url: apiContact.profile_url,
    username: apiContact.username,
    instagram_id: apiContact.instagram_id,
    full_name: fullName,
    conversation_id: apiContact.conversation_id,
    categories: apiContact.categories,
  };
};

const ContactsDashboard = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importingCount, setImportingCount] = useState(0);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  const [sidebarSelectedTag, setSidebarSelectedTag] = useState<string | null>(null);
  const [filterSelectedTags, setFilterSelectedTags] = useState<string[]>([]);

  const [tagsLoading, setTagsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const api = useApi();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/contacts");

      if (!response.data || !Array.isArray(response.data.contacts)) {
        setContacts([]);
        setError("Invalid response format");
        setLoading(false);
        return;
      }

      const contactsArray: ApiContact[] = response.data.contacts;
      const mappedContacts = contactsArray.map((contact: ApiContact) => {
        return mapApiContactToContact(contact);
      });

      setContacts(mappedContacts);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to load contacts");
      } else {
        setError("Failed to load contacts");
      }
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchContacts();
      await fetchTags();
    };
    fetchInitialData();
  }, []);

  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const response = await api.get<{ tags: string[] }>(
        "/api/org/metadata/tags"
      );
      setTags(response.data.tags || []);
    } catch (err) {
      setError("Failed to load tags");
    } finally {
      setTagsLoading(false);
    }
  };

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsImporting(true);
      setError(null);
      setImportingCount(0);

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const requiredFields = ["firstName", "email"];
            const missingFields = requiredFields.filter(
              (f) => !results.meta.fields?.includes(f)
            );
            if (missingFields.length) {
              throw new Error(`Missing columns: ${missingFields.join(", ")}`);
            }

            const contactsToImport = results.data.map((row) => {
              const missing = requiredFields.filter(
                (f) => !row[f]?.toString().trim()
              );
              if (missing.length) {
                throw new Error(`Row missing: ${missing.join(", ")}`);
              }

              return {
                firstName: row.firstName?.toString().trim() || "",
                lastName: row.lastName?.toString().trim() || "",
                email: row.email?.toString().trim() || "",
                phone: row.phone?.toString().trim() || "",
                company: row.company?.toString().trim() || "",
                country: row.country?.toString().trim() || "",
                tags:
                  row.tags
                    ?.split(",")
                    .map((t) => t.trim())
                    .filter(Boolean) || [],
              };
            });

            setImportingCount(contactsToImport.length);
            const { data, error } = await supabase
              .from("contacts")
              .insert(contactsToImport)
              .select();

            if (error) throw error;
            setContacts((prev) => [
              ...prev,
              ...(data?.map((c) => ({
                ...c,
                tags: Array.isArray(c.tags) ? c.tags : [],
              })) || []),
            ]);
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setIsImporting(false);
            setImportingCount(0);
            if (event.target) event.target.value = "";
          }
        },
        error: (err) => setError(`CSV error: ${err.message}`),
      });
    },
    []
  );

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSaveContact = useCallback(
    (newContact: Partial<Contact>) => {
      const updatedContact = {
        ...newContact,
        tags: newContact.tags || [],
      };

      setContacts((prev) => {
        if (selectedContact?.id) {
          return prev.map((c) =>
            c.id === selectedContact.id
              ? ({ ...c, ...updatedContact } as Contact)
              : c
          );
        }
        return [
          ...prev,
          { ...updatedContact, id: `manual-${Date.now()}` } as Contact,
        ];
      });
    },
    [selectedContact]
  );

  const handleCreateTag = async (name: string) => {
    try {
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("Tag name is required");
      }

      await api.patch("/api/org/metadata/tags/add", null, {
        params: { tag: trimmedName },
      });

      setTags((prev) =>
        prev.includes(trimmedName) ? prev : [trimmedName, ...prev]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tag");
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    try {
      if (
        !window.confirm(`Are you sure you want to delete the tag "${tagName}"?`)
      ) {
        return;
      }

      await api.patch("/api/org/metadata/tags/remove", null, {
        params: { tag: tagName },
      });

      setTags((prev) => prev.filter((tag) => tag !== tagName));

      // Remove from both filter states if present
      if (sidebarSelectedTag === tagName) {
        setSidebarSelectedTag(null);
      }
      setFilterSelectedTags((prev) => prev.filter((tag) => tag !== tagName));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tag");
    }
  };

  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    // Sidebar tag (single selection, replaces filter button selection)
    if (sidebarSelectedTag) {
      filtered = filtered.filter((contact) =>
        contact.tags?.includes(sidebarSelectedTag) ||
        contact.categories?.includes(sidebarSelectedTag)
      );
    }
    // Filter button tags (multiple selection, only if sidebar is not active)
    else if (filterSelectedTags.length > 0) {
      filtered = filtered.filter((contact) => {
        // Contact must have at least one of the selected tags
        return filterSelectedTags.some(
          (tag) =>
            contact.tags?.includes(tag) || contact.categories?.includes(tag)
        );
      });
    }

    // Filter by search query 
    if (searchQuery) {
      filtered = filtered.filter((contact) => {
        const searchText = `${contact.firstName} ${contact.lastName} ${contact.email
          } ${contact.username || ""} ${contact.phone || ""}`;
        return searchText.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    return filtered;
  }, [contacts, searchQuery, sidebarSelectedTag, filterSelectedTags]);

  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sidebarSelectedTag, filterSelectedTags, searchQuery]);

  return (
    <div className="h-full w-full flex bg-white overflow-hidden">
      {/* Tag Sidebar */}
      <div className="w-64 flex-shrink-0 h-full bg-white border-r border-gray-200">
        <TagSidebar
          tags={tags}
          tagsLoading={tagsLoading}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
          onTagSelect={(tag) => {
            if (sidebarSelectedTag === tag) {
              setSidebarSelectedTag(null);
            } else {
              setSidebarSelectedTag(tag);
              setFilterSelectedTags([]);
            }
          }}
          selectedTag={sidebarSelectedTag}
          onTagModalOpen={() => setIsTagModalOpen(true)}
          error={error}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
        {/* Header */}
        <div className="flex-shrink-0">
          <ContactListHeader
            searchValue={searchQuery}
            onSearch={setSearchQuery}
            onAddContact={() => setSelectedContact({} as Contact)}
            onImportCSV={handleFileUpload}
            onMessageSend={() => { }}
            tags={tags}
            selectedTags={filterSelectedTags}
            onTagsChange={(tags) => {
              setFilterSelectedTags(tags);
              setSidebarSelectedTag(null);
            }}
          />
        </div>

        {/* Show active filter status */}
        {(sidebarSelectedTag || filterSelectedTags.length > 0) && (
          <div className="flex-shrink-0 bg-blue-50 border-b border-blue-100 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <TagIcon className="w-4 h-4 text-blue-600" />

                {/* Sidebar Tag Display */}
                {sidebarSelectedTag && (
                  <>
                    <span className="text-sm text-blue-900">
                      Filtered by sidebar tag:
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {sidebarSelectedTag}
                      <button
                        onClick={() => setSidebarSelectedTag(null)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  </>
                )}

                {/* Filter Button Tags Display */}
                {!sidebarSelectedTag && filterSelectedTags.length > 0 && (
                  <>
                    <span className="text-sm text-blue-900">
                      Filtered by {filterSelectedTags.length} tag{filterSelectedTags.length !== 1 ? 's' : ''}:
                    </span>
                    {filterSelectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                      >
                        {tag}
                        <button
                          onClick={() => setFilterSelectedTags(filterSelectedTags.filter((t) => t !== tag))}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </>
                )}

                <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  setSidebarSelectedTag(null);
                  setFilterSelectedTags([]);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Spinner />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">
                  {sidebarSelectedTag
                    ? `No contacts with tag "${sidebarSelectedTag}" 🔍`
                    : filterSelectedTags.length > 0
                      ? `No contacts with selected tags 🔍`
                      : searchQuery
                        ? "No matching contacts found 🔍"
                        : "No contacts found 🔍"}
                </p>
                {(sidebarSelectedTag || filterSelectedTags.length > 0 || searchQuery) && (
                  <button
                    onClick={() => {
                      setSidebarSelectedTag(null);
                      setFilterSelectedTags([]);
                      setSearchQuery("");
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Contact List */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="divide-y divide-gray-100">
                  {paginatedContacts.map((contact) => (
                    <ContactItem
                      key={contact.id}
                      contact={contact}
                      onEdit={() => handleEdit(contact)}
                      onDelete={() => handleDeleteTag(contact.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex-shrink-0">
                <PaginationFooter
                  currentPage={currentPage}
                  totalItems={filteredContacts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-md">
            <ContactForm
              contact={selectedContact}
              onClose={() => setSelectedContact(null)}
              onSave={handleSaveContact}
            />
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 text-red-700 rounded-lg shadow-lg flex items-center z-50 p-4 border border-red-200">
          <span className="text-sm flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-700 hover:text-red-900 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Import Toast */}
      {isImporting && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-blue-50 text-blue-700 rounded-lg shadow-lg flex items-center gap-3 z-50 p-4 border border-blue-200">
          <Spinner />
          <span className="text-sm">
            Importing {importingCount} contact{importingCount !== 1 ? "s" : ""}
            ...
          </span>
        </div>
      )}
    </div>
  );
};

export default ContactsDashboard;
