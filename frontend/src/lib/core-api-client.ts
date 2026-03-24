import axios, { type AxiosInstance } from "axios";
import { getTenantDomain } from "@/utils/tenant-helper";
import { useAuthStore } from "@/stores/auth.store";

/** Em dev, o Vite faz proxy de `/api-core` → `http://localhost:3002`. */
const CORE_BASE_URL = import.meta.env.DEV
  ? "/api-core"
  : (import.meta.env.VITE_API_CORE_URL ?? "http://localhost:3002");

export const coreApiClient: AxiosInstance = axios.create({
  baseURL: CORE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

coreApiClient.interceptors.request.use((config) => {
  const domain = getTenantDomain().trim() || "demo";
  config.headers = config.headers ?? {};
  config.headers["X-Tenant-Domain"] = domain;
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
