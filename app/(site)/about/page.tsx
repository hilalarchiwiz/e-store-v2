import Breadcrumbs from '@/components/v2/Breadcrumbs';
import Button from '@/components/v2/Button';
import Link from 'next/link';
import { getSetting } from '@/app/(admin)/admin/(admin)/setting/actions/setting.action';
import prisma from '@/lib/prisma';

async function getAboutData() {
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
    banner: bannerRes.setting || {},
    whoWeAre: whoWeAreRes.setting || {},
    whatWeDo,
    whatWeDoSetting: whatWeDoSettingRes.setting || {},
    missionVision,
    whyChoose,
    teams,
  };
}

const CARD_STYLES = [
  'bg-primary text-white',
  'bg-white dark:bg-[#1a251d] text-[#121714] dark:text-white',
];

export default async function AboutPageV2() {
  const { banner, whoWeAre, whatWeDo, whatWeDoSetting, missionVision, whyChoose, teams } = await getAboutData();

  return (
    <main className="flex-1">
      {/* 1. Banner */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {banner.image ? (
            <img src={banner.image} className="w-full h-full object-cover scale-105" alt="About Banner" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-[#1a4731]" />
          )}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        </div>
        <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            {banner.title || 'Eco-Conscious Living Starts Here'}
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            {banner.description || 'Discover the story, mission, and passionate team behind Ecomare.'}
          </p>
        </div>
      </section>

      <div className="max-w-300 mx-auto w-full px-6 -mt-8 relative z-20 mb-10">
        <Breadcrumbs items={[{ label: 'Home', href: '/v2' }, { label: 'About Us' }]} />
      </div>

      {/* 2. Who We Are */}
      {(whoWeAre.title || whoWeAre.description) && (
        <section className="max-w-300 mx-auto px-6 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              Visionaries
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#121714] dark:text-white leading-[1.1]">
              {whoWeAre.title}
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
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
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
              {whoWeAre.image ? (
                <img src={whoWeAre.image} className="w-full h-full object-cover" alt="Who we are" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-8xl text-primary/40">nature_people</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-10 -left-10 bg-primary p-10 rounded-[2rem] shadow-2xl text-white hidden xl:block">
              <span className="material-symbols-outlined text-5xl">nature_people</span>
            </div>
          </div>
        </section>
      )}

      {/* 3. What We Do */}
      <section className="bg-primary/5 dark:bg-[#1a251d]/30 py-24 md:py-32">
        <div className="max-w-300 mx-auto px-6 text-center">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Our Services</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#121714] dark:text-white mb-4">
            {whatWeDoSetting.title || 'What We Do'}
          </h2>
          {whatWeDoSetting.description && (
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-20">{whatWeDoSetting.description}</p>
          )}
          {!whatWeDoSetting.description && <div className="mb-20" />}
          {whatWeDo.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {whatWeDo.map((item) => (
                <div key={item.id} className="bg-white dark:bg-[#1a251d] p-10 rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-transform duration-500 border border-primary/5">
                  <div className="size-20 bg-primary rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-4xl">{item.icon || 'eco'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#121714] dark:text-white mb-4">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-lg">No services added yet.</p>
          )}
        </div>
      </section>

      {/* 4. Mission & Vision */}
      {missionVision.length > 0 && (
        <section className="max-w-300 mx-auto px-6 py-24 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-8">
          {missionVision.map((item, i) => (
            <div key={item.id} className={`${CARD_STYLES[i % CARD_STYLES.length]} p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden group`}>
              <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                <span className="material-symbols-outlined text-3xl">{item.icon || 'flag'}</span>
              </div>
              <h3 className="text-4xl font-black mb-6">{item.title}</h3>
              <p className="text-lg opacity-80 leading-relaxed font-medium">{item.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* 5. Why Choose Us */}
      {whyChoose.length > 0 && (
        <section className="bg-[#121714] py-24 md:py-32">
          <div className="max-w-300 mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-20">
              Why Choose <span className="text-primary italic">Ecomare?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyChoose.map((item) => (
                <div key={item.id} className="text-center group">
                  <div className="size-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl shadow-black/20">
                    <span className="material-symbols-outlined text-4xl">{item.icon || 'star'}</span>
                  </div>
                  <h4 className="text-xl font-black text-white mb-4">{item.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Team */}
      {teams.length > 0 && (
        <section className="max-w-300 mx-auto px-6 py-24 md:py-32">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-6 text-primary">
              <span className="material-symbols-outlined text-4xl">groups</span>
              <span className="text-sm font-black uppercase tracking-[0.3em]">Our Tribe</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#121714] dark:text-white mb-6">Meet the Experts</h2>
            <p className="text-gray-500 max-w-xl mx-auto font-medium">
              Combining decades of experience in environmental science, botany, and sustainable design.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {teams.map((member) => (
              <div key={member.id} className="group text-center">
                <div className="mb-8 rounded-[2rem] overflow-hidden aspect-[3/4] relative shadow-xl">
                  {member.image ? (
                    <img src={member.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={member.name} />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-primary/40">person</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-2xl font-black text-[#121714] dark:text-white mb-1">{member.name}</h3>
                <p className="text-primary font-bold text-sm mb-4">{member.designation}</p>
                <p className="text-xs text-gray-500 leading-relaxed font-medium px-4">{member.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
