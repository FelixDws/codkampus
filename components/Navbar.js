import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  return (
    <>
      {/* 🔥 NAVBAR */}
      <div className="bg-[#0F766E]/95 backdrop-blur-sm text-white shadow-sm sticky top-0 z-50 relative">

        {/* 🔥 GARIS HALUS NAVBAR */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">

          <div className="flex items-center justify-between gap-2">

            {/* LEFT */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">

              {/* 🔥 MENU BUTTON PALING KIRI */}
              <button
                onClick={() => setOpen(true)}
                className="text-xl px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                ☰
              </button>

              {router.pathname !== "/" && (
                <button
                  onClick={() => router.back()}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm transition whitespace-nowrap"
                >
                  ←
                </button>
              )}

              <nav className="h-16 flex items-center px-2 sm:px-4">
                <Link href="/" className="flex items-center gap-2">
                  <img
                    src="/logo/logo2.png"
                    alt="Logo"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                  <span className="title text-lg hidden sm:block text-white">
                    CodKampus
                  </span>
                </Link>
              </nav>
            </div>

            {/* RIGHT */}
            <div className="hidden sm:flex items-center gap-5 text-sm font-medium">

              <Link href="/forum">
                <span className="text-white/80 hover:text-white transition cursor-pointer whitespace-nowrap">
                  Forum
                </span>
              </Link>

              <Link href="/market">
                <span className="text-white/80 hover:text-white transition cursor-pointer whitespace-nowrap">
                  Market
                </span>
              </Link>

              <Link href="/event">
                <span className="text-white/80 hover:text-white transition cursor-pointer whitespace-nowrap">
                  Quiz
                </span>
              </Link>

              <Link href="/leaderboard">
                <span className="text-white/80 hover:text-white transition cursor-pointer whitespace-nowrap">
                  Leaderboard
                </span>
              </Link>

              {user ? (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/login");
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap"
                >
                  Logout
                </button>
              ) : (
                <Link href="/login">
                  <button className="bg-white text-[#0F766E] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition whitespace-nowrap">
                    Login
                  </button>
                </Link>
              )}

            </div>

          </div>

        </div>
      </div>

      {/* 🔥 SIDEBAR */}
      <div className={`fixed inset-0 z-50 ${open ? "visible" : "invisible"}`}>

        {/* OVERLAY */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* PANEL */}
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-2xl p-6 flex flex-col justify-between transform transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >

          {/* TOP */}
          <div>
            <button
              onClick={() => setOpen(false)}
              className="mb-6 text-gray-500 hover:text-gray-900"
            >
              ✕
            </button>

            <div className="flex flex-col gap-4 text-gray-800 font-medium">

              <Link href="/forum" onClick={() => setOpen(false)}>Forum</Link>
              <Link href="/market" onClick={() => setOpen(false)}>Market</Link>
              <Link href="/event" onClick={() => setOpen(false)}>Quiz</Link>
              <Link href="/leaderboard" onClick={() => setOpen(false)}>Leaderboard</Link>

              {/* 🔥 DIVIDER HALUS */}
              <div className="my-3 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

              <Link href="/settings" onClick={() => setOpen(false)}>
                ⚙️ Pengaturan
              </Link>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="pt-4 text-sm text-gray-500">

            {/* 🔥 DIVIDER HALUS */}
            <div className="mb-3 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            <p className="font-medium">CodKampus</p>
            <p className="text-xs text-gray-400">
              Created by @felixdhrma
            </p>
          </div>

        </div>
      </div>
    </>
  );
}