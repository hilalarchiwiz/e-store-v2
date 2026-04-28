import Link from 'next/link';
import { getPages } from '@/lib/action/home.action';
import generateSession from '@/lib/generate-session';

interface FooterProps {
  logo?: { logo?: string; favicon?: string };
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
  facebook_url: "public",
  instagram_url: "camera",
  twitter_url: "alternate_email",
  linkedin_url: "work",
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
      <div className="max-w-300 mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-primary mb-6">
              {logo?.logo ? (
                <img src={logo.logo} alt="Logo" className="h-9 w-auto object-contain" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl font-bold">eco</span>
                  <h2 className="text-[#121714] dark:text-white text-2xl font-black">Ecomare</h2>
                </>
              )}
            </Link>
            <p className="text-[#121714]/60 dark:text-white/60 mb-6 leading-relaxed text-sm">
              Leading the change toward conscious consumption and sustainable living since 2020.
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
                    <span className="material-symbols-outlined text-lg">
                      {SOCIAL_ICONS[key] ?? "link"}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex gap-3">
                <a className="size-10 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-lg">public</span>
                </a>
                <a className="size-10 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                </a>
                <a className="size-10 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-lg">camera</span>
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="flex flex-col gap-4 text-[#121714]/60 dark:text-white/60 text-sm">
              <li><Link className="hover:text-primary transition-colors" href="/shop">Shop All</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/about">About Us</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/recently-viewed">Recently Viewed</Link></li>
              {pages && pages.map((page: any) => (
                <li key={page.id}>
                  <Link className="hover:text-primary transition-colors" href={`/v2/${page.slug}`}>
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
              <li><Link className="hover:text-primary transition-colors" href="/shop">Track Your Order</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/shop">Returns &amp; Exchanges</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/shop">Shipping Information</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/faq">FAQ</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/contact">Contact Us</Link></li>
              {generalSetting?.support_email && (
                <li>
                  <a className="hover:text-primary transition-colors" href={`mailto:${generalSetting.support_email}`}>
                    {generalSetting.support_email}
                  </a>
                </li>
              )}
              {generalSetting?.support_number && (
                <li>
                  <a className="hover:text-primary transition-colors" href={`tel:${generalSetting.support_number}`}>
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
                <li><Link className="hover:text-primary transition-colors" href="/login">Login / Register</Link></li>
              )}
              <li>
                <Link className="hover:text-primary transition-colors" href={isLoggedIn ? "/v2/dashboard/profile" : "/login"}>
                  My Profile
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href={isLoggedIn ? "/v2/dashboard/orders" : "/login"}>
                  Order History
                </Link>
              </li>
              <li><Link className="hover:text-primary transition-colors" href="/wishlist">Wishlist</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#f1f4f2] dark:border-[#2a3a2f] pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#121714]/40 dark:text-white/40">
          <p>
            {generalSetting?.footer_text
              ? generalSetting.footer_text
              : `© ${year} Ecomare Inc. All rights reserved.`}
          </p>
          <div className="flex items-center gap-8">
            <a className="hover:text-primary" href="#">Privacy Policy</a>
            <a className="hover:text-primary" href="#">Terms of Service</a>
            <a className="hover:text-primary" href="#">Cookies</a>
          </div>
          <div className="flex items-center gap-4 grayscale opacity-50">
            <span className="material-symbols-outlined">payments</span>
            <span className="material-symbols-outlined">credit_card</span>
            <span className="material-symbols-outlined">wallet</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
