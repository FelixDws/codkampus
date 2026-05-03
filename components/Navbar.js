import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabase";

// 🔥 ICON LUICIDE
import {
  Menu,
  ArrowLeft,
  Store,
  MessageCircle,
  Trophy,
  BarChart3,
  Settings,
  X
} from "lucide-react";

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
      <div className="bg-[#0F766E]/95 backdrop-blur-md text-white shadow-sm sticky top-0 z-50 relative">

        {/* garis bawah */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">

          <div className="flex items-center justify-between">

            {/* LEFT */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">

              {/* MENU */}
              <button
                onClick={() => setOpen(true)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <Menu size={18} />
              </button>

              {/* BACK */}
              {router.pathname !== "/" && (
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  <ArrowLeft size={16} />
                </button>
              )}

              {/* LOGO */}
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/logo/logo2.png"
                  className="h-10 sm:h-12 object-contain"
                />
                <span className="hidden sm:block text-lg font-semibold tracking-tight">
                  CODKAMPUS
                </span>
              </Link>
            </div>

            {/* RIGHT (DESKTOP) */}
            <div className="hidden sm:flex items-center gap-6 text-sm font-medium">

              {/* MENU ITEM */}
              <NavItem href="/forum" icon={<MessageCircle size={16} />} label="Forum" router={router} />
              <NavItem href="/market" icon={<Store size={16} />} label="Market" router={router} />
              <NavItem href="/event" icon={<Trophy size={16} />} label="Quiz" router={router} />
              <NavItem href="/leaderboard" icon={<BarChart3 size={16} />} label="Leaderboard" router={router} />

              {/* AUTH */}
              {user ? (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/login");
                  }}
                  className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition"
                >
                  Logout
                </button>
              ) : (
                <Link href="/login">
                  <button className="bg-white text-[#0F766E] px-4 py-1.5 rounded-full font-semibold hover:bg-gray-100 transition">
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

            {/* CLOSE */}
            <button
              onClick={() => setOpen(false)}
              className="mb-6 text-gray-500 hover:text-gray-900"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col gap-3 text-gray-800">

              <SideItem href="/forum" icon={<MessageCircle size={16} />} label="Forum" close={setOpen} />
              <SideItem href="/market" icon={<Store size={16} />} label="Market" close={setOpen} />
              <SideItem href="/event" icon={<Trophy size={16} />} label="Quiz" close={setOpen} />
              <SideItem href="/leaderboard" icon={<BarChart3 size={16} />} label="Leaderboard" close={setOpen} />

              <div className="my-3 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

              <SideItem href="/settings" icon={<Settings size={16} />} label="Pengaturan" close={setOpen} />

            </div>
          </div>

          {/* BOTTOM */}
          <div className="text-sm text-gray-500">
            <div className="mb-3 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <p className="font-medium">CodKampus</p>
            <p className="text-xs text-gray-400">Created by @felixdhrma</p>
          </div>

        </div>
      </div>
    </>
  );
}

function NavItem({ href, icon, label, router }) {
  const active = router.pathname === href;

  return (
    <Link href={href}>
      <span
        className={`flex items-center gap-1 cursor-pointer transition ${
          active ? "text-white font-semibold" : "text-white/70 hover:text-white"
        }`}
      >
        {icon}
        {label}
      </span>
    </Link>
  );
}

function SideItem({ href, icon, label, close }) {
  return (
    <Link href={href} onClick={() => close(false)}>
      <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer">
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}