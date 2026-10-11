// PostMenu.tsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ellipsis, Bookmark, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const BASE_URL = "https://route-posts.routemisr.com";
const headers = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

const errMsg = (e: unknown, fallback: string) =>
  axios.isAxiosError(e) ? (e.response?.data?.message ?? fallback) : fallback;

type Props = {
  postId: string;
  isMine: boolean;
  isSaved: boolean;
  onEdit: () => void;
};

const itemBase =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition disabled:opacity-60";

const PostMenu = ({ postId, isMine, isSaved, onEdit }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const { mutate: toggleSave, isPending: saving } = useMutation({
    mutationFn: () =>
      axios.put(
        `${BASE_URL}/posts/${postId}/bookmark`,
        {},
        { headers: headers() },
      ),
    onSuccess: () => {
      toast.success(isSaved ? "Removed from saved" : "Saved");
      queryClient.invalidateQueries({ queryKey: ["Posts"] });
      queryClient.invalidateQueries({ queryKey: ["Post", postId] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
      setOpen(false);
    },
    onError: (e) => toast.error(errMsg(e, "Action failed")),
  });

  const { mutate: deletePost, isPending: deleting } = useMutation({
    mutationFn: () =>
      axios.delete(`${BASE_URL}/posts/${postId}`, { headers: headers() }),
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["Posts"] });
      setOpen(false);
    },
    onError: (e) => toast.error(errMsg(e, "Delete failed")),
  });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <Ellipsis size={18} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          <button
            role="menuitem"
            disabled={saving}
            onClick={() => toggleSave()}
            className={`${itemBase} cursor-pointer text-slate-700 hover:bg-slate-100`}
          >
            <Bookmark
              size={16}
              aria-hidden="true"
              className={isSaved ? "fill-[#1877f2] text-[#1877f2]" : ""}
            />
            {isSaved ? "Unsave post" : "Save post"}
          </button>

          {isMine && (
            <>
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className={`${itemBase} cursor-pointer text-slate-700 hover:bg-slate-100`}
              >
                <Pencil size={16} aria-hidden="true" />
                Edit post
              </button>

              <button
                role="menuitem"
                disabled={deleting}
                onClick={() => deletePost()}
                className={`${itemBase} cursor-pointer text-red-600 hover:bg-red-50`}
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete post
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PostMenu;
