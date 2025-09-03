// Environment Configuration
export const ENV_CONFIG = {
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID:
    "275251104501-tnp33sfbl98tksth0lujs2k9kjqhnl3i.apps.googleusercontent.com",

  // Backend URL - use local development server
  BACKEND_URL: "http://localhost:4000",

  // OAuth Redirect URLs (handled automatically by NextAuth.js)
  GOOGLE_REDIRECT_URI: `https://1fbf1a9ba555.ngrok-free.app/api/auth/callback/google`,
};

// Check if we're in development mode
export const IS_DEV = process.env.NODE_ENV === "development";

// Check if we're in browser environment
export const IS_BROWSER = typeof window !== "undefined";
