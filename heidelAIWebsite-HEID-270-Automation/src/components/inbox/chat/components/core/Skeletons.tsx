export const MessageSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    {/* Left side message */}
    <div className="flex items-start gap-2 max-w-[50%]">
      <div className="flex flex-col gap-2">
        <div className="h-14 w-48 bg-gray-200 rounded-3xl rounded-bl-lg" />
      </div>
    </div>

    {/* Right side message */}
    <div className="flex items-start gap-2 max-w-[50%] self-end">
      <div className="flex flex-col gap-2">
        <div className="h-14 w-56 bg-gray-200 rounded-3xl rounded-br-lg" />
      </div>
    </div>
  </div>
);