import Breadcrumbs from '@/components/v2/Breadcrumbs';
import DynamicIcon from '@/components/v2/DynamicIcon';
import Subscribe from '@/components/v2/Subscribe';
import { getSetting } from '@/app/(admin)/admin/(admin)/setting/actions/setting.action';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About QAAM | Technology You Can Trust',
  description:
    'Discover how QAAM.PK makes tested, dependable and affordable refurbished technology accessible across Pakistan.',
  openGraph: {
    title: 'About QAAM | Technology You Can Trust',
    description:
      'QAAM.PK is redefining how Pakistan shops for dependable refurbished laptops, computers and accessories.',
    url: 'https://qaam.pk/about',
    siteName: 'QAAM.PK',
    images: [{ url: '/images/og-image.png' }],
    type: 'website',
  },
};

const SHOWROOM_IMAGE = '/images/about/qaam-showroom.png';

const DEFAULT_SERVICES = [
  {
    title: 'Laptops',
    description: 'Refurbished laptops with powerful performance for work, study and gaming.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Tablets',
    description: 'Reliable tablets for entertainment, learning and productivity.',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Computers',
    description: 'Desktop systems built for speed, stability and everyday computing needs.',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'LEDs',
    description: 'High-quality LED monitors and displays for sharp, vivid visuals.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Gadgets',
    description: 'Smart, useful gadgets that make everyday life easier and more enjoyable.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Projectors',
    description: 'Projectors for presentations, movies and big-screen experiences.',
    image: 'https://images.unsplash.com/photo-1528395874238-34ebe249b3f2?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Batteries',
    description: 'Long-lasting batteries that keep your devices powered when you need them.',
    image: 'https://images.unsplash.com/photo-1609592424824-4d40193b2617?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Laptop Parts & Accessories',
    description: 'Quality parts and accessories to maintain, protect and upgrade your devices.',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=85',
  },
];

const DEFAULT_MISSION_VISION = [
  {
    title: 'Our Mission',
    description:
      'To deliver dependable products, honest value and excellent customer service while reducing electronic waste and supporting a more sustainable technology ecosystem.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Our Vision',
    description:
      'To become a trusted leader in sustainable technology by changing how people buy, use and reuse electronics—making quality technology accessible while extending the useful life of every device.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=85',
  },
];

const DEFAULT_BENEFITS = [
  { title: 'Quality Assured', description: 'Every product is tested for dependable performance.', icon: 'BadgeCheck' },
  { title: 'Trusted Support', description: 'We are here before and after your purchase.', icon: 'Headphones' },
  { title: 'Best Prices', description: 'Premium technology without the premium cost.', icon: 'BadgeDollarSign' },
  { title: 'Sustainable Choice', description: 'Refurbished technology for a better tomorrow.', icon: 'Leaf' },
];

const DEFAULT_STATS = [
  { value: '10,000+', label: 'Products Sold', detail: 'Across Pakistan', icon: 'ShoppingBag' },
  { value: '5,000+', label: 'Happy Customers', detail: 'And growing', icon: 'UsersRound' },
  { value: 'Checked & Tested', label: 'By Tech Experts', detail: 'Quality assured', icon: 'ShieldCheck' },
  { value: 'Nationwide', label: 'Delivery', detail: 'At your doorstep', icon: 'Truck' },
];

function isImage(value?: string | null) {
  return Boolean(
    value &&
      (value.startsWith('/') ||
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        /\.(png|jpe?g|webp|gif|svg)$/i.test(value)),
  );
}

