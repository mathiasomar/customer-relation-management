import { Clock, Fingerprint, LaptopMinimal } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Wrapper from "../wrapper";

const services = [
  {
    title: "Tailored to your business",
    description:
      "You need a system that is adapted to your way of doing business. Start with a fully customized CRM for your industry, stage, location, and more.",
    icon: Fingerprint,
  },
  {
    title: "Get started in minutes",
    description:
      "Don't waste time setting up a cumbersome system. Sign up today and get using your custom CRM within minutes. A free tier is available and paid tiers have a 30 day trial.",
    icon: Clock,
  },
  {
    title: "Organize your data",
    description:
      "Get control of your customers, sales, tasks, and more. See everything at a glance or just the important stuff. Ensure you won't miss anything with reports and calendar",
    icon: LaptopMinimal,
  },
];

const ServiceSection = () => {
  return (
    <div className="w-full min-h-[40vh] flex items-center">
      <Wrapper className="grid grid-cols-12 gap-4">
        {services.map((service, index) => (
          <Card
            key={index}
            className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3 shadow-none rounded-sm"
          >
            <CardContent>
              <div className="flex flex-col gap-4 items-center justify-center">
                <service.icon className="w-10 h-10 text-blue-500" />
                <h1 className="font-semibold text-center text-sm lg:text-lg xl:text-xl">
                  {service.title}
                </h1>
                <p className="mt-4 text-gray-600 text-center dark:text-gray-100 text-xs lg:text-base xl:text-lg">
                  {service.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </Wrapper>
    </div>
  );
};

export default ServiceSection;
