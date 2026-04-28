import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState(""); // ✅ TAMBAHAN
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================
  // LOAD PROFILE (CLEAN)
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

  // ❌ GAK ADA INSERT / UPSERT DI SINI

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
    setPhone(data.phone || ""); // ✅ TAMBAHAN
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
  // SAVE PROFILE (UPSERT)
  // ======================
  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);

    let finalAvatar = avatarUrl;

    if (avatarFile) {
      finalAvatar = await uploadAvatar();
    }

    const { data } = await supabase
      .from("users")
      .upsert([
        {
          id: user.id,
          email: user.email,
          name,
          bio,
          avatar_url: finalAvatar,
          phone, // ✅ TAMBAHAN
        },
      ])
      .select()
      .maybeSingle();

    setProfile(data);
    setName(data?.name || "");
    setBio(data?.bio || "");
    setAvatarUrl(data?.avatar_url || "");
    setPhone(data?.phone || ""); // ✅ TAMBAHAN

    setLoading(false);
    alert("Profil berhasil disimpan!");
  };

  // ======================
  // FORMAT WA LINK
  // ======================
  const formatPhone = (num) => {
    if (!num) return "";
    return num.replace(/^0/, "62").replace(/\D/g, "");
  };

  const waLink = phone
    ? `https://wa.me/${formatPhone(phone)}?text=Halo%20saya%20tertarik`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">
      <Navbar />

      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="bg-white p-8 rounded-3xl shadow-lg">

          <h1 className="text-3xl font-bold text-[#0F766E] text-center mb-6">
            👤 Profil Kamu
          </h1>

          <div className="flex flex-col items-center mb-6">
            <img
              src={avatarUrl || "https://via.placeholder.com/120"}
              className="w-28 h-28 rounded-full border-4 border-[#0F766E]"
            />

            <input
              type="file"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              className="mt-3"
            />
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama"
            className="w-full mb-4 p-3 border rounded-xl"
          />

          {/* ✅ INPUT NOMOR */}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nomor WhatsApp (contoh: 08123...)"
            className="w-full mb-4 p-3 border rounded-xl"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
            className="w-full mb-4 p-3 border rounded-xl"
          />



          <button
            onClick={saveProfile}
            className="w-full bg-[#0F766E] text-white p-3 rounded-full"
          >
            {loading ? "Saving..." : "Simpan"}
          </button>

        </div>
      </div>
    </div>
  );
}