"use client";
import { UsernameRequest, UsernameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { UploadButton } from "@uploadthing/react";
import { Label } from "../ui/Label";
import { Button } from "../ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { AvatarFallback } from "../ui/Avatar";
import { Icons } from "../layout/Icons";

interface UsernameFormProps {
  user: Pick<User, "id" | "image">;
}

type imageProps = {
  fileUrl: string;
  fileKey: string;
};

const ProfilePictureForm = ({ user }: UsernameFormProps) => {
  const router = useRouter();
  const { loginToast } = useCustomToast();
  const [image, setImage] = useState<imageProps>({ fileUrl: "", fileKey: "" });

  const { mutate: deleteImage } = useMutation({
    mutationFn: async () => {},
  });

  return (
    <form
    //   onSubmit={handleSubmit((e) => {
    //     updateUser(e);
    //   })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your profile picture</CardTitle>
          <CardDescription>{user.image}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative grid gap-1">
            <Label className="sr-only" htmlFor="name">
              username
            </Label>
            {user.image === "" || null ? (
              <div>
                <AvatarFallback>
                  {/* div around this relative h-32 w-32 overflow-hidden rounded-lg */}
                  <Icons.user className="h-4 w-4" />
                </AvatarFallback>
                <UploadButton<OurFileRouter>
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    // Do something with the response
                    // console.log("DARES ", res);

                    if (res) {
                      setImage(res[0]);
                      const json = JSON.stringify(res);
                      // console.log("Files: ", json);
                      // alert("Upload Completed");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    alert(`ERROR! ${error.message}`);
                  }}
                />
              </div>
            ) : (
              <div className="relative h-32 w-32 overflow-hidden rounded-lg">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    onClick={() => deleteImage()}
                    className="h-6 w-6 p-0 rounded-md "
                    variant="subtle"
                    aria-label="close modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* conditional not really necessary :( */}
                {user.image && (
                  <Image
                    fill
                    className="relative"
                    src={user.image}
                    alt="profile picture"
                    style={{ objectFit: "cover" }}
                  />
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
          //    isLoading={isLoading}
          >
            Update Profile Picture
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ProfilePictureForm;
