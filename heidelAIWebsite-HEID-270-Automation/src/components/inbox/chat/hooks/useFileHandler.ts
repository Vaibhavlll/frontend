import { useState, useRef } from "react";
import { validateFile } from "../utils";
import { toast } from "sonner";

export const useFileHandler = () => {
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const newFiles: File[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const error = validateFile(file);
            if (error) {
                toast.error(error);
                continue;
            }
            newFiles.push(file);
        }
        if (newFiles.length + attachments.length <= 1) {
            setAttachments((prev) => {
                const total = [...prev, ...newFiles].slice(0, 3);
                return total;
            });
        } else {
            toast.error("You can upload only 1 file at a time.");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    return {
        attachments,
        setAttachments,
        handleFiles,
        handleDrop,
        isDragging,
        setIsDragging,
        fileInputRef
    };
};