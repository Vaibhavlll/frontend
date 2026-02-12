import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  memo,
  useCallback,
} from "react";
import { Search, X, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface TagDropdownProps {
  assignedTags: string[];
  allTags: string[];
  isUpdatingTags: boolean;
  onToggleTag: (tag: string) => void;
  onRemoveTag: (
    tag: string,
    event: React.MouseEvent<HTMLDivElement | HTMLSpanElement>,
  ) => void;
}

const TagDropdown = memo(
  ({
    assignedTags,
    allTags,
    isUpdatingTags,
    onToggleTag,
    onRemoveTag,
  }: TagDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }, [isOpen]);

    const filteredTags = useMemo(() => {
      if (!searchQuery.trim()) return allTags;
      return allTags.filter((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }, [allTags, searchQuery]);

    const handleClearAll = useCallback(() => {
      assignedTags.forEach((tag) => onToggleTag(tag));
    }, [assignedTags, onToggleTag]);

    return (
      <div className="relative w-full" ref={dropdownRef}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isUpdatingTags}
                type="button"
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {assignedTags.length > 0 ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      {assignedTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-sans text-[10px] font-medium border border-blue-100 max-w-[60px] truncate"
                          title={tag}
                        >
                          {tag}
                          <span
                            role="button"
                            onClick={(e) => onRemoveTag(tag, e)}
                            className="hover:text-blue-900 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <X className="h-2.5 w-2.5" />
                          </span>
                        </span>
                      ))}

                      {assignedTags.length > 2 && (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-sans text-[10px] font-semibold border border-blue-200 flex-shrink-0">
                          +{assignedTags.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="font-sans text-xs font-medium text-gray-500">
                      Assign tags
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {assignedTags.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold border border-blue-100">
                      {assignedTags.length}
                    </span>
                  )}
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform mr-auto ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5">
              {assignedTags.length > 0
                ? `Manage ${assignedTags.length} tag${assignedTags.length > 1 ? "s" : ""}`
                : "Assign tags to this contact"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[400px]">
            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-100 z-10">
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-sans text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition-all"
                  />
                </div>
              </div>

              {assignedTags.length > 0 && (
                <div className="px-2.5 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                      Selected ({assignedTags.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      disabled={isUpdatingTags}
                      className="text-[10px] font-semibold text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {assignedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-sans text-[10px] font-medium border border-blue-100 whitespace-nowrap flex-shrink-0"
                      >
                        {tag}
                        <span
                          role="button"
                          onClick={(e) => onRemoveTag(tag, e)}
                          className="hover:bg-blue-100 rounded-full transition-colors cursor-pointer p-0.25"
                        >
                          <X className="h-2.5 w-2.5" />
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tags List */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {filteredTags.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-gray-400"
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
                  <p className="text-xs font-medium text-gray-500">
                    {searchQuery ? "No matching tags" : "No tags available"}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-2">
                  {filteredTags.map((tag) => {
                    const isSelected = assignedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => onToggleTag(tag)}
                        disabled={isUpdatingTags}
                        className={`w-full px-2.5 py-1.5 mb-0.5 flex items-center gap-2 text-left rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isSelected
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <Check
                              className="h-2.5 w-2.5 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <span
                          className={`font-sans text-[10px] flex-1 transition-all ${
                            isSelected
                              ? "font-semibold text-blue-700"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredTags.length > 0 && (
              <div className="flex-shrink-0 bg-white border-t border-gray-100 p-3">
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span className="font-medium">
                    {filteredTags.length} tag
                    {filteredTags.length > 1 ? "s" : ""} available
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

TagDropdown.displayName = "TagDropdown";
export default TagDropdown;
