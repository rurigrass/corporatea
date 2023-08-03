import ProfilePictureForm from "@/components/settings/ProfilePictureForm";
import UsernameForm from "@/components/settings/UsernameForm";
import { Input } from "@/components/ui/Input";
import { authOptions, getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useState } from "react";

//this is the stuff that shows up on the tab
export const metadata = {
  title: "Settings",
  description: "Manage your account",
};

interface pageProps {}

const Page = async ({}) => {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(authOptions.pages?.signIn || "/sign-in");
  }
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="grid items-start gap-8">
        <h1 className="font-bold text-3xl md:text-4xl">Settings</h1>
        {/* <div className="container flex items-center h-full max-w-3xl mx-auto">
          <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">Change your username</h1>
              <hr className="bg-zinc-500 h-px" />
              <div>
                <p className="text-lg font-medium">Name</p>
                <p className="text-xs pb-2">
                  Company names including capitalization cannot be changed
                </p>
                <div className="relative">
                  <Input
                    value={input}
                    placeholder="company"
                    onChange={(e) => setInput(e.target.value)}
                    //   className="pl-20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
      <div className="grid gap-10">
        <UsernameForm
          user={{
            id: session.user.id,
            username: session.user.username || "",
          }}
        />
        {/* <ProfilePictureForm
          user={{
            id: session.user.id,
            image: session.user.image || "",
          }}
        /> */}
      </div>
    </div>
  );
};

export default Page;
