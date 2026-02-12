import { useApi } from "@/lib/session_api";
import { useQuery } from "@tanstack/react-query";
import { WhatsAppTemplate } from "../../../types/template";

const useTemplates = (options?: { enabled?: boolean }) => {
    const api = useApi();

    return useQuery({
        queryKey: ["templates"],
        queryFn: async () => {
            try {
                const res = await api.get("/api/whatsapp/templates");
                // console.log(res.data.templates.prebuilt)
                const templatesData = res.data.templates || {};
                const userCreated = Array.isArray(templatesData.user_created)
                    ? templatesData.user_created.map((t: WhatsAppTemplate) => ({ ...t, type: t.type ?? "USER_CREATED" }))
                    : [];
                const prebuilt = Array.isArray(templatesData.prebuilt)
                    ? templatesData.prebuilt.map((t: WhatsAppTemplate) => ({ ...t, type: t.type ?? "PREBUILT" }))
                    : [];

                const allTemplates = [...userCreated, ...prebuilt];

                if (allTemplates.length > 0) {
                    return allTemplates;
                }

                console.warn("No templates found in response:", res.data);
                return [];
            } catch (error) {
                console.error("Error fetching templates:", error);
                throw error;
            }
        },
        enabled: options?.enabled ?? true,
    });
};

export default useTemplates;
