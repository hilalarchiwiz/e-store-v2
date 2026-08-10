import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";
import { getCategories, getLatestReviews, getReviews } from "@/lib/action/home.action";

export const revalidate = 60
export const dynamic = "force-dynamic";
const Home = async () => {
  const { categories } = await getCategories();
  const { reviews } = await getLatestReviews();

  return (
    <main>
      <Hero />
      <Categories categories={categories} />
      <NewArrival />
      <PromoBanner />
      <BestSeller />
      <CounDown />
      <Testimonials reviews={reviews} />
      <Newsletter />
    </main>
  );
};

export default Home;