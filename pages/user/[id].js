import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import Link from "next/link";

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-[#e5ddd5] flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow text-center">

        {/* AVATAR */}
        <img
          src={profile.avatar_url || "https://via.placeholder.com/100"}
          className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-[#075E54]"
        />

        {/* NAME */}
        <h1 className="text-xl font-bold mt-3 text-[#075E54]">
          {profile.name || "User"}
        </h1>

        {/* BIO */}
        <p className="text-gray-500 text-sm mt-1">
          {profile.bio || "Belum ada bio"}
        </p>

        {/* EXP */}
        <div className="mt-4 bg-[#075E54] text-white px-4 py-2 rounded-full inline-block">
          EXP: {profile.exp || 0}
        </div>

      </div>

    </div>
  );
}