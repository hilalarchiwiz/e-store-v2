import React from "react";
import { Testimonial } from "@/types/testimonial";
import Image from "next/image";
import { Star, StarIcon } from "lucide-react";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="shadow-testimonial bg-white rounded-[10px] py-7.5 px-4 sm:px-8.5 m-1">
      <div className="flex items-center gap-1 mb-5">
        {
          [1, 2, 3, 4, 5].map((startIndex) => (
            startIndex <= testimonial.rating ? (
              <Star key={startIndex} className="text-yellow fill-yellow size-4" />
            ) : (
              <StarIcon key={startIndex} className="size-4" />
            )
          ))
        }
      </div>

      <p className="text-dark mb-6">{testimonial.comment}</p>

      <a href="#" className="flex items-center gap-4">
        <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
          <Image
            src={'/images/users/user-01.jpg'}
            alt="author"
            className="w-12.5 h-12.5 rounded-full overflow-hidden"
            width={50}
            height={50}
          />
        </div>

        <div>
          <h3 className="font-medium text-dark">{testimonial?.name}</h3>
          <p className="text-[14px]">{testimonial?.email}</p>
        </div>
      </a>
    </div>
  );
};

export default SingleItem;
