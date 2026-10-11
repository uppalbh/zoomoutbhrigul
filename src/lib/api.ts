export const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;
export const PHOTON_NUMBER = import.meta.env.VITE_PHOTON_NUMBER as string | undefined;

export function apiHeaders(): HeadersInit {
  return { "Content-Type": "application/json", ...(API_KEY ? { "X-API-Key": API_KEY } : {}) };
}
