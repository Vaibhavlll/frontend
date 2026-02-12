import { MoreVertical, Plus, Upload, Search, X, Send, Filter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MessageComposer } from "./MessageComposer";

interface ContactListHeaderProps {
  searchValue: string;
  onSearch: (value: string) => void;
  onAddContact: () => void;
  onImportCSV: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMessageSend: (data: {
    tag?: string;
    platform: "whatsapp" | "instagram";
    template: string;
  }) => void;
  tags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

interface MessageData {
  tag?: string;
  platform: "whatsapp" | "instagram";
  template: string;
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  variant?: "default" | "primary" | "success";
  className?: string;
}

export const ContactListHeader = ({
  searchValue,
  onSearch,
  onAddContact,
  onImportCSV,
  onMessageSend,
  tags,
  selectedTags,
  onTagsChange,
}: ContactListHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMessageComposerOpen, setIsMessageComposerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kebabMenuRef = useRef<HTMLDivElement>(null);
  const kebabTriggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);

  const handleMessageSend = (data: MessageData) => {
    // console.log("Message sent:", data);
    setIsMessageComposerOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        kebabMenuRef.current &&
        !kebabMenuRef.current.contains(event.target as Node) &&
        !kebabTriggerRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }

      if (
        isFilterOpen &&
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node) &&
        !filterTriggerRef.current?.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }

      if (
        isSearchExpanded &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, isSearchExpanded, isFilterOpen]);

  const handleMenuAction = (action: string) => {
    if (action === "add") onAddContact();
    if (action === "import") fileInputRef.current?.click();
    setIsMenuOpen(false);
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleOpenMessageComposer = () => {
    setIsMessageComposerOpen(true);
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleClearAllTags = () => {
    onTagsChange([]);
  };


  interface QuickActionMenuProps {
    className?: string;
  }

  const QuickActionMenu: React.FC<QuickActionMenuProps> = ({
    className = "",
  }) => (
    <div className={`relative ${className}`}>
      <button
        ref={kebabTriggerRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="
          group relative
          flex items-center justify-center
          h-9 w-9 sm:h-10 sm:w-10
          hover:bg-gray-100
          text-gray-700 hover:text-gray-900
          rounded-2xl
          transition-all duration-200
          hover:scale-105 active:scale-95
        "
        aria-label="More actions"
      >
        <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {isMenuOpen && (
        <div
          ref={kebabMenuRef}
          className="
            absolute right-0 top-12 
            w-56 
            bg-white 
            rounded-2xl 
            shadow-xl 
            z-50
            overflow-hidden
          "
        >
          <div className="p-2">
            <button
              onClick={() => handleMenuAction("add")}
              className="
                w-full flex items-center gap-3
                px-4 py-3
                text-sm font-medium text-gray-700 
                hover:bg-blue-50 hover:text-blue-700
                rounded-xl
                transition-all duration-200
                group
              "
            >
              <div
                className="
                flex items-center justify-center
                h-8 w-8
                bg-blue-100 group-hover:bg-blue-200
                text-blue-600
                rounded-lg
                transition-colors duration-200
              "
              >
                <Plus className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">Add Contact</div>
                <div className="text-xs text-gray-500 group-hover:text-blue-600">
                  Create new contact
                </div>
              </div>
            </button>

            <button
              onClick={() => handleMenuAction("import")}
              className="
                w-full flex items-center gap-3
                px-4 py-3
                text-sm font-medium text-gray-700 
                hover:bg-green-50 hover:text-green-700
                rounded-xl
                transition-all duration-200
                group
              "
            >
              <div
                className="
                flex items-center justify-center
                h-8 w-8
                bg-green-100 group-hover:bg-green-200
                text-green-600
                rounded-lg
                transition-colors duration-200
              "
              >
                <Upload className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">Import CSV</div>
                <div className="text-xs text-gray-500 group-hover:text-green-600">
                  Bulk import contacts
                </div>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onImportCSV}
            />
          </div>
        </div>
      )}
    </div>
  );

  const MessageButton: React.FC<{
    size?: "sm" | "md" | "lg";
  }> = ({ size = "sm" }) => (
    <button
      onClick={handleOpenMessageComposer}
      className={`
      flex items-center gap-2
      bg-gradient-to-r
      hover:bg-gray-100 active:bg-gray-200 hover:text-gray-900 text-black
      font-sans text-xs font-medium
      rounded-2xl
      hover:shadow-lg
      transition-all duration-200
      hover:scale-105 active:scale-95
      px-3 py-2                  
      h-8 min-w-[80px]            
    `}
    >
      <Send className="h-3 w-3" />
      <span>Message</span>
    </button>
  );

  const FilterButton = () => (
    <div className="relative">
      <button
        ref={filterTriggerRef}
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className={`
          flex items-center gap-2
          ${
            selectedTags.length > 0
              ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              : "bg-gray-10 text-gray-900 hover:bg-gray-100"
          }
          font-sans text-xs font-medium
          rounded-2xl
          hover:shadow-md
          transition-all duration-200
          hover:scale-105 active:scale-95
          px-3 py-2
          h-8
        `}
        aria-label="Filter by tags"
      >
        <Filter className="h-3 w-3" />
        <span>Filter</span>
        {selectedTags.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-semibold">
            {selectedTags.length}
          </span>
        )}
      </button>

      {isFilterOpen && (
        <div
          ref={filterMenuRef}
          className="
            absolute right-0 top-12 
            w-72
            bg-white 
            rounded-2xl 
            shadow-xl 
            border border-gray-100
            z-50
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="font-sans text-xs font-medium text-gray-900">
                Filter by Tags
              </span>
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={handleClearAllTags}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Selected Tags Pills */}
          {selectedTags.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="hover:text-indigo-900 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags List */}
          <div className="max-h-64 overflow-y-auto p-2">
            {tags.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">No tags available</p>
              </div>
            ) : (
              tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`
                      w-full px-3 py-2.5 flex items-center gap-3 text-left
                      rounded-xl
                      transition-all duration-150
                      ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-900"
                          : "hover:bg-gray-50 text-gray-700"
                      }
                    `}
                  >
                    <div
                      className={`
                      w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                      transition-colors duration-150
                      ${
                        isSelected
                          ? "bg-indigo-500 border-indigo-500"
                          : "border-gray-300"
                      }
                    `}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isSelected ? "font-semibold" : ""
                      }`}
                    >
                      {tag}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full bg-white border-b border-gray-200">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="font-sans text-l font-medium">Contacts</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MessageButton size="lg" />

              <FilterButton />

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="
                    pl-12 pr-4 py-3
                    w-50 xl:w-66
                    text-gray-900 placeholder-gray-500
                    rounded-2xl
                    font-sans text-xs font-medium
                  "
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>

              <QuickActionMenu />
            </div>
          </div>

          {isMessageComposerOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="relative w-full max-w-6xl">
                <button
                  onClick={() => setIsMessageComposerOpen(false)}
                  className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <MessageComposer
                  onMessageSend={handleMessageSend}
                  directMode={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
