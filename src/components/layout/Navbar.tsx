import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "../ui/Button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import UserAccountNav from "./UserAccountNav";
import SearchBar from "./SearchBar";
import { LogIn } from "lucide-react";

const Navbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="fixed top-0 inset-x-0 bg-zinc-100 border-b border-zinc-300 z-[10] py-2">
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/" className="flex  items-center">
          {/* <Icons.logo className="h-8 w-8 sm:h-6 sm:w-6" /> */}
          {/* hidden sm:block */}
          <Icons.tea className="mr-2 h-4 w-4 sm:hidden" />
          <p className=" text-zinc-700 text-sm font-medium hidden sm:block">
            Corporatea
          </p>
        </Link>
        {/* Searchbar */}
        <SearchBar />
        {/* SignIn */}
        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <Link href="/sign-in" className={buttonVariants()}>
            <span className="hidden md:block md:mr-1.5">Sign In</span>
            <LogIn />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
