import { getRandomProducts, getSliders } from "@/lib/action/home.action";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import Link from "next/link";
export const revalidate = 1
const Hero = async () => {

  const { sliders } = await getSliders();
  const { products } = await getRandomProducts();
  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel sliders={sliders} />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              {products && products.map(product => (
                <div key={product.id} className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                  <div className="flex items-center justify-between gap-14">
                    <div>
                      <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-17">
                        <Link
                          href={`/shop-details/${product.id}`}
                          className="line-clamp-3 hover:text-blue transition-colors"
                        >
                          {product.title}
                        </Link>
                      </h2>

                      <div>

                        <span className="flex items-center gap-3">
                          <span className="font-medium text-md text-heading-5 text-red">
                            Rs. {
                              product.discountedPrice
                                ? product.price - ((product.discountedPrice / 100) * product.price)
                                : product.price
                            }
                          </span>
                          {
                            product.discountedPrice ? (
                              <span className="font-medium text-md text-dark-4 line-through">
                                Rs.{product.price}
                              </span>
                            ) : ('')
                          }

                        </span>
                      </div>
                    </div>

                    <div>
                      <Image
                        src={product.images[0]}
                        alt="mobile image"
                        width={123}
                        height={161}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
