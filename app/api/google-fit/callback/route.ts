import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";

export async function GET(request: NextRequest) {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3001";
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=google_fit_denied`
    );
  }

  // Get the Clerk auth token to authenticate the Convex mutation
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });

  if (!token) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=not_authenticated`
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_FIT_CLIENT_ID!,
        client_secret: process.env.GOOGLE_FIT_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_FIT_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Google token exchange failed:", errorData);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings?error=google_fit_token_exchange`
      );
    }

    const tokens = await tokenResponse.json();

    // Save tokens to Convex via authenticated mutation
    convex.setAuth(token);
    await convex.mutation(api.functions.googleFit.saveGoogleFitTokens, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      scopes: (tokens.scope ?? "").split(" ").filter(Boolean),
    });

    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?google_fit=connected`
    );
  } catch (err) {
    console.error("Error saving Google Fit tokens:", err);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=google_fit_save`
    );
  }
}
