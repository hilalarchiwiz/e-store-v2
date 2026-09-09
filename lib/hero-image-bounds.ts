import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { unstable_cache } from "next/cache";
import { findHeroImageBounds } from "@/lib/hero-image-layout";

export const getHeroImageBounds = unstable_cache(async (source: string, _version?: string) => {
  try {
    let buffer: Buffer;
    if (source.startsWith("/") && !source.startsWith("//")) {
      const publicRoot = path.resolve(process.cwd(), "public");
      const filePath = path.resolve(publicRoot, `.${source}`);
      if (!filePath.startsWith(`${publicRoot}${path.sep}`)) return null;
      buffer = await readFile(filePath);
    } else {
      const url = new URL(source);
      const account = process.env.AZURE_STORAGE_ACCOUNT_NAME || "staticportal";
      if (url.protocol !== "https:" || url.hostname !== `${account}.blob.core.windows.net`) return null;
      const response = await fetch(url, { signal: AbortSignal.timeout(4000), redirect: "error" });
      if (!response.ok || Number(response.headers.get("content-length")) > 10_000_000) return null;
      buffer = Buffer.from(await response.arrayBuffer());
    }
    if (buffer.length > 10_000_000) return null;
    const image = sharp(buffer, { limitInputPixels: 16_000_000 });
    const metadata = await image.metadata();
    // Opaque images retain their original framing.
    if (!metadata.hasAlpha) return null;
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return findHeroImageBounds(data, info.width, info.height) ?? null;
  } catch {
    return null;
  }
}, ["hero-image-bounds"], { revalidate: 3600 });
