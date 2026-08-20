import { convexAuth, createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import Google from "@auth/core/providers/google";
import * as jose from "jose";

async function verifyAppleIdentityToken(identityToken: string) {
  const JWKS = jose.createRemoteJWKSet(
    new URL("https://appleid.apple.com/auth/keys"),
  );
  const bundleId = process.env.AUTH_APPLE_BUNDLE_ID;
  if (!bundleId) throw new Error("AUTH_APPLE_BUNDLE_ID env var is not set");

  const { payload } = await jose.jwtVerify(identityToken, JWKS, {
    issuer: "https://appleid.apple.com",
    audience: bundleId,
  });

  return {
    sub: payload.sub as string,
    email: payload.email as string | undefined,
  };
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password,

    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),

    ConvexCredentials({
      id: "apple",
      authorize: async (credentials: Record<string, unknown>, ctx) => {
        const identityToken = credentials.identityToken as string | undefined;
        if (!identityToken) return null;

        try {
          const { sub, email } = await verifyAppleIdentityToken(identityToken);

          // Return existing account if found, otherwise create it.
          try {
            const { user } = await retrieveAccount(ctx, { provider: "apple", account: { id: sub } });
            return { userId: user._id };
          } catch {
            const { user } = await createAccount(ctx, {
              provider: "apple",
              account: { id: sub },
              profile: {
                ...(email ? { email, emailVerificationTime: Date.now() } : {}),
              },
              shouldLinkViaEmail: !!email,
            });
            return { userId: user._id };
          }
        } catch (err) {
          console.error("Apple sign-in failed:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // Allow the React Native deep-link scheme as a valid redirectTo target
    // so the Google OAuth callback can return the auth code to the app.
    redirect: async ({ redirectTo }) => {
      if (redirectTo.startsWith("stopper://")) return redirectTo;
      const siteUrl = (process.env.SITE_URL ?? "").replace(/\/$/, "");
      if (redirectTo.startsWith("/") || redirectTo.startsWith("?")) {
        return `${siteUrl}${redirectTo}`;
      }
      if (redirectTo.startsWith(siteUrl)) return redirectTo;
      throw new Error(`Invalid redirectTo: ${redirectTo}`);
    },
  },
});