async function getAboutData() {
  try {
    const [bannerRes, whoWeAreRes, whatWeDoSettingRes, statsRes, whyChooseSettingRes, teamSettingRes, whatWeDo, missionVision, whyChoose, teams] =
      await Promise.all([
        getSetting('about_banner'),
        getSetting('about_who_we_are'),
        getSetting('about_what_we_do'),
        getSetting('about_stats'),
        getSetting('about_why_choose'),
        getSetting('team'),
        prisma.whatWeDo.findMany({ where: { type: 'what_we_do' }, orderBy: { createdAt: 'asc' } }),
        prisma.whatWeDo.findMany({ where: { type: 'mission_vision' }, orderBy: { createdAt: 'asc' } }),
        prisma.whatWeDo.findMany({ where: { type: 'why_choose' }, orderBy: { createdAt: 'asc' } }),
        prisma.team.findMany({ orderBy: { createdAt: 'asc' } }),
      ]);

    return {
      banner: bannerRes?.setting || {},
      whoWeAre: whoWeAreRes?.setting || {},
      whatWeDoSetting: whatWeDoSettingRes?.setting || {},
      statsSetting: statsRes?.setting || {},
      whyChooseSetting: whyChooseSettingRes?.setting || {},
      teamSetting: teamSettingRes?.setting || {},
      whatWeDo,
      missionVision,
      whyChoose,
      teams,
    };
  } catch (error) {
    console.error('Error loading About page data:', error);
    return {
      banner: {},
      whoWeAre: {},
      whatWeDoSetting: {},
      statsSetting: {},
      whyChooseSetting: {},
      teamSetting: {},
      whatWeDo: [],
      missionVision: [],
      whyChoose: [],
      teams: [],
    };
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary sm:text-sm lg:text-base">{children}</p>;
}

function PlayLink({ href, label }: { href?: string; label: string }) {
  const className =
    'inline-flex size-14 items-center justify-center rounded-full bg-white text-[#121714] shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30';

  if (!href) {
    return (
      <span className={className} aria-hidden="true">
        <DynamicIcon name="Play" size={24} className="ml-1 fill-current" />
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className} aria-label={label}>
      <DynamicIcon name="Play" size={24} className="ml-1 fill-current" />
    </a>
  );
}

export default async function AboutPage() {
  const {
    banner,
    whoWeAre,
    whatWeDoSetting,
    statsSetting,
    whyChooseSetting,
    teamSetting,
    whatWeDo,
    missionVision,
    whyChoose,
    teams,
  } = await getAboutData();

  const hero = {
    title: banner.title || 'Our Story.\nOur Promise.',
    subtitle: banner.subtitle || 'QAAM.PK is redefining the way Pakistan shops for technology.',
    description:
      banner.description ||
      'We offer premium, tested and certified refurbished laptops, desktops, monitors, gadgets and accessories at honest prices—backed by warranty, trust and real people.',
    buttonText: banner.buttonText || 'Shop Our Products',
    link: banner.link || '/shop',
    images: [
      banner.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1100&q=85',
      banner.image2 || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=85',
      banner.image3 || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=700&q=85',
      banner.image4 || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85',
      banner.image5 || SHOWROOM_IMAGE,
    ],
    videoUrl: banner.videoUrl || '',
  };

  const stats = DEFAULT_STATS.map((item, index) => ({
    value: statsSetting[`item${index + 1}Value`] || item.value,
    label: statsSetting[`item${index + 1}Label`] || item.label,
    detail: statsSetting[`item${index + 1}Detail`] || item.detail,
    icon: statsSetting[`item${index + 1}Icon`] || item.icon,
  }));

  const services = (whatWeDo.length ? whatWeDo : DEFAULT_SERVICES).map((item: any, index: number) => ({
    title: item.title,
    description: item.description,
    image: isImage(item.image || item.icon) ? item.image || item.icon : DEFAULT_SERVICES[index % DEFAULT_SERVICES.length].image,
  }));

  const missionCards = (missionVision.length ? missionVision : DEFAULT_MISSION_VISION).map((item: any, index: number) => ({
    title: item.title,
    description: item.description,
    image: isImage(item.image || item.icon)
      ? item.image || item.icon
      : DEFAULT_MISSION_VISION[index % DEFAULT_MISSION_VISION.length].image,
  }));

  const benefits = (whyChoose.length ? whyChoose : DEFAULT_BENEFITS).map((item: any, index: number) => ({
    title: item.title,
    description: item.description,
    icon: item.icon || DEFAULT_BENEFITS[index % DEFAULT_BENEFITS.length].icon,
  }));

  return (
    <main className="about-page bg-white text-[#121714] transition-colors dark:bg-[#101713] dark:text-white">
      <div className="mx-auto hidden w-full max-w-[1600px] px-4 pb-2 pt-5 sm:block sm:px-6 lg:px-10">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-9 px-3 pb-12 pt-5 sm:gap-14 sm:px-6 sm:pt-0 md:gap-20 lg:px-10 lg:pb-24">
        <section className="grid items-center gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14 lg:py-10">
          <div className="mx-auto max-w-2xl text-center sm:mx-0 sm:text-left">
            <h1 className="whitespace-pre-line text-[32px] font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-7xl">
              {hero.title}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-[11px] font-extrabold leading-snug text-primary sm:mx-0 sm:mt-4 sm:text-xl">{hero.subtitle}</p>
            <p className="mx-auto mt-4 max-w-xl text-[11px] leading-[1.55] text-[#667069] dark:text-white/65 sm:mx-0 sm:mt-7 sm:text-base sm:leading-7">
              {hero.description}
            </p>
            <Link
              href={hero.link}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[10px] font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg sm:mt-7 sm:gap-2 sm:rounded-lg sm:px-5 sm:py-3 sm:text-sm"
            >
              {hero.buttonText}
              <DynamicIcon name="ArrowRight" size={15} />
            </Link>
          </div>

          <div className="grid h-[205px] grid-cols-[1.25fr_.95fr] grid-rows-3 gap-1.5 sm:h-[390px] sm:gap-2 md:h-[470px] md:gap-3">
            <img src={hero.images[0]} alt="QAAM refurbished laptop" className="row-span-2 h-full w-full rounded-xl object-cover" />
            <img src={hero.images[1]} alt="Technology available at QAAM" className="h-full w-full rounded-xl object-cover" />
            <img src={hero.images[2]} alt="QAAM computer collection" className="h-full w-full rounded-xl object-cover" />
            <div className="relative overflow-hidden rounded-xl">
              <img src={hero.images[4]} alt="QAAM technology showroom" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayLink href={hero.videoUrl} label="Watch the QAAM story" />
              </div>
            </div>
            <img src={hero.images[3]} alt="Technology accessories from QAAM" className="h-full w-full rounded-xl object-cover" />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl bg-[#f4f5f4] p-4 dark:bg-[#1a231e] sm:rounded-2xl sm:p-8 lg:p-10">
          <div className="grid items-center gap-5 sm:gap-8 lg:grid-cols-[.78fr_1.22fr] lg:gap-12">
            <div className="text-center sm:text-left">
              <SectionLabel>{whoWeAre.eyebrow || 'Who we are'}</SectionLabel>
              <h2 className="mt-2 whitespace-pre-line text-xl font-black leading-tight tracking-tight sm:mt-3 sm:text-4xl">
                {whoWeAre.title || 'Trusted Refurbished Tech.\nBuilt for Pakistan.'}
              </h2>
              <div className="mx-auto my-3 h-0.5 w-10 rounded-full bg-primary sm:mx-0 sm:my-5 sm:h-1 sm:w-14" />
              <p className="text-[11px] leading-[1.55] text-[#667069] dark:text-white/65 sm:text-base sm:leading-7">
                {whoWeAre.description ||
                  'We deliver dependable products, honest value and excellent customer service while reducing electronic waste and building a more sustainable technology ecosystem.'}
              </p>
              {whoWeAre.secondaryDescription && (
                <p className="mt-2 text-[11px] leading-[1.55] text-[#667069] dark:text-white/65 sm:mt-3 sm:text-base sm:leading-7">{whoWeAre.secondaryDescription}</p>
              )}
            </div>
            <img
              src={whoWeAre.image || SHOWROOM_IMAGE}
              alt="QAAM team helping customers choose reliable technology"
              className="h-52 w-full rounded-lg object-cover sm:h-80 sm:rounded-xl lg:h-[390px]"
            />
          </div>
        </section>

        <section aria-label="QAAM at a glance" className="rounded-xl border border-black/5 bg-white px-1 py-3 shadow-[0_8px_30px_rgba(0,0,0,.10)] dark:border-white/10 dark:bg-[#18211c] sm:rounded-2xl sm:p-6">
          <div className="grid grid-cols-4 gap-0">
            {stats.map((stat, index) => (
              <div key={`${stat.label}-${index}`} className="flex min-w-0 flex-col items-center justify-center gap-1 border-r border-black/10 px-1 text-center last:border-r-0 dark:border-white/10 sm:flex-row sm:gap-3 sm:px-4 sm:text-left lg:px-7">
                <span className="shrink-0 text-primary">
                  <DynamicIcon name={stat.icon} fallback="BadgeCheck" size={24} />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-[8px] font-black leading-tight sm:text-lg lg:text-xl">{stat.value}</p>
                  <p className="mt-0.5 break-words text-[7px] font-semibold leading-tight text-[#667069] dark:text-white/65 sm:mt-1 sm:text-xs lg:text-sm">{stat.label}</p>
                  <span className="sr-only">{stat.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center sm:text-left">
          <SectionLabel>{whatWeDoSetting.eyebrow || 'What we do'}</SectionLabel>
          <h2 className="mx-auto mt-2 max-w-3xl whitespace-pre-line text-xl font-black leading-tight tracking-tight sm:mx-0 sm:mt-3 sm:text-4xl">
            {whatWeDoSetting.title || 'Quality Tech, Smart Choices.\nEverything You Need, All in One Place.'}
          </h2>
          {whatWeDoSetting.description && (
            <p className="mx-auto mt-3 max-w-3xl text-[11px] leading-[1.55] text-[#667069] dark:text-white/65 sm:mx-0 sm:mt-4 sm:text-base sm:leading-7">{whatWeDoSetting.description}</p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-2.5 text-center sm:mt-8 sm:gap-5 sm:text-left lg:grid-cols-4">
            {services.map((service: any, index: number) => (
              <article key={`${service.title}-${index}`} className="group overflow-hidden rounded-lg border border-black/10 bg-white p-2 shadow-[0_3px_12px_rgba(0,0,0,.08)] transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#18211c] sm:rounded-xl sm:p-3">
                <div className="h-28 overflow-hidden rounded-md bg-[#f4f5f4] sm:h-52 sm:rounded-lg">
                  <img src={service.image} alt={service.title} className="h-full w-full object-contain p-1 transition duration-500 group-hover:scale-105" />
                </div>
                <div className="px-0.5 pb-1 pt-2.5 sm:px-1 sm:pb-2 sm:pt-4">
                  <h3 className="text-[12px] font-black leading-tight sm:text-lg">{service.title}</h3>
                  <p className="mt-1 text-[9px] leading-[1.35] text-[#667069] dark:text-white/60 sm:mt-2 sm:text-sm sm:leading-6">{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:gap-6 xl:grid-cols-2">
          {missionCards.map((card: any, index: number) => (
            <article key={`${card.title}-${index}`} className="grid overflow-hidden rounded-lg bg-[#f4f5f4] dark:bg-[#1a231e] sm:grid-cols-[.88fr_1.12fr] sm:rounded-xl">
              <img src={card.image} alt={card.title} className="h-64 w-full object-cover sm:h-full sm:min-h-[300px]" />
              <div className="flex flex-col justify-center p-4 text-center sm:p-9 sm:text-left">
                <h3 className="text-xl font-black sm:text-3xl">{card.title}</h3>
                <div className="mx-auto my-3 h-0.5 w-10 rounded-full bg-primary sm:mx-0 sm:my-4 sm:h-1 sm:w-14" />
                <p className="text-[11px] leading-[1.55] text-[#667069] dark:text-white/65 sm:text-sm sm:leading-7">{card.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid items-center gap-5 py-1 sm:gap-9 sm:py-3 xl:grid-cols-[.92fr_1fr_.72fr]">
          <div className="text-center sm:text-left">
            <SectionLabel>{whyChooseSetting.eyebrow || 'Why choose QAAM?'}</SectionLabel>
            <h2 className="mt-2 whitespace-pre-line text-xl font-black leading-tight tracking-tight sm:mt-3 sm:text-4xl">
              {whyChooseSetting.title || 'Technology You Can Trust.\nService You Can Count On.'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[10px] leading-[1.5] text-[#667069] dark:text-white/65 sm:mx-0 sm:mt-5 sm:text-base sm:leading-7">
              {whyChooseSetting.description ||
                'From honest product information to careful testing and helpful after-sales support, every part of the QAAM experience is designed around your confidence.'}
            </p>
            <Link
              href={whyChooseSetting.link || '/shop'}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[10px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary/90 sm:mt-6 sm:gap-2 sm:rounded-lg sm:px-5 sm:py-3 sm:text-sm"
            >
              {whyChooseSetting.buttonText || 'Shop With Confidence'}
              <DynamicIcon name="ArrowRight" size={15} />
            </Link>
          </div>

          <div className="hidden gap-5 sm:grid sm:grid-cols-2">
            {benefits.map((benefit: any, index: number) => (
              <div key={`${benefit.title}-${index}`} className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <DynamicIcon name={benefit.icon} fallback="BadgeCheck" size={23} />
                </span>
                <div>
                  <h3 className="font-black">{benefit.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#667069] dark:text-white/60">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 sm:rounded-xl xl:h-[330px]">
            <img src={whyChooseSetting.image || SHOWROOM_IMAGE} alt="QAAM quality testing and customer support" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayLink href={whyChooseSetting.videoUrl} label="Watch why customers choose QAAM" />
            </div>
          </div>
        </section>

        {teams.length > 0 && (
          <section className="overflow-hidden rounded-xl bg-[#f4f5f4] p-4 dark:bg-[#1a231e] sm:rounded-2xl sm:p-8 lg:p-10">
            <div className="grid gap-5 sm:gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
              <div className="text-center sm:text-left">
                <SectionLabel>{teamSetting.eyebrow || 'Our team'}</SectionLabel>
                <h2 className="mt-2 whitespace-pre-line text-xl font-black leading-tight tracking-tight sm:mt-3 sm:text-4xl">
                  {teamSetting.title || 'The People Behind QAAM\nWorking for You.'}
                </h2>
                {teamSetting.description && <p className="mt-3 text-[11px] leading-[1.55] text-[#667069] dark:text-white/65 sm:mt-4 sm:text-sm sm:leading-7">{teamSetting.description}</p>}
              </div>
              <div className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
                {teams.map((member: any) => (
                  <article key={member.id} className="w-[44%] shrink-0 snap-start overflow-hidden rounded-lg bg-white text-center shadow-[0_3px_14px_rgba(0,0,0,.13)] dark:bg-[#101713] sm:w-auto sm:rounded-xl">
                    <img src={member.image} alt={member.name} className="h-32 w-full object-cover object-top sm:h-44" />
                    <div className="p-2.5 sm:p-4">
                      <h3 className="text-[11px] font-black sm:text-base">{member.name}</h3>
                      <p className="mt-0.5 text-[9px] text-[#667069] dark:text-white/60 sm:mt-1 sm:text-sm">{member.designation}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <Subscribe
          variant="compact"
          title={banner.newsletterTitle || 'Stay Updated with QAAM'}
          description={
            banner.newsletterDescription ||
            'Subscribe for the latest deals, new arrivals and exclusive offers delivered straight to your inbox.'
          }
        />
      </div>
    </main>
  );
}
