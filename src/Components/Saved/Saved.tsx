import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Bookmark, Loader2 } from "lucide-react";
import Post from "../Post/Post";
import type { Post as PostType } from "../../interface/PostInterface";

const Saved = () => {
  const { data: posts = [], isLoading } = useQuery<PostType[]>({
    queryKey: ["savedPosts"],
    queryFn: async () => {
      const { data } = await axios.get(
        "https://route-posts.routemisr.com/users/bookmarks",
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        },
      );
      return data.data.bookmarks; 
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-3 py-3.5">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
        <Bookmark size={20} className="text-[#1877f2]" aria-hidden="true" />
        Saved posts
      </h2>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#1877f2]" />
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
          No saved posts yet.
        </p>
      )}

      {posts.map((p) => (
        <Post key={p.id} post={p} isPostDetails={false} />
      ))}
    </div>
  );
};

export default Saved;
