import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/session_api";
import { CannedResponse } from "../types";

export const useCannedResponses = () => {
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<CannedResponse[]>([]);
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [selectedCannedIndex, setSelectedCannedIndex] = useState(0);
  const api = useApi();

  // 1. Fetch Responses on Mount
  useEffect(() => {
    const fetchCannedResponses = async () => {
      try {
        const response = await api.get("/api/canned_responses");
        if (response.data?.canned_responses) {
          setCannedResponses(response.data.canned_responses);
        }
      } catch (error) {
        console.error("[CannedResponses] Fetch error:", error);
      }
    };
    fetchCannedResponses();
  }, []);

  // 2. Navigation Helper: Moves selection up or down
  const navigateSelection = useCallback((direction: "up" | "down") => {
    if (!showCannedResponses || filteredResponses.length === 0) return;

    setSelectedCannedIndex((prev) => {
      if (direction === "up") {
        return prev > 0 ? prev - 1 : filteredResponses.length - 1; // Loop to bottom
      } else {
        return prev < filteredResponses.length - 1 ? prev + 1 : 0; // Loop to top
      }
    });
  }, [showCannedResponses, filteredResponses.length]);

  // 3. Filtering Logic: Updates the list based on user input
  // We use useCallback to keep the function stable, but we debounce the CALLER, not the setter inside.
  const filterResponses = useCallback((searchText: string) => {
    const query = searchText.toLowerCase().trim();

    // Only active if starts with "/"
    if (!query.startsWith("/")) {
      setShowCannedResponses(false);
      setFilteredResponses([]);
      return;
    }

    const shortcutQuery = query.slice(1); // remove "/"

    // If just "/", show all
    if (shortcutQuery === "") {
      setFilteredResponses(cannedResponses);
      setShowCannedResponses(cannedResponses.length > 0);
      setSelectedCannedIndex(0);
      return;
    }

    // Filter
    const filtered = cannedResponses.filter((r) =>
      r.shortcut.toLowerCase().includes(shortcutQuery)
    );

    setFilteredResponses(filtered);
    setShowCannedResponses(filtered.length > 0);
    setSelectedCannedIndex(0); // Reset selection on new search
  }, [cannedResponses]);

  // 4. Helper to get the currently selected item (for Enter key)
  const getCurrentSelection = () => {
    if (!showCannedResponses || filteredResponses.length === 0) return null;
    return filteredResponses[selectedCannedIndex];
  };

  return {
    cannedResponses,        // The raw full list
    filteredResponses,      // The active list based on search
    showCannedResponses,    // Boolean visibility
    selectedCannedIndex,    // Number pointer
    setShowCannedResponses, // Manual override if needed
    setFilteredResponses,  // For testing or external updates
    setSelectedCannedIndex, // For mouse hover interaction
    filterResponses,        // Function to call on text change
    navigateSelection,      // Function to call on Arrow keys
    getCurrentSelection,    // Function to call on Enter key
  };
};