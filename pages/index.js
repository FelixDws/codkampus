import Navbar from "../components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { MessageCircle, Store, Gamepad2, Trophy } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      setUser(u);

      if (u) {
        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", u.id)
          .single();

        setProfile(profileData);
      }
    });
  }, []);

  const features = [
  { title: "Forum Diskusi", link: "/forum", icon: MessageCircle },
  { title: "Marketplace", link: "/market", icon: Store },
  { title: "QuisYuk", link: "/event", icon: Gamepad2 },
  { title: "Leaderboard", link: "/leaderboard", icon: Trophy }
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* 🔥 AVATAR */}
        <div className="flex justify-end mb-4">
          {user && (
            <Link href="/profile">
              <div className="relative cursor-pointer">
                <img
                  src={profile?.avatar_url || "https://via.placeholder.com/40"}
                  className="w-11 h-11 rounded-full border-2 border-[#0F766E] hover:scale-105 transition"
                />
                {/* ONLINE DOT */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
            </Link>
          )}
        </div>

        {/* HERO */}
        <div className="text-center mb-12 flex flex-col items-center gap-2">
  <img 
    src="/logo/logo.png" 
    alt="CODKampus Logo" 
    className="w-96 h-auto"
  />

  <p className="text-gray-700 text-lg">
    Jual beli, diskusi, & cuan bareng mahasiswa
  </p>

  <div className="text-sm text-gray-500">
    #NoRibet #CODAja
  </div>
</div>

        {/* FITUR */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((item, i) => (
            <Link key={i} href={item.link}>
              <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border border-gray-200 hover:scale-[1.03]">

                <div className="mb-2 text-[#0F766E]">
  <item.icon size={28} />
</div>

                <h2 className="text-lg font-semibold text-[#0F766E]">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Klik untuk masuk →
                </p>

              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0F766E] mb-5">
            Mulai Sekarang
          </h2>

          <div className="flex flex-wrap justify-center gap-4">

            <Link href="/forum">
              <button className="btn-main">
                Masuk Forum
              </button>
            </Link>

            {!user && (
              <>
                <Link href="/login">
                  <button className="btn-main">
                    Login
                  </button>
                </Link>

                <Link href="/register">
                  <button className="btn-accent">
                    Register
                  </button>
                </Link>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}