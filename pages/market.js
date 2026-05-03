import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

import MarketCard from "../components/MarketCard";
import SellPopup from "../components/SellPopup";

export default function Market() {
  const [items, setItems] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showMine, setShowMine] = useState(false);
  const [editItemData, setEditItemData] = useState(null);

  // 🔥 TAMBAHAN (TIDAK MENGHAPUS APAPUN)
  const [sortBy, setSortBy] = useState("newest");
  const [myLocation, setMyLocation] = useState(null);

  const router = useRouter();

  // 🔥 TAMBAHAN: AMBIL LOKASI USER
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setMyLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  // 🔥 TAMBAHAN: FUNCTION JARAK
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

  // ⏱ TIMER
  const getRemainingTime = (expiredAt) => {
    if (!expiredAt) return null;

    const now = new Date();
    const end = new Date(expiredAt);
    const diff = end - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}j ${minutes}m`;
  };

  // 📦 FETCH DATA
  const getItems = async () => {
    const { data } = await supabase
      .from("market")
      .select("*")
      .order("boosted", { ascending: false })
      .order("created_at", { ascending: false });

    const clean = data || [];
    setItems(clean);

    const userIds = [...new Set(clean.map((i) => i.user_id).filter(Boolean))];

    if (!userIds.length) return;

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .in("id", userIds);

    const map = {};
    users?.forEach((u) => (map[u.id] = u));

    setProfiles((prev) => ({ ...prev, ...map }));
  };

  useEffect(() => {
    getItems();

    const t = setInterval(getItems, 3000);

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user);
    });

    return () => clearInterval(t);
  }, []);

  // 🚀 BOOST
  const handleBoost = async (marketId) => {
    if (!user) return alert("Login dulu");

    const res = await fetch("/api/boost/create", {
      method: "POST",
      body: JSON.stringify({
        marketId,
        userId: user.id,
        amount: 10000,
      }),
    });

    const data = await res.json();
    window.location.href = data.redirect_url;

    setTimeout(getItems, 5000);
  };

  // 💬 CHAT
  const chatSeller = async (item) => {
    if (!user) return alert("Login dulu");

    let seller = profiles[item.user_id];

    if (!seller) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", item.user_id)
        .maybeSingle();

      seller = data;
    }

    const sellerName =
      seller?.name || seller?.email?.split("@")[0] || "penjual";

    await supabase.from("posts").insert([
      {
        content: `Halo ${sellerName}, saya tertarik dengan "${item.name}"`,
        user_email: user.email,
        user_id: user.id,
      },
    ]);

    setTimeout(() => router.push("/forum"), 200);
  };

  // ✏ EDIT
  const editItem = (item) => {
    setEditItemData(item);
    setShowPopup(true);
  };

  // 🗑 DELETE
  const deleteItem = async (item) => {
    if (!confirm("Yakin mau hapus barang ini?")) return;

    if (item.image_url) {
      const fileName = item.image_url.split("/market-images/").pop();

      await supabase.storage
        .from("market-images")
        .remove([fileName]);
    }

    await supabase.from("market").delete().eq("id", item.id);

    getItems();
  };

  // 🔍 FILTER
  const myItems = items.filter((i) => i.user_id === user?.id);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  let displayItems = showMine ? myItems : filteredItems;

  // 🔥 TAMBAHAN SORTING (TIDAK MENGUBAH ASLI)
  if (sortBy === "cheap") {
    displayItems = [...displayItems].sort((a, b) => a.price - b.price);
  }

  if (sortBy === "near" && myLocation) {
    displayItems = [...displayItems].sort((a, b) => {
      const sellerA = profiles[a.user_id];
      const sellerB = profiles[b.user_id];

      if (!sellerA?.latitude || !sellerB?.latitude) return 0;

      const d1 = getDistance(
        myLocation.lat,
        myLocation.lng,
        sellerA.latitude,
        sellerA.longitude
      );

      const d2 = getDistance(
        myLocation.lat,
        myLocation.lng,
        sellerB.latitude,
        sellerB.longitude
      );

      return d1 - d2;
    });
  }

  // 🔥 BOOST ACTIVE
  const isBoostActive = (item) => {
    if (!item.boosted || !item.boost_expired_at) return false;
    return new Date(item.boost_expired_at) > new Date();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] relative">

      {/* BATIK HALUS */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <img src="/batik.png" className="w-full h-full object-cover" />
      </div>

      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6 relative">

        {/* 🔥 TAMBAHAN SORT BUTTON */}
        <div className="flex gap-6 mb-6 relative border-b border-gray-200">

  {/* TERBARU */}
  <button
    onClick={() => setSortBy("newest")}
    className={`pb-2 text-sm font-medium transition relative
      ${sortBy === "newest" ? "text-[#0F766E]" : "text-gray-400"}
    `}
  >
    Terbaru
    {sortBy === "newest" && (
      <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#0F766E] rounded-full" />
    )}
  </button>

  {/* TERMURAH */}
  <button
    onClick={() => setSortBy("cheap")}
    className={`pb-2 text-sm font-medium transition relative
      ${sortBy === "cheap" ? "text-[#0F766E]" : "text-gray-400"}
    `}
  >
    Termurah
    {sortBy === "cheap" && (
      <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#0F766E] rounded-full" />
    )}
  </button>

  {/* TERDEKAT */}
  <button
    onClick={() => setSortBy("near")}
    className={`pb-2 text-sm font-medium transition relative
      ${sortBy === "near" ? "text-[#0F766E]" : "text-gray-400"}
    `}
  >
    Terdekat
    {sortBy === "near" && (
      <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#0F766E] rounded-full" />
    )}
  </button>

</div>

        {/* POPUP */}
        <SellPopup
          show={showPopup}
          onClose={() => {
            setShowPopup(false);
            setEditItemData(null);
          }}
          onSuccess={getItems}
          user={user}
          editItem={editItemData}
        />

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Marketplace Mahasiswa
          </h1>
          <p className="text-sm text-gray-400">
            Jual beli cepat tanpa ribet
          </p>
        </div>

        {/* SEARCH + ACTION */}
        <div className="bg-white border rounded-2xl p-3 mb-6 shadow-sm">

          <div className="flex flex-col sm:flex-row gap-2">

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari barang..."
              className="input flex-1"
            />

            <div className="flex gap-2">

              <button
                onClick={() => {
                  setEditItemData(null);
                  setShowPopup(true);
                }}
                className="px-4 py-2 bg-[#0F766E] text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
              >
                + Jual
              </button>

              <button
                onClick={() => setShowMine(!showMine)}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition"
              >
                {showMine ? "Semua" : " Penjualan Saya"}
              </button>

            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {displayItems.length === 0 && (
            <div className="col-span-2 text-center py-10 text-gray-400">
              Belum ada barang
            </div>
          )}

          {displayItems.map((item) => {
            const seller = profiles[item.user_id];

            const distance =
              seller?.latitude && myLocation
                ? getDistance(
                    myLocation.lat,
                    myLocation.lng,
                    seller.latitude,
                    seller.longitude
                  )
                : null;

            return (
              <MarketCard
                key={item.id}
                item={item}
                seller={seller}
                user={user}
                distance={distance}
                isBoostActive={isBoostActive}
                getRemainingTime={getRemainingTime}
                onChat={chatSeller}
                onBoost={handleBoost}
                onEdit={editItem}
                onDelete={deleteItem}
              />
            );
          })}

        </div>
      </div>
    </div>
  );
}