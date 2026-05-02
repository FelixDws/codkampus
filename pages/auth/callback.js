import { useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabase";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // 🔥 INI KUNCI FIX (ambil session dari URL hash)
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        router.replace("/login");
        return;
      }

      if (data?.session) {
        router.replace("/");
      } else {
        router.replace("/login");
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Memproses login...
    </div>
  );
}