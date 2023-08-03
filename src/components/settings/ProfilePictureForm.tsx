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
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";

interface UsernameFormProps {
  user: Pick<User, "id" | "image">;
}

type imageProps = {
  fileUrl: string;
  fileKey: string;
};

const ProfilePictureForm: FC<UsernameFormProps> = ({ user }) => {
  const router = useRouter();
  const { loginToast } = useCustomToast();
  const [image, setImage] = useState<imageProps>({ fileUrl: "", fileKey: "" });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { mutate: updateUser, isLoading } = useMutation({
    mutationFn: async ({ name }: UsernameRequest) => {
      const payload: UsernameRequest = { name };
      const { data } = await axios.patch("api/settings", payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Username already taken, please use a different username.",
            description: "Please choose a different name for your Company.",
            variant: "destructive",
          });
        }
        if (err.response?.status === 422) {
          return toast({
            title: "Username is too short or too long!",
            description:
              "Please ensure that your Username name is between 3 and 32 characters long.",
            variant: "destructive",
          });
        }
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      toast({
        title: "There was an error.",
        description: "Could not update username.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        description: "Your username has been updated",
      });
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((e) => {
        updateUser(e);
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>Please enter a display name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative grid gap-1">
            <Label className="sr-only" htmlFor="name">
              username
            </Label>
            {user.image === "" ? <div>no image</div> : <div>{user.image}</div>}
            {/* <Input
              id="name"
              className="max-w-[400px]"
              size={32}
              placeholder={user.username ?? "username"}
              {...register("name")}
            /> */}
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button isLoading={isLoading}>Update Profile Picture</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ProfilePictureForm;
