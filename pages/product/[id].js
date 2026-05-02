import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { MessageCircle, ArrowLeft } from "lucide-react";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);

  const formatPhone = (num) => {
    if (!num) return "";
    return num.replace(/^0/, "62").replace(/\D/g, "");
  };

  const waLink = seller?.phone
    ? `https://wa.me/${formatPhone(seller.phone)}?text=Halo%20saya%20tertarik%20dengan%20${product?.name}`
    : "";

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: productData } = await supabase
        .from("market")
        .select("*")
        .eq("id", id)
        .single();

      setProduct(productData);

      if (productData?.user_id) {
        const { data: sellerData } = await supabase
          .from("users")
          .select("*")
          .eq("id", productData.user_id)
          .single();

        setSeller(sellerData);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <p className="p-6 text-center text-gray-400">Loading...</p>;
  }

  if (!product) {
    return (
      <div className="p-6 text-center">
        <p>Produk tidak ditemukan</p>
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

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-[#0F766E]"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

          {/* IMAGE */}
          <div
            className="w-full aspect-square bg-gray-100 cursor-pointer"
            onClick={() => setShowImage(true)}
          >
            <img
              src={product.image_url || "/placeholder.jpg"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 space-y-5">

            {/* TITLE */}
            <h1 className="text-lg font-semibold text-gray-800">
              {product.name}
            </h1>

            {/* PRICE */}
            <p className="text-2xl font-bold text-[#0F766E]">
              Rp {product.price?.toLocaleString()}
            </p>

            {/* META */}
            <p className="text-xs text-gray-400">
              Upload: {new Date(product.created_at).toLocaleString()}
            </p>

            {/* SELLER */}
            {seller && (
              <Link href={`/user/${seller.id}`}>
                <div className="flex items-center gap-3 border rounded-xl p-3 hover:bg-gray-50 cursor-pointer transition">

                  <img
                    src={seller.avatar_url || "https://ui-avatars.com/api/?name=User"}
                    className="w-10 h-10 rounded-full object-cover border"
                  />

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {seller.name || seller.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lihat profil penjual
                    </p>
                  </div>

                </div>
              </Link>
            )}

            {/* ACTION */}
            {seller?.phone && (
              <a
                href={waLink}
                target="_blank"
                className="flex items-center justify-center gap-2 mt-2 
                           bg-[#0F766E] hover:opacity-90 transition 
                           text-white px-4 py-3 rounded-xl font-medium"
              >
                <MessageCircle size={18} />
                Chat via WhatsApp
              </a>
            )}

          </div>

        </div>

      </div>

      {/* 🔥 IMAGE MODAL */}
      {showImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowImage(false)}
        >
          <img
            src={product.image_url}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

    </div>
  );
}