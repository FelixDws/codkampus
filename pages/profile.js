import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProfile = async (u) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", u.id)
      .single();

    if (!data) return;

    setName(data.name || "");
    setBio(data.bio || "");
    setAvatarUrl(data.avatar_url || "");
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      setUser(u);

      if (u) {
        await loadProfile(u);
      }
    });
  }, []);

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return avatarUrl;

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile);

    if (error) {
      alert("Upload gagal");
      return avatarUrl;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const saveProfile = async () => {
    if (!user) return alert("Belum login");

    setLoading(true);

    let finalAvatar = avatarUrl;

    if (avatarFile) {
      finalAvatar = await uploadAvatar();
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        bio: bio.trim(),
        avatar_url: finalAvatar,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      alert("Gagal update");
      setLoading(false);
      return;
    }

    setName(data.name || "");
    setBio(data.bio || "");
    setAvatarUrl(data.avatar_url || "");

    setLoading(false);
    alert("Profil berhasil disimpan!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">

      {/* NAVBAR GLOBAL (SUDAH ADA BACK) */}
      <Navbar />

      <div className="max-w-xl mx-auto px-6 py-10">

        {/* CARD */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">

          <h1 className="text-3xl font-bold text-[#0F766E] mb-6 text-center">
            👤 Profil Kamu
          </h1>

          {/* AVATAR */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={
                  avatarUrl
                    ? `${avatarUrl}?t=${Date.now()}`
                    : "https://via.placeholder.com/120"
                }
                className="w-28 h-28 rounded-full object-cover border-4 border-[#0F766E]"
              />

              {/* ONLINE DOT */}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
            </div>

            <label className="mt-4 text-sm text-[#0F766E] cursor-pointer hover:underline">
              Ganti Foto
              <input
                type="file"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {/* FORM */}
          <div className="space-y-5">

            <div>
              <label className="text-sm text-gray-600">Nama</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl mt-1 focus:ring-2 focus:ring-[#0F766E] outline-none"
                placeholder="Nama kamu..."
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl mt-1 focus:ring-2 focus:ring-[#0F766E] outline-none"
                placeholder="Ceritakan tentang kamu..."
              />
            </div>

            <button
              onClick={saveProfile}
              className="w-full bg-[#0F766E] text-white py-3 rounded-full font-semibold hover:scale-105 transition"
            >
              {loading ? "Menyimpan..." : "💾 Simpan Profil"}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}