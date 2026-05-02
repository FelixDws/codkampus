import { useState } from "react";
import supabase from "../lib/supabase";
import { useRouter } from "next/router";
import { Mail, Lock, Info } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const router = useRouter();

  const register = async () => {
    if (!email || !password) {
      alert("Mohon isi email dan password");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Email verifikasi telah dikirim. Silakan cek inbox Anda.");
      router.push("/login");

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
    if (e.key === "Enter") register();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* BRAND TOP */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[#0F766E]">
            CODKampus
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Marketplace mahasiswa terpercaya
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* ACCENT BAR */}
          <div className="h-2 bg-gradient-to-r from-[#0F766E] to-[#F59E0B]" />

          <div className="p-8">

            {/* TITLE */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Buat Akun Baru
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Mulai jual & beli dengan aman
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
              <span className="text-xs text-gray-400">atau daftar dengan email</span>
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
            <div className="relative mb-2">
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

            {/* INFO */}
            <div className="flex items-center justify-between mb-6 text-xs text-gray-400">
              <span>Disimpan secara terenkripsi</span>
              <button
                onClick={() => setShowInfo(true)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={register}
              disabled={loading}
              className="w-full bg-[#0F766E] text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-[#0d5c55] transition-all disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Buat Akun"}
            </button>

            {/* LOGIN */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Sudah punya akun?{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-[#0F766E] font-medium cursor-pointer hover:underline"
              >
                Masuk
              </span>
            </p>

            {/* TERMS */}
            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              Dengan membuat akun, Anda menyetujui Syarat & Ketentuan CODKampus
            </p>

          </div>
        </div>

      </div>

      {/* MODAL */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-xl shadow-lg text-sm">

            <h2 className="text-lg font-semibold text-[#0F766E] mb-3">
              Keamanan Akun
            </h2>

            <ul className="space-y-2 text-gray-600">
              <li>Password disimpan dalam bentuk terenkripsi</li>
              <li>Jangan bagikan password ke siapa pun</li>
              <li>Gunakan kombinasi huruf dan angka</li>
              <li>Minimal 6 karakter</li>
            </ul>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 w-full bg-[#0F766E] text-white py-2 rounded-xl"
            >
              Mengerti
            </button>

          </div>
        </div>
      )}

    </div>
  );
}