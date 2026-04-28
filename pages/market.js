import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Market() {
  const [items, setItems] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [showMine, setShowMine] = useState(false);

  const router = useRouter();

  // ❌ HAPUS TOTAL createUserIfNotExist (biang masalah)

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

    setProfiles((prev) => ({ ...prev, ...map }));
  };

  useEffect(() => {
    getItems();

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u);
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
        created_at: new Date().toISOString(),
      },
    ]);

    if (!error) {
      setName("");
      setPrice("");
      setShowPopup(false);
      getItems();
    } else {
      alert("Gagal jual");
    }

    setLoading(false);
  };

  const deleteItem = async (id) => {
    if (!confirm("Yakin mau hapus barang ini?")) return;
    await supabase.from("market").delete().eq("id", id);
    getItems();
  };

  const editItem = async (item) => {
    const newName = prompt("Edit nama barang:", item.name);
    const newPrice = prompt("Edit harga:", item.price);

    if (!newName || !newPrice) return;

    await supabase
      .from("market")
      .update({
        name: newName,
        price: Number(newPrice),
      })
      .eq("id", item.id);

    getItems();
  };

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

  const myItems = items.filter((i) => i.user_id === user?.id);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const displayItems = showMine ? myItems : filteredItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">
      <Navbar />

      <div className="container-main">

        <div className="text-center mb-6">
          <h1 className="title">🛒 CODKampus Market</h1>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setShowPopup(true)} className="btn-accent">
            + Jual Barang
          </button>

          <button onClick={() => setShowMine(!showMine)} className="btn-main">
            {showMine ? "Semua Barang" : "Penjualan Saya"}
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari barang..."
          className="input mb-6"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

          {displayItems.length === 0 && (
            <p className="text-gray-500 text-center col-span-2">
              Kosong 😢
            </p>
          )}

          {displayItems.map((item) => {
            const seller = profiles[item.user_id];
            const sellerName =
              seller?.name || seller?.email?.split("@")[0] || "User";

            return (
              <div key={item.id} className="card hover:shadow-xl transition">

                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  COD Ready
                </span>

                <h2 className="font-bold text-[#0F766E] mt-2">
                  {item.name}
                </h2>

                <p className="text-[#F59E0B] font-bold">
                  Rp {item.price}
                </p>

                <p className="text-xs text-gray-400">
                  Upload: {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "-"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
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

                {seller?.badge && (
                  <div className="mt-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                      ${seller.badge === "pro"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-yellow-100 text-yellow-600"}`}
                    >
                      {seller.badge === "pro" && "🧠 Pro"}
                      {seller.badge === "king" && "👑 King"}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => chatSeller(item)}
                  className="btn-main w-full mt-4"
                >
                  💬 Chat Seller
                </button>

                {user?.id === item.user_id && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => editItem(item)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-full text-sm"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-full text-sm"
                    >
                      🗑 Hapus
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[300px]">

              <h2 className="mb-3 font-bold">Jual Barang</h2>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama"
                className="input mb-2"
              />

              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Harga"
                className="input mb-3"
              />

              <button onClick={addItem} className="btn-accent w-full mb-2">
                {loading ? "..." : "Jual"}
              </button>

              <button onClick={() => setShowPopup(false)} className="w-full text-sm">
                Batal
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}