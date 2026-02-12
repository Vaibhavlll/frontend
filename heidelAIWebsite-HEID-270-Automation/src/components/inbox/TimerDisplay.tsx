const TimerDisplay = ({ hours }: { hours: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - hours / 24);

  return (
    <div className="relative h-16 w-16">
      <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 48 48">
        {/* Background Circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress Circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="#3b82f6"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          className="transition-all duration-700 ease-in-out"
        />
      </svg>

      {/* Text in Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold text-gray-800">
          {hours > 0 ? `${hours}h` : "0h"}
        </span>
        <span className="text-[8px] text-gray-500">remaining</span>
      </div>
    </div>
  );
};

export default TimerDisplay;
