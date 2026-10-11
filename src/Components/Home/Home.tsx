import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Sparkles, Earth, Bookmark, Loader2 } from "lucide-react";
import Post from "../Post/Post";
import CreatePost from "../CreatePost/CreatePost";
import SuggestedFriends from "../SuggestedFriends/SuggestedFriends";
import type { Post as PostType } from "../../interface/PostInterface";

const BASE_URL = "https://route-posts.routemisr.com";

const tabs = [
  {
    key: "feed",
    label: "Feed",
    icon: Newspaper,
    url: "/posts/feed",
    params: {},
  },
  {
    key: "mine",
    label: "My Posts",
    icon: Sparkles,
    url: "/posts/feed",
    params: { only: "me" },
  },
  {
    key: "community",
    label: "Community",
    icon: Earth,
    url: "/posts",
    params: {},
  },
  {
    key: "saved",
    label: "Saved",
    icon: Bookmark,
    url: "/users/bookmarks", 
    params: {},
  },
] as const;

const Home = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("feed");
  const current = tabs.find((t) => t.key === tab)!;

  async function getAllPosts(): Promise<PostType[]> {
    const { data } = await axios.get(BASE_URL + current.url, {
      params: current.params,
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    return data?.data?.posts ?? data?.data?.bookmarks ?? [];
  }

  const {
    data: posts = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["Posts", tab],
    queryFn: getAllPosts,
    enabled: !!current.url,
  });

  return (
    <div className="mx-auto max-w-7xl px-3 py-3.5">
      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="hidden h-fit xl:sticky xl:top-21 xl:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {tabs.map(({ key, label, icon: Icon }, i) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                  i > 0 ? "mt-1" : ""
                } ${
                  tab === key
                    ? "bg-[#e7f3ff] text-[#1877f2]"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm xl:hidden">
            <div className="grid grid-cols-2 gap-2">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                    tab === key
                      ? "bg-[#e7f3ff] text-[#1877f2]"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <CreatePost />

          <div className="space-y-4">
            {isLoading && (
              <div className="flex justify-center py-10 text-slate-400">
                <Loader2 className="animate-spin" />
              </div>
            )}

            {isError && (
              <p className="py-6 text-center text-sm font-semibold text-rose-600">
                Failed to load posts
              </p>
            )}

            {posts.map((post, idx) => (
              <Post post={post} key={post.id || idx} isPostDetails={false} />
            ))}

            {!isLoading && !isError && posts.length === 0 && (
              <p className="py-6 text-center text-sm font-semibold text-slate-500">
                {tab === "saved" ? "No saved posts yet" : "No posts yet"}
              </p>
            )}
          </div>
        </section>

        <SuggestedFriends />
      </div>
    </div>
  );
};

export default Home;
