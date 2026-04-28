import React from "react";

interface Banner {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  link: string;
  buttonText: string | null;
}

interface BannersProps {
  banners: Banner[];
}

const Banners: React.FC<BannersProps> = ({ banners = [] }) => {
  if (!banners.length) return null;

  const [banner1, banner2, banner3] = banners;

  return (
    <section className="px-6 py-16">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Banner 1 - Left */}
        {banner1 && (
          <div className="lg:col-span-1 h-[400px] relative rounded-3xl overflow-hidden shadow-lg group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url("${banner1.imageUrl}")` }}
            ></div>
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <h3 className="text-2xl font-bold mb-2 leading-tight">
                {banner1.title}
              </h3>
              <a
                href={banner1.link}
                className="text-sm font-bold underline flex items-center gap-2"
              >
                {banner1.buttonText || "Learn More"}{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>
        )}

        {/* Banner 2 - Center (Large) */}
        {banner2 && (
          <div className="lg:col-span-2 h-[400px] relative rounded-3xl overflow-hidden shadow-2xl group border-4 border-primary/20">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url("${banner2.imageUrl}")` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent"></div>
            <div className="absolute inset-0 p-12 flex flex-col justify-center max-w-md text-white">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 w-fit">
                Limited Edition
              </span>
              <h2 className="text-4xl font-black mb-4 leading-tight">
                {banner2.title}
              </h2>
              {banner2.description && (
                <p className="mb-8 opacity-90 text-sm">{banner2.description}</p>
              )}
              <a
                href={banner2.link}
                className="bg-white text-primary-dark px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all w-fit shadow-xl"
              >
                {banner2.buttonText || "Shop Collection"}
              </a>
            </div>
          </div>
        )}

        {/* Banner 3 - Right */}
        {banner3 && (
          <div className="lg:col-span-1 h-[400px] relative rounded-3xl overflow-hidden shadow-lg group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url("${banner3.imageUrl}")` }}
            ></div>
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white text-right">
              <h3 className="text-2xl font-bold mb-2 leading-tight">
                {banner3.title}
              </h3>
              <a
                href={banner3.link}
                className="text-sm font-bold underline flex items-center gap-2 justify-end"
              >
                {banner3.buttonText || "Our Process"}{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Banners;
