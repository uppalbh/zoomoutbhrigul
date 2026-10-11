const env = import.meta.env as Record<string, string | undefined>;
export const API_BASE = env["VITE_API_BASE_URL"];
export const API_KEY = env["VITE_API_KEY"];
export const PHOTON_NUMBER = env["VITE_PHOTON_NUMBER"];

export function apiHeaders(): HeadersInit {
  return { "Content-Type": "application/json", ...(API_KEY ? { "X-API-Key": API_KEY } : {}) };
}
