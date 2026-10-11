import { useRef, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ImagePlus, Loader2, Send, X } from "lucide-react";

const BASE_URL = "https://route-posts.routemisr.com";

const errMsg = (e: unknown, fallback: string) =>
  axios.isAxiosError(e) ? (e.response?.data?.message ?? fallback) : fallback;

const CreateComment = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [img, setImg] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function closeImg() {
    if (imgSrc) URL.revokeObjectURL(imgSrc);
    setImg(null);
    setImgSrc(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imgSrc) URL.revokeObjectURL(imgSrc);
    setImg(file);
    setImgSrc(URL.createObjectURL(file));
  }

  const { isPending, mutate } = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      if (content.trim()) formData.append("content", content.trim());
      if (img) formData.append("image", img);

      return axios.post(`${BASE_URL}/posts/${id}/comments`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
    },
    onSuccess: (res) => {
      toast.success(res.data?.message ?? "Comment added");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["Posts"] });
      queryClient.invalidateQueries({ queryKey: ["UserPost"] });
      queryClient.invalidateQueries({ queryKey: ["Post", id] });
      setContent("");
      closeImg();
    },
    onError: (e) => toast.error(errMsg(e, "Failed to add comment")),
  });

  const canSubmit = (content.trim() !== "" || img !== null) && !isPending;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <input
          id={`comment-input-${id}`}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSubmit) mutate();
          }}
          placeholder="Write a comment..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#1877f2]"
        />

        <label
          title="Add image"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200"
        >
          <ImagePlus size={18} aria-hidden="true" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImg}
            className="hidden"
          />
        </label>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => mutate()}
          aria-label="Send comment"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1877f2] text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {imgSrc && (
        <div className="relative mt-3 inline-block">
          <img
            src={imgSrc}
            alt=""
            className="max-h-40 rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={closeImg}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateComment;
