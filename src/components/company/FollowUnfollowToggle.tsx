"use client";
import { FC, startTransition } from "react";
import { Button } from "../ui/Button";
import { useMutation } from "@tanstack/react-query";
import { FollowCompanyPayload } from "@/lib/validators/company";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface FollowUnfollowToggleProps {
  companyId: string;
  companyName: string;
  isFollower: boolean;
}

const FollowUnfollowToggle: FC<FollowUnfollowToggleProps> = ({
  companyId,
  companyName,
  isFollower,
}) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: followCompany, isLoading: isFollowLoading } = useMutation({
    mutationFn: async () => {
      const payload: FollowCompanyPayload = {
        companyId,
      };
      const { data } = await axios.post("/api/company/follow", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          return toast({
            title: "You already follow this company",
            variant: "destructive",
          });
        }
        if (err.response?.status === 422) {
          return toast({
            title: "Something went wrong",
            description: "Zod Error",
            variant: "destructive",
          });
        }
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      toast({
        title: "There was an error.",
        description: "Could not follow company.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      toast({
        title: "Following!",
        description: `You are now following ${companyName}`,
        variant: "default",
      });
    },
  });

  const { mutate: unfollowCompany, isLoading: isUnfollowLoading } = useMutation(
    {
      mutationFn: async () => {
        const payload: FollowCompanyPayload = {
          companyId,
        };
        const { data } = await axios.post("/api/company/unfollow", payload);
        return data as string;
      },
    //   onError: (err: AxiosError) => {
    //     if (err instanceof AxiosError) {
    //       if (err.response?.status === 400) {
    //         return toast({
    //           title: "You do not follow this company",
    //           variant: "destructive",
    //         });
    //       }
    //       if (err.response?.status === 422) {
    //         return toast({
    //           title: "Something went wrong",
    //           description: "Zod Error",
    //           variant: "destructive",
    //         });
    //       }
    //       if (err.response?.status === 401) {
    //         return loginToast();
    //       }
    //     }
    //     toast({
    //       title: "There was an error.",
    //       description: "Could not unfollow company.",
    //       variant: "destructive",
    //     });
    //   },
      //this is a shorter alternative
        onError: (err: AxiosError) => {
          toast({
            title: "Error",
            description: err.response?.data as string,
            variant: "destructive",
          });
        },
      onSuccess: () => {
        startTransition(() => {
          // Refresh the current route and fetch new data from the server without
          // losing client-side browser or React state.
          router.refresh();
        });
        toast({
          title: "Unfollowed!",
          description: `You have now unfollowed ${companyName}`,
          variant: "default",
        });
      },
    }
  );

  return isFollower ? (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={isUnfollowLoading}
      onClick={() => unfollowCompany()}
    >
      Unfollow Company
    </Button>
  ) : (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={isFollowLoading}
      onClick={() => followCompany()}
    >
      Follow Company
    </Button>
  );
};

export default FollowUnfollowToggle;
