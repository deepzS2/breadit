import Link from "next/link";

import { getAuthSession } from "@/lib/auth";

import { Icons } from "./icons";
import { SearchBar } from "./search-bar";
import { UserAccountNav } from "./user-account-nav";
import { buttonVariants } from "./ui/button";

export const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <div className="fixed inset-x-0 top-0 py-2 border-b h-fit bg-zinc-100 border-zinc-300 z-[10]">
      <div className="container flex gap-2 justify-between items-center mx-auto max-w-7xl h-full">
        {/* Logo */}
        <Link href="/" className="flex gap-2 items-center">
          <Icons.logo className="w-8 h-8 sm:w-6 sm:h-6" />
          <p className="hidden text-sm font-medium md:block text-zinc-700">
            Breadit
          </p>
        </Link>

        {/* Search bar */}
        <SearchBar />

        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <Link href="/sign-in" className={buttonVariants()}>
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
};
