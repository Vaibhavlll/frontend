import { FileText, MessageSquare, Package, ArrowLeftRight } from "lucide-react";

export const FLUID_STYLES = `
  :root {
    --sidebar-padding: clamp(0.625rem, 1.5vw, 0.875rem);
    --sidebar-gap: clamp(0.375rem, 0.75vw, 0.5rem);
    --sidebar-text-sm: clamp(0.6875rem, 1.25vw, 0.8125rem);
    --sidebar-text-xs: clamp(0.5625rem, 0.9vw, 0.6875rem);
    --avatar-size: clamp(2rem, 3.5vw, 2.5rem);
    --icon-size: clamp(0.875rem, 1.5vw, 1rem);
  }
  .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb { background: #cbd5e1; }
  .ios-scrollbar::-webkit-scrollbar { width: 3px; }
  .ios-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .ios-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 8px; transition: all 0.3s ease; }
  .ios-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); }
  * { min-width: 0; min-height: 0; }
`;

export const ACCORDION_CONFIG = [
  { value: "summary", icon: FileText, title: "Summary", subtitle: "Insights", color: "orange" },
  { value: "templates", icon: MessageSquare, title: "Templates", subtitle: "Messages", color: "blue" },
  { value: "products", icon: Package, title: "Products", subtitle: "Catalog", color: "purple" },
  { value: "analytics", icon: ArrowLeftRight, title: "Transfers", subtitle: "Metrics", color: "green" },
];