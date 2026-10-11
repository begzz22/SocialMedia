import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Earth,
  Users,
  Lock,
  Image as ImageIcon,
  Smile,
  Send,
  X,
} from "lucide-react";
import EmojiPicker from "./EmojiPicker";

const BASE_URL = "https://route-posts.routemisr.com";
const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

type Privacy = "public" | "following" | "only_me";
const PrivacyIcon = { public: Earth, following: Users, only_me: Lock } as const;

const CreatePost = () => {
  const queryClient = useQueryClient();

  const [body, setBody] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [img, setImg] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const emojiBox = useRef<HTMLDivElement>(null);

  const { data: me } = useQuery({
    queryKey: ["profile-data"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/users/profile-data`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      return res.data?.data?.user ?? res.data?.data;
    },
  });

  // تنضيف الـ preview من الذاكرة
  useEffect(() => {
    return () => {
      if (imgSrc) URL.revokeObjectURL(imgSrc);
    };
  }, [imgSrc]);

  function createPost() {
    const formData = new FormData();

    if (body.trim() !== "") formData.append("body", body.trim());
    if (img != null) formData.append("image", img);
    formData.append("privacy", privacy);

    return axios.post(`${BASE_URL}/posts`, formData, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
  }

  const { isPending, mutate } = useMutation({
    mutationFn: createPost,
    onSuccess: async (data) => {
      toast.success(data.data.message);
      await queryClient.invalidateQueries({ queryKey: ["Posts"] });
      await queryClient.invalidateQueries({ queryKey: ["UserPost"] });
      closeImg();
      setBody("");
    },
    onError: (error) => {
      toast.error(
        axios.isAxiosError(error)
          ? (error.response?.data?.message ?? "Failed to create post")
          : "Failed to create post",
      );
    },
  });

  function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImg(file);
    setImgSrc(URL.createObjectURL(file));
    e.target.value = "";
  }

  function closeImg() {
    setImg(null);
    setImgSrc(null);
  }

  const Icon = PrivacyIcon[privacy];
  const canPost = (body.trim() !== "" || img != null) && !isPending;
  const firstName = me?.name?.split(" ")[0] ?? "";

  function addEmoji(emoji: string) {
    const el = textRef.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    setBody(body.slice(0, start) + emoji + body.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  useEffect(() => {
    if (!showEmoji) return;
    const onClick = (e: MouseEvent) => {
      if (emojiBox.current && !emojiBox.current.contains(e.target as Node))
        setShowEmoji(false);
    };
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setShowEmoji(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showEmoji]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <img
          alt={me?.name ?? "User"}
          src={me?.photo || DEFAULT_AVATAR}
          className="h-11 w-11 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-base font-extrabold text-slate-900">{me?.name}</p>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            <Icon size={12} aria-hidden="true" />
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as Privacy)}
              className="bg-transparent outline-none"
            >
              <option value="public">Public</option>
              <option value="following">Followers</option>
              <option value="only_me">Only me</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textRef}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`What's on your mind, ${firstName}?`}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[17px] leading-relaxed text-slate-800 outline-none transition focus:border-[#1877f2] focus:bg-white"
        />
      </div>

      {imgSrc && (
        <div className="relative mt-3">
          <img
            src={imgSrc}
            alt="Selected"
            className="max-h-72 w-full rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={closeImg}
            aria-label="Remove image"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
        <div className="relative flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
            <ImageIcon
              size={18}
              className="text-emerald-600"
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Photo/video</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImg}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            aria-expanded={showEmoji}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <Smile size={18} className="text-amber-500" aria-hidden="true" />
            <span className="hidden sm:inline">Feeling/activity</span>
          </button>

          {showEmoji && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <EmojiPicker onSelect={addEmoji} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!canPost}
            onClick={() => mutate()}
            className="flex items-center gap-2 rounded-lg bg-[#1877f2] px-5 py-2 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#166fe5] disabled:opacity-60"
          >
            {isPending ? "Posting..." : "Post"}
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
