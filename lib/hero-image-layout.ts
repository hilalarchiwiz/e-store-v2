export interface HeroImageBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
}

/** Locate visible pixels without changing the source image. */
export function findHeroImageBounds(pixels: Uint8Array, width: number, height: number): HeroImageBounds | undefined {
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] > 8) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < left || bottom < top) return undefined;
  // A small breathing space keeps edges and soft shadows clear of the viewport.
  const padding = Math.ceil(Math.max(right - left + 1, bottom - top + 1) * 0.025);
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1, sourceWidth: width, sourceHeight: height };
}
