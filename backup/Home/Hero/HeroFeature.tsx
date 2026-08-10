import React from "react";
import Image from "next/image";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Free Shipping",
    description: "For all orders $200",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "1 & 1 Returns",
    description: "Cancellation after 1 day",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "100% Secure Payments",
    description: "Gurantee secure payments",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "24/7 Dedicated Support",
    description: "Anywhere & anytime",
  },
];

const HeroFeature = () => {
  return (
    <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7.5 xl:gap-12.5 mt-6 sm:mt-10 bg-white sm:bg-transparent p-4 sm:p-0 rounded-[10px] shadow-1 sm:shadow-none">
        {featureData.map((item, key) => (
          <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0" key={key}>
            <div className="shrink-0">
              <Image
                unoptimized
                src={item.img}
                alt={item.title}
                width={40}
                height={41}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
              />
            </div>

            <div>
              <h3 className="font-semibold sm:font-medium text-base sm:text-lg text-dark">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
