export const BASE_URL =
  typeof window !== "undefined"
    ? (window as any).NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
    : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
