import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabase";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exp, setExp] = useState(0);
  const [replyTo, setReplyTo] = useState(null);

  // ✅ TAMBAHAN ONLINE
  const [onlineUsers, setOnlineUsers] = useState([]);

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

  const formatDateHeader = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Hari ini";
    }

    if (d.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    }

    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    let presenceChannel; // ✅ TAMBAHAN

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

      // ✅ TAMBAHAN PRESENCE ONLINE
      presenceChannel = supabase.channel("online-users", {
        config: {
          presence: { key: u.id },
        },
      });

      presenceChannel
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState();
          setOnlineUsers(Object.keys(state));
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel.track({
              online_at: new Date().toISOString(),
            });
          }
        });
    };

    init();

    const channel = supabase
      .channel("realtime-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const newPost = payload.new;

          setPosts((prev) => {
            const exist = prev.find((p) => p.id === newPost.id);
            if (exist) return prev;
            return [...prev, newPost];
          });

          scrollToBottom();
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        (payload) => {
          const id = payload.old.id;
          setPosts((prev) => prev.filter((p) => p.id !== id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (presenceChannel) supabase.removeChannel(presenceChannel); // ✅ TAMBAHAN
    };
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

    const ids = [...new Set(clean.map((p) => p.user_id).filter(Boolean))];

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .in("id", ids);

    const map = {};
    users?.forEach((u) => (map[u.id] = u));
    setProfiles((prev) => ({ ...prev, ...map }));
  };

  const deleteMessage = async (id) => {
    await supabase.from("posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    setLoading(true);

    const { error } = await supabase.from("posts").insert([
      {
        content: text,
        user_email: user.email,
        user_id: user.id,
        created_at: new Date().toISOString(),
        parent_id: replyTo?.id || null,
      },
    ]);

    if (!error) {
      setText("");
      setReplyTo(null);

      await supabase
        .from("users")
        .update({ exp: exp + 10 })
        .eq("id", user.id);

      setExp((prev) => prev + 10);

      const { data: allPosts } = await supabase
        .from("posts")
        .select("id")
        .order("id", { ascending: true });

      if (allPosts.length > 20) {
        const idsToDelete = allPosts
          .slice(0, allPosts.length - 20)
          .map((p) => p.id);

        await supabase.from("posts").delete().in("id", idsToDelete);
      }
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">

      <div className="sticky top-0 z-50 bg-[#0F766E] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="bg-white/20 px-3 py-1 rounded-full">
            ←
          </button>

          <div className="text-center">
            <h1 className="font-bold">💬 Forum CODKampus</h1>

            <div className="w-32 h-2 bg-white/20 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#F59E0B]" style={{ width: `${(exp % 50) * 2}%` }} />
            </div>

            <p className="text-xs opacity-80">EXP: {exp}</p>
          </div>

          <div className="w-6"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">

        {(() => {
          let lastDate = null;

          return posts.map((p, i) => {
            const isMe = p.user_id === user?.id;
            const profile = profiles[p.user_id?.trim?.()];
            const parent = posts.find(x => x.id === p.parent_id);

            const isOnline = onlineUsers.includes(p.user_id); // ✅ TAMBAHAN

            const currentDate = new Date(p.created_at).toDateString();
            const showDate = currentDate !== lastDate;
            lastDate = currentDate;

            return (
              <div key={i}>

                {showDate && (
                  <div className="text-center my-2">
                    <span className="bg-[#e5ddd5] text-gray-700 text-xs px-4 py-1 rounded-full shadow">
                      {formatDateHeader(p.created_at)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isMe ? "justify-end" : ""}`}>

                  {!isMe && (
                    <Link href={`/user/${p.user_id}`}>
                      <img
                        src={profile?.avatar_url || "https://via.placeholder.com/40"}
                        className="w-8 h-8 rounded-full mr-2 cursor-pointer"
                      />
                    </Link>
                  )}

                  <div className={`max-w-[75%] break-words p-3 rounded-2xl shadow ${isMe ? "bg-[#0F766E] text-white" : "bg-white"}`}>

                    {!isMe && (
                      <Link href={`/user/${p.user_id}`}>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-[#0F766E] cursor-pointer hover:underline">
                            {profile?.name || "User"}
                          </p>

                          {/* 🟢 ONLINE */}
                          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                        </div>
                      </Link>
                    )}

                    {parent && (
                      <div className="text-xs bg-black/10 p-2 rounded mb-1">
                        {parent.content}
                      </div>
                    )}

                    <p>{p.content}</p>

                    <p className="text-xs mt-1 opacity-70">
                      {formatTime(p.created_at)}
                    </p>

                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setReplyTo(p)} className="text-xs text-blue-400">
                        Reply
                      </button>

                      {isMe && (
                        <button onClick={() => deleteMessage(p.id)} className="text-xs text-red-400">
                          Hapus
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          });
        })()}

        <div ref={bottomRef}></div>
      </div>

      {replyTo && (
        <div className="px-3 py-2 bg-yellow-100 text-sm flex justify-between">
          <span>Reply: {replyTo.content.slice(0, 30)}...</span>
          <button onClick={() => setReplyTo(null)}>❌</button>
        </div>
      )}

      <div className="p-3 flex gap-2 bg-white border-t">
        <input
          className="flex-1 p-3 rounded-full border"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis sesuatu..."
        />

        <button onClick={sendMessage} className="bg-[#F59E0B] text-white px-5 rounded-full">
          {loading ? "..." : "Kirim"}
        </button>
      </div>
    </div>
  );
}