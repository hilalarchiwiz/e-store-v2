import assert from "node:assert/strict";
import test from "node:test";
import { findHeroImageBounds } from "../lib/hero-image-layout";

test("hero viewport removes transparent margins and preserves every visible product pixel", () => {
  const width = 120, height = 63;
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 12; y <= 50; y++) {
    for (let x = 29; x <= 90; x++) pixels[(y * width + x) * 4 + 3] = 255;
  }
  const bounds = findHeroImageBounds(pixels, width, height)!;
  assert.ok(bounds.x > 0 && bounds.y > 0);
  assert.ok(bounds.x <= 29 && bounds.y <= 12);
  assert.ok(bounds.x + bounds.width > 90 && bounds.y + bounds.height > 50);
  assert.ok(bounds.width < width && bounds.height < height);
  assert.equal(bounds.sourceWidth, width);
  assert.equal(bounds.sourceHeight, height);
});

test("hero viewport handles empty images and products at the image edges", () => {
  assert.equal(findHeroImageBounds(new Uint8Array(64), 4, 4), undefined);
  const opaque = new Uint8Array(64).fill(255);
  assert.deepEqual(findHeroImageBounds(opaque, 4, 4), { x: 0, y: 0, width: 4, height: 4, sourceWidth: 4, sourceHeight: 4 });
});
