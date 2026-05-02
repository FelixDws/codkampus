import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { useRouter } from "next/router";
import imageCompression from "browser-image-compression";
import { Flame, Clock, MessageCircle, Rocket, Pencil, Trash2, ShoppingCart } from "lucide-react";

export default function Market() {
  const [items, setItems] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [showMine, setShowMine] = useState(false);

  const router = useRouter();

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

  const getItems = async () => {
    const { data } = await supabase
      .from("market")
      .select("*")
      .order("boosted", { ascending: false })
      .order("created_at", { ascending: false });

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

    setProfiles((prev) => ({ ...prev, ...map }));
  };

  useEffect(() => {
  getItems();

  const t = setInterval(() => {
    getItems();
  }, 3000);

  supabase.auth.getSession().then(({ data }) => {
    const u = data.session?.user;
    setUser(u);
  });

  return () => clearInterval(t);
}, []);

  // 🔥 TAMBAHAN (TIDAK MENGUBAH APA PUN)
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

setTimeout(() => {
  getItems();
}, 5000);
  };

  const addItem = async () => {
    if (!name.trim() || !price.trim()) {
      alert("Isi nama & harga dulu");
      return;
    }

    if (!user) return alert("Login dulu");

    setLoading(true);

    let imageUrl = null;

// 🔥 UPLOAD KE STORAGE
if (image) {
  if (image.type !== "image/jpeg") {
    alert("Hanya JPG");
    setLoading(false);
    return;
  }

  if (image.size > 1 * 1024 * 1024) {
  compressedImage = await imageCompression(image, options);
}

  const fileName = `${Date.now()}-${Math.random()}-${image.name}`;
  let compressedImage = image;

if (image.size > 1 * 1024 * 1024) {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.8,
    };

    compressedImage = await imageCompression(image, options);
  } catch (err) {
    console.log("Compress error:", err);
  }
}

  const { error: uploadError } = await supabase.storage
    .from("market-images")
    
    .upload(fileName, compressedImage);

  if (uploadError) {
    alert("Upload gagal");
    setLoading(false);
    return;
  }

  const { data } = supabase.storage
    .from("market-images")
    .getPublicUrl(fileName);

  imageUrl = data.publicUrl;
}

// 🔥 INSERT KE DATABASE
const { error } = await supabase.from("market").insert([
  {
    name: name.trim(),
    price: Number(price),
    user_id: user.id,
    created_at: new Date().toISOString(),
    image_url: imageUrl, // 🔥 INI YANG PENTING
  },
]);

    if (!error) {
      setName("");
      setPrice("");
      setImage(null);     // 🔥 TAMBAH INI
  setPreview(null);
      setShowPopup(false);
      getItems();
    } else {
      alert("Gagal jual");
    }

    setLoading(false);
  };

  const deleteItem = async (item) => {
  if (!confirm("Yakin mau hapus barang ini?")) return;

  // 🔥 hapus dari storage
  if (item.image_url) {
    const fileName = item.image_url.split("/market-images/").pop();

    await supabase.storage
      .from("market-images")
      .remove([fileName]);
  }

  // 🔥 hapus dari DB
  await supabase.from("market").delete().eq("id", item.id);

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

  const isBoostActive = (item) => {
  if (!item.boosted || !item.boost_expired_at) return false;
  return new Date(item.boost_expired_at) > new Date();
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">
      <Navbar />

      <div className="container-main">

      {showPopup && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-sm">

        <h2 className="font-bold mb-4">Jual Barang</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama barang"
          className="input mb-2 w-full"
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Harga"
          className="input mb-2 w-full"
        />

        <label className="btn-main w-full text-center cursor-pointer mb-3">
  📸 Ambil / Upload Foto
  <input
    type="file"
    accept="image/*"
    capture="environment"
    onChange={(e) => {
      const file = e.target.files[0];
      setImage(file);

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    }}
    className="hidden"
  />
</label>

        {preview && (
  <img
    src={preview}
    className="w-full h-40 object-cover rounded-xl mb-2"
  />
)}

        <button onClick={addItem} className="btn-main w-full">
          Jual
        </button>

        <button
          onClick={() => setShowPopup(false)}
          className="mt-2 text-sm text-gray-500 w-full"
        >
          Batal
        </button>

      </div>
    </div>
  )}

        <div className="text-center mb-6">
          <h1 className="title flex items-center justify-center gap-2">
  <ShoppingCart size={24} />
  CODKampus Market
</h1>
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
                <div
                  key={item.id}
                  className={`card transition relative z-0
  ${isBoostActive(item)
    ? "ring-2 ring-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)]"
    : "hover:shadow-xl"
  }`}
>

                {/* 🔥 TAMBAHAN BADGE */}
                {isBoostActive(item) && (
                  <div className="absolute top-2 right-2 z-10 pointer-events-none bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
  <Flame size={12} />
  BOOSTED
</div>
                )}
                {item.image_url && (
  <img
    src={item.image_url}
    className="w-full h-40 object-cover rounded-xl mb-2"
  />
)}
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  COD Ready
                </span>

                <h2 className="font-bold text-[#0F766E] mt-2">
                  {item.name}
                </h2>

                <p className="text-[#F59E0B] font-bold">
                  Rp {item.price}
                </p>

                {isBoostActive(item) &&
 item.boost_expired_at &&
 user &&
 String(user.id) === String(item.user_id) && (
  <p className="text-xs text-yellow-600 font-semibold mt-1">
    <div className="flex items-center gap-1 text-xs text-yellow-600 font-semibold mt-1">
  <Clock size={12} />
  {getRemainingTime(item.boost_expired_at)} lagi
</div>
  </p>
)}

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
  className="btn-main w-full mt-4 flex items-center justify-center gap-2"
>
  <MessageCircle size={16} />
  Chat Seller
</button>

                {user && String(user.id) === String(item.user_id) && (
  <button
    onClick={() => handleBoost(item.id)}
    className="w-full mt-2 bg-yellow-400 text-black py-2 rounded-full font-bold flex items-center justify-center gap-2"
  >
    <Rocket size={16} />
    Boost
  </button>
)}

                {user?.id === item.user_id && (
                  <div className="flex gap-2 mt-2">
                    <button
  onClick={() => editItem(item)}
  className="flex-1 bg-blue-500 text-white py-2 rounded-full text-sm flex items-center justify-center gap-1"
>
  <Pencil size={14} />
  Edit
</button>

<button
  onClick={() => deleteItem(item)}
  className="flex-1 bg-red-500 text-white py-2 rounded-full text-sm flex items-center justify-center gap-1"
>
  <Trash2 size={14} />
  Hapus
</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}