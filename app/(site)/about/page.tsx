import Breadcrumbs from '@/components/v2/Breadcrumbs';
import Button from '@/components/v2/Button';
import Link from 'next/link';
import DynamicIcon from '@/components/v2/DynamicIcon';
import { getSetting } from '@/app/(admin)/admin/(admin)/setting/actions/setting.action';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About QAAM | QAAM.PK - Technology You Can Trust",
  description: "QAAM.PK is redefining the way Pakistan shops for technology. We provide high-quality refurbished laptops, gadgets, and accessories that deliver premium performance.",
  openGraph: {
    title: "About QAAM | Technology You Can Trust",
    description: "QAAM.PK is redefining the way Pakistan shops for technology with high-quality refurbished laptops and accessories.",
    url: "https://qaam.pk/about",
    siteName: "Qaam.pk",
    images: [{ url: "/images/og-image.png" }],
    type: "website",
  },
};

async function getAboutData() {
  try {
    const [bannerRes, whoWeAreRes, whatWeDoSettingRes, whatWeDo, missionVision, whyChoose, teams] = await Promise.all([
      getSetting('about_banner'),
      getSetting('about_who_we_are'),
      getSetting('about_what_we_do'),
      prisma.whatWeDo.findMany({ where: { type: 'what_we_do' }, orderBy: { createdAt: 'asc' } }),
      prisma.whatWeDo.findMany({ where: { type: 'mission_vision' }, orderBy: { createdAt: 'asc' } }),
      prisma.whatWeDo.findMany({ where: { type: 'why_choose' }, orderBy: { createdAt: 'asc' } }),
      prisma.team.findMany({ orderBy: { createdAt: 'asc' } }),
    ]);
    return {
      banner: bannerRes?.setting || {},
      whoWeAre: whoWeAreRes?.setting || {},
      whatWeDo: whatWeDo || [],
      whatWeDoSetting: whatWeDoSettingRes?.setting || {},
      missionVision: missionVision || [],
      whyChoose: whyChoose || [],
      teams: teams || [],
    };
  } catch (error) {
    console.error("Error loading about data:", error);
    return {
      banner: {},
      whoWeAre: {},
      whatWeDo: [],
      whatWeDoSetting: {},
      missionVision: [],
      whyChoose: [],
      teams: [],
    };
  }
}

// Default fallback categories/services for QAAM redesign matching mockup specs
const DEFAULT_SERVICES = [
  {
    title: "Laptops",
    description: "Refurbished laptops with powerful performance for work, study and gaming.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    icon: "laptop",
  },
  {
    title: "Tablets",
    description: "Reliable tablets for entertainment, learning and productivity.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    icon: "tablet",
  },
  {
    title: "Computer",
    description: "Desktop built for speed, stability and everyday computing needs.",
    image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80",
    icon: "monitor",
  },
  {
    title: "LEDs",
    description: "High quality LED monitors and displays for crisp visuals.",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    icon: "tv",
  },
  {
    title: "Gadgets",
    description: "Smart and useful gadgets that make life easier and more fun.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    icon: "headphones",
  },
  {
    title: "Projectors",
    description: "Projectors for presentations, movies and big screen experiences.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    icon: "projector",
  },
  {
    title: "Batteries",
    description: "Long lasting batteries to keep your devices powered when you need them.",
    image: "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=800&q=80",
    icon: "battery-charging",
  },
  {
    title: "Laptop parts & Accessories",
    description: "Original parts and accessories to maintain and upgrade your devices.",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80",
    icon: "cpu",
  },
];

const DEFAULT_VALUE_PROPS = [
  {
    title: "Quality Assured",
    description: "Every product is tested for top performance",
    icon: "verified",
  },
  {
    title: "Best Prices",
    description: "Premium technology without the premium cost.",
    icon: "payments",
  },
  {
    title: "Trusted Support",
    description: "We're here before and after your purchase.",
    icon: "headset_mic",
  },
  {
    title: "Sustainable Choice",
    description: "Refurbished tech for a better tomorrow.",
    icon: "eco",
  },
];

