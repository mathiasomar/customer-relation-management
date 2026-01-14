import FeatureSection from "@/components/home/feature-section";
import HeroSection from "@/components/home/hero-section";
import ServiceSection from "@/components/home/service-section";

const HomePage = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <ServiceSection />
      <FeatureSection />
    </div>
  );
};

export default HomePage;
