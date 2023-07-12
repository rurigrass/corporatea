"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { CreateCompanyPayload } from "@/lib/validators/company";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";

type imageProps = {
  fileUrl: string;
  fileKey: string;
};

const Page = () => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const [image, setImage] = useState<imageProps>();
  const { loginToast } = useCustomToast();

  const { mutate: createCompany, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CreateCompanyPayload = { name: input.toLowerCase() };
      const { data } = await axios.post("/api/company", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Company already exists.",
            description: "Please choose a different name for your Company.",
            variant: "destructive",
          });
        }
        if (err.response?.status === 422) {
          return toast({
            title: "Company name is too short or too long!",
            description:
              "Please ensure that your Company name is between 3 and 21 characters long.",
            variant: "destructive",
          });
        }
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      toast({
        title: "There was an error.",
        description: "Could not create company.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      router.push(`/company/${data}`);
    },
  });

  console.log(image);

  return (
    <div className="container flex flex-row items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Add a Company</h1>
        </div>
        <hr className="bg-zinc-500 h-px" />

        <div>
          <p className="text-lg font-medium">Name</p>
          <div className="relative">
            <Input
              value={input}
              placeholder="company"
              onChange={(e) => setInput(e.target.value)}
              //   className="pl-20"
            />
          </div>
        </div>

        {/* add image */}
        <div>
          <p className="text-lg font-medium">Image</p>
          {/* <p className="text-xs pb-2">
            Company names including capitalization cannot be changed
          </p> */}
          <UploadButton<OurFileRouter>
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              console.log("DARES ", res);

              if (res) {
                setImage(res[0]);
                const json = JSON.stringify(res);
                console.log("Files: ", json);
                // alert("Upload Completed");
              }
            }}
            onUploadError={(error: Error) => {
              // Do something with the error.
              alert(`ERROR! ${error.message}`);
            }}
          />
          {image && (
            <div className="relative h-32 w-32  overflow-hidden rounded-lg">
              <Image fill src={image.fileUrl} alt={image.fileKey}></Image>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="subtle" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => createCompany()}
          >
            Add Company
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
