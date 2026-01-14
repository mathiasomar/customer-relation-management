import Image from "next/image";
import Wrapper from "../wrapper";
import { Button } from "../ui/button";
import Link from "next/link";

const HeroSection = () => {
  return (
    <div className="w-full min-h-[90vh] flex items-center">
      <Wrapper className="flex flex-col-reverse items-center justify-center md:flex-row md:justify-between">
        {/* Hero Details */}
        <div className="flex flex-col gap-4 w-full justify-center md:w-1/2 lg:w-3/5">
          <h1 className="text-2xl tracking-tight text-center leading-8 md:text-3xl md:tracking-normal md:leading-12 lg:text-5xl font-bold lg:tracking-wide mb-4 lg:leading-14 lg:text-left">
            The simpler way to manage your customer and make more sales
          </h1>
          <p className="text-sm text-center md:text-sm lg:text-left text-gray-600 dark:text-gray-400">
            Manage your deal pipeline, customers, leads, and more. Build
            stronger relationship and <b>make more sales with modern tools</b>
          </p>
          <div className="w-full flex flex-col items-center justify-center md:flex-row lg:justify-start gap-4 mt-10">
            <Button asChild className="w-full md:w-max">
              <Link href="/" className="text-xs md:text-sm">
                Start Today
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full md:w-max">
              <Link href="/" className="text-xs md:text-sm">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
        {/* Hero Image */}
        <div className="md:w-1/2 lg:w-2/5">
          <Image src="/hero.svg" alt="hero-img" width={700} height={800} />
        </div>
      </Wrapper>
    </div>
  );
};

export default HeroSection;
