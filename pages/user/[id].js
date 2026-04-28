import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatPhone = (num) => {
    if (!num) return "";
    return num.replace(/^0/, "62").replace(/\D/g, "");
  };

  const waLink = profile?.phone
    ? `https://wa.me/${formatPhone(profile.phone)}?text=Halo%20saya%20tertarik%20dengan%20produkmu`
    : "";

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) return <p className="p-5">Loading...</p>;

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p>User tidak ditemukan</p>
        <Link href="/" className="text-blue-500">
          Kembali ke Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">
      
      <Navbar />

      <div className="flex justify-center items-center px-6 py-10">

        <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-lg text-center">

          {/* AVATAR */}
          <img
            src={profile.avatar_url || "https://via.placeholder.com/100"}
            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-[#0F766E]"
          />

          {/* NAME */}
          <h1 className="text-2xl font-bold mt-3 text-[#0F766E]">
            {profile.name || "User"}
          </h1>

          {/* 🔥 BADGE */}
          {profile.badge && (
            <div className="mt-2 flex justify-center">
              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold
                ${profile.badge === "pro"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-yellow-100 text-yellow-600"}`}
              >
                {profile.badge === "pro" && "🧠 Quiz Pro"}
                {profile.badge === "king" && "👑 Quiz King"}
              </span>
            </div>
          )}

          {/* BIO */}
          <p className="text-gray-500 text-sm mt-1">
            {profile.bio || "Belum ada bio"}
          </p>

          {/* EXP */}
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F59E0B]"
                style={{ width: `${(profile.exp % 50) * 2}%` }}
              />
            </div>
            <p className="text-xs mt-1 text-gray-500">
              EXP: {profile.exp || 0}
            </p>
          </div>

          {/* WHATSAPP */}
          {profile.phone && (
            <a
              href={waLink}
              target="_blank"
              className="block mt-5 bg-green-500 hover:bg-green-600 transition text-white px-4 py-3 rounded-full"
            >
              Chat WhatsApp
            </a>
          )}

        </div>

      </div>
    </div>
  );
}