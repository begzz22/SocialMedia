import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Camera,
  Expand,
  X,
  Mail,
  Users,
  FileText,
  Bookmark,
  ThumbsUp,
  Repeat2,
  MessageCircle,
  Clock3,
  Loader2,
} from "lucide-react";
import type { Post as PostType } from "../../interface/PostInterface";

const BASE_URL = "https://route-posts.routemisr.com";
const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

// لو الـ header اللي اشتغل معاك مختلف، غيره هنا في مكان واحد
const authHeaders = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

const errMsg = (e: unknown, fallback: string) =>
  axios.isAxiosError(e) ? (e.response?.data?.message ?? fallback) : fallback;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/* ---------- كارت البوست المختصر ---------- */
const ProfilePostCard = ({
  post,
  myId,
}: {
  post: PostType;
  myId: string;
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLiked = post.likes?.includes(myId);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["UserPost"] });
    queryClient.invalidateQueries({ queryKey: ["Posts"] });
    queryClient.invalidateQueries({ queryKey: ["Post", post.id] });
  };

  const { mutate: toggleLike, isPending: liking } = useMutation({
    mutationFn: () =>
      axios.put(`${BASE_URL}/posts/${post.id}/like`, {}, { headers: authHeaders() }),
    onSuccess: invalidate,
    onError: (e) => toast.error(errMsg(e, "Like failed")),
  });

  const { mutate: sharePost, isPending: sharing } = useMutation({
    mutationFn: () =>
      axios.post(`${BASE_URL}/posts/${post.id}/share`, {}, { headers: authHeaders() }),
    onSuccess: () => {
      toast.success("Post shared");
      invalidate();
    },
    onError: (e) => toast.error(errMsg(e, "Share failed")),
  });

  const actionBtn =
    "inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_6px_rgba(15,23,42,.05)] transition hover:shadow-sm">
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <img
              alt={post.user.name}
              src={post.user.photo || DEFAULT_AVATAR}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">
                {post.user.name}
              </p>
              <p className="truncate text-xs font-semibold text-slate-500">
                @{post.user.username}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/postDetails/${post.id}`)}
            className="cursor-pointer rounded-md px-2 py-1 text-xs font-bold text-[#1877f2] transition hover:bg-[#e7f3ff]"
          >
            View details
          </button>
        </div>

        {post.body && (
          <p className="whitespace-pre-wrap pt-3 text-[15px] leading-relaxed text-slate-800">
            {post.body}
          </p>
        )}
        {post.image && (
          <img
            src={post.image}
            alt=""
            className="mt-3 max-h-105 w-full rounded-xl object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex flex-wrap items-center gap-1 sm:gap-3">
          <button
            disabled={liking}
            onClick={() => toggleLike()}
            className={`${actionBtn} ${isLiked ? "bg-[#e7f3ff] text-[#1877f2]" : ""}`}
          >
            <ThumbsUp size={14} className="text-[#1877f2]" aria-hidden="true" />
            {post.likesCount ?? 0} likes
          </button>

          <button
            disabled={sharing}
            onClick={() => sharePost()}
            className={actionBtn}
          >
            <Repeat2 size={14} className="text-[#1877f2]" aria-hidden="true" />
            {post.sharesCount ?? 0} shares
          </button>

          <button
            onClick={() => navigate(`/postDetails/${post.id}`)}
            className={actionBtn}
          >
            <MessageCircle size={14} className="text-[#1877f2]" aria-hidden="true" />
            {post.commentsCount ?? 0} comments
          </button>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <Clock3 size={13} aria-hidden="true" />
          {formatDate(post.createdAt)}
        </span>
      </div>
    </article>
  );
};

/* ---------- الصفحة ---------- */
const Profile = () => {
  const { id } = useParams();
  const { user: myId } = jwtDecode<{ user: string }>(
    localStorage.getItem("token")!,
  );
  const userId = id ?? myId;
  const isMine = userId === myId;

  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [showPhoto, setShowPhoto] = useState(false);

  // يقفل المودال بـ Escape
  useEffect(() => {
    if (!showPhoto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowPhoto(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showPhoto]);

  // بيانات اليوزر (راجع الـ endpoint وأسماء الحقول من الدوكس)
  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await axios.get(
        isMine
          ? `${BASE_URL}/users/profile-data`
          : `${BASE_URL}/users/${userId}/profile`,
        { headers: authHeaders() },
      );
      return data.data.user;
    },
  });

  // بوستات اليوزر
  const { data: posts = [], isLoading } = useQuery<PostType[]>({
    queryKey: ["UserPost", userId],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE_URL}/users/${userId}/posts`, {
        headers: authHeaders(),
      });
      return data?.data?.posts ?? [];
    },
  });

  // المحفوظات (بتاعتي أنا بس)
  const { data: saved = [], isLoading: loadingSaved } = useQuery<PostType[]>({
    queryKey: ["Posts", "saved"],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE_URL}/users/bookmarks`, {
        headers: authHeaders(),
      });
      return data?.data?.bookmarks ?? [];
    },
    enabled: isMine,
  });

  const list = tab === "posts" ? posts : saved;
  const listLoading = tab === "posts" ? isLoading : loadingSaved;

  const stat = (label: string, value: number | string) => (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
        {value}
      </p>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-3 py-3.5">
      <main className="min-w-0">
        <div className="space-y-5 sm:space-y-6">
          {/* كارت البروفايل */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,.06)] sm:rounded-[28px]">
            <div className="group/cover relative h-44 bg-[linear-gradient(112deg,#0f172a_0%,#1e3a5f_36%,#2b5178_72%,#5f8fb8_100%)] sm:h-52 lg:h-60">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(255,255,255,.14)_0%,rgba(255,255,255,0)_36%)]" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/25 to-transparent" />

              {isMine && (
                <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3 sm:opacity-0 sm:transition sm:group-hover/cover:opacity-100">
                  <label className="pointer-events-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-black/60">
                    <Camera size={13} aria-hidden="true" />
                    Add cover
                    <input accept="image/*" className="hidden" type="file" />
                  </label>
                </div>
              )}
            </div>

            <div className="relative -mt-12 px-3 pb-5 sm:-mt-16 sm:px-8 sm:pb-6">
              <div className="rounded-3xl border border-white/60 bg-white/90 p-5 backdrop-blur-xl sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex min-w-0 items-end gap-4">
                    {/* الأفاتار */}
                    <div className="group/avatar relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowPhoto(true)}
                        className="cursor-zoom-in rounded-full"
                      >
                        <img
                          alt={profile?.name}
                          src={profile?.photo || DEFAULT_AVATAR}
                          className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-[#dbeafe]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowPhoto(true)}
                        title="View profile photo"
                        aria-label="View profile photo"
                        className="absolute bottom-1 left-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-[#1877f2] shadow-sm ring-1 ring-slate-200 transition duration-200 hover:bg-slate-50 sm:opacity-0 sm:group-hover/avatar:opacity-100 sm:group-focus-within/avatar:opacity-100"
                      >
                        <Expand size={16} aria-hidden="true" />
                      </button>

                      {isMine && (
                        <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#1877f2] text-white shadow-sm transition duration-200 hover:bg-[#166fe5] sm:opacity-0 sm:group-hover/avatar:opacity-100 sm:group-focus-within/avatar:opacity-100">
                          <Camera size={17} aria-hidden="true" />
                          <input accept="image/*" className="hidden" type="file" />
                        </label>
                      )}
                    </div>

                    <div className="min-w-0 pb-1">
                      <h2 className="truncate text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
                        {profile?.name}
                      </h2>
                      <p className="mt-1 text-lg font-semibold text-slate-500 sm:text-xl">
                        @{profile?.username}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d7e7ff] bg-[#eef6ff] px-3 py-1 text-xs font-bold text-[#0b57d0]">
                        <Users size={13} aria-hidden="true" />
                        Route Posts member
                      </div>
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-3 gap-2 lg:w-130">
                    {stat("Followers", profile?.followersCount ?? 0)}
                    {stat("Following", profile?.followingCount ?? 0)}
                    {stat("Bookmarks", profile?.bookmarksCount ?? saved.length)}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-extrabold text-slate-800">About</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Mail size={15} className="text-slate-500" aria-hidden="true" />
                        {profile?.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users size={15} className="text-slate-500" aria-hidden="true" />
                        Active on Route Posts
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-2xl border border-[#dbeafe] bg-[#f6faff] px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#1f4f96]">
                        My posts
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-900">
                        {posts.length}
                      </p>
                    </div>
                    {isMine && (
                      <div className="rounded-2xl border border-[#dbeafe] bg-[#f6faff] px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#1f4f96]">
                          Saved posts
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-900">
                          {saved.length}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* التابات والبوستات */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 sm:inline-flex sm:w-auto sm:gap-0">
                <button
                  onClick={() => setTab("posts")}
                  className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                    tab === "posts"
                      ? "bg-white text-[#1877f2] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText size={15} aria-hidden="true" />
                  My Posts
                </button>
                {isMine && (
                  <button
                    onClick={() => setTab("saved")}
                    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                      tab === "saved"
                        ? "bg-white text-[#1877f2] shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Bookmark size={15} aria-hidden="true" />
                    Saved
                  </button>
                )}
              </div>
              <span className="rounded-full bg-[#e7f3ff] px-3 py-1 text-xs font-bold text-[#1877f2]">
                {list.length}
              </span>
            </div>

            <div className="space-y-3">
              {listLoading && (
                <div className="flex justify-center py-10 text-slate-400">
                  <Loader2 className="animate-spin" />
                </div>
              )}

              {!listLoading && list.length === 0 && (
                <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
                  {tab === "posts" ? "No posts yet" : "No saved posts yet"}
                </p>
              )}

              {list.map((post) => (
                <ProfilePostCard key={post.id} post={post} myId={myId} />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* مودال تكبير الصورة */}
      {showPhoto && (
        <div
          onClick={() => setShowPhoto(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            onClick={() => setShowPhoto(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <img
            onClick={(e) => e.stopPropagation()}
            alt={profile?.name}
            src={profile?.photo || DEFAULT_AVATAR}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default Profile;