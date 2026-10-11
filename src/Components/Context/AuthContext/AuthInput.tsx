import type { ComponentProps, ReactNode } from "react";

type Props = ComponentProps<"input"> & { icon: ReactNode; error?: string };

const AuthInput = ({ icon, error, className = "", ...props }: Props) => (
  <div>
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      <input
        {...props}
        className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-[#00298d] ${
          error ? "border-rose-400" : "border-slate-200"
        } ${className}`}
      />
    </div>
    {error && <p className="mt-1 px-1 text-xs font-semibold text-rose-600">{error}</p>}
  </div>
);

export default AuthInput;