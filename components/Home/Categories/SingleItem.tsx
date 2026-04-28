import { Category } from "@/types/category";
import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <Link href={`/shop?category=${item.id}`} className="group flex flex-col items-center">
      <div className="max-w-32.5 w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4">
        <Image src={item.img} alt="Category" width={82} height={62} />
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block font-medium text-center text-dark bg-linear-to-r from-purple-300 to-purple-400 bg-size-[0px_1px] bg-bottom-left bg-no-repeat transition-[background-size] duration-500 hover:bg-size-[100%_3px] group-hover:bg-size-[100%_1px] group-hover:text-purple-600">
          {item.title}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;
