import midtransClient from "midtrans-client";
import { createClient } from "@supabase/supabase-js";

// 🔥 CLIENT KHUSUS BACKEND (BYPASS RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export default async function handler(req, res) {
  try {
    const { marketId, userId, amount } = JSON.parse(req.body);

    const orderId = "BOOST-" + Date.now();

    // 🔥 INSERT (PAKAI ADMIN)
    const { error: insertError } = await supabaseAdmin.from("boosts").insert({
      order_id: orderId,
      user_id: userId,
      market_id: marketId,
      amount: amount,
      status: "pending",
    });

    if (insertError) {
      console.error("❌ INSERT BOOST ERROR:", insertError);
      return res.status(500).json({ error: "gagal insert boost" });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: marketId,
          price: amount,
          quantity: 1,
          name: "Boost Produk",
        },
      ],
      customer_details: {
        first_name: "User",
        email: "test@email.com",
      },
      enabled_payments: ["bank_transfer"],
    };

    const transaction = await snap.createTransaction(parameter);

    return res.status(200).json({
      redirect_url: transaction.redirect_url,
    });
  } catch (err) {
    console.error("🔥 CREATE ERROR:", err);
    return res.status(500).json({ error: "error create boost" });
  }
}