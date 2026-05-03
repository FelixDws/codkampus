import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { MessageCircle } from "lucide-react";

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myLocation, setMyLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  // ======================
  // DISTANCE FUNCTION
  // ======================
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const formatPhone = (num) => {
    if (!num) return "";
    return num.replace(/^0/, "62").replace(/\D/g, "");
  };

  const waLink = profile?.phone
    ? `https://wa.me/${formatPhone(profile.phone)}?text=Halo%20saya%20tertarik%20dengan%20produkmu`
    : "";

  // ======================
  // GET USER LOCATION
  // ======================
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setMyLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  // ======================
  // FETCH DATA
  // ======================
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      // PROFILE
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      setProfile(userData);

      // PRODUK USER
      const { data: userProducts } = await supabase
        .from("market")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      setProducts(userProducts || []);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // ======================
  // CALCULATE DISTANCE
  // ======================
  useEffect(() => {
    if (
      !myLocation ||
      !profile?.latitude ||
      !profile?.longitude
    ) return;

    const d = getDistance(
      myLocation.lat,
      myLocation.lng,
      profile.latitude,
      profile.longitude
    );

    setDistance(d);
  }, [myLocation, profile]);

  if (loading) {
    return <p className="p-6 text-center text-gray-400">Loading...</p>;
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p>User tidak ditemukan</p>
        <Link href="/" className="text-blue-500">
          Kembali ke Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2f6] relative">

      {/* BATIK */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none">
        <img src="/batik.png" className="w-full h-full object-cover" />
      </div>

      <Navbar />

      {/* PROFILE */}
      <div className="max-w-md mx-auto px-6 py-10">

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">

          <img
            src={profile.avatar_url || "https://ui-avatars.com/api/?name=User"}
            className="w-20 h-20 rounded-full object-cover mx-auto border border-gray-300"
          />

          <h1 className="text-lg font-semibold mt-3 text-gray-800">
            {profile.name || "User"}
          </h1>

          {/* 🔥 BADGE (TETAP ADA) */}
          {profile.badge && (
            <div className="mt-2 flex justify-center">
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium
                ${profile.badge === "pro"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-yellow-100 text-yellow-600"}`}
              >
                {profile.badge === "pro" && "Quiz Pro"}
                {profile.badge === "king" && "Quiz King"}
              </span>
            </div>
          )}

          {/* 🔥 LOKASI + JARAK */}
          <p className="text-xs text-gray-500 mt-2">
            📍 {profile.location_name || "Lokasi tidak diketahui"}
            {distance && (
              <>
                {" "}•{" "}
                {distance < 1
                  ? `${Math.round(distance * 1000)} m`
                  : `${distance.toFixed(1)} km`}
              </>
            )}
          </p>

          <p className="text-gray-500 text-sm mt-2">
            {profile.bio || "Belum ada bio"}
          </p>

          {/* EXP */}
          <div className="mt-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">EXP</span>
              <span className="font-medium text-gray-800">
                {profile.exp || 0}
              </span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F766E]"
                style={{ width: `${(profile.exp % 50) * 2}%` }}
              />
            </div>
          </div>

          {/* CHAT */}
          {profile.phone && (
            <a
              href={waLink}
              target="_blank"
              className="flex items-center justify-center gap-2 mt-6 
                         bg-[#0F766E] hover:opacity-90 transition 
                         text-white px-4 py-3 rounded-xl font-medium"
            >
              <MessageCircle size={18} />
              Chat via WhatsApp
            </a>
          )}

        </div>

      </div>

      {/* PRODUK */}
      <div className="max-w-5xl mx-auto px-6 pb-10">

        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Barang Dijual
        </h2>

        {products.length === 0 ? (
          <p className="text-xs text-gray-400">
            Belum ada barang
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {products.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`}>
                <div className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer">

                  <div className="aspect-square bg-gray-100">
                    <img
                      src={item.image_url || "/placeholder.jpg"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3">
                    <p className="text-xs font-medium line-clamp-1">
                      {item.name}
                    </p>

                    <p className="text-[#0F766E] text-xs font-semibold mt-1">
                      Rp {item.price?.toLocaleString()}
                    </p>
                  </div>

                </div>
              </Link>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}