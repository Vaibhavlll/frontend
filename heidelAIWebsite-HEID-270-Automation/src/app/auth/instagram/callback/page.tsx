"use client"

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from "@/lib/session_api";
import { storeData, DB_KEYS } from "@/lib/indexedDB";
import axios, { Axios, AxiosError } from "axios";



interface InstagramProfileResponse {
  status?: string;
  id: string;
  username: string;
  profile_picture_url: string;
  biography?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  name?: string;
  website?: string;
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

interface ErrorResponse {
  message?: string;
}

function InstagramCallbackContent() {
  const api = useApi()
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Processing Instagram authorization...");

  const exchangeCodeForToken = useCallback(async (code: string) => {
    try {
      const response = await api.post<InstagramProfileResponse>("/api/instagram/auth", {
        code,
        redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!,
      });

      if (response.status === 403) {
        const errorData = response.data as ErrorResponse;
        const errorMessage = errorData.message || "This Instagram account is already connected to another organization. If you think this is incorrect, please contact us at support@heidelai.com for further assistance.";
        throw new Error(errorMessage);
      }

      if (response.status !== 200 || (typeof response.data === "object" && response.data.status === "error")) {
        let errorMessage = "Failed to connect Instagram account";
        const errorData = response.data as ErrorResponse | { status?: string; message?: string } | string;

        if (typeof errorData === "object" && errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
        throw new Error(errorMessage);
      }


      const profileData = response.data;

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
          website: profileData.website,
        },
        lastUpdated: Date.now(),
      };

      await storeData("integrations", DB_KEYS.INTEGRATIONS.INSTAGRAM, instagramData);

      setStatus("success");
      setMessage("Instagram connected successfully!");
      toast.success("Instagram account connected successfully");

      const timer = setTimeout(() => {
        router.push("/dashboard#integrations");
      }, 3000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: AxiosError | any) {
      console.error("Error exchanging Instagram code:", error);

      let errMsg = "Unknown error occurred";
      if (error.response && error.response.status === 403) {
        errMsg = "This Instagram account is already connected to another organization. If you think this is incorrect, please contact us at support@heidelai.com for further assistance.";
      } else if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errMsg = error.response.data.detail;
      } else if (error instanceof Error) {
        errMsg = error.message;
      }

      setStatus("error");
      setMessage(errMsg);
      toast.error(`Instagram connection failed: ${errMsg}`);
    }
  }, [router]);

  useEffect(() => {
    if (!searchParams) return;

    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      setMessage("Missing required parameters from Instagram.");
      toast.error("Instagram connection failed: Missing parameters");
      const timer = setTimeout(() => {
        router.push("/dashboard#integrations");
      }, 3000);
      return;
    }

    exchangeCodeForToken(code);
    localStorage.removeItem("instagram_auth_state");
  }, [searchParams, exchangeCodeForToken]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Connecting Instagram</h1>
            <p className="text-gray-600">Please wait while we complete the connection process...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-2">Connection Successful!</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting you back to settings...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-2">Connection Failed</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting you back to settings...</p>
          </>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function CallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Loading</h1>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}

export default function InstagramCallback() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <InstagramCallbackContent />
    </Suspense>
  );
}