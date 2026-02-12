import { useState, useEffect, useRef } from "react";
import { createClient, PostgrestError } from "@supabase/supabase-js";
import { Button } from "../ui/button";
import { Contact } from "../types/contacts";
import { useApi } from "@/lib/session_api";



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ContactFormModalProps {
  contact?: Partial<Contact>;
  onClose: () => void;
  onSave: (contact: Partial<Contact>) => void;
}

interface Tag {
  name: string;
}

export const ContactForm: React.FC<ContactFormModalProps> = ({
  contact,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Contact>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    bio: "",
    company: "",
    platform: "",
    ...contact,
    tags: Array.isArray(contact?.tags) ? contact.tags : [],
  });

  const [tagsList, setTagsList] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const api = useApi();

  // Fetch tag names from Supabase
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        // Use your API instance (axios, fetch, etc.)
        const response = await api.get<{ tags: string[] }>("/api/org/metadata/tags");
        setTagsList(response.data.tags || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTagsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName) {
      alert("First Name is required");
      return;
    }

    try {
      const contactData = {
        ...formData,
      };

      onSave(contactData);

      onClose();

    } catch (error) {
      if (error instanceof Error || error instanceof PostgrestError) {
        alert(`Error saving contact: ${error.message}`);
      } else {
        alert('An unexpected error occurred while saving the contact');
      }
    }
  };

  // push tag to API
  const toggleTag = async (tagName: string) => {
    setFormData((prevFormData) => {
      const currentTags = Array.isArray(prevFormData.tags) ? prevFormData.tags : [];
      const isRemoving = currentTags.includes(tagName);
      const newTags = isRemoving
        ? currentTags.filter((name) => name !== tagName)
        : [...currentTags, tagName];

      const optimisticFormData = { ...prevFormData, tags: newTags };
      onSave(optimisticFormData);

      (async () => {
        try {
          const response = await api.post("/api/contacts/update-categories", {
            conversation_id: contact?.conversation_id || contact?.id,
            categories: newTags,
          });

          if (!(response.status === 200 || response.data?.success)) {
            throw new Error("Failed to update categories");
          }

          // console.log("Categories updated successfully");

        } catch (error) {
          console.error("Error updating categories:", error);
          alert("Failed to update tags. Please try again.");

          const revertedFormData = { ...prevFormData, tags: currentTags };
          setFormData((current) => ({
            ...current,
            tags: currentTags,
          }));
          onSave(revertedFormData);
        }
      })();

      return optimisticFormData;
    });
  };

  const countries = [
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
  ];

  const platforms = ["Whatsapp", "Instagram"];

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-white">
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 sm:p-8 md:p-10">

          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {contact?.id ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <p className="text-slate-600">
              Please fill out the form below with the contact&apos;s information
            </p>
          </div>

          {/* Form Fields Container */}
          <div className="space-y-6">

            {/* Name Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg 
                          text-slate-900 placeholder-slate-400
                          focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                          transition-all duration-200
                          hover:border-slate-400"
                  placeholder="John"
                  value={formData.firstName || ""}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg 
                          text-slate-900 placeholder-slate-400
                          focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                          transition-all duration-200
                          hover:border-slate-400"
                  placeholder="Doe"
                  value={formData.lastName || ""}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Information Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg 
                            text-slate-900 placeholder-slate-400
                            focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                            transition-all duration-200
                            hover:border-slate-400"
                    placeholder="john@example.com"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg 
                            text-slate-900 placeholder-slate-400
                            focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                            transition-all duration-200
                            hover:border-slate-400"
                    placeholder="1234567890"
                    value={formData.phone || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phone: value });
                    }}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">10 digits, no spaces or dashes</p>
              </div>
            </div>

            {/* Location and Platform Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-slate-700 mb-2">
                  Country
                </label>
                <div className="relative">
                  <select
                    id="country"
                    name="country"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg 
                            text-slate-900 appearance-none cursor-pointer
                            focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                            transition-all duration-200
                            hover:border-slate-400"
                    value={formData.country || ""}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Platform */}
              <div>
                <label htmlFor="platform" className="block text-sm font-semibold text-slate-700 mb-2">
                  Platform
                </label>
                <div className="relative">
                  <select
                    id="platform"
                    name="platform"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg 
                            text-slate-900 appearance-none cursor-pointer
                            focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                            transition-all duration-200
                            hover:border-slate-400"
                    value={formData.platform || ""}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  >
                    <option value="">Select platform</option>
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Username */}
            {formData.platform === "Instagram" && (
              <div className="animate-slideDown">
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                  Instagram Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    @
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required={formData.platform === "Instagram"}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg 
                            text-slate-900 placeholder-slate-400
                            focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                            transition-all duration-200
                            hover:border-slate-400"
                    placeholder="username"
                    value={formData.username || ""}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Tags Section */}
            <div ref={dropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tags & Categories
              </label>

              {/* Tags Dropdown */}
              <button
                type="button"
                onClick={() => setIsTagsOpen(!isTagsOpen)}
                className="w-full min-h-[44px] px-4 py-2.5 bg-white border border-slate-300 rounded-lg 
                        text-left flex items-center justify-between gap-3
                        focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                        transition-all duration-200
                        hover:border-slate-400"
              >
                <div className="flex-1 flex flex-wrap gap-2">
                  {loadingTags ? (
                    <span className="text-slate-400 text-sm">Loading tags...</span>
                  ) : Array.isArray(formData.tags) && formData.tags.length > 0 ? (
                    formData.tags.map((tagName) => (
                      <span
                        key={tagName}
                        className="inline-flex items-center gap-1.5 px-3 py-1 
                                bg-blue-50 text-blue-700 rounded-full text-sm font-medium
                                border border-blue-200"
                      >
                        {tagName}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTag(tagName);
                          }}
                          className="hover:text-blue-900 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">Click to select tags</span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isTagsOpen ? "rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Tags Dropdown */}
              {isTagsOpen && (
                <div className="mt-2 bg-white border border-slate-300 rounded-lg shadow-lg 
                  max-h-60 overflow-y-auto animate-slideDown">
                  {tagsList.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 text-slate-300">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 text-sm">No tags available</p>
                    </div>
                  ) : (
                    tagsList.map((tag) => {
                      const isSelected = formData.tags?.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left
                        transition-colors duration-150
                        hover:bg-slate-50 active:bg-slate-100
                        ${isSelected ? "bg-blue-50" : ""}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                            transition-colors duration-150
                            ${isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-slate-300"}`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${isSelected ? "font-semibold text-blue-900" : "text-slate-700"}`}>
                            {tag}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1.5">
                Select tags to categorize this contact
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 
                      bg-white border border-slate-300 rounded-lg
                      text-slate-700 font-medium
                      hover:bg-slate-50 active:bg-slate-100
                      focus:outline-none focus:ring-4 focus:ring-slate-200
                      transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 py-2.5 
                      bg-blue-600 border border-blue-600 rounded-lg
                      text-white font-medium
                      hover:bg-blue-700 active:bg-blue-800
                      focus:outline-none focus:ring-4 focus:ring-blue-500/50
                      transition-all duration-200
                      shadow-sm hover:shadow"
            >
              {contact?.id ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
