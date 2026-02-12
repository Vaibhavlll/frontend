"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Trash, Users, X, Tag as TagIcon, Search, MessageSquare } from "lucide-react";
import { Spinner } from "./Spinner";
import { MessageComposer } from "./MessageComposer";

interface TagSidebarProps {
  tags: string[];
  tagsLoading?: boolean;
  onCreateTag: (name: string) => void;
  onDeleteTag: (name: string) => void;
  onTagSelect: (name: string | null) => void;
  selectedTag: string | null;
  error?: string | null;
  onTagModalOpen?: () => void;
  onTagModalClose?: () => void;
  onClose?: () => void;
}

const TagSidebar = ({
  tags,
  tagsLoading,
  onCreateTag,
  onDeleteTag,
  onTagSelect,
  selectedTag,
  error,
  onTagModalOpen,
  onTagModalClose,
  onClose,
}: TagSidebarProps) => {
  const [newTagName, setNewTagName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [openMenuName, setOpenMenuName] = useState<string | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [isMessageComposerOpen, setIsMessageComposerOpen] = useState(false);
  const [selectedTagForMessage, setSelectedTagForMessage] = useState<string>("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered tags based on search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const query = searchQuery.toLowerCase().trim();
    return tags.filter(tag => tag.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".kebab-menu")) {
        setOpenMenuName(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showCreateForm) {
      onTagModalOpen?.();
    } else {
      onTagModalClose?.();
    }
  }, [showCreateForm, onTagModalOpen, onTagModalClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsOperationLoading(true);
    try {
      await onCreateTag(newTagName.trim());
      setNewTagName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Create failed:", error);
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleTagSelect = (tagName: string | null) => {
    onTagSelect(tagName);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    setIsOperationLoading(true);
    try {
      await onDeleteTag(tagName);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleMessageClick = (tagName: string) => {
    setSelectedTagForMessage(tagName);
    setIsMessageComposerOpen(true);
    setOpenMenuName(null);
  };

  const handleMessageSend = (data: { tag?: string; platform: "whatsapp" | "instagram"; template: string; }) => {
    // console.log("Message sent:", data);
    setIsMessageComposerOpen(false);
    setSelectedTagForMessage("");
  };

  const shouldShowInitialLoader = tagsLoading && tags.length === 0;

  return (
    <>
      {/* Container */}
      <div className="w-full h-full bg-white flex flex-col border-r border-gray-200">
        {/* Search Bar */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 text-gray-900 text-sm rounded-xl"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {shouldShowInitialLoader ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <Spinner />
              <p className="mt-3 text-sm text-gray-500">Loading tags...</p>
            </div>
          ) : (
            <>
              {/* Action Buttons Section */}
              <div className="px-4 pb-3 flex-shrink-0 relative">
                {isOperationLoading && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border border-gray-200">
                      <Spinner />
                      <span className="text-sm text-gray-600 font-medium">Processing...</span>
                    </div>
                  </div>
                )}

                {/* Stacked Buttons */}
                <div className="flex flex-col gap-2.5">
                  {/* Create New Tag Button */}
                  <button
                    onClick={() => {
                      setShowCreateForm(true);
                    }}
                    disabled={isOperationLoading}
                    className="w-full h-10 bg-white-100 hover:bg-gray-100 active:bg-gray-100 text-black text-sm px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <h3 className="font-sans text-xs font-medium">New Tag</h3>
                  </button>
                  {/* All Customers Button */}
                  <button
                    onClick={() => handleTagSelect(null)}
                    disabled={isOperationLoading}
                    className={`w-full h-10 text-sm px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedTag === null
                        ? "bg-gray-100 text-gray-900 border border-gray-100"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 active:bg-gray-200"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <h3 className="font-sans text-xs font-medium">All Customer</h3>
                  </button>
                </div>
              </div>

              {/* Tags Section Header */}
              <div className="px-4 py-2 flex-shrink-0 border-t border-gray-200">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider">TAGS</h3>
                  <span className="text-xs text-gray-400 font-medium">{filteredTags.length}</span>
                </div>
              </div>

              {/* Tags List */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {searchQuery && filteredTags.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-1">No tags found</p>
                    <p className="text-xs text-gray-500 mb-3">No results for &quot;{searchQuery}&quot;</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                      Clear search
                    </button>
                  </div>
                )}
                {filteredTags.length === 0 && !searchQuery ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
                      <TagIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">No tags yet</p>
                    <p className="text-xs text-gray-500">Create your first tag to get started</p>
                  </div>
                ) : filteredTags.length > 0 ? (
                  // Tags List
                  <div className="space-y-1">
                    {filteredTags.map((tagName) => (
                      <div
                        key={tagName}
                        className={`group relative flex items-center justify-between py-2 px-2 rounded-md cursor-pointer transition-all ${
                          selectedTag === tagName 
                            ? "bg-gray-100 text-gray-900" 
                            : "text-gray-700 hover:bg-gray-100 active:bg-gray-100"
                        } ${isOperationLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={(e) => {
                          if (!(e.target as Element).closest('.kebab-menu') && !isOperationLoading) {
                            handleTagSelect(tagName);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-sans text-xs font-medium">{tagName}</h3>
                        </div>
                        {/* Kebab Menu */}
                        <div className="relative kebab-menu flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            className="p-1 hover:bg-gray-200 active:bg-gray-300 rounded-md transition-colors"
                            disabled={isOperationLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isOperationLoading) {
                                setOpenMenuName(openMenuName === tagName ? null : tagName);
                              }
                            }}
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
                          </button>
                          {openMenuName === tagName && !isOperationLoading && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-2 text-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMessageClick(tagName);
                                }}
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                <span>Message</span>
                              </button>
                              <div className="my-0.5 border-t border-gray-100"></div>
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm("Are you sure you want to delete this tag?")) {
                                    handleDeleteTag(tagName);
                                  }
                                  setOpenMenuName(null);
                                }}
                              >
                                <Trash className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Create Tag Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <TagIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Create New Tag</h3>
                    <p className="text-sm text-gray-500 mt-1">Add a new tag to organize contacts</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewTagName("");
                  }}
                  className="h-8 w-8 hover:bg-gray-100 active:bg-gray-200 rounded-lg flex-shrink-0 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {error && (
                <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-start gap-2">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Tag Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Enter tag name"
                    required
                    maxLength={50}
                    disabled={isOperationLoading}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTagName("");
                    }}
                    className="flex-1 h-10 border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    disabled={isOperationLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-10 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md transition-all"
                    disabled={!newTagName.trim() || isOperationLoading}
                  >
                    {isOperationLoading ? (
                      <div className="flex items-center gap-2">
                        <Spinner />
                        Creating...
                      </div>
                    ) : "Create Tag"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Message Composer Modal */}
      {isMessageComposerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl">
            <button
              onClick={() => {
                setIsMessageComposerOpen(false);
                setSelectedTagForMessage("");
              }}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <MessageComposer
              onMessageSend={handleMessageSend}
              directMode={true}
              preSelectedTag={selectedTagForMessage}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TagSidebar;
