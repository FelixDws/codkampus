import Navbar from "../components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { MessageCircle, Gamepad2, Trophy, Store } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);

  const [currentSlide, setCurrentSlide] = useState(0);

const banners = [
  "/banner1.jpg",
  "/banner2.jpg",
  "/banner3.jpg"
];

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

  const features = [
    { title: "Forum", link: "/forum", icon: MessageCircle },
    { title: "Quiz", link: "/event", icon: Gamepad2 },
    { title: "Top Member", link: "/leaderboard", icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-16">

        {/* AVATAR */}
        {user && (
          <div className="flex justify-end">
            <Link href="/profile">
              <img
                src={profile?.avatar_url || "https://via.placeholder.com/40"}
                className="w-10 h-10 rounded-full cursor-pointer"
              />
            </Link>
          </div>
        )}

        <section className="space-y-6">

           <div className="flex justify-center">
    <img src="/logo/logo.png" className="w-40 md:w-52" />
  </div>

  {/* 🔥 SLIDER */}
  <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden">

    {banners.map((img, index) => (
      <img
        key={index}
        src={img}
        className={`absolute w-full h-full object-cover transition-opacity duration-700 ${
          index === currentSlide ? "opacity-100" : "opacity-0"
        }`}
      />
    ))}

    {/* DOT INDICATOR */}
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
      {banners.map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i === currentSlide ? "bg-white" : "bg-white/50"
          }`}
        />
      ))}
    </div>

  </div>

  {/* TEXT */}
  <div className="text-center space-y-3">

    <h1 className="text-3xl font-bold text-[#0F766E]">
      Marketplace Mahasiswa Tanpa Ribet
    </h1>

    <p className="text-gray-600">
      Jual beli langsung antar mahasiswa. COD. Cepat. Aman.
    </p>

    <p className="text-sm text-gray-400">
      Jual beli, diskusi, & cuan bareng mahasiswa <br />
      #NoRibet #CODAja
    </p>

    {/* CTA */}
    <div className="flex justify-center gap-3 mt-3">
      <Link href="/market">
        <button className="flex items-center gap-2 bg-[#0F766E] text-white px-5 py-2.5 rounded-lg font-medium">
          <Store size={18} />
          Marketplace
        </button>
      </Link>

      <Link href="/forum">
        <button className="flex items-center gap-2 border border-[#0F766E] text-[#0F766E] px-5 py-2.5 rounded-lg font-medium hover:bg-[#0F766E] hover:text-white transition">
          <MessageCircle size={18} />
          Forum
        </button>
      </Link>
    </div>

  </div>

</section>

        {/* VALUE */}
        <section className="flex justify-center gap-10 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Store size={16} /> Tanpa ongkir
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={16} /> COD langsung
          </div>
          <div className="flex items-center gap-2">
            <Trophy size={16} /> Khusus mahasiswa
          </div>
        </section>

        {/* PRODUK */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-[#0F766E]">
              Barang Terbaru
            </h2>

            <Link href="/market" className="text-sm text-gray-500 hover:text-[#0F766E]">
              Lihat semua →
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada barang</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((item) => (
                <Link key={item.id} href={`/user/${item.user_id}`}>
                  <div className="cursor-pointer group">

                    <img
                      src={item.image_url || "https://via.placeholder.com/150"}
                      className="rounded-lg mb-2 group-hover:scale-105 transition"
                    />

                    <p className="text-sm font-medium line-clamp-1">
                      {item.title}
                    </p>

                    <p className="text-xs text-gray-500">
                      Rp {item.price?.toLocaleString()}
                    </p>

                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 🔥 FITUR (SHOPEE STYLE) */}
        <section>
          <h2 className="font-semibold text-[#0F766E] mb-4">
            Fitur Lainnya
          </h2>

          <div className="grid grid-cols-3 gap-6 text-center">
            {features.map((item, i) => (
              <Link key={i} href={item.link}>
                <div className="flex flex-col items-center gap-2 cursor-pointer group">

                  <div className="w-14 h-12 flex items-center justify-center rounded-xl bg-[#f1f5f9] group-hover:bg-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition">
                    <item.icon size={22} className="text-[#0F766E]" />
                  </div>

                  <p className="text-xs text-gray-600 group-hover:text-[#0F766E]">
                    Masuk {item.title}
                  </p>

                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section className="text-center space-y-3">
            <h2 className="font-semibold text-[#0F766E]">
              Gabung Sekarang
            </h2>

            <div className="flex justify-center gap-4">
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
    </div>
  );
}