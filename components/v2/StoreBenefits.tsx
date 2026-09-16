import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHoldingDollar,
  faHeadset,
  faSquareCheck,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";

const benefits = [
  {
    title: "Checked Products",
    description: "Every product is tested for quality and performance.",
    icon: faSquareCheck,
  },
  {
    title: "Affordable pricing",
    description: "Best prices on premium refurbished tech.",
    icon: faHandHoldingDollar,
  },
  {
    title: "Customer Support",
    description: "Expert support before and after purchase.",
    icon: faHeadset,
  },
  {
    title: "Fast Delivery",
    description: "Nationwide delivery across Pakistan.",
    icon: faTruck,
  },
];

export default function StoreBenefits() {
  return (
    <section aria-label="Why shop with QAAM" className="pb-2 pt-8 sm:pt-10">
      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-0.5 py-1 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="flex min-h-32 min-w-[290px] snap-start items-center gap-4 rounded-lg border border-black/10 bg-white px-4 py-5 shadow-[0_2px_7px_rgba(0,0,0,0.16)] dark:border-white/10 dark:bg-surface sm:min-w-[312px] lg:min-w-0"
          >
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#e8f0eb] text-primary dark:bg-primary/15">
              <FontAwesomeIcon icon={benefit.icon} className="text-3xl" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold leading-tight text-foreground sm:text-lg">
                {benefit.title}
              </h3>
              <p className="mt-0.5 text-sm leading-[1.25] text-[#555] dark:text-white/70 sm:text-base">
                {benefit.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
