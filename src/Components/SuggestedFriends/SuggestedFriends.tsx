// SuggestedFriends.tsx
import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, UserPlus, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

const BASE_URL = "https://route-posts.routemisr.com";
const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

type Friend = {
  _id: string;
  name: string;
  username: string;
  photo?: string;
  followersCount: number;
  isFollowing?: boolean;
};

// استخدم نفس الـ header اللي حليت بيه مشكلة اللايك
const authHeaders = () => ({ token: localStorage.getItem("token") ?? "" });

const newLocal = "hidden h-fit xl:sticky xl:top-[84px] xl:block";
const SuggestedFriends = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(5);
  const [openMobile, setOpenMobile] = useState(false);

  const { data: friends = [], isLoading } = useQuery<Friend[]>({
    queryKey: ["suggestedFriends"],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE_URL}/users/suggestions?limit=20`, {
        headers: authHeaders(),
      });
      return data.data.suggestions;
    },
  });

  const { mutate: follow, variables: pendingId } = useMutation({
    mutationFn: (id: string) =>
      axios.put(`${BASE_URL}/users/${id}/follow`, {}, { headers: authHeaders() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestedFriends"] });
      queryClient.invalidateQueries({ queryKey: ["Posts"] });
    },
    onError: (e) =>
      toast.error(
        axios.isAxiosError(e)
          ? (e.response?.data?.message ?? "Follow failed")
          : "Follow failed",
      ),
  });

  const filtered = friends.filter((f) =>
    `${f.name} ${f.username}`.toLowerCase().includes(search.toLowerCase()),
  );

  const card = (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#1877f2]" aria-hidden="true" />
          <h3 className="text-base font-extrabold text-slate-900">
            Suggested Friends
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
          {friends.length}
        </span>
      </div>

      <label className="relative mb-3 block">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#1877f2] focus:bg-white"
        />
      </label>

      {isLoading && <p className="text-center text-xs text-slate-400">Loading...</p>}

      <div className="space-y-3">
        {filtered.slice(0, visible).map((f) => (
          <div key={f._id} className="rounded-xl border border-slate-200 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-slate-50"
              >
                <img
                  alt={f.name}
                  src={f.photo || DEFAULT_AVATAR}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 hover:underline">
                    {f.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">@{f.username}</p>
                </div>
              </button>

              <button
                disabled={pendingId === f._id}
                onClick={() => follow(f._id)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
                  f.isFollowing
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-[#e7f3ff] text-[#1877f2] hover:bg-[#d8ebff]"
                }`}
              >
                {f.isFollowing ? (
                  <UserCheck size={13} aria-hidden="true" />
                ) : (
                  <UserPlus size={13} aria-hidden="true" />
                )}
                {f.isFollowing ? "Following" : "Follow"}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                {f.followersCount} followers
              </span>
            </div>
          </div>
        ))}
      </div>

      {visible < filtered.length && (
        <button
          onClick={() => setVisible((v) => v + 5)}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          View more
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-3 xl:hidden">
        <button
          type="button"
          onClick={() => setOpenMobile((o) => !o)}
          className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Users size={17} className="text-[#1877f2]" aria-hidden="true" />
            Suggested Friends
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {friends.length}
            </span>
            <span className="text-xs font-bold text-[#1877f2]">
              {openMobile ? "Hide" : "Show"}
            </span>
          </span>
        </button>
        {openMobile && card}
      </div>
      <aside className={newLocal}>{card}</aside>
    </>
  );
};

export default SuggestedFriends;