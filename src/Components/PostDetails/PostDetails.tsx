import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Post from "../Post/Post";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["Post", id],
    queryFn: () =>
      axios.get(`https://route-posts.routemisr.com/posts/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    enabled: !!id,
    select: (res) => res.data.data.post,
  });

  return (
    <div className="mx-auto max-w-7xl px-3 py-3.5">
      <main className="min-w-0">
        <div className="mx-auto max-w-3xl space-y-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 size={32} className="animate-spin text-[#1877f2]" />
            </div>
          )}

          {isError && (
            <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
              Couldn't load this post.
            </p>
          )}

          {data && <Post post={data} isPostDetails={true} />}
        </div>
      </main>
    </div>
  );
};

export default PostDetails;
