import "../styles/globals.css";
import Script from "next/script";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

export default function App({ Component, pageProps }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;

      const { data: s } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setSettings(s);
    };

    load();
  }, []);

  useEffect(() => {
    if (!settings) return;

    if (settings.dark_mode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="Mid-client-b0LfPUabpbwZmv0m"
        strategy="beforeInteractive"
      />

      {/* 🔥 GLOBAL DARK FIX */}
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
        <Component {...pageProps} />
      </div>
    </>
  );
}