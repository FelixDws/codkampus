import { useState } from "react";
import supabase from "../lib/supabase";
import { useRouter } from "next/router";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const login = async () => {
    if (!email || !password) {
      alert("Mohon isi email dan password");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        alert("Email atau password salah");
        return;
      }

      router.push("/");

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
      prompt: "select_account"
    }
      },
    });

    if (error) alert(error.message);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") login();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* BRAND */}
        <div className="flex flex-col items-center text-center leading-none">

  <img
    src="/logo/logo.png"
    className="w-52 md:w-60 h-auto object-contain -mb-2"
    alt="CODKampus Logo"
  />


</div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* ACCENT */}
          <div className="h-2 bg-gradient-to-r from-[#0F766E] to-[#F59E0B]" />

          <div className="p-8">

            {/* TITLE */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Masuk ke Akun
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Lanjutkan aktivitas kamu
              </p>
            </div>

            {/* GOOGLE LOGIN */}
            <button
              onClick={loginWithGoogle}
              className="w-full border py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition font-medium"
            >
              <img src="/google.png" className="w-5 h-5" />
              Lanjut dengan Google
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">atau login dengan email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* EMAIL */}
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none transition"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative mb-6">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none transition"
              />
            </div>

            {/* BUTTON */}
            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-[#0F766E] text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-[#0d5c55] transition-all disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

            {/* FOOTER */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Belum punya akun?{" "}
              <span
                onClick={() => router.push("/register")}
                className="text-[#F59E0B] font-medium cursor-pointer hover:underline"
              >
                Daftar
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}