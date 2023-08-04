"use client";

import type EditorJS from "@editorjs/editorjs";
import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { PostCreationRequest, PostValidator } from "@/lib/validators/post";
import { uploadFiles } from "@/lib/uploadthing";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { toast } from "@/hooks/use-toast";

interface EditorProps {
  subredditId: string;
}

export const Editor = ({ subredditId }: EditorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isMounted = useIsMounted();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostCreationRequest>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      title: "",
      subredditId,
      content: null,
    },
  });

  const { mutate: createPost } = useMutation<
    string,
    unknown,
    PostCreationRequest
  >({
    mutationFn: async (payload) => {
      const { data } = await axios.post("/api/subreddit/post/create", payload);

      return data;
    },
    onError: () => {
      return toast({
        title: "Something went wrong",
        description: "Your post was not published, please try again later",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // r/mycommunity/submit into r/mycommunity
      const newPathname = pathname.split("/").slice(0, -1).join("/");

      router.push(newPathname);
      router.refresh();

      return toast({
        description: "Your post has been published.",
      });
    },
  });

  const ref = useRef<EditorJS>();
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Type here to write your post...",
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
        titleRef.current?.focus();
      }, 0);
    };

    if (isMounted()) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [, value] of Object.entries(errors)) {
        toast({
          title: "Something went wrong",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  const onSubmit = handleSubmit(async (data) => {
    const blocks = await ref.current?.save();

    const payload: PostCreationRequest = {
      title: data.title,
      subredditId,
      content: blocks,
    };

    createPost(payload);
  });

  const { ref: formTitleRef, ...rest } = register("title");

  return (
    <div className="p-4 w-full rounded-lg border bg-zinc-50 border-zinc-200">
      <form id="subreddit-post-form" className="w-fit" onSubmit={onSubmit}>
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            ref={(e) => {
              formTitleRef(e);

              // @ts-ignore
              titleRef.current = e;
            }}
            placeholder="Title"
            className="overflow-hidden w-full text-5xl font-bold bg-transparent appearance-none resize-none focus:outline-none"
            {...rest}
          />

          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
    </div>
  );
};
