import Link from "next/link";
import { getPages } from "@/lib/action/home.action";
import generateSession from "@/lib/generate-session";

interface FooterProps {
  logo?: { logo?: string; dark_logo?: string; favicon?: string };
  generalSetting?: {
    support_number?: string;
    footer_text?: string;
    support_email?: string;
    home_address_location?: string;
    home_number?: string;
  };
  socialInfo?: {
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
  };
}

const SOCIAL_ICONS: Record<string, string> = {
  facebook_url: "facebook",
  instagram_url: "instagram",
  twitter_url: "public",
  linkedin_url: "mail",
};

const Footer = async ({ logo, generalSetting, socialInfo }: FooterProps) => {
  const [{ pages = [] }, session] = await Promise.all([
    getPages(),
    generateSession(),
  ]);
  const isLoggedIn = !!session?.user;

  const socialLinks = socialInfo
    ? Object.entries(socialInfo).filter(([, url]) => !!url)
    : [];

  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#0c120e] border-t border-[#f1f4f2] dark:border-[#2a3a2f] pt-16 pb-8">
      <div className="max-w-400 mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-primary mb-6"
            >
              {logo?.logo || logo?.dark_logo ? (
                <>
                  {logo.logo && (
                    <img
                      src={logo.logo}
                      alt="Logo (White)"
                      className={`h-9 w-auto object-contain ${logo.dark_logo ? "hidden dark:block" : ""}`}
                    />
                  )}
                  {logo.dark_logo && (
                    <img
                      src={logo.dark_logo}
                      alt="Logo (Black)"
                      className={`h-9 w-auto object-contain ${logo.logo ? "dark:hidden block" : ""}`}
                    />
                  )}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl font-bold">
                    Qaam
                  </span>
                  <h2 className="text-[#121714] dark:text-white text-2xl font-black">
                    .PK
                  </h2>
                </>
              )}
            </Link>
            <p className="text-[#121714]/60 dark:text-white/60 mb-6 leading-relaxed text-sm">
              We provide high-quality refurbished laptops, gadgets, and accessories that deliver premium performance without the premium price tag.
            </p>
            {/* Social links */}
            {socialLinks.length > 0 ? (
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map(([key, url]) => (
                  <a
                    key={key}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-10 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                    title={key.replace("_url", "")}
                  >
                    {key === "facebook_url" ? (
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.99984 0.666504C7.48706 0.666504 6.09165 1.04648 4.81361 1.80644C3.53557 2.54019 2.51836 3.5491 1.76197 4.83317C1.03166 6.11724 0.666504 7.51923 0.666504 9.03915C0.666504 10.428 0.966452 11.7252 1.56635 12.9307C2.19233 14.1099 3.04 15.0926 4.10938 15.8788C5.17876 16.6649 6.37855 17.1497 7.70876 17.3332V11.4763H5.59608V9.03915H7.70876V7.19166C7.70876 6.16965 7.98262 5.37038 8.53035 4.79386C9.10417 4.21734 9.8736 3.92908 10.8386 3.92908C11.4646 3.92908 12.0906 3.98149 12.7166 4.08632V6.16965H11.6602C11.1908 6.16965 10.8386 6.30068 10.6039 6.56273C10.3952 6.79858 10.2909 7.09994 10.2909 7.46682V9.03915H12.6383L12.2471 11.4763H10.2909V17.3332C11.6472 17.1235 12.86 16.6256 13.9294 15.8395C14.9988 15.0533 15.8334 14.0706 16.4333 12.8913C17.0332 11.6859 17.3332 10.4018 17.3332 9.03915C17.3332 7.51923 16.955 6.11724 16.1986 4.83317C15.4683 3.5491 14.4641 2.54019 13.1861 1.80644C11.908 1.04648 10.5126 0.666504 8.99984 0.666504Z" fill="currentColor" />
                        <path opacity="0.04" d="M7.70887 11.4764V17.3333H10.291V11.4764H12.2472L12.6384 9.03926H10.291V7.46693C10.291 7.10006 10.3954 6.7987 10.604 6.56285C10.8388 6.30079 11.1909 6.16977 11.6604 6.16977H12.7167V4.08643C12.0907 3.98161 11.4647 3.9292 10.8388 3.9292C9.87371 3.9292 9.10428 4.21746 8.53046 4.79398C7.98273 5.3705 7.70887 6.16977 7.70887 7.19178V9.03926H5.59619V11.4764H7.70887Z" fill="currentColor" />
                      </svg>
                    ) : key === "instagram_url" ? (
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_317_501)">
                          <path d="M19.6562 6C19.625 5 19.4375 4.28125 19.2187 3.625C19 2.96875 18.6562 2.4375 18.125 1.90625C17.5937 1.375 17.0625 1.0625 16.4375 0.8125C15.8125 0.5625 15.125 0.40625 14.0625 0.375C12.9687 0.3125 12.6562 0.3125 10 0.3125C7.34375 0.3125 7.0625 0.3125 6 0.34375C4.9375 0.375 4.28125 0.5625 3.625 0.78125C2.96875 1 2.4375 1.375 1.90625 1.90625C1.375 2.4375 1.03125 2.96875 0.8125 3.625C0.5625 4.25 0.40625 4.9375 0.375 6C0.34375 7.0625 0.3125 7.34375 0.3125 10C0.3125 12.6562 0.3125 12.9375 0.34375 14C0.375 15.0625 0.5625 15.7188 0.78125 16.375C1 17.0312 1.34375 17.5625 1.875 18.0938C2.40625 18.625 2.96875 18.9688 3.59375 19.1875C4.21875 19.4062 4.90625 19.5938 5.96875 19.625C7.03125 19.6875 7.3125 19.6875 9.96875 19.6875C12.625 19.6875 12.9062 19.6875 13.9687 19.6562C15.0312 19.625 15.6875 19.4375 16.3437 19.2188C17 19 17.5312 18.6562 18.0625 18.125C18.5937 17.5938 18.9375 17.0312 19.1562 16.4062C19.375 15.7812 19.5625 15.0938 19.5937 14.0312C19.625 13.0312 19.625 12.7188 19.625 10.0625C19.625 7.40625 19.6875 7.0625 19.6562 6ZM17.9062 13.9062C17.875 14.8438 17.6875 15.3438 17.5625 15.7188C17.375 16.1562 17.1562 16.5 16.8125 16.8125C16.4687 17.1562 16.1562 17.3438 15.7187 17.5625C15.375 17.6875 14.875 17.875 13.9062 17.9062C12.9062 17.9062 12.5937 17.9062 10.0312 17.9062C7.46875 17.9062 7.125 17.9062 6.125 17.875C5.1875 17.8438 4.6875 17.6562 4.3125 17.5312C3.875 17.3438 3.53125 17.125 3.21875 16.7812C2.875 16.4375 2.6875 16.125 2.46875 15.6875C2.34375 15.3438 2.15625 14.8438 2.125 13.875C2.125 12.9063 2.125 12.5938 2.125 10C2.125 7.40625 2.125 7.09375 2.15625 6.09375C2.1875 5.15625 2.375 4.65625 2.5 4.28125C2.6875 3.84375 2.90625 3.5 3.21875 3.1875C3.5625 2.84375 3.875 2.65625 4.3125 2.46875C4.65625 2.34375 5.15625 2.15625 6.125 2.125C7.125 2.09375 7.4375 2.09375 10.0312 2.09375C12.625 2.09375 12.9375 2.09375 13.9375 2.125C14.875 2.15625 15.375 2.34375 15.75 2.46875C16.1875 2.65625 16.5312 2.875 16.8437 3.1875C17.1875 3.53125 17.375 3.84375 17.5937 4.28125C17.7187 4.625 17.9062 5.125 17.9375 6.09375C17.9687 7.09375 17.9687 7.40625 17.9687 10C17.9687 12.5938 17.9375 12.9062 17.9062 13.9062Z" fill="currentColor" />
                          <path d="M10.0005 5.03125C7.21924 5.03125 5.03174 7.28125 5.03174 10C5.03174 12.7812 7.28174 14.9688 10.0005 14.9688C12.7192 14.9688 15.0005 12.7812 15.0005 10C15.0005 7.21875 12.7817 5.03125 10.0005 5.03125ZM10.0005 13.25C8.18799 13.25 6.75049 11.7812 6.75049 10C6.75049 8.21875 8.21924 6.75 10.0005 6.75C11.813 6.75 13.2505 8.1875 13.2505 10C13.2505 11.8125 11.813 13.25 10.0005 13.25Z" fill="currentColor" />
                          <path d="M15.2188 5.96875C15.8573 5.96875 16.375 5.45106 16.375 4.8125C16.375 4.17391 15.8573 3.65625 15.2188 3.65625C14.5802 3.65625 14.0625 4.17391 14.0625 4.8125C14.0625 5.45106 14.5802 5.96875 15.2188 5.96875Z" fill="currentColor" />
                        </g>
                        <defs>
                          <clipPath id="clip0_317_501">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    ) : (
                      <span className="material-symbols-outlined text-lg">
                        {SOCIAL_ICONS[key] ?? "link"}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex gap-3">
                <a
                  className="size-10 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                  href="#"
                >
                  <span className="material-symbols-outlined text-lg">
                    public
                  </span>
                </a>
                <a
                  className="size-10 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                  href="#"
                >
                  <span className="material-symbols-outlined text-lg">
                    play_arrow
                  </span>
                </a>
                <a
                  className="size-10 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                  href="#"
                >
                  <span className="material-symbols-outlined text-lg">
                    camera
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="flex flex-col gap-4 text-[#121714]/60 dark:text-white/60 text-sm">
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/shop"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/about"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/recently-viewed"
                >
                  Recently Viewed
                </Link>
              </li>
              {pages &&
                pages.map((page: any) => (
                  <li key={page.id}>
                    <Link
                      className="hover:text-primary transition-colors"
                      href={`/${page.slug}`}
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="flex flex-col gap-4 text-[#121714]/60 dark:text-white/60 text-sm">
              {/* <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/track-order"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/returns-exchanges"
                >
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/shop"
                >
                  Shipping Information
                </Link>
              </li> */}
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/faq"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/contact"
                >
                  Contact Us
                </Link>
              </li>
              {generalSetting?.support_email && (
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href={`mailto:${generalSetting.support_email}`}
                  >
                    {generalSetting.support_email}
                  </a>
                </li>
              )}
              {generalSetting?.support_number && (
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href={`tel:${generalSetting.support_number}`}
                  >
                    {generalSetting.support_number}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h4 className="font-bold text-lg mb-6">My Account</h4>
            <ul className="flex flex-col gap-4 text-[#121714]/60 dark:text-white/60 text-sm">
              {!isLoggedIn && (
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="/login"
                  >
                    Login / Register
                  </Link>
                </li>
              )}
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href={isLoggedIn ? "/dashboard/profile" : "/login"}
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href={isLoggedIn ? "/dashboard/orders" : "/login"}
                >
                  Order History
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/wishlist"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#f1f4f2] dark:border-[#2a3a2f] pt-8 flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-[#121714]/40 dark:text-white/40">
          <p>
            {generalSetting?.footer_text
              ? generalSetting.footer_text
              : `© ${year} Ecomare Inc. All rights reserved.`}
          </p>
          <div className="flex items-center gap-8">
            {/* <a className="hover:text-primary" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-primary" href="#">
              Terms of Service
            </a>
            <a className="hover:text-primary" href="#">
              Cookies
            </a> */}
          </div>
          {/* <div className="flex items-center gap-4 grayscale opacity-50">
            <span className="material-symbols-outlined">payments</span>
            <span className="material-symbols-outlined">credit_card</span>
            <span className="material-symbols-outlined">wallet</span>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
