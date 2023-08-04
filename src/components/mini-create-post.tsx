"use client";

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";

import { UserAvatar } from "./user-avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ImageIcon, Link2 } from "lucide-react";

interface MiniCreatePostProps {
  session: Session | null;
}

export const MiniCreatePost = ({ session }: MiniCreatePostProps) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <li className="overflow-hidden list-none bg-white rounded-md shadow">
      <div className="flex gap-6 justify-between py-4 px-6 h-full">
        <div className="relative">
          <UserAvatar
            user={{ name: session?.user.name, image: session?.user.image }}
          />

          <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full outline-white outline outline-2"></span>
        </div>

        <Input
          readOnly
          onClick={() => router.push(pathname + "/submit")}
          placeholder="Create post"
        />

        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <ImageIcon className="text-zinc-600" />
        </Button>

        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <Link2 className="text-zinc-600" />
        </Button>
      </div>
    </li>
  );
};
