import "../css/style.css";
import { Metadata } from "next";
import { ReduxProvider } from "@/redux/provider";
import { Toaster } from "react-hot-toast";
import Header from "@/components/v2/Header";
import Footer from "@/components/v2/Footer";
import TopBar from "@/components/v2/TopBar";
import NavigationProgress from "@/components/v2/NavigationProgress";
import { getSiteSettings } from "@/lib/action/settings.action";
import CartInitializer from "@/components/v2/CartInitializer";
import { getSetting } from "../(admin)/admin/(admin)/setting/actions/setting.action";

export async function generateMetadata(): Promise<Metadata> {
  const { setting } = await getSetting("logo");

  return {
    title: {
      default: "Qaam.pk | Premium Laptops, Tablets & PC Essentials",
      template: "%s | Qaam.pk",
    },
    description:
      "Upgrade your workspace with high-performance laptops, tablets, and PC gear. Discover the latest tech, new arrivals, and exclusive deals at Qaam.pk.",
    metadataBase: new URL("https://qaam.pk"),
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
  const settings = await getSiteSettings();

  return (
    <html lang="en" className="font-manrope" suppressHydrationWarning={true}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-display">
        <NavigationProgress />
        <Toaster position="top-center" />
        <ReduxProvider>
          <CartInitializer />
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              <div className="bg-background-light dark:bg-background-dark min-h-screen text-[#121714] dark:text-white font-display transition-colors duration-300">
                {/* <TopBar generalSetting={settings.generalSetting} /> */}
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
