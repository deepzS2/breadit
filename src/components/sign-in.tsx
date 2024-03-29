import Link from "next/link";

import { Icons } from "./icons";
import { UserAuthForm } from "./user-auth-form";

export const SignIn = () => {
  return (
    <div className="container flex flex-col justify-center mx-auto space-y-6 w-full sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto w-6 h-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mx-auto max-w-xs text-sm">
          By continuing, you are setting up a Breadit account and agree to our
          User Agreement and Privacy Policy.
        </p>

        {/* Sign in form */}
        <UserAuthForm />

        <p className="px-8 text-sm text-center text-zinc-700">
          New to Breadit?{" "}
          <Link
            href="/sign-up"
            className="text-sm underline underline-offset-4 hover:text-zinc-800"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
