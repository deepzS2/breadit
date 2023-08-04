"use client";

import { User } from "next-auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UserAvatar } from "./user-avatar";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface UserAccountNavProps {
  user: Pick<User, "name" | "image" | "email">;
}

export const UserAccountNav = ({ user }: UserAccountNavProps) => {
  const onSignOut = (event: Event) => {
    event.preventDefault();

    signOut({
      callbackUrl: `${window.location.origin}/sign-in`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          className="w-8 h-8"
          user={{ name: user.name, image: user.image }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex gap-2 justify-start items-center p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="text-sm w-[200px] truncate text-zinc-700">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/">Feed</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/r/create">Create community</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={onSignOut} className="cursor-pointer">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
