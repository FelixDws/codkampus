import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  return (
    <div className="bg-[#0F766E] text-white shadow-md">
      {/* 🔥 penting: max-w + overflow hidden */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">

        {/* BARIS UTAMA */}
        <div className="flex items-center justify-between gap-2">

          {/* LEFT */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {router.pathname !== "/" && (
              <button
                onClick={() => router.back()}
                className="bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap"
              >
                ←
              </button>
            )}

            <nav className="h-16 flex items-center px-4">
  <Link href="/">
    <img
      src="/logo/logo2.png"
      alt="Logo"
      className="h-20 w-auto object-contain"
    />
  </Link>
</nav>
          </div>

          {/* RIGHT (WRAP DI HP) */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium flex-wrap justify-end">

            <Link href="/forum">
              <span className="hover:text-[#F59E0B] cursor-pointer whitespace-nowrap">
                Forum
              </span>
            </Link>

            <Link href="/market">
              <span className="hover:text-[#F59E0B] cursor-pointer whitespace-nowrap">
                Market
              </span>
            </Link>

            <Link href="/event">
              <span className="hover:text-[#F59E0B] cursor-pointer whitespace-nowrap">
                Quiz
              </span>
            </Link>

            <Link href="/leaderboard">
              <span className="hover:text-[#F59E0B] cursor-pointer whitespace-nowrap">
                Leaderboard
              </span>
            </Link>

            {/* AUTH */}
            {user ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
                className="bg-[#F59E0B] px-2 sm:px-3 py-1 rounded-full text-white whitespace-nowrap"
              >
                Logout
              </button>
            ) : (
              <Link href="/login">
                <button className="bg-white text-[#0F766E] px-2 sm:px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                  Login
                </button>
              </Link>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}