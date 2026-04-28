'use client';
import { submitReview } from "@/lib/action/home.action";
import { MAX_COMMENT_LENGTH } from "@/lib/constant";
import StarRatingIcon from "./StarRatingIcon";
import Form from "../Admin/Form";
import { SubmitButton } from "./SubmitButton";
import FormSubmit from "./FormSubmit";


const SubmitReview = ({ productId }) => {
    return (
        <FormSubmit action={submitReview}>
            <h2 className="font-medium text-2xl text-gray-900 mb-3.5">
                Add a Review
            </h2>

            <p className="mb-6 text-gray-600">
                Your email address will not be published. Required fields are marked *
            </p>
            <StarRatingIcon />
            <input type="hidden" name="productId" value={productId} readOnly />
            <div className="rounded-xl bg-white ">
                <div className="mb-5">
                    <label htmlFor="comments" className="block mb-2.5 text-gray-700 font-medium">
                        Comments*
                    </label>

                    <textarea
                        name="comment"
                        id="comments"
                        rows={5}
                        placeholder="Your comments"
                        required
                        className="rounded-md border border-gray-300 bg-gray-50 placeholder:text-gray-400 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-5 sm:gap-7.5 mb-5.5">
                    <div className="flex-1">
                        <label htmlFor="name" className="block mb-2.5 text-gray-700 font-medium">
                            Name*
                        </label>

                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Your name"
                            required
                            className="rounded-md border border-gray-300 bg-gray-50 placeholder:text-gray-400 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-lg focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <div className="flex-1">
                        <label htmlFor="email" className="block mb-2.5 text-gray-700 font-medium">
                            Email*
                        </label>

                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Your email"
                            required
                            className="rounded-md border border-gray-300 bg-gray-50 placeholder:text-gray-400 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-lg focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>
            </div>
        </FormSubmit>
    );
}

export default SubmitReview