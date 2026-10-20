import assert from "node:assert/strict";
import test from "node:test";
import { productReviewSchema } from "../lib/product-review-schema";

const review = {
  rating: 5,
  name: "Ayesha",
  comment: "Works well.",
  createdAt: new Date("2026-10-20T00:00:00Z"),
};

test("products without valid ratings do not claim reviews or an aggregate rating", () => {
  assert.deepEqual(productReviewSchema([]), {});
  assert.deepEqual(productReviewSchema([0, 6, NaN, 2.5].map((rating) => ({ ...review, rating }))), {});
});

test("schema includes genuine review authors, content, dates and the average rating", () => {
  const schema = productReviewSchema([review, { ...review, name: "Ali", rating: 4 }]);
  assert.equal(schema.aggregateRating?.ratingValue, 4.5);
  assert.equal(schema.aggregateRating?.reviewCount, 2);
  assert.equal(schema.review?.length, 2);
  assert.deepEqual(schema.review?.[0], {
    "@type": "Review",
    author: { "@type": "Person", name: "Ayesha" },
    datePublished: "2026-10-20T00:00:00.000Z",
    reviewBody: "Works well.",
    reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5, worstRating: 1 },
  });
});

test("unnamed reviews contribute ratings without inventing author names", () => {
  const schema = productReviewSchema([{ ...review, name: null }, { ...review, name: " " }]);
  assert.equal(schema.aggregateRating?.reviewCount, 2);
  assert.equal("review" in schema, false);
});
