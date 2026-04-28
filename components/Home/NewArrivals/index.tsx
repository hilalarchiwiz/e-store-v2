import Image from "next/image";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import { getProducts } from "@/lib/action/home.action";
export const revalidate = 1
const NewArrival = async () => {
  const { products } = await getProducts({
    categoryId: undefined,
  });
  return (
    <section className="overflow-hidden pt-15">
      <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex font-medium text-[14px] py-2.5 px-7 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-blue-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4  gap-x-7.5 gap-y-9">
          {/* <!-- New Arrivals item --> */}
          {products.map((item, key) => (
            <ProductItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
