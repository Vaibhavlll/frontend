import React, { useState, useRef, useEffect } from "react";

const AssignDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "assign">("assign");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-all duration-150 font-sans text-xs font-medium`}
      >
        {activeTab === "assign" ? "Assign to Agent" : "History"}
        <svg
          className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[210px] min-h-[80px] bg-white backdrop-blur-[1px] border border-gray-200 shadow-xl rounded-lg z-20 animate-in fade-in duration-150"
          tabIndex={-1}
        >
          {/* Tab selectors */}
          <div className="flex border-b border-gray-100">
            <button
              className={`flex-1 py-2 text-xs font-medium focus:outline-none ${
                activeTab === "history"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("history")}
              tabIndex={0}
            >
              History
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium focus:outline-none ${
                activeTab === "assign"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("assign")}
              tabIndex={0}
            >
              Transfer
            </button>
          </div>
          <div className="p-3 text-xs text-gray-600 min-h-[32px]">
            {activeTab === "history" ? (
              <div>No history available.</div>
            ) : (
              <div>No assign actions.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignDropdown;
