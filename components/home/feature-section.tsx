import Image from "next/image";
import Wrapper from "../wrapper";
import { ArrowRight, Database, LaptopMinimal, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const features = [
  {
    title: "Real time reporting",
    description:
      "Get extensive stats from your system in real time with powerful business  analytics an business intelligence tools",
    icon: LaptopMinimal,
  },
  {
    title: "Email Sync",
    description:
      "Synchronize your email into Charge automatically. Whether the emails were sent from the Charge system or not, you can view them in line eith other customer data",
    icon: RefreshCcw,
  },
  {
    title: "Document Storage",
    description:
      "Upload documents to live right along side all of your other customer information. Keep contracts, proposal, and more secure in your CRM, accessible from anywhere",
    icon: Database,
  },
];

const FeatureSection = () => {
  return (
    <div className="w-full min-h-[90vh]">
      <Wrapper className="flex flex-col-reverse items-center gap-10 justify-center lg:flex-row lg:justify-between lg:items-start">
        {/* Feature Details */}
        <div className="flex flex-col gap-4 items-center lg:items-start w-full md:w-full lg:w-3/5">
          <h1 className="font-semibold text-lg md:text-xl lg:text-3xl lg:font-bold my-6">
            Comprehensive features
          </h1>
          <div className="w-full flex flex-col gap-8 items-center lg:items-start">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 border py-4 px-2 rounded-sm w-full md:flex-row"
              >
                <div>
                  <feature.icon className="w-10 h-10 text-blue-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="font-semibold text-sm lg:text-lg xl:text-xl">
                    {feature.title}
                  </h1>
                  <p className="mt-4 text-gray-600 dark:text-gray-100 text-xs md:text-sm lg:text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Feature Image */}
        <div className="g:w-2/5">
          <Image src="/chart.png" alt="chart" width={700} height={800} />
        </div>
      </Wrapper>
      <div className="mt-5 flex items-center justify-center">
        <Button asChild>
          <Link href={"/fetaures"}>
            <ArrowRight className="w-4 h-4" /> See more features
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default FeatureSection;
