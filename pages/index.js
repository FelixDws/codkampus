import Navbar from "../components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { MessageCircle, Trophy, Store, Pencil, MapPin } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import Onboarding from "../components/Onboarding";
import Head from "next/head";

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
  const [distances, setDistances] = useState({});
  const [showScroll, setShowScroll] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);


  // 🔥 TAMBAHAN LOKASI (TIDAK MENGHAPUS APAPUN)
  const [myLocation, setMyLocation] = useState(null);

  const banners = ["/banner1.jpg", "/banner2.jpg", "/banner3.jpg"];

  useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 200) {
      setFadeOut(true); // mulai fade

      setTimeout(() => {
        setShowScroll(false); // baru hilang
      }, 300);
    } else {
      setShowScroll(true);
      setFadeOut(false);
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  // 🔥 AMBIL LOKASI USER
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setMyLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
  if (!myLocation || products.length === 0) return;

  const calculate = async () => {
    const userIds = [...new Set(products.map(p => p.user_id))];

    const { data: users } = await supabase
      .from("users")
      .select("id, latitude, longitude, location_name")
      .in("id", userIds);

    const map = {};

    users?.forEach(u => {
      if (u.latitude && u.longitude) {
        map[u.id] = {
          distance:
            Math.sqrt(
              Math.pow(u.latitude - myLocation.lat, 2) +
              Math.pow(u.longitude - myLocation.lng, 2)
            ) * 111,
          location: u.location_name
        };
      }
    });

    setDistances(map);
  };

  calculate();
}, [myLocation, products]);

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
    <>
      <Head>
        <title>CODKampus</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${jakarta.className} min-h-screen bg-[#f8fafc] relative`}>

        {/* BATIK BACKGROUND */}
        <div className="fixed inset-0 opacity-[0.04] pointer-events-none">
          <img src="/batik.png" className="w-full h-full object-cover" />
        </div>

        <Navbar />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 py-6 sm:py-10 space-y-12">

          {/* PROFILE */}
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

          {/* HERO */}
          <section className="text-center space-y-6 relative">

            {/* 🔥 GLOW HALUS */}
            <div className="absolute inset-0 flex justify-center pointer-events-none">
              <div className="w-72 h-72 bg-[#0F766E]/10 blur-3xl rounded-full" />
            </div>

            <img
              src="/logo/logo.png"
              className="w-56 md:w-72 mx-auto animate-fade-in hover:scale-105 transition duration-300"
            />

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-[#0F766E]">
                Marketplace Mahasiswa
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                #NoRibet #CODAja
              </p>

              {/* 🔥 LOKASI USER */}
              {myLocation && (
  <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
    <MapPin size={12} className="opacity-70" />
    Lokasi kamu aktif
  </p>
)}
            </div>

            {/* SLIDER (TETAP SAMA) */}
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
                  <button className="flex items-center gap-2 bg-[#0F766E] text-white px-6 py-2.5 rounded-xl text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
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

          {/* VALUE (UPGRADE CAPSULE) */}
          <section className="flex justify-center gap-6 text-xs text-gray-500 bg-white/60 backdrop-blur px-4 py-2 rounded-full w-fit mx-auto shadow-sm">
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
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">

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

  {/* 🔥 LOKASI */}
  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 truncate">
  <MapPin size={12} className="opacity-70" />

  {distances[item.user_id]
    ? `${distances[item.user_id].location || "Sekitar kamu"} • ${
        distances[item.user_id].distance < 1
          ? Math.round(distances[item.user_id].distance * 1000) + " m"
          : distances[item.user_id].distance.toFixed(1) + " km"
      }`
    : "Mengambil lokasi..."}
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

          {/* 🔥 SCROLL GUIDE (RIGHT SIDE) */}
{showScroll && (
  <div
    className={`fixed right-3 sm:right-6 bottom-24 sm:bottom-28 flex flex-col items-center z-50 pointer-events-none transition-all duration-300 ${
      fadeOut ? "opacity-0 translate-y-2" : "opacity-70 translate-y-0"
    }`}
  >

    <span className="text-[10px] text-gray-400 rotate-90 tracking-wide mb-2">
      scroll
    </span>

    <div className="relative w-[2px] h-10 bg-gray-200 overflow-hidden rounded-full">
      <div className="absolute top-0 left-0 w-full h-3 bg-[#0F766E] animate-scroll-smooth" />
    </div>

  </div>
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
    </>
  );
}