import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import {
  Earth,
  Users,
  Lock,
  ThumbsUp,
  MessageCircle,
  Share2,
  Repeat2,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Post as PostType } from "../../interface/PostInterface";
import CommentHeader from "../CommentHeader/CommentHeader";
import CreateComment from "../CreateComment/CreateComment";
import PostMenu from "../PostMenu/PostMenu";

const BASE_URL = "https://route-posts.routemisr.com";
const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

const privacyMeta = {
  public: { label: "Public", icon: Earth },
  following: { label: "Followers", icon: Users },
  only_me: { label: "Only me", icon: Lock },
} as const;

const timeAgo = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString();
};

const authHeaders = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

const errMsg = (e: unknown, fallback: string) =>
  axios.isAxiosError(e) ? (e.response?.data?.message ?? fallback) : fallback;

const actionBase =
  "cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:text-sm";

const imageClass = "mt-3 max-h-[520px] w-full rounded-xl object-cover";

const Post = ({
  post,
  isPostDetails,
}: {
  post: PostType;
  isPostDetails: boolean;
}) => {
  const { user } = jwtDecode<{ user: string }>(localStorage.getItem("token")!);
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(post.body ?? "");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["Posts"] });
    queryClient.invalidateQueries({ queryKey: ["Post", post.id] });
  };

  // لايك
  const { mutate: toggleLike, isPending: liking } = useMutation({
    mutationFn: () =>
      axios.put(
        `${BASE_URL}/posts/${post.id}/like`,
        {},
        { headers: authHeaders() },
      ),
    onSuccess: invalidate,
    onError: (e) => toast.error(errMsg(e, "Like failed")),
  });

  // تعديل
  const { mutate: updatePost, isPending: updating } = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("body", draft);
      return axios.put(`${BASE_URL}/posts/${post.id}`, fd, {
        headers: authHeaders(),
      });
    },
    onSuccess: () => {
      toast.success("Post updated");
      invalidate();
      setIsEditing(false);
    },
    onError: (e) => toast.error(errMsg(e, "Update failed")),
  });

  const isMine = user === post.user._id;
  const isLiked = post.likes.includes(user);
  const profilePath = isMine ? "/profile" : `/profile/${post.user._id}`;
  const { label, icon: PrivacyIcon } =
    privacyMeta[post.privacy as keyof typeof privacyMeta] ?? privacyMeta.public;

  return (
    <article className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4">

        <div className="flex items-center gap-3">
          <Link to={profilePath} className="shrink-0">
            <img
              alt={post.user.name}
              src={post.user.photo || DEFAULT_AVATAR}
              className="h-11 w-11 rounded-full object-cover"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              to={profilePath}
              className="truncate text-sm font-bold text-slate-900 hover:underline"
            >
              {post.user.name}
            </Link>
            <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
              @{post.user.username} ·
              <Link
                to={`/postDetails/${post.id}`}
                className="rounded px-0.5 py-0.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 hover:underline"
              >
                {timeAgo(post.createdAt)}
              </Link>
              <span className="mx-1">·</span>
              <span className="inline-flex items-center gap-1 px-1 py-0.5">
                <PrivacyIcon size={11} aria-hidden="true" />
                {label}
              </span>
            </div>
          </div>

          <PostMenu
            postId={post.id}
            isMine={isMine}
            isSaved={!!post.bookmarked}
            onEdit={() => {
              setDraft(post.body ?? "");
              setIsEditing(true);
            }}
          />
        </div>

        {/* المحتوى */}
        {isEditing ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1877f2] focus:bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setDraft(post.body ?? "");
                }}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating || !draft.trim()}
                onClick={() => updatePost()}
                className="cursor-pointer rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#166fe5] disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          post?.body && (
            <div className="mt-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                {post.body}
              </p>
            </div>
          )
        )}

        {post?.image && <img src={post.image} alt="" className={imageClass} />}
      </div>

      {/* العدادات */}
      <div className="px-4 pb-2 pt-3 text-sm text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1877f2] text-white">
              <ThumbsUp size={12} aria-hidden="true" />
            </span>
            <button
              type="button"
              className="cursor-default font-semibold transition"
            >
              {post.likesCount ?? 0} likes
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
            <span className="inline-flex items-center gap-1">
              <Repeat2 size={13} aria-hidden="true" />
              {post.sharesCount ?? 0} shares
            </span>
            <span>{post.commentsCount ?? 0} comments</span>
            {!isPostDetails && (
              <Link
                to={`/postDetails/${post.id}`}
                className="rounded-md px-2 py-1 text-xs font-bold text-[#1877f2] hover:bg-[#e7f3ff]"
              >
                View details
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-4 border-t border-slate-200" />

      {/* الأزرار */}
      <div className="grid grid-cols-3 gap-1 p-1">
        <button
          disabled={liking}
          onClick={() => toggleLike()}
          className={`${actionBase} ${
            isLiked
              ? "bg-[#e7f3ff] text-[#1877f2]"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ThumbsUp size={18} aria-hidden="true" />
          <span>Like</span>
        </button>

        <Link
          to={`/postDetails/${post.id}`}
          className={`${actionBase} text-slate-600 hover:bg-slate-100`}
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span>Comment</span>
        </Link>

        <button className={`${actionBase} text-slate-600 hover:bg-slate-100`}>
          <Share2 size={18} aria-hidden="true" />
          <span>Share</span>
        </button>
      </div>

      {/* Top comment */}
      {post?.topComment && !isPostDetails && (
        <div className="mx-4 mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Top Comment
          </p>
          <div className="flex items-start gap-2">
            <img
              alt={post.topComment.commentCreator.name}
              src={post.topComment.commentCreator.photo || DEFAULT_AVATAR}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1 rounded-2xl bg-white px-3 py-2">
              <p className="truncate text-xs font-bold text-slate-900">
                {post.topComment.commentCreator.name}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">
                {post.topComment.content}
              </p>
            </div>
          </div>
          <Link
            to={`/postDetails/${post.id}`}
            className="mt-2 inline-block text-xs font-bold text-[#1877f2] hover:underline"
          >
            View all comments
          </Link>
        </div>
      )}

      {isPostDetails && (
        <div className="space-y-3 border-t border-slate-200 p-4">
          <CommentHeader id={post.id} />
          <CreateComment id={post.id} />
        </div>
      )}
    </article>
  );
};

export default Post;
