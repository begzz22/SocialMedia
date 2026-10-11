import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { KeyRound, Loader2 } from "lucide-react";

const BASE_URL = "https://route-posts.routemisr.com";

// لو الـ header اللي اشتغل معاك مختلف، غيره هنا مرة واحدة
const authHeaders = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

const errMsg = (e: unknown, fallback: string) =>
  axios.isAxiosError(e) ? (e.response?.data?.message ?? fallback) : fallback;

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[0-9]/, "Must include a number")
      .regex(/[^A-Za-z0-9]/, "Must include a special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current one",
  });

type Inputs = z.infer<typeof schema>;

const inputBase =
  "w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1877f2] focus:bg-white";

const Settings = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: (values: Inputs) =>
      axios.patch(
        `${BASE_URL}/users/change-password`,
        {
          password: values.currentPassword,
          newPassword: values.newPassword,
        },
        { headers: authHeaders() },
      ),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? "Password updated");
      reset();
    },
    onError: (e) => toast.error(errMsg(e, "Failed to update password")),
  });

  return (
    <div className="mx-auto max-w-7xl px-3 py-3.5">
      <main className="min-w-0">
        <div className="mx-auto max-w-2xl">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f3ff] text-[#1877f2]">
                <KeyRound size={18} aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                  Change Password
                </h1>
                <p className="text-sm text-slate-500">
                  Keep your account secure by using a strong password.
                </p>
              </div>
            </div>

            <form
              noValidate
              onSubmit={handleSubmit((v) => changePassword(v))}
              className="space-y-4"
            >
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Current password
                </span>
                <input
                  type="password"
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className={`${inputBase} ${
                    errors.currentPassword
                      ? "border-rose-400"
                      : "border-slate-200"
                  }`}
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <span className="mt-1 block text-xs font-semibold text-rose-600">
                    {errors.currentPassword.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  New password
                </span>
                <input
                  type="password"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className={`${inputBase} ${
                    errors.newPassword ? "border-rose-400" : "border-slate-200"
                  }`}
                  {...register("newPassword")}
                />
                {errors.newPassword ? (
                  <span className="mt-1 block text-xs font-semibold text-rose-600">
                    {errors.newPassword.message}
                  </span>
                ) : (
                  <span className="mt-1 block text-xs text-slate-500">
                    At least 8 characters with uppercase, lowercase, number, and
                    special character.
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Confirm new password
                </span>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className={`${inputBase} ${
                    errors.confirmPassword
                      ? "border-rose-400"
                      : "border-slate-200"
                  }`}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <span className="mt-1 block text-xs font-semibold text-rose-600">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </label>

              <button
                type="submit"
                disabled={!isValid || isPending}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1877f2] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Update password"
                )}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
