import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { User, KeyRound, Loader2 } from "lucide-react";
import AuthShell from "../Context/AuthContext/AuthShell";
import AuthInput from "../Context/AuthContext/AuthInput";
import { authContext } from "../Context/AuthContext/AuthContext";

const BASE_URL = "https://route-posts.routemisr.com";

const schema = z.object({
  login: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});
type Inputs = z.infer<typeof schema>;

const Login = () => {
  const { insertUserToken } = useContext(authContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: { login: "", password: "" },
    resolver: zodResolver(schema),
  });

  async function signIn(values: Inputs) {
    try {
      const { data } = await axios.post(`${BASE_URL}/users/signin`, values);
      insertUserToken(data.data.token);
      toast.success(data.message);
      navigate("/feed");
    } catch (e) {
      toast.error(
        axios.isAxiosError(e)
          ? (e.response?.data?.message ?? "Login failed")
          : "Something went wrong",
      );
    }
  }

  return (
    <AuthShell active="login">
      <h2 className="text-2xl font-extrabold text-slate-900">
        Log in to Route Posts
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Log in and continue your social journey.
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(signIn)}
        className="mt-5 space-y-3.5"
      >
        <AuthInput
          icon={<User size={18} aria-hidden="true" />}
          placeholder="Email or username"
          type="text"
          error={errors.login?.message}
          {...register("login")}
        />
        <AuthInput
          icon={<KeyRound size={18} aria-hidden="true" />}
          placeholder="Password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />

        <button
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00298d] py-3 text-base font-extrabold text-white transition hover:bg-[#001f6b] disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Log In"
          )}
        </button>

        <button
          type="button"
          className="mx-auto block text-sm font-semibold text-[#00298d] transition hover:underline"
        >
          Forgot password?
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
