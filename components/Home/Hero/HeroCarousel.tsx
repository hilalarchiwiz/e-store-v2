"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css";
import Image from "next/image";

const HeroCarousal = ({ sliders }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{ delay: 2500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination]}
      // Add 'h-full' here to ensure swiper takes up parent height if needed
      className="hero-carousel h-full"
    >
      {sliders && sliders.map(slider => (
        <SwiperSlide key={slider.id}>
          {/* CHANGES:
             1. Added 'min-h-[400px]' (or whatever height you want)
             2. Added 'items-center' to vertically center the inner content
          */}
          <div className="flex items-center justify-between flex-col-reverse sm:flex-row min-h-87.5 sm:min-h-115 px-4 sm:px-10">

            <div className="max-w-[450px] py-10 flex flex-col justify-center">
              <h1 className="font-bold text-dark text-2xl sm:text-4xl mb-3">
                <a href={slider.link}>{slider?.title}</a>
              </h1>

              <p className="text-gray-600 leading-relaxed">
                {slider?.description}
              </p>

              <div className="mt-8">
                <a
                  href={slider.link}
                  className="inline-flex font-medium text-white text-[14px] rounded-md bg-blue-dark py-3 px-9 transition-all hover:bg-[#25a953]"
                >
                  Shop Now
                </a>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-4">
              <Image
                src={slider?.img}
                alt={slider?.title}
                width={350}
                height={350}
                unoptimized
                className="object-contain max-h-[300px] sm:max-h-[400px]"
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;