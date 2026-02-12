import { useEffect, useState } from "react";

export const AnimatedPrice = ({ price }: { price: string }) => {
  // 1. Parse the target value immediately
  const numericValue = parseInt(price.replace(/[^0-9]/g, '')) || 0;

  // 2. Initialize state with the TARGET value (not 0).
  // This ensures the first render is static and instant.
  const [displayValue, setDisplayValue] = useState(numericValue);

  useEffect(() => {
    // 3. Determine start and end points
    const start = displayValue;
    const end = numericValue;

    // 4. IMPORTANT: If values are the same (initial load), do nothing.
    if (start === end) return;

    const duration = 500; // 0.5s animation
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out expo for smooth effect
      const easeOut = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
      
      const current = start + (end - start) * easeOut(progress);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [numericValue]); // Only runs when the numeric price actually changes

  return <>{`₹${Math.round(displayValue).toLocaleString('en-IN')}`}</>;
};