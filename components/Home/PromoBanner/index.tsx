import { getBanners } from "@/lib/action/home.action";
import Image from "next/image";
import Link from "next/link";

const PromoBanner = async () => {
  const { banners } = await getBanners();

  // 1. Separate the banners by type
  const heroBanner = banners?.find((b) => b.type === "HERO");
  const promoBanners = banners?.filter((b) => b.type === "PROMO_HALF");

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

        {/* --- HERO BANNER (Big) --- */}
        {heroBanner && (
          <div
            style={{ backgroundColor: heroBanner.bgColor }}
            className="relative z-1 overflow-hidden rounded-lg py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5"
          >
            <div className="max-w-[550px] w-full">
              <span className="block font-medium text-xl text-dark mb-3">
                {heroBanner.title}
              </span>
              <p>{heroBanner.description}</p>
              <Link
                href={heroBanner.link}
                className="inline-flex font-medium text-[14px] text-white bg-blue-dark py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-[#25a953] mt-7.5"
              >
                {heroBanner.buttonText}
              </Link>
            </div>
            <Image
              src={heroBanner.imageUrl}
              alt={heroBanner.title}
              className="absolute bottom-0 right-4 lg:right-26 -z-1 object-contain"
              width={274}
              height={350}
            />
          </div>
        )}

        {/* --- PROMO BANNERS (Small Grid) --- */}
        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {promoBanners?.slice(0, 2).map((banner, index) => {
            console.log(index)
            return (
              <div
                key={banner.id}
                style={{ backgroundColor: banner.bgColor }}
                className="relative z-1 overflow-hidden rounded-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10"
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  // Check index to mimic your original layout (left-aligned vs right-aligned images)
                  className={`absolute top-1/2 -translate-y-1/2 -z-1 object-contain ${index === 0 ? "left-3 sm:left-10" : "right-3 sm:right-8.5"
                    }`}
                  width={200}
                  height={200}
                />

                <div className={index === 0 ? "text-right" : "text-left"}>
                  <span className="block text-lg text-dark mb-1.5">
                    {banner.title}
                  </span>
                  {banner.description && (
                    <p className={` text-[14px] ${index === 0 ? "text-right" : "text-left"} mb-2`}>
                      {banner.description}
                    </p>
                  )}
                  <Link
                    href={banner.link}
                    className={`inline-flex font-medium text-[14px] text-white py-2.5 px-8.5 rounded-md ease-out duration-200 mt-5 ${index === 0 ? "bg-blue-dark hover:bg-[#25a953]" : "bg-blue-dark hover:bg-[#25a953]"
                      }`}
                  >
                    {banner.buttonText}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;