import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

export default function Settings() {
  const [tab, setTab] = useState("security");
  const [user, setUser] = useState(null);

  const [settings, setSettings] = useState({
    two_fa: false,
    session_lock: true,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data?.session?.user;
      if (!u) return;

      setUser(u);

      let { data: s } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", u.id)
        .maybeSingle();

      if (!s) {
        const { data: newData } = await supabase
          .from("user_settings")
          .insert({ user_id: u.id })
          .select()
          .single();

        s = newData;
      }

      setSettings((prev) => ({
        ...prev,
        ...(s || {}),
      }));

      setLoading(false);
    };

    load();
  }, []);

  const update = async (key, value) => {
    if (!user) return;

    setSettings((prev) => ({ ...prev, [key]: value }));

    const { data } = await supabase
      .from("user_settings")
      .update({ [key]: value })
      .eq("user_id", user.id)
      .select();

    if (!data || data.length === 0) {
      await supabase.from("user_settings").insert({
        user_id: user.id,
        [key]: value,
      });
    }
  };

  const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/login";
};

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-main">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container-main">
        <h1 className="title mb-6">Pengaturan</h1>

        <div className="flex flex-col sm:flex-row gap-6">

          {/* SIDEBAR */}
          <div className="sm:w-56 flex sm:flex-col gap-2 text-sm">
            {["Profile","Security","Terms & Conditions", "Credits"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-left px-3 py-2 rounded-lg ${
                  tab === t
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="flex-1 space-y-6">

            {tab === "profile" && (
    <div className="card space-y-6">

      <h2 className="font-semibold text-lg">Profile</h2>

      <div>
        <p className="text-xs text-gray-400 mb-1">Email</p>
        <div className="border rounded-lg px-4 py-2 text-sm bg-gray-50">
          {user?.email}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1">Login Method</p>
        <div className="border rounded-lg px-4 py-2 text-sm bg-gray-50">
          {isGoogle ? "Google Account" : "Email & Password"}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition"
      >
        Logout
      </button>

    </div>
  )}

            {tab === "security" && (
              <div className="card space-y-6">
                <h2 className="font-medium text-lg">Security</h2>

                <Toggle
                  label="Two-Factor Authentication"
                  value={settings.two_fa}
                  onChange={(v) => update("two_fa", v)}
                />

                <Toggle
                  label="Session Protection"
                  value={settings.session_lock}
                  onChange={(v) => update("session_lock", v)}
                />

                {/* 🔥 TAMBAHAN BIAR GAK KOSONG */}
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    Fitur keamanan ini membantu melindungi akun Anda dari akses tidak sah.
                  </p>
                </div>
              </div>
            )}

            {tab === "terms & conditions" && (
  <div className="card space-y-6">
    <h2 className="font-semibold text-lg">Terms & Conditions</h2>

    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

      {/* PASAL 1 */}
      <div>
        <p className="font-semibold">Pasal 1 - Ketentuan Umum</p>
        <p>
          Dengan mengakses dan menggunakan platform CodKampus ("Platform"), pengguna menyatakan telah membaca, memahami, dan menyetujui seluruh isi Ketentuan Layanan ini secara sah dan mengikat.
        </p>
        <p>
          Ketentuan ini merupakan perjanjian yang mengikat secara hukum antara pengguna dan CodKampus.
        </p>
      </div>

      {/* PASAL 2 */}
      <div>
        <p className="font-semibold">Pasal 2 - Definisi</p>
        <ul className="list-disc ml-5">
          <li><b>Platform</b>: Layanan digital CodKampus</li>
          <li><b>Pengguna</b>: Setiap individu yang mengakses atau menggunakan layanan</li>
          <li><b>Konten</b>: Informasi, data, teks, gambar, atau materi lain yang diunggah</li>
          <li><b>Transaksi</b>: Aktivitas jual beli atau pertukaran antar pengguna</li>
        </ul>
      </div>

      {/* PASAL 3 */}
      <div>
        <p className="font-semibold">Pasal 3 - Akun dan Keamanan</p>
        <p>
          Pengguna wajib memberikan informasi yang benar, akurat, dan terkini saat mendaftar.
        </p>
        <p>
          Pengguna bertanggung jawab penuh atas keamanan akun, termasuk kerahasiaan kata sandi.
        </p>
        <p>
          Segala aktivitas dalam akun dianggap sah dan menjadi tanggung jawab pengguna.
        </p>
      </div>

      {/* PASAL 4 */}
      <div>
        <p className="font-semibold">Pasal 4 - Penggunaan yang Dilarang</p>
        <p>Pengguna dilarang menggunakan platform untuk:</p>
        <ul className="list-disc ml-5">
          <li>Kegiatan ilegal atau melanggar hukum</li>
          <li>Penipuan, scam, atau manipulasi transaksi</li>
          <li>Menyebarkan konten berbahaya, pornografi, atau kebencian</li>
          <li>Eksploitasi bug, hacking, scraping, atau reverse engineering</li>
          <li>Mengganggu sistem atau pengguna lain</li>
        </ul>
      </div>

      {/* PASAL 5 */}
      <div>
        <p className="font-semibold">Pasal 5 - Transaksi dan Tanggung Jawab</p>
        <p>
          CodKampus hanya bertindak sebagai perantara platform dan tidak terlibat langsung dalam transaksi antar pengguna.
        </p>
        <p>
          Segala risiko transaksi menjadi tanggung jawab masing-masing pihak yang terlibat.
        </p>
        <p>
          CodKampus tidak menjamin keakuratan, kualitas, atau keamanan barang/jasa yang ditawarkan pengguna.
        </p>
      </div>

      {/* PASAL 6 */}
      <div>
        <p className="font-semibold">Pasal 6 - Konten Pengguna</p>
        <p>
          Pengguna bertanggung jawab penuh atas konten yang diunggah.
        </p>
        <p>
          CodKampus berhak menghapus konten yang melanggar tanpa pemberitahuan.
        </p>
      </div>

      {/* PASAL 7 */}
      <div>
        <p className="font-semibold">Pasal 7 - Hak Kekayaan Intelektual</p>
        <p>
          Seluruh elemen platform termasuk desain, sistem, dan fitur merupakan milik CodKampus dan dilindungi hukum.
        </p>
        <p>
          Dilarang menyalin, mendistribusikan, atau menggunakan tanpa izin tertulis.
        </p>
      </div>

      {/* PASAL 8 */}
      <div>
        <p className="font-semibold">Pasal 8 - Batasan Tanggung Jawab</p>
        <p>
          CodKampus tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan platform.
        </p>
        <p>
          Termasuk namun tidak terbatas pada kehilangan data, kerugian finansial, atau gangguan layanan.
        </p>
      </div>

      {/* PASAL 9 */}
      <div>
        <p className="font-semibold">Pasal 9 - Force Majeure</p>
        <p>
          CodKampus tidak bertanggung jawab atas kegagalan layanan akibat kejadian di luar kendali seperti bencana alam, gangguan jaringan, atau kebijakan pemerintah.
        </p>
      </div>

      {/* PASAL 10 */}
      <div>
        <p className="font-semibold">Pasal 10 - Perubahan Layanan</p>
        <p>
          CodKampus berhak mengubah, menambah, atau menghentikan layanan kapan saja tanpa pemberitahuan sebelumnya.
        </p>
      </div>

      {/* PASAL 11 */}
      <div>
        <p className="font-semibold">Pasal 11 - Privasi dan Data</p>
        <p>
          Data pengguna digunakan untuk operasional platform dan peningkatan layanan.
        </p>
        <p>
          CodKampus berupaya menjaga keamanan data, namun tidak menjamin bebas dari risiko pihak ketiga.
        </p>
      </div>

      {/* PASAL 12 */}
      <div>
        <p className="font-semibold">Pasal 12 - Hukum yang Berlaku</p>
        <p>
          Ketentuan ini diatur dan ditafsirkan berdasarkan hukum yang berlaku di Republik Indonesia.
        </p>
      </div>

      {/* PASAL 13 */}
      <div>
        <p className="font-semibold">Pasal 13 - Penyelesaian Sengketa</p>
        <p>
          Sengketa yang timbul akan diselesaikan secara musyawarah terlebih dahulu.
        </p>
        <p>
          Jika tidak tercapai kesepakatan, maka akan diselesaikan melalui jalur hukum sesuai yurisdiksi Indonesia.
        </p>
      </div>

      {/* PASAL 14 */}
      <div>
        <p className="font-semibold">Pasal 14 - Persetujuan</p>
        <p>
          Dengan menggunakan platform, pengguna dianggap menyetujui seluruh isi ketentuan ini termasuk pembaruan di masa mendatang.
        </p>
      </div>

    </div>

    <div className="pt-4 border-t border-gray-200 text-xs text-gray-400">
      Last updated: 2026 • CodKampus
    </div>
  </div>
)}

            {tab === "credits" && (
  <div className="card space-y-6">
    <h2 className="font-medium text-lg">Credits</h2>

    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">

      <p>
        CodKampus adalah sebuah platform digital yang dirancang dengan tujuan utama untuk menghadirkan ekosistem terpadu bagi mahasiswa dalam menjalankan aktivitas akademik maupun non-akademik secara lebih efisien, modern, dan terstruktur.
      </p>

      <p>
        Platform ini lahir dari kebutuhan akan sebuah ruang digital yang tidak hanya sekadar menjadi tempat interaksi, tetapi juga mampu memberikan nilai tambah dalam hal produktivitas, kolaborasi, serta pengembangan diri bagi para penggunanya.
      </p>

      <p>
        Pengembangan CodKampus dilakukan dengan pendekatan berbasis teknologi modern yang mengedepankan performa, skalabilitas, dan kemudahan penggunaan. Dengan memanfaatkan framework Next.js sebagai fondasi utama dalam pengembangan frontend, serta Supabase sebagai backend-as-a-service yang menyediakan layanan database, autentikasi, dan storage, platform ini dibangun untuk mampu menangani kebutuhan pengguna secara real-time dengan stabilitas yang tinggi.
      </p>

      <p>
        Dalam proses pengembangannya, CodKampus tidak hanya berfokus pada aspek teknis semata, tetapi juga memperhatikan pengalaman pengguna secara menyeluruh. Setiap elemen antarmuka dirancang dengan mempertimbangkan kenyamanan, keterbacaan, serta kemudahan navigasi, sehingga pengguna dapat berinteraksi dengan sistem tanpa hambatan yang berarti.
      </p>

      <p>
        Selain itu, aspek keamanan menjadi salah satu prioritas utama dalam pengembangan platform ini. Berbagai mekanisme perlindungan diterapkan untuk memastikan bahwa data pengguna tetap aman dan terlindungi dari potensi penyalahgunaan.
      </p>

      <p>
        CodKampus juga dirancang sebagai platform yang terus berkembang. Pengembangan tidak berhenti pada versi awal, melainkan direncanakan untuk terus mengalami peningkatan seiring dengan kebutuhan pengguna dan perkembangan teknologi.
      </p>

      <p>
        Proyek ini dikembangkan secara independen oleh Felix Dharma sebagai bentuk eksplorasi dalam bidang pengembangan perangkat lunak, khususnya dalam membangun sistem berbasis web yang terintegrasi.
      </p>

      <p>
        Dalam perjalanannya, CodKampus tidak terlepas dari berbagai tantangan, baik dari sisi teknis maupun konseptual. Namun, setiap tantangan tersebut menjadi bagian dari proses pembelajaran yang berharga dalam upaya menciptakan sistem yang lebih baik.
      </p>

      <p>
        Akhir kata, CodKampus bukan hanya sekadar sebuah proyek, melainkan sebuah langkah awal menuju pengembangan ekosistem digital yang lebih luas dengan visi jangka panjang yang berkelanjutan.
      </p>

    </div>

    <div className="pt-4 border-t border-gray-200 text-xs text-gray-400">
      Version 1.0 • CodKampus Project • Felix Dharma
    </div>
  </div>
)}

          </div>
        </div>
      </div>
    </>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>

      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
          value ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
            value ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}