import Image from "next/image";
import { User } from "next-auth";
import { AvatarProps } from "@radix-ui/react-avatar";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Icons } from "./icons";

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, "name" | "image">;
}

export const UserAvatar = ({ user, ...props }: UserAvatarProps) => {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className="relative w-full h-full aspect-square">
          <Image
            fill
            src={user.image!}
            alt="Profile picture"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user?.name}</span>
          <Icons.user className="w-4 h-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};
