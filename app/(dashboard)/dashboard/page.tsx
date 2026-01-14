import AppLineChart from "@/components/dashboard/app-line-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Item, ItemContent, ItemMedia } from "@/components/ui/item";
import {
  Building,
  Contact2,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-4 md:col-span-2 lg:col-span-3">
          {/* Dashboard metrics */}
          <div className="w-full grid grid-cols-4 gap-4">
            <div className="col-span-4 sm:col-span-2 md:col-span-1">
              <Card className="p-2">
                <CardContent>
                  <div className="w-full flex items-start gap-6">
                    {/* Icon */}
                    <div>
                      <Building className="w-10 h-10 text-blue-500" />
                    </div>
                    {/* Stats */}
                    <div className="flex flex-col gap-2">
                      <h1 className="font-bold text-xl">20</h1>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        Organization
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-4 sm:col-span-2 md:col-span-1">
              <Card className="p-2">
                <CardContent>
                  <div className="w-full flex items-start gap-6">
                    {/* Icon */}
                    <div>
                      <Contact2 className="w-10 h-10 text-blue-500" />
                    </div>
                    {/* Stats */}
                    <div className="flex flex-col gap-2">
                      <h1 className="font-bold text-xl">200+</h1>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        Contacts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-4 sm:col-span-2 md:col-span-1">
              <Card className="p-2">
                <CardContent>
                  <div className="w-full flex items-start gap-6">
                    {/* Icon */}
                    <div>
                      <Target className="w-10 h-10 text-blue-500" />
                    </div>
                    {/* Stats */}
                    <div className="flex flex-col gap-2">
                      <h1 className="font-bold text-xl">100+</h1>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        Leads
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-4 sm:col-span-2 md:col-span-1">
              <Card className="p-2">
                <CardContent>
                  <div className="w-full flex items-start gap-6">
                    {/* Icon */}
                    <div>
                      <Lightbulb className="w-10 h-10 text-blue-500" />
                    </div>
                    {/* Stats */}
                    <div className="flex flex-col gap-2">
                      <h1 className="font-bold text-xl">10</h1>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        Opportunities
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-5">
            <Card>
              <CardContent>
                <CardHeader>
                  <div className="flex items-center text-sm font-semibold gap-2">
                    Organization Oppotunities Trends{" "}
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                </CardHeader>
                <AppLineChart />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="col-span-4 md:col-span-2 lg:col-span-1">
          <Card>
            <CardContent>
              <h1 className="text-sm font-bold mb-2">Recent contacts</h1>
              <Item variant={"outline"} className="rounded-2xl mb-4 p-2">
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={"/users/2.png"} />
                    <AvatarFallback>2</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <div className="flex flex-col">
                    <h1 className="text-xs font-semibold">Joe Doe</h1>
                  </div>
                </ItemContent>
              </Item>
              <Item variant={"outline"} className="rounded-2xl mb-4 p-2">
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={"/users/3.png"} />
                    <AvatarFallback>2</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <div className="flex flex-col">
                    <h1 className="text-xs font-semibold">Joe Doe</h1>
                  </div>
                </ItemContent>
              </Item>
              <Item variant={"outline"} className="rounded-2xl mb-4 p-2">
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={"/users/4.png"} />
                    <AvatarFallback>2</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <div className="flex flex-col">
                    <h1 className="text-xs font-semibold">Joe Doe</h1>
                  </div>
                </ItemContent>
              </Item>
              <Item variant={"outline"} className="rounded-2xl mb-4 p-2">
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={"/users/5.png"} />
                    <AvatarFallback>2</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <div className="flex flex-col">
                    <h1 className="text-xs font-semibold">Joe Doe</h1>
                  </div>
                </ItemContent>
              </Item>
              <Item variant={"outline"} className="rounded-2xl mb-4 p-2">
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={"/users/6.png"} />
                    <AvatarFallback>2</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <div className="flex flex-col">
                    <h1 className="text-xs font-semibold">Joe Doe</h1>
                  </div>
                </ItemContent>
              </Item>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
