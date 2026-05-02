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

  const router = useRouter();

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

  const displayItems = showMine ? myItems : filteredItems;

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

        {/* POPUP */}
        <SellPopup
  show={showPopup}
  onClose={() => {
    setShowPopup(false);
    setEditItemData(null); // 🔥 reset biar gak nyangkut
  }}
  onSuccess={getItems}
  user={user}
  editItem={editItemData} // 🔥 INI YANG KURANG
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

          {displayItems.map((item) => (
            <MarketCard
              key={item.id}
              item={item}
              seller={profiles[item.user_id]}
              user={user}
              isBoostActive={isBoostActive}
              getRemainingTime={getRemainingTime}
              onChat={chatSeller}
              onBoost={handleBoost}
              onEdit={editItem}
              onDelete={deleteItem}
            />
          ))}

        </div>
      </div>
    </div>
  );
}