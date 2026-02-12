/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface MenuItem {
  key: string;
  icon: any;
  label: string;
  toStateName: string;
}

interface PrimarySidebarProps {
  menuItems: MenuItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function PrimarySidebar({
  menuItems,
  activeKey,
  onSelect,
}: PrimarySidebarProps) {
  return (
    <div className="w-16 hover:w-48 transition-all duration-300 ease-in-out h-full border-r bg-white/90 backdrop-blur-sm">
      <nav className="flex flex-col gap-1 p-2">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors",
              activeKey === item.key && "bg-gray-100 text-gray-900"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}