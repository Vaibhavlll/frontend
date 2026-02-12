// Create a new file for typography components
import { cn } from "@/lib/utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const H1 = ({ children, className }: TypographyProps) => (
  <h1 className={cn("text-3xl font-bold tracking-tight", className)}>
    {children}
  </h1>
);

export const H2 = ({ children, className }: TypographyProps) => (
  <h2 className={cn("text-2xl font-semibold tracking-tight", className)}>
    {children}
  </h2>
);

export const H3 = ({ children, className }: TypographyProps) => (
  <h3 className={cn("text-xl font-semibold tracking-tight", className)}>
    {children}
  </h3>
);

export const Body = ({ children, className }: TypographyProps) => (
  <p className={cn("text-base leading-7", className)}>
    {children}
  </p>
);

export const Small = ({ children, className }: TypographyProps) => (
  <p className={cn("text-sm text-gray-500", className)}>
    {children}
  </p>
);