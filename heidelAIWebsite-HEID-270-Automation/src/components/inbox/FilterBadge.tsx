import { cn } from "@/lib/utils";

interface FilterBadgeProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FilterBadge = ({ active, onClick, icon, children, className }: FilterBadgeProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all",
        active 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "bg-muted hover:bg-muted/80 text-muted-foreground",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
};