/**
 * In Vite dev, default to same-origin + `vite` proxy to the API (avoids CORS pain).
 * In production, default to the backend URL unless VITE_API_BASE_URL is set.
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv === "") return "";
  if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv;
  return import.meta.env.DEV ? "" : "http://localhost:4000";
}
