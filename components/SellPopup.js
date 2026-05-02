import { useState, useEffect} from "react";
import supabase from "../lib/supabase";
import imageCompression from "browser-image-compression";

export default function SellPopup({ show, onClose, onSuccess, user, editItem}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (editItem) {
    setName(editItem.name || "");
    setPrice(editItem.price ? formatPrice(String(editItem.price)) : "");
    setPreview(editItem.image_url || null);
  }
}, [editItem]);

  if (!show) return null;

  // 🔥 FORMAT RUPIAH (UX upgrade, logic tetap)
  const formatPrice = (value) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceChange = (e) => {
    setPrice(formatPrice(e.target.value));
  };

  const handleClose = () => {
  setName("");
  setPrice("");
  setImage(null);
  setPreview(null);
  onClose();
};

  const addItem = async () => {
    if (loading) return;

    if (!name.trim() || !price.trim()) {
      alert("Isi nama & harga dulu");
      return;
    }

    if (!user) {
      alert("Login dulu");
      return;
    }

    setLoading(true);

    let imageUrl = null;

    // 🔥 IMAGE PROCESS (TIDAK DIUBAH)
    if (image) {
      if (!image.type.startsWith("image/")) {
        alert("File harus gambar");
        setLoading(false);
        return;
      }

      let compressedImage = image;

      try {
        compressedImage = await imageCompression(image, {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
      } catch {}

      const fileName = `${Date.now()}-${Math.random()}-${image.name}`;

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

    // 🔥 FIX PRICE (tetap number)
    const cleanPrice = Number(price.replace(/\./g, ""));

    let error;

if (editItem) {
  // 🔥 EDIT MODE
  const res = await supabase
    .from("market")
    .update({
      name: name.trim(),
      price: cleanPrice,
      image_url: imageUrl || editItem.image_url,
    })
    .eq("id", editItem.id);

  error = res.error;
} else {
  // 🔥 CREATE MODE
  const res = await supabase.from("market").insert([
    {
      name: name.trim(),
      price: cleanPrice,
      user_id: user.id,
      created_at: new Date().toISOString(),
      image_url: imageUrl,
    },
  ]);

  error = res.error;
}

    if (error) {
      alert(editItem ? "Gagal update" : "Gagal jual");
      setLoading(false);
      return;
    }

    // RESET
    setName("");
    setPrice("");
    setImage(null);
    setPreview(null);

    onClose();
    onSuccess();

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">

      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

        {/* HEADER */}
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
  {editItem ? "Edit Barang" : "Jual Barang"}
</h2>
          <p className="text-xs text-gray-400">
            Isi detail barang dengan jelas agar cepat terjual
          </p>
        </div>

        {/* INPUT NAME */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">
            Nama Barang
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Laptop Asus ROG"
            className="input w-full"
          />
        </div>

        {/* INPUT PRICE */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">
            Harga
          </label>
          <input
            value={price}
            onChange={handlePriceChange}
            placeholder="Contoh: 1.500.000"
            className="input w-full"
          />
        </div>

        {/* UPLOAD */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">
            Foto Barang
          </label>

          <label className="w-full border border-dashed border-gray-300 py-3 rounded-xl text-sm text-center cursor-pointer hover:bg-gray-50 transition block">
            {preview ? "Ganti Foto" : "Upload Foto"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImage(file);
                if (file) setPreview(URL.createObjectURL(file));
              }}
              className="hidden"
            />
          </label>
        </div>

        {/* PREVIEW */}
        {preview && (
          <img
            src={preview}
            className="w-full h-44 object-cover rounded-xl mb-4 border"
          />
        )}

        {/* ACTION BUTTON */}
        <button
          onClick={addItem}
          disabled={loading}
          className="btn-main w-full disabled:opacity-60"
        >
          {loading
  ? "Menyimpan..."
  : editItem
  ? "Update Barang"
  : "Jual Sekarang"}
        </button>

        {/* CLOSE */}
        <button
          onClick={handleClose}
          className="mt-3 text-sm text-gray-500 w-full"
        >
          Batal
        </button>

      </div>
    </div>
  );
}