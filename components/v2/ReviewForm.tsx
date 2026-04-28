import React, { useState } from "react";
import Button from "@/components/v2/Button";
import { toast } from "react-hot-toast";
import { createReview } from "@/lib/action/review.action";

interface ReviewFormProps {
  productId: number;
  onSuccess: (review: any) => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  // Assuming anonymous reviews for now since authentication context wasn't explicitly requested
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    if (!comment || !name || !email) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createReview({
        productId,
        rating,
        comment,
        name,
        email,
      });

      if (result.success) {
        toast.success("Review submitted successfully!");
        onSuccess(result.review);
      } else {
        toast.error(result.error || "Failed to submit review.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#f1f4f2] dark:bg-[#2a3a2f] p-6 rounded-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300"
    >
      <h3 className="font-bold text-lg">Write a Review</h3>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
          Rating
        </label>
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="transition-transform hover:scale-110 active:scale-90"
            >
              <span
                className={`material-symbols-outlined text-3xl ${star <= (hoverRating || rating) ? "text-yellow-500 fill-1" : "text-gray-300 dark:text-gray-600"}`}
              >
                star
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Your Name"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
          Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-30"
          placeholder="Share your thoughts about the product..."
          required
        />
      </div>

      <div className="flex gap-3 justify-end mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Submit Review
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