export default async function AboutPageV2() {
  const { banner, whoWeAre, whatWeDo, whatWeDoSetting, missionVision, whyChoose } = await getAboutData();

  // Combine dynamic data with QAAM defaults for a complete aesthetic display
  const heroTitle = whoWeAre.title || banner.title || "About QAAM";
  const heroSubtitle = "Technology you can trust, performance you can feel.";
  const heroDescription = whoWeAre.description || banner.description || "QAAM.PK is redefining the way Pakistan shops for technology. We provide high-quality refurbished laptops, gadgets, and accessories that deliver premium performance without the premium price tag. With a focus on trust, affordability, and customer satisfaction, we make smart technology accessible for everyone.";
  const heroImage = whoWeAre.image || banner.image || "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80";

  const servicesList = whatWeDo.length > 0
    ? whatWeDo.map((item, idx) => ({
      title: item.title,
      description: item.description,
      image: DEFAULT_SERVICES[idx % DEFAULT_SERVICES.length].image,
      icon: item.icon || DEFAULT_SERVICES[idx % DEFAULT_SERVICES.length].icon,
    }))
    : DEFAULT_SERVICES;

  const valueProps = whyChoose.length > 0
    ? whyChoose.map((item, idx) => ({
      title: item.title,
      description: item.description,
      icon: item.icon || DEFAULT_VALUE_PROPS[idx % DEFAULT_VALUE_PROPS.length].icon,
    }))
    : DEFAULT_VALUE_PROPS;

  return (
    <main className="min-h-screen bg-white dark:bg-[#121815] text-gray-900 dark:text-white transition-colors duration-300">

      {/* 1. Breadcrumbs Container */}
      <div className="max-w-400 mx-auto px-4  pt-6 pb-2">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      </div>

      {/* 2. Hero About Section */}
      <section className="max-w-400 mx-auto px-4  py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Text Block */}
          <div className="lg:col-span-6 flex flex-col justify-start items-start gap-6">
            <div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white font-['Inter',sans-serif] leading-tight">
                {heroTitle}
              </h1>
              <p className="mt-2 text-xl sm:text-2xl font-semibold text-green-600 dark:text-green-400">
                {heroSubtitle}
              </p>
            </div>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {heroDescription}
            </p>

            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-green-600/20 transition-all duration-200 group"
              >
                <span>Shop Our Products</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Right Image Block */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800 aspect-[4/3] sm:aspect-[16/11]">
              <img
                src={heroImage}
                alt="About QAAM"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-2xl pointer-events-none" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. Feature Highlights / Badges Bar */}
      <section className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-50 dark:bg-[#1a231e] border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((prop, idx) => (
            <div key={idx} className="flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-full bg-green-600/10 dark:bg-green-500/15 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <DynamicIcon name={prop.icon} fallback="verified" size={26} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
                  {prop.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                  {prop.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Our Services / What We Offer */}
      <section className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <span className="text-green-600 dark:text-green-400 font-bold text-lg md:text-xl block mb-1">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            {whatWeDoSetting.title || "What We Offer"}
          </h2>
          {whatWeDoSetting.description && (
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm md:text-base">
              {whatWeDoSetting.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {servicesList.map((service, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#1a231e] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group p-3.5"
            >
              <div className="w-full h-48 md:h-52 rounded-lg overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex flex-col flex-1 justify-start">
                <Link href={`/shop?category=${encodeURIComponent(service.title)}`} className="no-underline">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {service.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Our Mission & Our Vision */}
      <section className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Mission Card */}
          <div className="bg-gray-50 dark:bg-[#1a231e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full sm:w-64 h-48 sm:h-44 rounded-xl overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                alt="Our Mission"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {missionVision[0]?.title || "Our Mission"}
              </h3>
              <div className="w-16 h-1 bg-green-600 dark:bg-green-500 rounded-full my-3" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {missionVision[0]?.description || "We are committed to delivering dependable products, honest value, and excellent customer service while reducing electronic waste and promoting a more sustainable technology ecosystem."}
              </p>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-gray-50 dark:bg-[#1a231e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full sm:w-64 h-48 sm:h-44 rounded-xl overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700">
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
                alt="Our Vision"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {missionVision[1]?.title || "Our Vision"}
              </h3>
              <div className="w-16 h-1 bg-green-600 dark:bg-green-500 rounded-full my-3" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {missionVision[1]?.description || "To become a trusted leader in sustainable technology solutions by transforming the way people buy, use, and reuse electronics. We envision a future where quality technology is accessible to everyone and electronic waste is reduced through responsible refurbishment, repair, and reuse."}
              </p>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}

/* ============================================================================
   OLD ABOUT PAGE CODE (COMMENTED OUT FOR REFERENCE AS REQUESTED)
   ============================================================================

const CARD_STYLES = [
  'bg-primary text-white',
  'bg-white dark:bg-[#1a251d] text-[#121714] dark:text-white',
];

export function OldAboutPageV2({ banner, whoWeAre, whatWeDo, whatWeDoSetting, missionVision, whyChoose, teams }: any) {
  return (
    <main className="flex-1">
      <section className="relative h-[360px] sm:h-[440px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {banner.image ? (
            <img src={banner.image} className="w-full h-full object-cover scale-105" alt="About Banner" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-[#1a4731]" />
          )}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        </div>
        <div className="relative z-10 max-w-[800px] mx-auto px-4 sm:px-6 text-center text-white">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-3 sm:mb-6 leading-tight">
            {banner.title || 'Eco-Conscious Living Starts Here'}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            {banner.description || 'Discover the story, mission, and passionate team behind Qaam.pk.'}
          </p>
        </div>
      </section>

      <div className="max-w-400 md:px-10 mx-auto w-full px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20 mb-6 sm:mb-10">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />
      </div>

      {(whoWeAre.title || whoWeAre.description) && (
        <section className="max-w-400 md:px-10 mx-auto px-4 sm:px-6 py-10 sm:py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="space-y-4 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              Visionaries
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-[#121714] dark:text-white leading-tight">
              {whoWeAre.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              {whoWeAre.description}
            </p>
            {whoWeAre.buttonText && (
              whoWeAre.link ? (
                <Link href={whoWeAre.link}>
                  <Button variant="primary" icon="trending_up">{whoWeAre.buttonText}</Button>
                </Link>
              ) : (
                <Button variant="primary" icon="trending_up">{whoWeAre.buttonText}</Button>
              )
            )}
          </div>
          <div className="relative group">
            <div className="aspect-[4/3] sm:aspect-[4/5] rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
              {whoWeAre.image ? (
                <img src={whoWeAre.image} className="w-full h-full object-cover" alt="Who we are" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl sm:text-8xl text-primary/40">nature_people</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-10 -left-10 bg-primary p-10 rounded-[2rem] shadow-2xl text-white hidden xl:block">
              <span className="material-symbols-outlined text-5xl">nature_people</span>
            </div>
          </div>
        </section>
      )}

      <section className="bg-primary/5 dark:bg-[#1a251d]/30 py-12 sm:py-24 md:py-32">
        <div className="max-w-400 md:px-10 mx-auto px-4 sm:px-6 text-center">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 sm:mb-4 block">Our Services</span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#121714] dark:text-white mb-3 sm:mb-4">
            {whatWeDoSetting.title || 'What We Do'}
          </h2>
          {whatWeDoSetting.description && (
            <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 sm:mb-16 md:mb-20">{whatWeDoSetting.description}</p>
          )}
          {!whatWeDoSetting.description && <div className="mb-10 sm:mb-16 md:mb-20" />}
          {whatWeDo.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
              {whatWeDo.map((item: any) => (
                <div key={item.id} className="bg-white dark:bg-[#1a251d] p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-transform duration-500 border border-primary/5">
                  <div className="size-14 sm:size-20 bg-primary rounded-2xl sm:rounded-3xl flex items-center justify-center text-white mx-auto mb-5 sm:mb-8 shadow-lg shadow-primary/30">
                    <DynamicIcon name={item.icon} fallback="Eco" size={32} />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-[#121714] dark:text-white mb-2 sm:mb-4">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm sm:text-lg">No services added yet.</p>
          )}
        </div>
      </section>

      {missionVision.length > 0 && (
        <section className="max-w-400 md:px-10 mx-auto px-4 sm:px-6 py-12 sm:py-24 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {missionVision.map((item: any, i: number) => (
            <div key={item.id} className={`${CARD_STYLES[i % CARD_STYLES.length]} p-6 sm:p-12 md:p-20 rounded-2xl sm:rounded-[3rem] shadow-2xl relative overflow-hidden group`}>
              <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="size-12 sm:size-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-8 backdrop-blur-md">
                <DynamicIcon name={item.icon} fallback="Flag" size={28} />
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-6">{item.title}</h3>
              <p className="text-sm sm:text-base md:text-lg opacity-80 leading-relaxed font-medium">{item.description}</p>
            </div>
          ))}
        </section>
      )}

      {whyChoose.length > 0 && (
        <section className="bg-[#121714] py-12 sm:py-24 md:py-32">
          <div className="max-w-400 md:px-10 mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white text-center mb-10 sm:mb-16 md:mb-20">
              Why Choose <span className="text-primary italic">Qaam.pk?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {whyChoose.map((item: any) => (
                <div key={item.id} className="text-center group p-4 sm:p-0">
                  <div className="size-16 sm:size-24 bg-primary/10 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-4 sm:mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl shadow-black/20">
                    <DynamicIcon name={item.icon} fallback="Star" size={32} />
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white mb-2 sm:mb-4">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {teams.length > 0 && (
        <section className="max-w-400 md:px-10 mx-auto px-4 sm:px-6 py-12 sm:py-24 md:py-32">
          <div className="text-center mb-10 sm:mb-20">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-6 text-primary">
              <span className="material-symbols-outlined text-2xl sm:text-4xl">groups</span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em]">Our Tribe</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#121714] dark:text-white mb-3 sm:mb-6">Meet the Experts</h2>
            <p className="text-xs sm:text-base text-gray-500 max-w-xl mx-auto font-medium">
              Combining decades of experience in environmental science, botany, and sustainable design.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            {teams.map((member: any) => (
              <div key={member.id} className="group text-center">
                <div className="mb-4 sm:mb-8 rounded-2xl sm:rounded-[2rem] overflow-hidden aspect-[3/4] relative shadow-xl">
                  {member.image ? (
                    <img src={member.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={member.name} />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-5xl sm:text-6xl text-primary/40">person</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-[#121714] dark:text-white mb-1">{member.name}</h3>
                <p className="text-primary font-bold text-xs sm:text-sm mb-2 sm:mb-4">{member.designation}</p>
                <p className="text-xs text-gray-500 leading-relaxed font-medium px-2 sm:px-4">{member.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
============================================================================ */

