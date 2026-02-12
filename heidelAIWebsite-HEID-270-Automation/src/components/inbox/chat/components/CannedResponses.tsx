import React, { useEffect } from "react";
import { CannedResponse } from "../types";

interface CannedResponsesProps {
  filteredResponses: CannedResponse[];
  showCannedResponses: boolean;
  selectedCannedIndex: number;
  onSelect: (response: CannedResponse) => void;
  onHover: (index: number) => void;
}

export const CannedResponses = ({
  filteredResponses,
  showCannedResponses,
  selectedCannedIndex,
  onSelect,
  onHover
}: CannedResponsesProps) => {
  
    useEffect(() => {
        if (showCannedResponses) {
            const activeElement = document.getElementById(`canned-response-${selectedCannedIndex}`);
            if (activeElement) {
            activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
    }, [selectedCannedIndex, showCannedResponses]);
  if (!showCannedResponses) return null;


  return (
    <>
      {/* Dropdown Container */}
      <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl border border-gray-200 shadow-2xl max-h-[300px] overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
        
        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Canned Responses
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {filteredResponses.length} found
          </span>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto max-h-[220px] custom-scroll">
          {filteredResponses.length > 0 ? (
            filteredResponses.map((response, index) => (
              <button
                id={`canned-response-${index}`}
                key={response._id || index}
                type="button" // Prevent form submission
                onClick={(e) => {
                  e.preventDefault(); // Stop focus loss
                  onSelect(response);
                }}
                onMouseEnter={() => onHover(index)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 transition-all group ${
                  index === selectedCannedIndex
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : "hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-sm font-mono font-semibold px-2 py-0.5 rounded ${
                          index === selectedCannedIndex
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700"
                        }`}
                      >
                        {response.shortcut}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {response.response}
                    </p>
                  </div>
                  
                  {/* Selection Indicator Icon */}
                  {index === selectedCannedIndex && (
                    <div className="flex-shrink-0 text-blue-600 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            /* No Results State */
            <div className="p-8 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No matching shortcuts</p>
              <p className="text-xs text-gray-500">Try a different keyword</p>
            </div>
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs shadow-sm">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs shadow-sm">↵</kbd> Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs shadow-sm">Esc</kbd> Close
          </span>
        </div>
      </div>
    </>
  );
};