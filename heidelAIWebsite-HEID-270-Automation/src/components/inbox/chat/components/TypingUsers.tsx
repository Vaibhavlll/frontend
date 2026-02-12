export const TypingUsers = ({typingUsers} : {typingUsers: Map<string, {agent_name: string}>}) => {
    return (
        <>
            {typingUsers.size > 0 && (
                <div className="inline-flex items-center ml-5 px-3 text-sm ">
                    {/* Overlapping Initials */}
                    <div className="flex items-center -space-x-2 mr-2">
                    {Array.from(typingUsers.values())
                        .slice(0, 2)
                        .map((user, idx) => {
                        const initials = user.agent_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase();
                        const bgColor = `hsl(${(user.agent_name.length * 37) % 360}, 70%, 45%)`;
                        return (
                            <div
                            key={idx}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow"
                            style={{
                                backgroundColor: bgColor,
                                zIndex: 10 - idx,
                            }}
                            >
                            {initials}
                            </div>
                        );
                        })}
                    </div>
                    {/* Typing Text */}
                    <span>
                    {typingUsers.size === 1 && (
                        <>
                        {Array.from(typingUsers.values())[0].agent_name} is typing
                        </>
                    )}
                    {typingUsers.size === 2 && (
                        <>
                        {Array.from(typingUsers.values())[0].agent_name} & {Array.from(typingUsers.values())[1].agent_name} are typing
                        </>
                    )}
                    {typingUsers.size > 2 && (
                        <>Multiple people are typing</>
                    )}
                    </span>
                    {/* Dots */}
                    <div className="flex justify-end gap-1 ml-1">
                    <span className="dot animate-dot"></span>
                    <span className="dot animate-dot delay-150"></span>
                    <span className="dot animate-dot delay-300"></span>
                    </div>
                    <style>{`
                    .dot {
                        width: 3px;
                        height: 3px;
                        border-radius: 50%;
                        background-color: #555;
                    }
                    @keyframes dot {
                        0% { opacity: 0.3; transform: translateY(0); }
                        50% { opacity: 1; transform: translateY(-2px); }
                        100% { opacity: 0.3; transform: translateY(0); }
                    }
                    .animate-dot {
                        animation: dot 1s infinite ease-in-out;
                    }
                    .delay-150 { animation-delay:0.15s; } 
                    .delay-300 { animation-delay: 0.3s; } 
                    `}
                    </style>                 
                    </div>             
                )}         
            </>     
        ); 
    };