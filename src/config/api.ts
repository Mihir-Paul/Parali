// Centralized Parali API configuration file.
// Enforces production-time environment validation to prevent silent connection failures.

const isProd = import.meta.env.PROD;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

if (isProd) {
  if (!apiBaseUrl) {
    console.warn(
      "[Parali API Guard] VITE_API_BASE_URL is not defined in Vercel environment variables. API calls will use dynamic fallbacks."
    );
  } else if (
    apiBaseUrl.includes("localhost") ||
    apiBaseUrl.includes("127.0.0.1") ||
    apiBaseUrl.includes("5173") ||
    apiBaseUrl.includes("8000")
  ) {
    console.warn(
      `[Parali API Guard] VITE_API_BASE_URL (${apiBaseUrl}) points to localhost in production. Set VITE_API_BASE_URL to your deployed Render backend URL in Vercel environment variables.`
    );
  }
}

export const BACKEND_URL = apiBaseUrl ? apiBaseUrl.replace(/\/+$/, '') : '';
export const IS_PRODUCTION = isProd;

