import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const THEME = {
  primary: "#1B974B",
  primaryDark: "#1A7339",
  light: {
    background: "#FFFFFF",
    foreground: "#000000",
    secondary: "#5B5B5B",
    card: "#F2F2F2",
    icon: "#E7EEEA",
    border: "#DADFDA",
  },
  dark: {
    background: "#262E36",
    foreground: "#FFFFFF",
    secondary: "#BCBEC1",
    card: "#222931",
    icon: "#212F33",
    border: "#3C454E",
  },
} as const;

type LogoSetting = {
  logo?: unknown;
  dark_logo?: unknown;
  favicon?: unknown;
};

function imageUrl(value: unknown, request: NextRequest): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  try {
    return new URL(value, request.nextUrl.origin).toString();
  } catch {
    return null;
  }
}

/** Public, read-only configuration consumed by the web and mobile storefronts. */
export async function GET(request: NextRequest) {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "logo" } });
    let logo: LogoSetting = {};

    if (row?.value) {
      try {
        const parsed: unknown = JSON.parse(row.value);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          logo = parsed as LogoSetting;
        }
      } catch {
        // A malformed admin value should not make the public app unavailable.
      }
    }

    return NextResponse.json(
      {
        version: 1,
        branding: {
          lightLogo: imageUrl(logo.logo, request),
          darkLogo: imageUrl(logo.dark_logo, request),
          favicon: imageUrl(logo.favicon, request),
        },
        theme: THEME,
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    console.error("Failed to load storefront configuration", error);
    return NextResponse.json(
      { error: "Unable to load storefront configuration" },
      { status: 500 },
    );
  }
}
