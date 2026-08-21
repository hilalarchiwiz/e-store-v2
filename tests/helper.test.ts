import test from 'node:test';
import assert from 'node:assert/strict';

import { discountPrice, getDiff, parseDate, slugify } from '../lib/helper';

test('discountPrice applies a percentage and handles a missing discount', () => {
  assert.equal(discountPrice({ price: 1_000, discount: 15 }), 850);
  assert.equal(discountPrice({ price: 1_000, discount: null }), 1_000);
});

test('slugify creates stable URL-safe slugs', () => {
  assert.equal(slugify('  Premium  Gaming Laptop!  '), 'premium-gaming-laptop');
  assert.equal(slugify('USB-C -- Dock'), 'usb-c-dock');
});

test('parseDate returns a date for input and null when absent', () => {
  assert.equal(parseDate(null), null);
  assert.equal(parseDate('2026-08-21T00:00:00.000Z')?.toISOString(), '2026-08-21T00:00:00.000Z');
});

test('getDiff reports changed business fields and ignores record metadata', () => {
  const changed = getDiff(
    { id: 1, title: 'Old', details: { memory: '8GB' }, updatedAt: 'yesterday' },
    { id: 2, title: 'New', details: { memory: '16GB' }, updatedAt: 'today' },
  );

  assert.deepEqual(changed.sort(), ['details', 'title']);
});
