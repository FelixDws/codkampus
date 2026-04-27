import { useState } from "react";
import supabase from "../lib/supabase";
import { useRouter } from "next/router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const register = async () => {
    if (!email || !password) {
      alert("Isi semua!");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    try {
      setLoading(true);

      // 🔥 SIGN UP
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      console.log("SIGNUP RESULT:", data, error);

      if (error) {
        alert(error.message);
        return;
      }

      if (!data?.user) {
        alert("Gagal membuat akun");
        return;
      }

      // 🔥 INSERT KE TABLE USERS (INI FIX 500)
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: data.user.email,
          name: data.user.email.split("@")[0],
          exp: 0,
        },
      ]);

      console.log("INSERT RESULT:", insertError);

      if (insertError) {
        alert("Akun dibuat tapi gagal simpan profil");
        return;
      }

      // ✅ SUCCESS
      alert("Akun berhasil dibuat!");
      router.push("/login");

    } catch (err) {
      console.error("REGISTER ERROR:", err);
      alert("Terjadi kesalahan besar");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      register();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6fffa] to-[#fef3c7] px-4">

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-lg border">

        <h1 className="text-3xl font-bold text-center text-[#0F766E] mb-6">
          📝 Daftar CODKampus
        </h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
          className="w-full mb-4 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0F766E] outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="new-password"
          className="w-full mb-6 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0F766E] outline-none"
        />

        <button
          type="button"
          onClick={register}
          disabled={loading}
          className="w-full bg-[#F59E0B] text-white py-3 rounded-full font-semibold hover:scale-105 transition disabled:opacity-60"
        >
          {loading ? "Loading..." : "Daftar"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-[#0F766E] cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}