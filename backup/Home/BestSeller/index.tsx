import React from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import shopData from "@/components/Shop/shopData";
import { getProducts } from "@/lib/action/home.action";
export const revalidate = 1
const BestSeller = async () => {
  const { products } = await getProducts({
    categoryId: undefined,
  });
  return (
    <section className="overflow-hidden">
      <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Best Sellers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7.5">
          {/* <!-- Best Sellers item --> */}
          {products.map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop"
            className="inline-flex font-medium text-[14px] py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-blue-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
