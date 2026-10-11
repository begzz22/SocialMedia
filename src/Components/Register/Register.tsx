// Components/Register/Register.tsx
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { User, AtSign, Users, Calendar, KeyRound, Loader2 } from "lucide-react";
import AuthShell from "../Context/AuthContext/AuthShell";
import AuthInput from "../Context/AuthContext/AuthInput";

const BASE_URL = "https://route-posts.routemisr.com";

const isAdult = (value: string) => {
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 18;
};

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Minimum length is 3 letters")
      .max(15, "Maximum length is 15 letters"),
    username: z
      .string()
      .trim()
      .max(30, "Maximum length is 30 letters")
      .refine((v) => v === "" || v.length >= 3, "Minimum length is 3 letters"),
    email: z.email("Invalid email"),
    gender: z.enum(["male", "female"], { error: "Gender is required" }),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine(isAdult, "You must be 18 or older"),
    password: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "At least 8 characters with upper, lower, number and a special character",
      ),
    rePassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

type Inputs = z.infer<typeof schema>;

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      password: "",
      rePassword: "",
    },
    resolver: zodResolver(schema),
  });

  async function signUp(values: Inputs) {
    const { username, ...rest } = values;
    const body = username ? { ...rest, username } : rest;

    try {
      const { data } = await axios.post(`${BASE_URL}/users/signup`, body);
      toast.success(data.message);
      navigate("/login");
    } catch (e) {
      toast.error(
        axios.isAxiosError(e)
          ? (e.response?.data?.message ?? "Registration failed")
          : "Something went wrong",
      );
    }
  }

  return (
    <AuthShell active="register">
      <h2 className="text-2xl font-extrabold text-slate-900">Create a new account</h2>
      <p className="mt-1 text-sm text-slate-500">It is quick and easy.</p>

      <form noValidate onSubmit={handleSubmit(signUp)} className="mt-5 space-y-3.5">
        <AuthInput
          icon={<User size={18} aria-hidden="true" />}
          placeholder="Full name"
          type="text"
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthInput
          icon={<AtSign size={18} aria-hidden="true" />}
          placeholder="Username (optional)"
          type="text"
          error={errors.username?.message}
          {...register("username")}
        />
        <AuthInput
          icon={<AtSign size={18} aria-hidden="true" />}
          placeholder="Email address"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Gender */}
        <div>
          <div className="relative">
            <Users
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              {...register("gender")}
              className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-[#00298d] ${
                errors.gender ? "border-rose-400" : "border-slate-200"
              }`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          {errors.gender && (
            <p className="mt-1 px-1 text-xs font-semibold text-rose-600">{errors.gender.message}</p>
          )}
        </div>

        <AuthInput
          icon={<Calendar size={18} aria-hidden="true" />}
          placeholder="Date of birth"
          type="date"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />
        <AuthInput
          icon={<KeyRound size={18} aria-hidden="true" />}
          placeholder="Password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AuthInput
          icon={<KeyRound size={18} aria-hidden="true" />}
          placeholder="Confirm password"
          type="password"
          error={errors.rePassword?.message}
          {...register("rePassword")}
        />

        <button
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00298d] py-3 text-base font-extrabold text-white transition hover:bg-[#001f6b] disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Create New Account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;