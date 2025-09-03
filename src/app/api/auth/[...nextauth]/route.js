import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
      authorization: {
        params: {
          scope: "name email",
          response_mode: "form_post", // Required by Apple for name/email scope
          response_type: "code",
        },
      },
    }),
  ],
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none", // Changed to 'none' for cross-origin form_post
        secure: true, // Required when sameSite is 'none'
        path: "/",
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account.provider === "google") {
        try {
          const { authenticateWithGoogle } = await import('@/lib/googleAuth');
          
          // Create Google user object matching mobile app format
          const googleUser = {
            name: profile?.name || user?.name,
            email: profile?.email || user?.email,
            picture: profile?.picture || user?.image,
            sub: profile?.sub || user?.id,
            id: profile?.sub || user?.id,
          };
          
          const authResult = await authenticateWithGoogle(googleUser);
          
          if (authResult.success) {
            user.backendToken = authResult.token;
            user.backendUser = authResult.user;
            return true;
          } else {
            console.error('Google Sign-In: Backend authentication failed', authResult.error);
            // Pass error to login page via URL parameter
            return `/login?error=AuthError&message=${encodeURIComponent(authResult.error)}`;
          }
        } catch (error) {
          console.error('Google Sign-In: Error during backend authentication', error);
          const errorMsg = error.response?.data?.message || error.message || 'Google authentication failed';
          return `/login?error=AuthError&message=${encodeURIComponent(errorMsg)}`;
        }
      } else if (account.provider === "apple") {
        try {
          const { authenticateWithApple } = await import('@/lib/appleAuth');
          
          const sessionData = {
            user: user,
            token: {
              email: profile?.email || user?.email,
              name: profile?.name || user?.name,
              providerId: profile?.sub || user?.id,
              sub: profile?.sub || user?.id,
            },
          };
          
          const authResult = await authenticateWithApple(sessionData);
          
          if (authResult.success) {
            user.backendToken = authResult.token;
            user.backendUser = authResult.user;
            return true;
          }
          console.error('Apple Sign-In: Backend authentication failed', authResult.error);
          // Pass error to login page via URL parameter
          return `/login?error=AuthError&message=${encodeURIComponent(authResult.error)}`;
        } catch (error) {
          console.error('Apple Sign-In: Error during backend authentication', error);
          const errorMsg = error.response?.data?.message || error.message || 'Apple authentication failed';
          return `/login?error=AuthError&message=${encodeURIComponent(errorMsg)}`;
        }
      }
      return true;
    },
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (profile) {
        token.providerId = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
      }
      if (user?.backendToken) {
        token.backendToken = user.backendToken;
        token.backendUser = user.backendUser;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      session.providerId = token.providerId;
      session.backendToken = token.backendToken;
      session.backendUser = token.backendUser;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
