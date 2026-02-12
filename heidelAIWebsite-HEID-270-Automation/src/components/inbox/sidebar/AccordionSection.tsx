import React, { memo } from "react";
import { LucideIcon } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AccordionSectionProps {
  value: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}

const AccordionSection = memo(
  ({
    value,
    icon: Icon,
    title,
    subtitle,
    color,
    children,
  }: AccordionSectionProps) => (
    <AccordionItem
      value={value}
      className="border-0 bg-white/60 backdrop-blur-sm overflow-hidden"
    >
      <AccordionTrigger className="hover:no-underline hover:bg-gray-50/60 transition-all duration-300 px-[var(--sidebar-padding)] py-[calc(var(--sidebar-padding)*0.5)]">
        <div className="flex items-center gap-[calc(var(--sidebar-gap)*0.75)]">
          {/* <div
            className={`bg-${color}-100/80 rounded-lg flex items-center justify-center flex-shrink-0 w-[calc(var(--icon-size)*1.15)] h-[calc(var(--icon-size)*1.15)]`}
          >
            <Icon
              className={`text-${color}-600 w-[calc(var(--icon-size)*0.85)] h-[calc(var(--icon-size)*0.85)]`}
            />
          </div> */}
          <div className="text-left min-w-0 flex-1 flex items-center gap-2">
            <span className="font-semibold text-gray-900 truncate text-[calc(var(--sidebar-text-sm)*0.9)] w-16 flex-shrink-0">
              {title}
            </span>
            <span className="text-gray-500 truncate text-[calc(var(--sidebar-text-xs)*0.95)]">
              {subtitle}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0 bg-gray-50/30 data-[state=open]:flex-1 data-[state=open]:flex data-[state=open]:flex-col min-h-0">
        {children}
      </AccordionContent>
    </AccordionItem>
  ),
);

AccordionSection.displayName = "AccordionSection";
export default AccordionSection;
