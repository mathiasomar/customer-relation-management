"use client";

import DeleteMember from "@/components/dashboard/delete-member";
import EditMemberRole from "@/components/dashboard/edit-member-role";
import CardListSkeleton from "@/components/dashboard/loaders/card-list-skeleton";
import ViewMemberPermission from "@/components/dashboard/view-member-permission";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useTenantMembers } from "@/hooks/use-tenant";
import { authClient } from "@/lib/auth-client";
import { Member } from "@/types/member";
import { Package2 } from "lucide-react";

const ViewMembers = () => {
  const { data: members, isFetching } = useTenantMembers();
  const { data: session, isPending } = authClient.useSession();
  return (
    <>
      {isFetching || isPending ? (
        <CardListSkeleton items={3} columns={3} />
      ) : members?.length === 0 ? (
        <Alert variant={"destructive"}>
          <Package2 />
          <AlertDescription>No Members</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {members?.map((member) => (
            <Card
              className="p-4 shadow-md shadow-green-200 border-green-300"
              key={member?.id}
            >
              <CardContent className="flex items-start p-0">
                {/* image container */}
                <Avatar className="w-15 h-15 rounded-lg">
                  <AvatarImage src={member.user.image || ""} />
                  <AvatarFallback className="text-2xl font-semibold rounded-lg">
                    {member.user.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* details container */}
                <div className="p-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Name:</span>
                    <span>{member.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Email:</span>
                    <span>{member.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Role:</span>
                    <span
                      data-role={member.role}
                      className="px-2 py-1 rounded-full w-max text-xs data-[role=ADMIN]:bg-red-100 data-[role=ADMIN]:text-red-800 data-[role=MANAGER]:bg-green-100 data-[role=MANAGER]:text-green-800 data-[role=MEMBER]:bg-blue-100 data-[role=MEMBER]:text-blue-800"
                    >
                      {member.role
                        .toLowerCase()
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Invited By:</span>
                    {member.invitedBy === session?.user.id ? (
                      session.user.name
                    ) : (
                      <span className="text-xs w-max px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center gap-4 justify-end">
                <EditMemberRole member={member as Member} />
                <DeleteMember member={member as Member} />
                <ViewMemberPermission member={member as Member} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ViewMembers;
