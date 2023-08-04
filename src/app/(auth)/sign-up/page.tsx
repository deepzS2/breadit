import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { SignUp } from "@/components/sign-up";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  return (
    <div className="absolute inset-0">
      <div className="flex flex-col gap-20 justify-center items-center mx-auto max-w-2xl h-full">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "self-start -mt-20"
          )}
        >
          <ChevronLeft className="mr-2 w-4 h-4" />
          Home
        </Link>

        <SignUp />
      </div>
    </div>
  );
}
