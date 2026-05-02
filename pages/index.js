import Navbar from "../components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { MessageCircle, Trophy, Store, Pencil } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import Onboarding from "../components/Onboarding";



const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const banners = ["/banner1.jpg", "/banner2.jpg", "/banner3.jpg"];

  useEffect(() => {
  const done = localStorage.getItem("onboarding_done");

  if (!done) {
    setShowOnboarding(true);
  }
}, []);

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

    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("market")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    setProducts(data || []);
  };

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#f8fafc] relative`}>

      {/* BATIK BACKGROUND */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none">
        <img src="/batik.png" className="w-full h-full object-cover" />
      </div>

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 py-6 sm:py-10 space-y-12">

        {/* 🔥 TAMBAHAN: BULATAN PROFILE (TIDAK MENGGANGGU UI LAMA) */}
        
          <div className="flex justify-end">
            <Link href="/profile">
              <img
                src={
  profile?.avatar_url ||
  `https://ui-avatars.com/api/?name=${profile?.username || "User"}&background=0F766E&color=fff`
}
                className="w-10 h-10 rounded-full cursor-pointer border border-gray-200 hover:scale-105 transition"
              />
            </Link>
          </div>
        

        {/* 🔥 PROFILE BAR (TETAP ADA, TIDAK DIHAPUS) */}
        

        {/* HERO */}
        <section className="text-center space-y-6">

          <img 
            src="/logo/logo.png" 
            className="w-56 md:w-72 mx-auto animate-fade-in"
          />

          <div>
            {/* 🔥 FONT DISEDIKIT DI-UPGRADE (TANPA UBAH STYLE BESAR) */}
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-[#0F766E]">
              Marketplace Mahasiswa
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Jual beli langsung. COD aman. Tanpa ribet.
            </p>
          </div>

          {/* SLIDER */}
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden">

            {banners.map((img, index) => (
              <img
                key={index}
                src={img}
                className={`absolute w-full h-full object-cover transition-all duration-700 ${
                  index === currentSlide 
                    ? "opacity-100 scale-100" 
                    : "opacity-0 scale-105"
                }`}
              />
            ))}

            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === 0 ? banners.length - 1 : prev - 1
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 rounded"
            >
              ‹
            </button>

            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % banners.length)
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 rounded"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full cursor-pointer ${
                    i === currentSlide ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">

            <div className="flex gap-3">

              <Link href="/market">
                <button className="flex items-center gap-2 bg-[#0F766E] text-white px-6 py-2.5 rounded-xl text-sm shadow-sm hover:shadow-md transition active:scale-95">
                  <Store size={16} />
                  Marketplace
                </button>
              </Link>

              <Link href="/forum">
                <button className="flex items-center gap-2 border border-[#0F766E] text-[#0F766E] px-6 py-2.5 rounded-xl text-sm hover:bg-[#0F766E] hover:text-white transition active:scale-95">
                  <MessageCircle size={16} />
                  Forum
                </button>
              </Link>

            </div>

            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#0F766E]/40 to-transparent" />

          </div>

        </section>

        {/* VALUE */}
        <section className="flex justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Store size={14} /> Tanpa ongkir
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={14} /> COD langsung
          </div>
          <div className="flex items-center gap-1">
            <Trophy size={14} /> Khusus mahasiswa
          </div>
        </section>

        {/* PRODUK */}
        <section>

          <div className="flex justify-between mb-3">
            <h2 className="text-[#0F766E] font-semibold text-sm">
              Barang Terbaru
            </h2>

            <Link href="/market" className="text-xs text-gray-400">
              Lihat semua
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada barang</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              {products.map((item) => (
                <Link key={item.id} href={`/product/${item.id}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">

                    <div className="aspect-square bg-gray-100">
                      <img
                        src={item.image_url || "/placeholder.jpg"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-2">
                      <p className="text-xs font-medium line-clamp-1">
                        {item.name}
                      </p>

                      <p className="text-[#0F766E] text-xs font-semibold">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>

                  </div>
                </Link>
              ))}

            </div>
          )}
        </section>

        {/* TRUST */}
        <section className="text-center text-xs text-gray-400">
          Digunakan oleh mahasiswa Indonesia
        </section>

        {/* CTA LOGIN */}
        {!user && (
          <section className="text-center space-y-2">
            <h2 className="text-sm font-semibold text-[#0F766E]">
              Gabung sekarang
            </h2>

            <div className="flex justify-center gap-3">
              <Link href="/login">
                <button className="btn-main">Login</button>
              </Link>

              <Link href="/register">
                <button className="btn-accent">Register</button>
              </Link>
            </div>
          </section>
        )}

      </main>
      {showOnboarding && (
  <Onboarding
    onFinish={() => {
      localStorage.setItem("onboarding_done", "true");
      setShowOnboarding(false);
    }}
  />
)}
    </div>
  );
}