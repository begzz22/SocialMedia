import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const stats = [
  { value: "2012", label: "Founded" },
  { value: "40K+", label: "Graduates" },
  { value: "50+", label: "Partner Companies" },
  { value: "5", label: "Branches" },
  { value: "20", label: "Diplomas Available" },
];

type Props = { active: "login" | "register"; children: ReactNode };

const AuthShell = ({ active, children }: Props) => {
  const navigate = useNavigate();

  const tab = (key: "login" | "register", label: string) => (
    <button
      type="button"
      onClick={() => navigate(`/${key}`)}
      className={`rounded-lg py-2 text-sm font-extrabold transition ${
        active === key
          ? "bg-white text-[#00298d] shadow-sm"
          : "text-slate-600 hover:text-slate-800"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="min-h-screen bg-[#f0f2f5] px-4 py-8 sm:py-12 lg:flex lg:items-center"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: branding */}
        <section className="order-2 w-full max-w-xl text-center lg:order-1 lg:text-left">
          <h1 className="hidden text-5xl font-extrabold tracking-tight text-[#00298d] sm:text-6xl lg:block">
            Route Posts
          </h1>
          <p className="mt-4 hidden text-2xl font-medium leading-snug text-slate-800 lg:block">
            Connect with friends and the world around you on Route Posts.
          </p>

          <div className="mt-6 rounded-2xl border border-[#c9d5ff] bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#00298d]">
              About Route Academy
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              Egypt's Leading IT Training Center Since 2012
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Route Academy is the premier IT training center in Egypt, established in 2012. We
              specialize in delivering high-quality training courses in programming, web
              development, and application development. We've identified the unique challenges
              people may face when learning new technology and made efforts to provide strategies
              to overcome them.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-[#c9d5ff] bg-[#f2f6ff] px-3 py-2"
                >
                  <p className="text-base font-extrabold text-[#00298d]">{s.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>


        <section className="order-1 w-full max-w-107.5 lg:order-2">
          <div className="rounded-2xl bg-white p-4 sm:p-6">
            <div className="mb-4 text-center lg:hidden">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#00298d]">
                Route Posts
              </h1>
              <p className="mt-1 text-base font-medium leading-snug text-slate-700">
                Connect with friends and the world around you on Route Posts.
              </p>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 ">
              {tab("login", "Login")}
              {tab("register", "Register")}
            </div>

            {children}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthShell;