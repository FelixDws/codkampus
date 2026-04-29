import { useState } from "react";
import supabase from "../lib/supabase";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const login = async () => {
    if (!email || !password) {
      alert("Isi email & password!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert("Login gagal!");
    } else {
      router.push("/");
    }

    setLoading(false);
  };

  // 🔥 ENTER SUPPORT
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6fffa] to-[#fef3c7] px-4">

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-lg border">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-[#0F766E] mb-6">
          🔐 Login CODKampus
        </h1>

        {/* EMAIL */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full mb-4 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0F766E] outline-none"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full mb-6 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0F766E] outline-none"
        />

        {/* BUTTON */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-[#0F766E] text-white py-3 rounded-full font-semibold hover:scale-105 transition disabled:opacity-60"
        >
          {loading ? "Loading..." : "Masuk"}
        </button>

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Belum punya akun?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-[#F59E0B] cursor-pointer hover:underline"
          >
            Daftar
          </span>
        </p>

      </div>
    </div>
  );
}