// Centralized Parali API configuration file.
// Enforces production-time environment validation to prevent silent connection failures.

const isProd = import.meta.env.PROD;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

if (isProd) {
  if (!apiBaseUrl) {
    console.error(
      "[Parali API Guard] PRODUCTION CONFIGURATION ERROR: VITE_API_BASE_URL is not defined in environment variables."
    );
  } else if (
    apiBaseUrl.includes("localhost") ||
    apiBaseUrl.includes("127.0.0.1") ||
    apiBaseUrl.includes("5173") ||
    apiBaseUrl.includes("8000")
  ) {
    throw new Error(
      `PRODUCTION CONFIGURATION ERROR: VITE_API_BASE_URL (${apiBaseUrl}) cannot point to localhost/127.0.0.1/5173/8000 in a production build. Set a proper production backend URL in your Vercel deployment variables.`
    );
  }
}

export const BACKEND_URL = apiBaseUrl || 'http://localhost:8000';
export const IS_PRODUCTION = isProd;
