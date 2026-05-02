import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================
  // LOAD PROFILE
  // ======================
  const loadProfile = async (u) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", u.id)
      .maybeSingle();

    if (!data) {
      const newUser = {
        id: u.id,
        email: u.email,
        name: u.email.split("@")[0],
        bio: "",
        avatar_url: "",
        phone: "",
        exp: 0,
      };

      setProfile(newUser);
      setName(newUser.name);
      setBio(newUser.bio);
      setAvatarUrl(newUser.avatar_url);
      setPhone(newUser.phone);
      return;
    }

    setProfile(data);
    setName(data.name || "");
    setBio(data.bio || "");
    setAvatarUrl(data.avatar_url || "");
    setPhone(data.phone || "");
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();

      const u = data.session?.user;

      if (!u) return;

      setUser(u);
      await loadProfile(u);
    };

    init();
  }, []);

  // ======================
  // UPLOAD AVATAR
  // ======================
  const uploadAvatar = async () => {
    if (!avatarFile || !user) return avatarUrl;

    const fileName = `${user.id}/${Date.now()}.${avatarFile.name.split(".").pop()}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile);

    if (error) return avatarUrl;

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // ======================
  // SAVE PROFILE (FIXED)
  // ======================
  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);

    let finalAvatar = avatarUrl;

    if (avatarFile) {
      finalAvatar = await uploadAvatar();
    }

    // 🔥 FIX UTAMA: pakai UPSERT
    const { data, error } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
        name,
        bio,
        avatar_url: finalAvatar,
        phone,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.log("SAVE ERROR:", error);
      alert("Gagal simpan");
      setLoading(false);
      return;
    }

    setProfile(data);
    setName(data?.name || "");
    setBio(data?.bio || "");
    setAvatarUrl(data?.avatar_url || "");
    setPhone(data?.phone || "");

    setLoading(false);
    alert("Profil berhasil disimpan!");
  };

  // ======================
  // FORMAT WA
  // ======================
  const formatPhone = (num) => {
    if (!num) return "";
    return num.replace(/^0/, "62").replace(/\D/g, "");
  };

  const waLink = phone
    ? `https://wa.me/${formatPhone(phone)}?text=Halo%20saya%20tertarik`
    : "";

  return (
  <div className="min-h-screen bg-[#eef2f6] relative">

    {/* BATIK */}
    <div className="fixed inset-0 opacity-[0.04] pointer-events-none">
      <img src="/batik.png" className="w-full h-full object-cover" />
    </div>

    <Navbar />

    <div className="max-w-xl mx-auto px-6 py-10">

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Profil
          </h1>
          <p className="text-sm text-gray-500">
            Kelola informasi akun kamu
          </p>
        </div>

        {/* AVATAR */}
        <div className="flex items-center gap-4 mb-6">

          <img
            src={avatarUrl || "https://ui-avatars.com/api/?name=User"}
            className="w-20 h-20 rounded-full object-cover border border-gray-300"
          />

          <div>
            <p className="text-sm text-gray-600 mb-2">
              Foto Profil
            </p>

            <label className="text-sm px-3 py-1.5 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
              Upload
              <input
                type="file"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* NAME */}
          <div>
            <label className="text-xs text-gray-500">Nama</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-xs text-gray-500">WhatsApp</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

          {/* BIO */}
          <div>
            <label className="text-xs text-gray-500">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

        </div>

        {/* ACTION */}
        <div className="mt-6">

          <button
            onClick={saveProfile}
            className="w-full bg-[#0F766E] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>

        </div>

      </div>

    </div>
  </div>
);
}