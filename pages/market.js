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
    await supabase.from("users").upsert(
      {
        id: u.id,
        email: u.email,
        name: u.email.split("@")[0],
        exp: 0,
      },
      { onConflict: "id" }
    );
  };

  const getItems = async () => {
    const { data } = await supabase
      .from("market")
      .select("*")
      .order("id", { ascending: false });

    const clean = data || [];
    setItems(clean);

    const userIds = [
      ...new Set(clean.map((i) => i.user_id).filter(Boolean)),
    ];

    if (userIds.length === 0) return;

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .in("id", userIds);

    const map = {};
    users?.forEach((u) => {
      map[u.id] = u;
    });

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

    const { error } = await supabase
      .from("market")
      .insert([
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
        .single();

      seller = data;
    }

    let sellerName =
      seller?.name ||
      seller?.email?.split("@")[0] ||
      "penjual";

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

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-[#0F766E]">
            🛒 CODKampus Market
          </h1>
          <p className="text-gray-600">
            Jual beli antar mahasiswa, #CODAja
          </p>
        </div>

        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari barang..."
          className="w-full px-4 py-3 mb-6 rounded-full border focus:ring-2 focus:ring-[#0F766E] outline-none"
        />

        {/* FORM JUAL */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8 border">

          <h2 className="font-semibold text-[#0F766E] mb-3">
            💸 Jual Barang
          </h2>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama barang..."
            className="w-full mb-3 px-4 py-2 border rounded-xl"
          />

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Harga (Rp)"
            className="w-full mb-3 px-4 py-2 border rounded-xl"
          />

          <button
            onClick={addItem}
            className="w-full bg-[#F59E0B] text-white py-2 rounded-full font-semibold hover:scale-105 transition"
          >
            {loading ? "..." : "Jual Sekarang"}
          </button>
        </div>

        {/* LIST */}
        <div className="grid md:grid-cols-2 gap-6">

          {filteredItems.length === 0 && (
            <p className="text-gray-500 text-center col-span-2">
              Barang tidak ditemukan 😢
            </p>
          )}

          {filteredItems.map((item) => {
            const seller = profiles[item.user_id];

            const sellerName =
              seller?.name ||
              seller?.email?.split("@")[0] ||
              "User";

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-xl transition border"
              >

                {/* BADGE */}
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  COD Ready
                </span>

                <h2 className="font-bold text-lg text-[#0F766E] mt-2">
                  {item.name}
                </h2>

                <p className="text-xl font-bold text-[#F59E0B]">
                  Rp {item.price}
                </p>

                <p className="text-sm text-gray-500 mt-1">
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
                  className="mt-4 w-full bg-[#0F766E] text-white py-2 rounded-full hover:scale-105 transition"
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