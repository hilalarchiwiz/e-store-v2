interface ProductReview {
  rating: number;
  name: string | null;
  comment: string;
  createdAt: Date;
}

interface ProductReviewSchema {
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  review?: {
    "@type": string;
    author: { "@type": string; name: string };
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      "@type": string;
      ratingValue: number;
      bestRating: number;
      worstRating: number;
    };
  }[];
}

export function productReviewSchema(reviews: ProductReview[]): ProductReviewSchema {
  const ratings = reviews.filter(
    ({ rating }) => Number.isInteger(rating) && rating >= 1 && rating <= 5,
  );
  if (ratings.length === 0) return {};

  // Only identify authors when a real name was supplied with the review.
  const namedReviews = ratings.filter(({ name }) => name?.trim());
  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratings.reduce((sum, { rating }) => sum + rating, 0) / ratings.length,
      reviewCount: ratings.length,
      bestRating: 5,
      worstRating: 1,
    },
    ...(namedReviews.length > 0 ? {
      review: namedReviews.map((review) => ({
        "@type": "Review",
        author: { "@type": "Person", name: review.name!.trim() },
        datePublished: review.createdAt.toISOString(),
        reviewBody: review.comment,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
      })),
    } : {}),
  };
}
