"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/hooks/use-user";

const MemberAvatar = ({ userId }: { userId: string }) => {
  const { data: user, isFetching } = useUser(userId);

  // Check if user is an error object or a valid user
  const isValidUser = user && "id" in user && !("error" in user);

  return (
    <>
      {isFetching ? (
        <Spinner />
      ) : isValidUser ? (
        <Avatar className="border">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="border">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      )}
    </>
  );
};

export default MemberAvatar;
