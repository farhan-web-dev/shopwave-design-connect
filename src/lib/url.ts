export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined"
    ? (window as Window & { VITE_API_BASE_URL?: string }).VITE_API_BASE_URL
    : process.env.VITE_API_BASE_URL) ||
  "http://localhost:5000/api";
