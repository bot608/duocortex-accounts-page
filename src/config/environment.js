// Environment Configuration
export const ENV_CONFIG = {
  // Backend URL - use local development server
  BACKEND_URL: "http://localhost:4000"
};

// Check if we're in development mode
export const IS_DEV = process.env.NODE_ENV === "development";

// Check if we're in browser environment
export const IS_BROWSER = typeof window !== "undefined";
