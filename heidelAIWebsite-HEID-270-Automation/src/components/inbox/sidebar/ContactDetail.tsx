import React, { memo } from "react";
import { LucideIcon } from "lucide-react";

interface ContactDetailProps {
  icon: LucideIcon;
  text: string;
}

const ContactDetail = memo(({ icon: Icon, text }: ContactDetailProps) => (
  <div className="flex items-start border-gray-100 last:border-0 gap-[calc(var(--sidebar-gap)*0.95)] py-[calc(var(--sidebar-gap)*1)]">
    <Icon className="text-gray-400 flex-shrink-0 mt-0.5 w-[calc(var(--icon-size)*0.85)] h-[calc(var(--icon-size)*0.85)]" />
    <div className="flex-1 min-w-0">
      <span className="block text-gray-900 font-medium truncate text-[calc(var(--sidebar-text-xs)*0.95)]">
        {text}
      </span>
    </div>
  </div>
));

ContactDetail.displayName = "ContactDetail";
export default ContactDetail;