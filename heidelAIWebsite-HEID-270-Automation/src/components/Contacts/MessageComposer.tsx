import { useState, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { WhatsAppTemplateContent } from "./WhatsAppTemplateContent";
import { WhatsAppTemplate } from "../types/template";
import { ScrollArea } from "../ui/scroll-area";
import { useApi } from "@/lib/session_api";
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

interface MessageData {
  tag?: string;
  platform: "whatsapp" | "instagram";
  template: string;
}

interface MessageComposerProps {
  onMessageSend: (data: MessageData) => void;
  directMode?: boolean;
  preSelectedTag?: string;
}

export const MessageComposer = ({ onMessageSend, directMode = false, preSelectedTag = "" }: MessageComposerProps) => {
  const [isMessageMenuOpen, setIsMessageMenuOpen] = useState(directMode);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<
    "whatsapp" | "instagram"
  >("whatsapp");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsAppTemplate | null>(null);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [isFetchingTemplates, setIsFetchingTemplates] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const api = useApi();

  useEffect(() => {
    if (directMode) {
      setIsMessageMenuOpen(true);
    }
  }, [directMode]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get<{ tags: string[] }>("/api/org/metadata/tags");
        if (response.data && response.data.tags) {
          setTags(response.data.tags);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags([]); // Optionally clear tags on error
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsFetchingTemplates(true);
      try {
        const response = await fetch(
          `https://egenie-whatsapp.koyeb.app/api/fetch_templates?name=${encodeURIComponent(
            templateSearch
          )}`
        );

        if (!response.ok) throw new Error("Failed to fetch templates");

        const responseData = await response.json();
        const templatesData = responseData.data?.data || [];

        const sortedTemplates = [...templatesData].sort((a, b) => {
          const searchLower = templateSearch.toLowerCase();
          const aStartsWith = a.name.toLowerCase().startsWith(searchLower);
          const bStartsWith = b.name.toLowerCase().startsWith(searchLower);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return a.name.localeCompare(b.name);
        });

        setTemplates(sortedTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplates([]);
      } finally {
        setIsFetchingTemplates(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (isTemplateDropdownOpen) fetchTemplates();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [templateSearch, isTemplateDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTemplateDropdownOpen(false);
      }

      if (
        !directMode &&
        isMessageMenuOpen &&
        messageMenuRef.current &&
        !messageMenuRef.current.contains(event.target as Node) &&
        !triggerButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMessageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMessageMenuOpen, directMode]);

  useEffect(() => {
    if (preSelectedTag) {
      setSelectedTag(preSelectedTag);
    }
  }, [preSelectedTag]);

  const handleSendMessage = () => {
    if (!templateSearch) return;
    onMessageSend({
      tag: selectedTag,
      platform: selectedPlatform,
      template: templateSearch,
    });
    setIsMessageMenuOpen(false);
    setIsTemplateDropdownOpen(false);
  };

  const handleTemplateSelect = (template: WhatsAppTemplate) => {
    setTemplateSearch(template.name);
    setSelectedTemplate(template);
    setIsTemplateDropdownOpen(false);
  };

  const handleClose = () => {
    if (directMode) {
      return;
    }
    setIsMessageMenuOpen(false);
  };

  if (directMode) {
    return (
      <div className="bg-white rounded-xl shadow-xl w-full flex">
        {/* Left Form Section */}
        <div className="w-1/2 p-6 border-r border-gray-200 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-black">Compose Message</h2>

          <div className="space-y-6 flex-1">
            {/* Tags Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Select Tag
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-black"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform("whatsapp")}
                  className={`p-3 rounded-lg border text-black ${selectedPlatform === "whatsapp"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform("instagram")}
                  className={`p-3 rounded-lg border text-black ${selectedPlatform === "instagram"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  Instagram
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div className="relative" ref={templateDropdownRef}>
              <label className="block text-sm font-medium mb-2 text-black">
                Select Template
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-black"
                  onFocus={() => setIsTemplateDropdownOpen(true)}
                />

                {isTemplateDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 text-black"
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {template.category} • {template.language}
                        </div>
                        <div
                          className={`text-xs mt-1 ${template.status === "APPROVED"
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                        >
                          {template.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3 justify-end border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!templateSearch}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Send Message
            </button>
          </div>
        </div>

        {/* Right Preview Section */}
        <div className="w-1/2 p-6 bg-gray-50 rounded-r-xl">
          <h3 className="text-lg font-semibold mb-4">Template Preview</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-[500px] overflow-hidden">
            {selectedTemplate ? (
              <ScrollArea className="h-full">
                <WhatsAppTemplateContent
                  key={selectedTemplate.id}
                  template={selectedTemplate}
                  editable={false}
                />
              </ScrollArea>
            ) : (
              <div className="text-gray-400 text-center py-8">
                Select a template to preview
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={triggerButtonRef}
        onClick={() => setIsMessageMenuOpen(!isMessageMenuOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:border-black-600 transition-colors shadow-sm"
      >
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-sans text-xs font-medium">
          Message
        </h3>
      </button>

      {isMessageMenuOpen && (
        <div
          ref={messageMenuRef}
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex">
            <div className="w-1/2 p-6 border-r border-gray-200 flex flex-col">
              <h2 className="text-xl font-semibold mb-6 text-black">Compose Message</h2>
              <div className="space-y-6 flex-1">
                {/* Same form content */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Select Tag
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-black"
                  >
                    <option value="">All Tags</option>
                    {tags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Platform
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatform("whatsapp")}
                      className={`p-3 rounded-lg border text-black ${selectedPlatform === "whatsapp"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlatform("instagram")}
                      className={`p-3 rounded-lg border text-black ${selectedPlatform === "instagram"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      Instagram
                    </button>
                  </div>
                </div>

                <div className="relative" ref={templateDropdownRef}>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Select Template
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-black"
                      onFocus={() => setIsTemplateDropdownOpen(true)}
                    />

                    {isTemplateDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 text-black"
                          >
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {template.category} • {template.language}
                            </div>
                            <div
                              className={`text-xs mt-1 ${template.status === "APPROVED"
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                            >
                              {template.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3 justify-end border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={() => setIsMessageMenuOpen(false)}
                  className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!templateSearch}
                  className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
              </div>
            </div>

            <div className="w-1/2 p-6 bg-gray-50 rounded-r-xl">
              <h3 className="text-lg font-semibold mb-4">Template Preview</h3>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-[500px] overflow-hidden">
                {selectedTemplate ? (
                  <ScrollArea className="h-full">
                    <WhatsAppTemplateContent
                      key={selectedTemplate.id}
                      template={selectedTemplate}
                      editable={false}
                    />
                  </ScrollArea>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    Select a template to preview
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsMessageMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
