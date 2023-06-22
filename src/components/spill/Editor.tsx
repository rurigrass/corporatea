"use client";
import { FC } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface EditorProps {}

const Editor: FC<EditorProps> = ({}) => {
  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form id="company-spill-form" className="w-fit" onSubmit={() => {}}>
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />
        </div>
      </form>
    </div>
  );
};

export default Editor;
