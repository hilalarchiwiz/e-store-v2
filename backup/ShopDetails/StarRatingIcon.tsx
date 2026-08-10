import { StarsIcon } from "lucide-react";
import { useState } from "react";
const StarRatingIcon = () => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    //   const StarIcon = () => (
    //     <svg
    //         className="fill-current"
    //         width="15"
    //         height="16"
    //         viewBox="0 0 15 16"
    //         fill="none"
    //         xmlns="http://www.w3.org/2000/svg"
    //     >
    //         <path
    //             d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
    //         />
    //     </svg>
    // );
    return (
        <div className="flex items-center gap-3 mb-7.5">
            <span className="text-gray-700">Your Rating*</span>

            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`cursor-pointer transition-colors ${star <= (hoveredRating || rating)
                            ? 'text-yellow-500'
                            : 'text-gray-300'
                            }`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                    >
                        <StarsIcon />
                    </span>
                ))}
            </div>

            {rating > 0 && (
                <span className="text-sm text-gray-600">({rating} star{rating !== 1 ? 's' : ''})</span>
            )}

            <input type="hidden" name="rating" value={rating} readOnly />
        </div>
    )
}

export default StarRatingIcon