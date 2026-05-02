import { useState } from "react";
import Link from "next/link";
import { Flame, Clock, MessageCircle, Rocket, Pencil, Trash2, X } from "lucide-react";

export default function MarketCard({
  item,
  seller,
  user,
  isBoostActive,
  getRemainingTime,
  onChat,
  onBoost,
  onEdit,
  onDelete,
}) {
  const [showImage, setShowImage] = useState(false);

  const sellerName =
    seller?.name || seller?.email?.split("@")[0] || "User";

  const boosted = isBoostActive(item);

  const formatPrice = (num) =>
    new Intl.NumberFormat("id-ID").format(num);

  return (
    <>
      {/* 🔥 IMAGE MODAL */}
      {showImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <button
            onClick={() => setShowImage(false)}
            className="absolute top-4 right-4 text-white"
          >
            <X size={24} />
          </button>

          <img
            src={item.image_url}
            className="max-w-[90%] max-h-[90%] rounded-xl"
          />
        </div>
      )}

      <div
        className={`bg-white rounded-2xl border p-4 transition relative
        ${boosted ? "ring-1 ring-yellow-300 shadow-sm" : "hover:shadow-md"}`}
      >

        {/* BOOST BADGE */}
        {boosted && (
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Flame size={12} />
            Boosted
          </div>
        )}

        {/* IMAGE (CLICKABLE) */}
        {item.image_url && (
          <div
            onClick={() => setShowImage(true)}
            className="cursor-pointer overflow-hidden rounded-xl mb-3"
          >
            <img
              src={item.image_url}
              className="w-full h-44 object-cover transition hover:scale-105"
            />
          </div>
        )}

        {/* TAG */}
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          COD Ready
        </span>

        {/* TITLE */}
        <h2 className="font-semibold text-gray-800 mt-2 leading-tight">
          {item.name}
        </h2>

        {/* PRICE */}
        <p className="text-[#0F766E] font-bold text-lg">
          Rp {formatPrice(item.price)}
        </p>

        {/* TIMER BOOST */}
        {boosted &&
          item.boost_expired_at &&
          user &&
          String(user.id) === String(item.user_id) && (
            <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
              <Clock size={12} />
              {getRemainingTime(item.boost_expired_at)} lagi
            </div>
        )}

        {/* META */}
        <p className="text-xs text-gray-400 mt-1">
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "-"}
        </p>

        {/* SELLER */}
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

        {/* BADGE */}
        {seller?.badge && (
          <div className="mt-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium
              ${
                seller.badge === "pro"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {seller.badge === "pro" && "🧠 Pro"}
              {seller.badge === "king" && "👑 King"}
            </span>
          </div>
        )}

        {/* CHAT */}
{/* ACTION BAR */}
<div className="flex items-center justify-between mt-4">

  {/* CHAT */}
  <button
    onClick={() => onChat(item)}
    className="flex items-center gap-2 text-sm font-medium text-[#0F766E] hover:underline"
  >
    <MessageCircle size={16} />
    Chat
  </button>

  {/* OWNER ACTION */}
  {user?.id === item.user_id && (
    <div className="flex items-center gap-1">

      {/* BOOST */}
      <button
        onClick={() => onBoost(item.id)}
        className="p-2 rounded-md text-yellow-600 hover:bg-yellow-100 transition"
        title="Boost"
      >
        <Rocket size={16} />
      </button>

      {/* EDIT */}
      <button
        onClick={() => onEdit(item)}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
        title="Edit"
      >
        <Pencil size={16} />
      </button>

      {/* DELETE */}
      <button
        onClick={() => onDelete(item)}
        className="p-2 rounded-md text-red-500 hover:bg-red-100 transition"
        title="Hapus"
      >
        <Trash2 size={16} />
      </button>

    </div>
  )}

</div>
      </div>
    </>
  );
}