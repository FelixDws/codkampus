import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user);
    });
  }, []);

  return (
    <div className="bg-[#0F766E] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* LEFT: BACK + LOGO */}
        <div className="flex items-center gap-4">

          {/* 🔙 BACK BUTTON */}
          {router.pathname !== "/" && (
            <button
              onClick={() => router.back()}
              className="bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
            >
              ←
            </button>
          )}

          {/* LOGO */}
          <Link href="/">
            <h1 className="text-xl font-bold cursor-pointer hover:opacity-90">
              💸 CODKampus
            </h1>
          </Link>
        </div>

        {/* MENU */}
        <div className="flex items-center gap-6 text-sm font-medium">

          <Link href="/forum">
            <span className="hover:text-[#F59E0B] cursor-pointer">
              Forum
            </span>
          </Link>

          <Link href="/market">
            <span className="hover:text-[#F59E0B] cursor-pointer">
              Market
            </span>
          </Link>

          <Link href="/event">
            <span className="hover:text-[#F59E0B] cursor-pointer">
              Event
            </span>
          </Link>

          <Link href="/leaderboard">
            <span className="hover:text-[#F59E0B] cursor-pointer">
              Leaderboard
            </span>
          </Link>

          {/* AUTH */}
          {user ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                location.reload();
              }}
              className="bg-[#F59E0B] px-3 py-1 rounded-full text-white hover:scale-105 transition"
            >
              Logout
            </button>
          ) : (
            <Link href="/login">
              <button className="bg-white text-[#0F766E] px-3 py-1 rounded-full font-semibold hover:scale-105 transition">
                Login
              </button>
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}