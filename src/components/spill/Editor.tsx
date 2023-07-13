"use client";
import { toast } from "@/hooks/use-toast";
import { uploadFiles } from "@/lib/uploadthing";
import { SpillCreationRequest, SpillValidator } from "@/lib/validators/spill";
import EditorJS from "@editorjs/editorjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { Button } from "../ui/Button";

type FormData = z.infer<typeof SpillValidator>;

interface EditorProps {
  companyId: string;
}

const Editor: FC<EditorProps> = ({ companyId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(SpillValidator),
    defaultValues: {
      companyId,
      spill: "",
      deets: null,
    },
  });

  const ref = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState<Boolean>(false);
  const [showDeets, setShowDeets] = useState<Boolean>(false);
  const _spillRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const Code = (await import("@editorjs/code")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        minHeight: 10,
        onReady() {
          ref.current = editor;
        },
        placeholder: "Type here to add the deets...",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  // upload to uploadthing
                  const [res] = await uploadFiles([file], "imageUploader");
                  return {
                    success: 1,
                    file: {
                      url: res.fileUrl,
                    },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  useEffect(() => {
    //check we are on the clientside
    if (typeof window !== undefined) {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_key, value] of Object.entries(errors)) {
        toast({
          title: "Something went wrong",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        // set focus to spill
        _spillRef?.current?.focus();
      }, 0);
    };

    if (isMounted) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  const { mutate: createPost } = useMutation({
    mutationFn: async ({ spill, deets, companyId }: SpillCreationRequest) => {
      const payload: SpillCreationRequest = {
        spill,
        deets,
        companyId,
      };
      const { data } = await axios.post("/api/company/spill/create", payload);
      return data;
    },
    onError: () => {
      return toast({
        title: "Something went wrong",
        description: "This Spill was not published please try again later",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // send user to their post
      const newPathname = pathname.split("/").slice(0, -1).join("/");
      router.push(newPathname);
      router.refresh();
      return toast({
        title: "Success!",
        description: "Your post has been published",
      });
    },
  });

  async function onSubmit(data: SpillCreationRequest) {
    const blocks = await ref.current?.save();

    const payload: SpillCreationRequest = {
      spill: data.spill,
      deets: blocks,
      companyId,
    };

    createPost(payload);
  }

  if (!isMounted) {
    return null;
  }

  //related to the useref (to focus on title)
  const { ref: spillRef, ...rest } = register("spill");

  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form
        id="company-spill-form"
        className="w-fit"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            //this ref spill is related to the useref (to focus on title)
            ref={(e) => {
              spillRef(e);
              // @ts-ignore
              _spillRef.current = e;
            }}
            {...rest}
            placeholder="What's the tea?"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />
          <div id="editor" className={` ${showDeets ? "" : "hidden"}`} />
        </div>
      </form>
      <div className="flex justify-end">
        <Button
          className=" hover:cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setShowDeets(!showDeets);
          }}
        >
          Got the deets?
        </Button>
      </div>
    </div>
  );
};

export default Editor;
