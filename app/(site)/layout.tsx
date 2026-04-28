import "../css/style.css";
import { Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ecomare v2 | Sustainable Eco-Conscious Shopping",
  description:
    "Live Green, Shop Better. Upgrade your home with planet-friendly essentials.",
};

import { ReduxProvider } from "@/redux/provider";
import { Toaster } from "react-hot-toast";
import Header from "@/components/v2/Header";
import Footer from "@/components/v2/Footer";
import TopBar from "@/components/v2/TopBar";
import NavigationProgress from "@/components/v2/NavigationProgress";
import { getSiteSettings } from "@/lib/action/settings.action";
import CartInitializer from "@/components/v2/CartInitializer";

export default async function V2Layout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${manrope.variable}`}
      suppressHydrationWarning={true}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="font-display">
        <NavigationProgress />
        <Toaster position="top-right" />
        <ReduxProvider>
          <CartInitializer />
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              <div className="bg-background-light dark:bg-background-dark min-h-screen text-[#121714] dark:text-white font-display transition-colors duration-300">
                <TopBar generalSetting={settings.generalSetting} />
                <Header logo={settings.logo} />
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
