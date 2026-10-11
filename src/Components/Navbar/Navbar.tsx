// Components/Navbar/Navbar.tsx
import { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { House, User, MessageCircle, Menu, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { authContext } from "../Context/AuthContext/AuthContext";
import image from "../../assets/route.png";

const BASE_URL = "https://route-posts.routemisr.com";
const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

const links = [
  { to: "/feed", label: "Feed", icon: House },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/notifications", label: "Notifications", icon: MessageCircle },
];

const Navbar = () => {
  const { token, logoutContext } = useContext(authContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const { data: user } = useQuery({
    queryKey: ["profile-data"],
    enabled: !!token,
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/users/profile-data`, {
        headers,
      });
      return res.data?.data?.user ?? res.data?.data;
    },
  });

  const { data: unread = 0 } = useQuery({
    queryKey: ["unread-count"],
    enabled: !!token,
    refetchInterval: 30000,
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/notifications/unread-count`, {
        headers,
      });
      const d = res.data?.data;
      return typeof d === "number" ? d : (d?.unreadCount ?? d?.count ?? 0);
    },
  });

  // قفل الـ dropdown لما تدوس برا أو Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const logout = () => {
    setOpen(false);
    logoutContext();
    navigate("/login");
  };

  const itemClass =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-2 py-1.5 sm:gap-3 sm:px-3">
        <NavLink to="/feed" className="flex items-center gap-3">
          <img
            alt="Route Posts"
            src={image}
            className="h-9 w-9 rounded-xl object-cover"
          />
          <p className="hidden text-xl font-extrabold text-slate-900 sm:block">
            Route Posts
          </p>
        </NavLink>

        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/90 px-1 py-1 sm:px-1.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-extrabold transition sm:gap-2 sm:px-3.5 ${
                  isActive
                    ? "bg-white text-[#1f6fe5]"
                    : "text-slate-600 hover:bg-white/90 hover:text-slate-900"
                }`
              }
            >
              <span className="relative">
                <Icon size={20} aria-hidden="true" />
                {label === "Notifications" && unread > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-black leading-4 text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">{label}</span>
              <span className="sr-only sm:hidden">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 transition hover:bg-slate-100"
          >
            <img
              alt={user?.name ?? "User"}
              src={user?.photo || DEFAULT_AVATAR}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="hidden max-w-35 truncate text-sm font-semibold text-slate-800 md:block">
              {user?.name}
            </span>
            <Menu size={15} className="text-slate-500" aria-hidden="true" />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
            >
              <button
                role="menuitem"
                onClick={() => go("/profile")}
                className={itemClass}
              >
                <User size={16} aria-hidden="true" />
                Profile
              </button>
              <button
                role="menuitem"
                onClick={() => go("/settings")}
                className={itemClass}
              >
                <Settings size={16} aria-hidden="true" />
                Settings
              </button>
              <div className="my-1 border-t border-slate-200" />
              <button
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
