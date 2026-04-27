import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";
import Link from "next/link";

export default function Market() {
  const [items, setItems] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const createUserIfNotExist = async (u) => {
    await supabase.from("users").upsert({
      id: u.id,
      email: u.email,
      name: u.email.split("@")[0],
      exp: 0,
    });
  };

  const getItems = async () => {
    const { data } = await supabase
      .from("market")
      .select("*")
      .order("id", { ascending: false });

    const clean = data || [];
    setItems(clean);

    const userIds = [...new Set(clean.map((i) => i.user_id).filter(Boolean))];

    if (userIds.length === 0) return;

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .in("id", userIds);

    const map = {};
    users?.forEach((u) => (map[u.id] = u));
    setProfiles(map);
  };

  useEffect(() => {
    getItems();

    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      setUser(u);

      if (u) {
        await createUserIfNotExist(u);
      }
    });
  }, []);

  const addItem = async () => {
    if (!name.trim() || !price.trim()) {
      alert("Isi nama & harga dulu");
      return;
    }

    if (!user) return alert("Login dulu");

    setLoading(true);

    const { error } = await supabase.from("market").insert([
      {
        name: name.trim(),
        price: Number(price),
        user_id: user.id,
      },
    ]);

    if (!error) {
      setName("");
      setPrice("");
      getItems();
      alert("Barang berhasil dijual!");
    } else {
      alert("Gagal jual");
    }

    setLoading(false);
  };

  const chatSeller = async (item) => {
    if (!user) return alert("Login dulu");

    let seller = profiles[item.user_id];

    if (!seller) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", item.user_id)
        .maybeSingle(); // 🔥 FIX

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

    alert(`Pesan dikirim ke ${sellerName}`);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">

      <Navbar />

      <div className="container-main">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="title">🛒 CODKampus Market</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Jual beli antar mahasiswa, #CODAja
          </p>
        </div>

        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari barang..."
          className="input mb-6"
        />

        {/* FORM */}
        <div className="card mb-8">
          <h2 className="font-semibold text-[#0F766E] mb-3">
            💸 Jual Barang
          </h2>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama barang..."
            className="input mb-3"
          />

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Harga (Rp)"
            className="input mb-3"
          />

          <button onClick={addItem} className="btn-accent w-full">
            {loading ? "..." : "Jual Sekarang"}
          </button>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

          {filteredItems.length === 0 && (
            <p className="text-gray-500 text-center col-span-2">
              Barang tidak ditemukan 😢
            </p>
          )}

          {filteredItems.map((item) => {
            const seller = profiles[item.user_id];

            const sellerName =
              seller?.name || seller?.email?.split("@")[0] || "User";

            return (
              <div key={item.id} className="card hover:shadow-xl transition">

                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  COD Ready
                </span>

                <h2 className="font-bold text-base sm:text-lg text-[#0F766E] mt-2">
                  {item.name}
                </h2>

                <p className="text-lg sm:text-xl font-bold text-[#F59E0B]">
                  Rp {item.price}
                </p>

                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Dijual oleh:{" "}
                  {seller ? (
                    <Link href={`/user/${seller.id}`}>
                      <span className="hover:underline cursor-pointer">
                        {sellerName}
                      </span>
                    </Link>
                  ) : (
                    sellerName
                  )}
                </p>

                <button
                  onClick={() => chatSeller(item)}
                  className="btn-main w-full mt-4"
                >
                  💬 Chat Seller
                </button>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}