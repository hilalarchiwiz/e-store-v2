import SiteIcon from '@/components/v2/SiteIcon';

const benefits = [
  { title: "Free Shipping", description: "On all orders above PKR 10,000", icon: "truck" },
  { title: "1 Year Warranty", description: "Brand authorized products", icon: "shield_check" },
  { title: "Easy Returns", description: "7- day hassle free returns", icon: "badge_dollar_sign" },
  { title: "Secure Payments", description: "100% secure checkout", icon: "lock" },
];

export default function ShopBenefits() {
  return (
    <section aria-label="Shopping benefits" className="rounded-2xl border border-neutral-200 bg-white p-4 font-['Inter'] shadow-[0_1px_6px_rgba(0,0,0,0.14)] dark:border-neutral-700 dark:bg-surface">
      <ul className="flex flex-col gap-7">
        {benefits.map(({ title, description, icon }) => (
          <li key={title} className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e7efea] text-[#159d4c] dark:bg-[#1b974b]/15 dark:text-[#38c775]">
              <SiteIcon name={icon} className="text-2xl" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-6 text-black dark:text-white">{title}</h3>
              <p className="text-[13px] leading-5 text-[#606060] dark:text-neutral-300">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
