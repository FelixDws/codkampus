import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabase";
import { useRouter } from "next/router";

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exp, setExp] = useState(0);

  const bottomRef = useRef(null);
  const router = useRouter();

  // 🔥 BACK KE MENU UTAMA
  const handleBack = () => {
    router.push("/");
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // =====================
  // INIT
  // =====================
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;

      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      // ambil profile sendiri
      const { data: me } = await supabase
        .from("users")
        .select("*")
        .eq("id", u.id)
        .single();

      if (me) {
        setProfiles((prev) => ({ ...prev, [me.id]: me }));
        setExp(me.exp || 0);
      }

      await getPosts();
    };

    init();

    // 🔥 REALTIME CHAT
    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          const newPost = payload.new;

          setPosts((prev) => [...prev, newPost]);

          // ambil profile kalau belum ada
          if (!profiles[newPost.user_id]) {
            const { data } = await supabase
              .from("users")
              .select("*")
              .eq("id", newPost.user_id)
              .single();

            if (data) {
              setProfiles((prev) => ({
                ...prev,
                [data.id]: data,
              }));
            }
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  // =====================
  // GET POSTS
  // =====================
  const getPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("id", { ascending: true });

    const clean = data || [];
    setPosts(clean);

    const ids = [...new Set(clean.map((p) => p.user_id))];

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .in("id", ids);

    const map = {};
    users?.forEach((u) => (map[u.id] = u));
    setProfiles(map);
  };

  // =====================
  // SEND MESSAGE
  // =====================
  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    setLoading(true);

    const newPost = {
      content: text,
      user_email: user.email,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    // 🔥 tampil langsung (biar gak perlu refresh)
    setPosts((prev) => [...prev, newPost]);

    setText("");

    await supabase.from("posts").insert([newPost]);

    // update exp
    await supabase
      .from("users")
      .update({ exp: exp + 10 })
      .eq("id", user.id);

    setExp((prev) => prev + 10);

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // =====================
  // UI
  // =====================
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">

      {/* HEADER */}
      <div className="bg-[#0F766E] text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="bg-white/20 px-3 py-1 rounded-full"
        >
          ←
        </button>

        <div>
          <h1 className="font-bold">💬 Forum CODKampus</h1>
          <p className="text-xs opacity-80">EXP: {exp}</p>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {posts.map((p, i) => {
          const isMe = p.user_id === user?.id;
          const profile = profiles[p.user_id];

          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : ""}`}>
              {!isMe && (
                <img
                  src={profile?.avatar_url || "https://via.placeholder.com/40"}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}

              <div
                className={`max-w-xs p-3 rounded-2xl shadow ${
                  isMe ? "bg-[#0F766E] text-white" : "bg-white"
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-bold text-[#0F766E]">
                    {profile?.name || "User"}
                  </p>
                )}

                <p>{p.content}</p>

                <p className="text-xs mt-1 opacity-70">
                  {formatTime(p.created_at)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div className="p-3 flex gap-2 bg-white border-t">
        <input
          className="flex-1 p-3 rounded-full border"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis sesuatu..."
        />

        <button
          onClick={sendMessage}
          className="bg-[#F59E0B] text-white px-5 rounded-full"
        >
          {loading ? "..." : "Kirim"}
        </button>
      </div>
    </div>
  );
}