"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css";
import Image from "next/image";

const HeroCarousal = ({ sliders }: { sliders?: any[] }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{ delay: 2500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel h-full"
    >
      {sliders &&
        sliders.map((slider: any) => (
          <SwiperSlide key={slider.id}>
            <div className="flex items-center justify-between flex-col-reverse sm:flex-row min-h-[340px] sm:min-h-115 px-4 sm:px-10 py-6 sm:py-0 gap-4 sm:gap-6">
              <div className="w-full sm:max-w-[450px] py-2 sm:py-10 flex flex-col justify-center text-center sm:text-left items-center sm:items-start">
                <h1 className="font-bold text-dark text-xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3">
                  <a href={slider.link} className="hover:text-blue transition-colors">
                    {slider?.title}
                  </a>
                </h1>

                <p className="text-gray-600 leading-relaxed text-xs sm:text-base line-clamp-3 sm:line-clamp-none">
                  {slider?.description}
                </p>

                <div className="mt-4 sm:mt-8">
                  <a
                    href={slider.link}
                    className="inline-flex font-medium text-white text-xs sm:text-sm rounded-md bg-blue-dark py-2.5 px-6 sm:py-3 sm:px-9 transition-all hover:bg-[#25a953]"
                  >
                    Shop Now
                  </a>
                </div>
              </div>

              <div className="relative flex items-center justify-center p-2 sm:p-4 shrink-0">
                <Image
                  src={slider?.img}
                  alt={slider?.title || "Hero Slider"}
                  width={350}
                  height={350}
                  unoptimized
                  className="object-contain max-h-[180px] sm:max-h-[350px] lg:max-h-[400px] w-auto"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
    </Swiper>
  );
};

export default HeroCarousal;