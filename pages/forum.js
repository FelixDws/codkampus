import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Forum() {
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exp, setExp] = useState(0);
  const [replyTo, setReplyTo] = useState(null);

  const bottomRef = useRef(null);
  const router = useRouter();

  const level = Math.floor(exp / 50) + 1;
  const progress = exp % 50;

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const findParent = (id) => posts.find((p) => p.id === id);

  // =====================
  // INIT + REALTIME
  // =====================
  useEffect(() => {
    setMounted(true);

    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      setUser(u);

      if (u) getUserExp(u.id);
    });

    getPosts();

    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          setPosts((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

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

  const getUserExp = async (id) => {
    const { data } = await supabase
      .from("users")
      .select("exp")
      .eq("id", id)
      .single();

    if (data) setExp(data.exp);
  };

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    setLoading(true);

    await supabase.from("posts").insert([
      {
        content: text,
        user_email: user.email,
        user_id: user.id,
        parent_id: replyTo?.id || null,
      },
    ]);

    // tambah exp
    await supabase
      .from("users")
      .update({ exp: exp + 10 })
      .eq("id", user.id);

    setText("");
    setReplyTo(null);
    getUserExp(user.id);
    setLoading(false);
  };

  // 🔥 FIX ENTER
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!mounted) return null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">

      {/* HEADER */}
      <div className="bg-[#0F766E] text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="bg-white/20 px-3 py-1 rounded-full"
        >
          ←
        </button>

        <div className="flex-1">
          <h1 className="font-bold">💬 Forum CODKampus</h1>
          <p className="text-xs opacity-80">
            Lv {level} • {progress}/50 EXP
          </p>

          {/* 🔥 PROGRESS BAR */}
          <div className="w-full bg-white/20 h-2 rounded mt-1">
            <div
              className="bg-yellow-400 h-2 rounded"
              style={{ width: `${(progress / 50) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {posts.map((p) => {
          const isMe = p.user_id === user?.id;
          const profile = profiles[p.user_id];
          const parent = p.parent_id ? findParent(p.parent_id) : null;
          const parentUser = parent ? profiles[parent.user_id] : null;

          return (
            <div key={p.id} className={`flex ${isMe ? "justify-end" : ""}`}>

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

                {/* REPLY FIX */}
                {parent && (
                  <div
                    className={`text-xs mb-2 pl-2 border-l-4 ${
                      isMe
                        ? "border-white/50 text-white/80"
                        : "border-[#0F766E] text-gray-600"
                    }`}
                  >
                    <p className="font-semibold">
                      {parentUser?.name || "User"}
                    </p>
                    <p className="truncate">{parent.content}</p>
                  </div>
                )}

                <p>{p.content}</p>

                <div className="text-xs flex justify-between mt-2 opacity-70">
                  <button onClick={() => setReplyTo(p)}>Reply</button>
                  <span>{formatTime(p.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div className="p-3 flex gap-2 bg-white border-t relative">

        {replyTo && (
          <div className="absolute bottom-14 left-4 text-xs bg-white border px-3 py-1 rounded-full shadow">
            Reply ke: {replyTo.content.slice(0, 20)}...
          </div>
        )}

        <input
          className="flex-1 p-3 rounded-full border"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown} // 🔥 FIX ENTER
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