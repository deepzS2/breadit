import { redirect } from "next/navigation";

import { UserNameForm } from "@/components/user-name-form";
import { authOptions, getAuthSession } from "@/lib/auth";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings",
};

export default async function SettingsPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(authOptions.pages?.signIn || "/sign-in");
  }

  return (
    <div className="py-12 mx-auto max-w-4xl">
      <div className="grid gap-8 items-start">
        <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
      </div>

      <div className="grid gap-10">
        <UserNameForm
          user={{ id: session.user.id, username: session.user.username || "" }}
        />
      </div>
    </div>
  );
}
