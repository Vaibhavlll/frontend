import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { FaWhatsapp, FaInstagram, FaTelegram } from "react-icons/fa";
import { Globe } from "lucide-react";
import { FilterBadge } from "./FilterBadge";

export interface FilterOptions {
  platform: string[];
  priority: string[];
  sentiment: string[];
  unreadOnly: boolean;
  hasQuery: boolean;
}

interface FilterMenuProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export const FilterMenu: React.FC<FilterMenuProps> = ({
  filters,
  onFilterChange,
}) => {
  const platformIcons = {
    whatsapp: <FaWhatsapp className="h-4 w-4 text-green-600" />,
    instagram: <FaInstagram className="h-4 w-4 text-pink-600" />,
    telegram: <FaTelegram className="h-4 w-4 text-blue-500" />,
    web: <Globe className="h-4 w-4 text-gray-600" />,
  };

  const getPriorityColor = (priority: string) =>
    priority === "high"
      ? "text-red-500"
      : priority === "medium"
      ? "text-amber-500"
      : "text-green-500";

  const capitalizeFirstLetter = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Popover>
      {/* Updated trigger with horizontal filter lines icon */}
      <PopoverTrigger asChild>
        <div
          tabIndex={0}
          role="button"
          aria-haspopup="true"
          className="h-9 w-9 flex items-center justify-center cursor-pointer rounded-xl hover:bg-gray-100"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-600"
          >
            <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-72">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bold">Platform</Label>
            <div className="flex flex-wrap gap-2">
              {["whatsapp", "telegram", "instagram", "web"].map((platform) => (
                <FilterBadge
                  key={platform}
                  active={filters.platform.includes(platform)}
                  onClick={() => {
                    const newPlatforms = filters.platform.includes(platform)
                      ? filters.platform.filter((p) => p !== platform)
                      : [...filters.platform, platform];
                    onFilterChange({ ...filters, platform: newPlatforms });
                  }}
                  icon={platformIcons[platform as keyof typeof platformIcons]}
                >
                  {capitalizeFirstLetter(platform)}
                </FilterBadge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Priority</Label>
            <div className="flex flex-wrap gap-2">
              {["high", "medium", "low"].map((priority) => (
                <FilterBadge
                  key={priority}
                  active={filters.priority.includes(priority)}
                  onClick={() => {
                    const newPriorities = filters.priority.includes(priority)
                      ? filters.priority.filter((p) => p !== priority)
                      : [...filters.priority, priority];
                    onFilterChange({ ...filters, priority: newPriorities });
                  }}
                  className={!filters.priority.includes(priority) ? getPriorityColor(priority) : ""}
                >
                  {capitalizeFirstLetter(priority)}
                </FilterBadge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Other Filters</Label>
            <div className="flex flex-wrap gap-2">
              <FilterBadge
                active={filters.unreadOnly}
                onClick={() =>
                  onFilterChange({ ...filters, unreadOnly: !filters.unreadOnly })
                }
              >
                Unread only
              </FilterBadge>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
