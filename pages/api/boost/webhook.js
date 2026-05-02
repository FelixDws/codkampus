import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // 🔥 WAJIB: ambil body dengan aman (Midtrans kadang kirim string)
    const notif = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    console.log("🔥 WEBHOOK MASUK:", notif);

    const orderId = notif.order_id;
    const status = notif.transaction_status;

    // 🔥 cuma proses kalau pembayaran sukses
    if (status === "settlement" || status === "capture") {

      const { data, error } = await supabase
        .from("boosts")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle(); // 🔥 biar gak crash

      if (error) {
        console.log("❌ Error ambil boost:", error);
        return res.status(200).end();
      }

      if (!data) {
        console.log("❌ Boost tidak ditemukan untuk:", orderId);
        return res.status(200).end();
      }

      console.log("✅ Boost ditemukan:", data);

      // 🔥 set expired (1 hari)
      const expired = new Date();
      expired.setDate(expired.getDate() + 1);

      // update market
      const { error: marketError } = await supabase
        .from("market")
        .update({
          boosted: true,
          boost_expired_at: expired,
        })
        .eq("id", data.market_id);

      if (marketError) {
        console.log("❌ Error update market:", marketError);
      }

      // update status boost
      const { error: boostError } = await supabase
        .from("boosts")
        .update({ status: "paid" })
        .eq("order_id", orderId);

      if (boostError) {
        console.log("❌ Error update boost:", boostError);
      }

      console.log("🔥 BOOST BERHASIL AKTIF:", orderId);
    }

    res.status(200).end();
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    res.status(500).end();
  }
}