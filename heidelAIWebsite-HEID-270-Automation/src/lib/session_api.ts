"use client";

import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo } from "react";

export const useApi = () => {
  const { getToken } = useAuth();

  const api = useMemo(() => {
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL
    });
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [api, getToken]);

  return api;
};
