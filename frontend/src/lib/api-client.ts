import axios, { type AxiosInstance } from "axios";
import { getTenantDomain } from "@/utils/tenant-helper";
import { useAuthStore } from "@/stores/auth.store";

const BASE_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL ?? "http://localhost:3001");
const API_PREFIX = import.meta.env.DEV ? "/api-auth" : "";

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const domain = getTenantDomain().trim() || "demo";
  // AxiosHeaders / plain object: garantir header em todos os ambientes
  config.headers = config.headers ?? {};
  config.headers["X-Tenant-Domain"] = domain;
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
