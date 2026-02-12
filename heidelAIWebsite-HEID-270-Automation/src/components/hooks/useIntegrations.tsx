import { useApi } from "@/lib/session_api";
import { useEffect, useState, useCallback, useRef } from "react";
import { storeData, getData, DB_KEYS } from "@/lib/indexedDB";

interface Integrations {
    instagram: false | InstagramData;
    whatsapp: false | WhatsappData;
}

export interface WhatsappData {
    status: boolean;
    name: string;
    phone: string;
    userId: string;
    businessInfo?: {
        account_type?: string;
        status?: string;
    };
    lastUpdated?: number;
}

interface InstagramData {
    status: boolean;
    username: string;
    profileImage: string;
    userId: string;
    businessInfo: {
        id?: string;
        biography?: string;
        followers_count?: number;
        follows_count?: number;
        media_count?: number;
        name?: string;
        website?: string;
    };
    lastUpdated?: number;
}

interface InstagramPost {
    id: string;
    caption?: string;
    media_url: string;
    media_type: string;
    timestamp: string;
}

export const useIntegrations = () => {
    const api = useApi();
    const [integrations, setIntegrations] = useState<Integrations>({
        instagram: false,
        whatsapp: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Ref to prevent double-fetching in React Strict Mode or rapid updates
    const isFetchingRef = useRef(false);

    const fetchFromApi = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
            // 1. Get High-Level Status
            const response = await api.get("/api/integrations/status");
            const apiData = response.data; // e.g. { instagram: true, whatsapp: true }

            // We do NOT set state here yet to avoid type errors (boolean vs Object)

            // 2. Handle Instagram
            if (apiData.instagram) {
                const profileResponse = await api.get(`/api/instagram/profile`);
                if (profileResponse.status === 200) {
                    const profileData = profileResponse.data;
                    const instagramData: InstagramData = {
                        status: true,
                        username: profileData.username || "",
                        profileImage: profileData.profile_picture_url || "/default-avatar.png",
                        userId: profileData.id || "",
                        businessInfo: {
                            id: profileData.id,
                            biography: profileData.biography,
                            followers_count: profileData.followers_count,
                            follows_count: profileData.follows_count,
                            media_count: profileData.media_count,
                            name: profileData.name,
                        },
                        lastUpdated: Date.now(),
                    };

                    // Update State & DB
                    setIntegrations(prev => ({ ...prev, instagram: instagramData }));
                    await storeData("integrations", DB_KEYS.INTEGRATIONS.INSTAGRAM, instagramData);

                    // Fetch posts in background (fire and forget)
                    api.get(`/api/instagram/posts`).then(async (postsResponse) => {
                        if (postsResponse.status === 200) {
                            await storeData('integrations', DB_KEYS.INTEGRATIONS.INSTAGRAM_POSTS, {
                                posts: postsResponse.data.data,
                                lastUpdated: Date.now()
                            });
                        }
                    }).catch(console.error);
                }
            } else {
                // Handle Disconnect
                setIntegrations(prev => ({ ...prev, instagram: false }));
                // Optional: Update DB to reflect disconnected status if needed
            }

            // 3. Handle WhatsApp
            if (apiData.whatsapp) {
                const profileResponse = await api.get(`/api/whatsapp/profile`);
                if (profileResponse.status === 200) {
                    const profileData = profileResponse.data;
                    const whatsappData: WhatsappData = {
                        status: true,
                        name: profileData.name || "",
                        phone: profileData.phone || "",
                        userId: profileData.user_id || "",
                        businessInfo: profileData.business_info || {},
                        lastUpdated: Date.now(),
                    };

                    setIntegrations(prev => ({ ...prev, whatsapp: whatsappData }));
                    await storeData("integrations", DB_KEYS.INTEGRATIONS.WHATSAPP, whatsappData);
                }
            } else {
                setIntegrations(prev => ({ ...prev, whatsapp: false }));
            }

            setError(null);
        } catch (err) {
            console.error("API error:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch from API");
        } finally {
            isFetchingRef.current = false;
            setLoading(false); // Ensure loading is off after API is done
        }
    }, []);

    const initIntegrations = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Parallel Load from IDB
            const [instagramData, whatsappData] = await Promise.all([
                getData<InstagramData>("integrations", DB_KEYS.INTEGRATIONS.INSTAGRAM),
                getData<WhatsappData>("integrations", DB_KEYS.INTEGRATIONS.WHATSAPP)
            ]);

            let shouldFetch = false;
            const FIVE_MINUTES = 5 * 60 * 1000;

            // 2. Evaluate Instagram Cache
            if (instagramData && instagramData.status) {
                setIntegrations(prev => ({ ...prev, instagram: instagramData }));
                if (!instagramData.lastUpdated || Date.now() - instagramData.lastUpdated > FIVE_MINUTES) {
                    shouldFetch = true;
                }
            } else {
                shouldFetch = true; // No data, so we must fetch
            }

            // 3. Evaluate WhatsApp Cache
            if (whatsappData && whatsappData.status) {
                setIntegrations(prev => ({ ...prev, whatsapp: whatsappData }));
                if (!whatsappData.lastUpdated || Date.now() - whatsappData.lastUpdated > FIVE_MINUTES) {
                    shouldFetch = true;
                }
            } else {
                shouldFetch = true; // No data, so we must fetch
            }

            // 4. If we found data for both, stop loading immediately (Optimistic UI)
            if (instagramData || whatsappData) {
                setLoading(false);
            }

            // 5. Trigger Network Sync if needed
            if (shouldFetch) {
                await fetchFromApi();
            } else {
                setLoading(false); // Make sure to turn off loading if we didn't fetch
            }

        } catch (err) {
            console.error("IDB Init Error", err);
            // If IDB fails, fallback to API
            await fetchFromApi();
        }
    }, [fetchFromApi]);

    useEffect(() => {
        initIntegrations();
    }, [initIntegrations]);

    return {
        integrations,
        loading,
        error,
        refreshIntegrations: fetchFromApi,
    };
};