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
  const [replyTo, setReplyTo] = useState(null);

  const bottomRef = useRef(null);
  const router = useRouter();

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

      if (!u) return router.push("/login");

      setUser(u);

      const { data: me } = await supabase
        .from("users")
        .select("*")
        .eq("id", u.id)
        .maybeSingle();

      if (me) {
        setProfiles((prev) => ({ ...prev, [me.id]: me }));
        setExp(me.exp || 0);
      }

      await getPosts();
    };

    init();

    // REALTIME
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
      parent_id: replyTo?.id || null,
    };

    setPosts((prev) => [...prev, newPost]);
    setText("");
    setReplyTo(null);

    await supabase.from("posts").insert([newPost]);

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

      {/* 🔥 STICKY NAVBAR */}
      <div className="sticky top-0 z-50 bg-[#0F766E] text-white px-4 py-3">

        <div className="flex items-center justify-between">

          <button
            onClick={() => router.push("/")}
            className="bg-white/20 px-3 py-1 rounded-full"
          >
            ←
          </button>

          <div className="text-center">
            <h1 className="font-bold">💬 Forum CODKampus</h1>

            {/* 🔥 EXP BAR */}
            <div className="w-32 h-2 bg-white/20 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-[#F59E0B]"
                style={{ width: `${(exp % 50) * 2}%` }}
              />
            </div>

            <p className="text-xs opacity-80">EXP: {exp}</p>
          </div>

          <div className="w-6"></div>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">

        {posts.map((p, i) => {
          const isMe = p.user_id === user?.id;
          const profile = profiles[p.user_id];

          const parent = posts.find(x => x.id === p.parent_id);

          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : ""}`}>

              {!isMe && (
                <img
                  src={profile?.avatar_url || "https://via.placeholder.com/40"}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}

              <div className={`max-w-[75%] break-words p-3 rounded-2xl shadow ${isMe ? "bg-[#0F766E] text-white" : "bg-white"}`}>

                {!isMe && (
                  <p className="text-xs font-bold text-[#0F766E]">
                    {profile?.name || "User"}
                  </p>
                )}

                {/* 🔥 REPLY PREVIEW */}
                {parent && (
                  <div className="text-xs bg-black/10 p-2 rounded mb-1">
                    {parent.content}
                  </div>
                )}

                <p>{p.content}</p>

                <p className="text-xs mt-1 opacity-70">
                  {formatTime(p.created_at)}
                </p>

                {/* 🔥 REPLY BUTTON */}
                <button
                  onClick={() => setReplyTo(p)}
                  className="text-xs text-blue-400 mt-1"
                >
                  Reply
                </button>

              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* 🔥 REPLY BAR */}
      {replyTo && (
        <div className="px-3 py-2 bg-yellow-100 text-sm flex justify-between">
          <span>Reply: {replyTo.content.slice(0, 30)}...</span>
          <button onClick={() => setReplyTo(null)}>❌</button>
        </div>
      )}

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