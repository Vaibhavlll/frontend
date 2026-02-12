import { useState } from "react";

export const useMessage = () => {
    const [message, setMessage] = useState<string>("");
    return {
        message,
        setMessage,
    }
}