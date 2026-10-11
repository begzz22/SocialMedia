import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Bell,
  Check,
  CheckCheck,
  Dot,
  Heart,
  Loader2,
  MessageCircle,
  Repeat2,
  UserPlus,
} from "lucide-react";

const BASE_URL = "https://route-posts.routemisr.com";
const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

// لو الـ header اللي اشتغل معاك مختلف، غيره هنا مرة واحدة
const authHeaders = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

const errMsg = (e: unknown, fallback: string) =>
  axios.isAxiosError(e) ? (e.response?.data?.message ?? fallback) : fallback;

const timeAgo = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString();
};

// شكل الإشعار تخميني، ظبطه حسب الـ response الحقيقي
type NotificationItem = {
  _id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor?: { _id: string; name: string; photo?: string };
  sender?: { _id: string; name: string; photo?: string };
  post?: { _id?: string; id?: string; body?: string } | string;
  comment?: { content?: string };
  content?: string;
};

const typeMeta = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("like"))
    return { icon: Heart, color: "text-rose-500", text: "liked your post" };
  if (t.includes("comment"))
    return {
      icon: MessageCircle,
      color: "text-[#1877f2]",
      text: "commented on your post",
    };
  if (t.includes("share"))
    return {
      icon: Repeat2,
      color: "text-emerald-600",
      text: "shared your post",
    };
  if (t.includes("follow"))
    return {
      icon: UserPlus,
      color: "text-[#1877f2]",
      text: "started following you",
    };
  return {
    icon: Bell,
    color: "text-slate-500",
    text: "sent you a notification",
  };
};

const Notifications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | "unread">("all");

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE_URL}/notifications`, {
        headers: authHeaders(),
      });
      return data?.data?.notifications ?? [];
    },
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const { mutate: markRead, variables: readingId } = useMutation({
    mutationFn: (id: string) =>
      axios.patch(
        `${BASE_URL}/notifications/${id}/read`,
        {},
        { headers: authHeaders() },
      ),
    onSuccess: refresh,
    onError: (e) => toast.error(errMsg(e, "Failed to mark as read")),
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: () =>
      axios.patch(
        `${BASE_URL}/notifications/read-all`,
        {},
        { headers: authHeaders() },
      ),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      refresh();
    },
    onError: (e) => toast.error(errMsg(e, "Failed to mark all as read")),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const list =
    tab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const openNotification = (n: NotificationItem) => {
    if (!n.isRead) markRead(n._id);
    const post = typeof n.post === "string" ? { _id: n.post } : n.post;
    const postId = post?._id ?? post?.id;
    if (postId) navigate(`/postDetails/${postId}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-3.5">
      <main className="min-w-0">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
          {/* الهيدر */}
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                  Notifications
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Realtime updates for likes, comments, shares, and follows.
                </p>
              </div>

              <button
                disabled={markingAll || unreadCount === 0}
                onClick={() => markAllRead()}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <CheckCheck size={15} aria-hidden="true" />
                Mark all as read
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={() => setTab("all")}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  tab === "all"
                    ? "bg-[#1877f2] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTab("unread")}
                className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  tab === "unread"
                    ? "bg-[#1877f2] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Unread
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    tab === "unread"
                      ? "bg-white text-[#1877f2]"
                      : "bg-white text-[#1877f2]"
                  }`}
                >
                  {unreadCount}
                </span>
              </button>
            </div>
          </div>

          {/* القائمة */}
          <div className="space-y-2 p-3 sm:p-4">
            {isLoading && (
              <div className="flex justify-center py-10 text-slate-400">
                <Loader2 className="animate-spin" />
              </div>
            )}

            {isError && (
              <p className="py-6 text-center text-sm font-semibold text-rose-600">
                Failed to load notifications
              </p>
            )}

            {!isLoading && !isError && list.length === 0 && (
              <p className="py-10 text-center text-sm font-semibold text-slate-500">
                {tab === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
            )}

            {list.map((n) => {
              const actor = n.actor ?? n.sender;
              const { icon: Icon, color, text } = typeMeta(n.type ?? "");
              const preview = n.comment?.content ?? n.content;

              return (
                <article
                  key={n._id}
                  className={`group relative flex gap-3 rounded-xl border p-3 transition sm:rounded-2xl sm:p-4 ${
                    n.isRead
                      ? "border-slate-200 bg-white"
                      : "border-[#dbeafe] bg-[#edf4ff]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => actor && navigate(`/profile/${actor._id}`)}
                      className="block cursor-pointer"
                    >
                      <img
                        alt={actor?.name}
                        src={actor?.photo || DEFAULT_AVATAR}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    </button>
                    <span
                      className={`absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white ${color}`}
                    >
                      <Icon size={15} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-1.5 sm:gap-2">
                      <p className="text-sm leading-6 text-slate-800">
                        <button
                          type="button"
                          onClick={() =>
                            actor && navigate(`/profile/${actor._id}`)
                          }
                          className="cursor-pointer font-extrabold hover:text-[#1877f2] hover:underline"
                        >
                          {actor?.name ?? "Someone"}
                        </button>{" "}
                        {text}
                      </p>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          {timeAgo(n.createdAt)}
                        </span>
                        {!n.isRead && (
                          <Dot
                            size={20}
                            className="text-[#1877f2]"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </div>

                    {preview && (
                      <button
                        type="button"
                        onClick={() => openNotification(n)}
                        className="mt-0.5 block cursor-pointer text-left text-sm text-slate-600 hover:underline"
                      >
                        {preview}
                      </button>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      {!n.isRead && (
                        <button
                          disabled={readingId === n._id}
                          onClick={() => markRead(n._id)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#1877f2] ring-1 ring-[#dbeafe] transition hover:bg-[#e7f3ff] disabled:opacity-60"
                        >
                          <Check size={13} aria-hidden="true" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Notifications;
