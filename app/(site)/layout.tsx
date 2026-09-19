import "../css/style.css";
import { Metadata } from "next";
import { ReduxProvider } from "@/redux/provider";
import Header from "@/components/v2/Header";
import Footer from "@/components/v2/Footer";
import TopBar from "@/components/v2/TopBar";
import NavigationProgress from "@/components/v2/NavigationProgress";
import { getSiteSettings } from "@/lib/action/settings.action";
import CartInitializer from "@/components/v2/CartInitializer";
import { getSetting } from "../(admin)/admin/(admin)/setting/actions/setting.action";
import { getHighestDealDiscount } from "@/lib/deals";

import ToasterProvider from "@/components/v2/ToasterProvider";

export async function generateMetadata(): Promise<Metadata> {
  const { setting } = await getSetting("logo");

  return {
    applicationName: "Qaam.pk",
    title: {
      default: "Laptops in Pakistan | Qaam.pk",
      template: "%s | Qaam.pk",
    },
    description:
      "Upgrade your workspace with high-performance laptops, tablets, and PC gear. Discover the latest tech, new arrivals, and exclusive deals at Qaam.pk.",
    metadataBase: new URL("https://qaam.pk"),
    authors: [{ name: "Qaam.pk", url: "https://qaam.pk" }],
    creator: "Qaam.pk",
    publisher: "Qaam.pk",
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
      type: "website",
      locale: "en_PK",
      url: "https://qaam.pk",
      siteName: "Qaam.pk",
      title: "Laptops in Pakistan | Qaam.pk",
      description:
        "Shop tested laptops, tablets, desktops and PC accessories with nationwide delivery across Pakistan.",
      images: [{ url: "/og", width: 1200, height: 630, alt: "Qaam.pk technology store" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Laptops in Pakistan | Qaam.pk",
      description: "Shop tested technology with nationwide delivery across Pakistan.",
      images: ["/og"],
    },
    verification: {
      google: "HDMVHQt5Tabe8oJsqORNh-nw_KPwd7jZQ3Q17_B8bIA",
    },
    icons: {
      icon: setting?.favicon, // This sets the dynamic favicon
      shortcut: setting?.favicon,
      apple: setting?.favicon, // Optional: for apple touch icon
    },
  };
}

export default async function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, highestDealDiscount] = await Promise.all([
    getSiteSettings(),
    getHighestDealDiscount(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-display bg-page text-foreground">
        <NavigationProgress />
        <ToasterProvider />
        <ReduxProvider>
          <CartInitializer />
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              <div className="bg-page min-h-screen text-foreground dark:text-foreground font-display transition-colors duration-300">
                {/* <TopBar generalSetting={settings.generalSetting} /> */}
                <Header
                  logo={settings.logo}
                  highestDealDiscount={highestDealDiscount}
                />
                {children}
                <Footer
                  logo={settings.logo}
                  generalSetting={settings.generalSetting}
                  socialInfo={settings.socialInfo}
                />
              </div>
            </div>
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
