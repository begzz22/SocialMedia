import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { Comment } from "../../interface/CommentsInterface";
import DeleteComment from "../DeleteComment/DeleteComment";

const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

const timeAgo = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString();
};

const CommentHeader = ({ id }: { id: string }) => {
  const { user } = jwtDecode<{ user: string }>(localStorage.getItem("token")!);

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://route-posts.routemisr.com/posts/${id}/comments`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      return data?.data?.comments ?? [];
    },
  });

  if (isLoading) {
    return (
      <p className="text-center text-xs text-slate-400">Loading comments...</p>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-center text-sm font-semibold text-slate-500">
        No comments yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment._id} className="flex items-start gap-2">
          <img
            alt={comment.commentCreator?.name}
            src={comment.commentCreator?.photo || DEFAULT_AVATAR}
            className="h-8 w-8 rounded-full object-cover"
          />

          <div className="min-w-0 flex-1 rounded-2xl bg-slate-100 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900">
                  {comment.commentCreator?.name}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">
                  {timeAgo(comment.createdAt)}
                </p>
              </div>

              {user === comment.commentCreator?._id && (
                <DeleteComment postId={id} commentId={comment._id} />
              )}
            </div>

            {comment.content && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {comment.content}
              </p>
            )}

            {comment.image && (
              <img
                src={comment.image}
                alt=""
                className="mt-2 max-h-60 rounded-xl object-cover"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentHeader;
