'use client';
import React, { useEffect, useState } from 'react';
import { Separator, TimeUnit } from './ui/timer-clock';


const CountDownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // 1. Ensure the date is treated as UTC by appending 'Z' if missing.
      // 2. Trim microseconds (6 digits) to milliseconds (3 digits) for cross-browser compatibility.
      let safeDate = targetDate;
      
      // Robustly handle timestamp formats:
      // - Truncate microseconds (>3 digits) to milliseconds (3 digits)
      // - Ensure string ends with 'Z' for UTC interpretation
      if (safeDate) {
        if (safeDate.includes('.')) {
             // Replace (.123)456...Z? with .123Z
             safeDate = safeDate.replace(/(\.\d{3})\d*(?:Z)?$/, '$1Z');
        } else if (!safeDate.endsWith('Z')) {
             safeDate += 'Z';
        }
      }

      const difference = +new Date(safeDate) - +new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Optional: clear timer if difference is negative
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
      <div className="flex items-center">
        {timeLeft.days > 0 && (
          <>
          <TimeUnit value={timeLeft.days} />
          <Separator />
          </>
        )}
        <TimeUnit value={timeLeft.hours} />
        <Separator />
        <TimeUnit value={timeLeft.minutes} />
        <Separator />
        <TimeUnit value={timeLeft.seconds} />
      </div>
  )
}

export default CountDownTimer;