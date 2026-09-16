import assert from "node:assert/strict";
import test from "node:test";
import { bulkOutOfStockVisibilityUpdate, parseShowOutOfStock, productVisibilityFilter } from "../lib/product-visibility";

test("visibility defaults to showing products and supports both saved choices", () => {
  for (const value of [null, undefined, "", "broken", "{}", '{"showOutOfStock":true}']) {
    assert.equal(parseShowOutOfStock(value), true);
  }
  assert.equal(parseShowOutOfStock('{"showOutOfStock":false}'), false);
  assert.deepEqual(productVisibilityFilter(true), { status: "active" });
  assert.deepEqual(productVisibilityFilter(false), { status: "active", quantity: { gt: 0 } });
});

test("shop filters before counting and paginating, and restores sold-out products when enabled", async () => {
  let showOutOfStock = false;
  const fixtures = Array.from({ length: 120 }, (_, index) => ({
    id: index + 1, status: "active", quantity: index % 3 === 0 ? 0 : 2,
    title: `Product ${index + 1}`, price: 100, discountedPrice: null,
    images: [], reviews: [], category: { title: "Laptops" }, createdAt: new Date("2026-01-01"),
  }));
  const filter = (where: any) => fixtures.filter((p) => p.status === where.status && (!where.quantity || p.quantity > where.quantity.gt));
  // Replace the DB boundary; exercise the production shop query and serializer without DB writes.
  (globalThis as any).prismaGlobal = {
    setting: { findUnique: async () => ({ value: JSON.stringify({ showOutOfStock }) }) },
    product: {
      count: async ({ where }: any) => filter(where).length,
      findMany: async ({ where, skip = 0, take }: any) => filter(where).slice(skip, skip + take),
    },
  };
  const { getShopProducts } = await import("../lib/shop-products");
  const first = await getShopProducts({});
  assert.equal(first.totalProducts, 80);
  assert.equal(first.products.length, 20);
  assert.ok(first.products.every((p) => p.quantity > 0));
  const next = await getShopProducts({}, 20, 50);
  assert.equal(next.products.length, 50);
  assert.ok(next.products.every((p) => p.quantity > 0));
  assert.equal(new Set([...first.products, ...next.products].map((p) => p.id)).size, 70);
  showOutOfStock = true;
  const visible = await getShopProducts({});
  assert.equal(visible.totalProducts, 120);
  assert.ok(visible.products.some((p) => p.quantity === 0));
  showOutOfStock = false;
  fixtures.forEach((p) => { p.quantity = 0; });
  const empty = await getShopProducts({});
  assert.equal(empty.totalProducts, 0);
  assert.deepEqual(empty.products, []);
  fixtures[0].quantity = 3;
  const restocked = await getShopProducts({});
  assert.equal(restocked.totalProducts, 1);
  assert.equal(restocked.products[0].id, fixtures[0].id);
});


test("bulk visibility restricts updates to selected sold-out products in the opposite published status", () => {
  for (const visible of [true, false]) {
    const update = bulkOutOfStockVisibilityUpdate([3, 5, 3], visible);
    assert.deepEqual(update.where, {
      id: { in: [3, 5] }, quantity: { lte: 0 }, status: visible ? "inactive" : "active",
    });
    assert.deepEqual(update.data, { status: visible ? "active" : "inactive" });
  }
});

test("bulk visibility rejects empty, oversized, and malformed selections", () => {
  for (const ids of [[], [0], [-1], [1.5], [NaN], [Infinity], [Number.MAX_SAFE_INTEGER + 1], Array(101).fill(1), null, ["1"]]) {
    assert.throws(() => bulkOutOfStockVisibilityUpdate(ids as number[], true));
  }
  assert.throws(() => bulkOutOfStockVisibilityUpdate([1], "true" as unknown as boolean));
});
