"use client";
import { FC, useCallback, useRef, useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { SpillCreationRequest, SpillValidator } from "@/lib/validators/spill";
import { zodResolver } from "@hookform/resolvers/zod";
import EditorJS from "@editorjs/editorjs";
import { uploadFiles } from "@/lib/uploadthing";
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

  useEffect(() => {
    //check we are on the clientside
    if (typeof window !== undefined) {
      setIsMounted(true);
    }
  }, []);

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
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        // _spillRef?.current?.focus()
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

  //related to the useref (to focus on title)
  const { ref: spillRef, ...rest } = register("spill");

  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form id="company-spill-form" className="w-fit" onSubmit={() => {}}>
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            //this ref spill is related to the useref (to focus on title)
            ref={(e) => {
              spillRef(e);
              // @ts-ignore
              _spillRef.current = e;
            }}
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
