"use client";

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { FC } from "react";
import UserAvatar from "../user/UserAvatar";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ImageIcon, Link2 } from "lucide-react";

interface MiniCreateSpillProps {
  session: Session | null;
}

const MiniCreateSpill: FC<MiniCreateSpillProps> = ({ session }) => {
  const router = useRouter();
  const pathname = usePathname();

  //NEEDS MORE RESPONSIVENESS WITH MOBILE VIEW
  return (
    <div className="overflow-hidden rounded-md bg-white shadow ">
      <div className="h-full px-4 py-4 flex justify-between gap-4">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user?.name || null,
              image: session?.user?.image || null,
            }}
          />
          <span className="absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white" />
        </div>
        <Input
          readOnly
          onClick={() => router.push(pathname + "/spill")}
          placeholder="Spill the tea"
        />
        <Button
          variant="ghost"
          onClick={() => router.push(pathname + "/submit")}
        >
          <ImageIcon />
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push(pathname + "/submit")}
        >
          <Link2 className="text-zinc-600" />
        </Button>
      </div>
    </div>
  );
};

export default MiniCreateSpill;
