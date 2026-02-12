import { useEffect, useRef, useState } from "react";

interface LazyMediaLoaderProps {
  children: React.ReactNode;
  index: number;
  initialLoadCount?: number;
}

export default function LazyMediaLoader({
  children,
  index,
  initialLoadCount = 5, // Load only first 5 immediately
}: LazyMediaLoaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(index < initialLoadCount);

  useEffect(() => {
    if (isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return <div ref={ref}>{isVisible ? children : <MediaPlaceholder />}</div>;
}

function MediaPlaceholder() {
  return (
    <div className="w-full max-w-sm h-[350px] bg-gray-200 animate-pulse rounded-2xl mx-auto mb-4"></div>
  );
}
