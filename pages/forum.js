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
  const [activeMenu, setActiveMenu] = useState(null);

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
  <div className="h-screen flex flex-col bg-[#eef2f6] relative">

    {/* BATIK */}
    <div className="fixed inset-0 opacity-[0.05] pointer-events-none">
      <img src="/batik.png" className="w-full h-full object-cover" />
    </div>

    {/* HEADER */}
    <div className="sticky top-0 z-50 bg-[#0F766E] text-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">

        <button
          onClick={() => router.push("/")}
          className="text-sm bg-white/20 px-3 py-1 rounded-lg"
        >
          ←
        </button>

        <div className="text-center">
          <h1 className="font-semibold">Forum CODKampus</h1>
          <p className="text-xs opacity-80">Diskusi antar mahasiswa</p>
        </div>

        <div className="text-xs opacity-80">
          EXP {exp}
        </div>

      </div>
    </div>

    {/* CHAT */}
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">

      {(() => {
        let lastDate = null;

        return posts.map((p, i) => {
          const isMe = p.user_id === user?.id;
          const profile = profiles[p.user_id?.trim?.()];
          const parent = posts.find(x => x.id === p.parent_id);
          const isOnline = onlineUsers.includes(p.user_id);

          const currentDate = new Date(p.created_at).toDateString();
          const showDate = currentDate !== lastDate;
          lastDate = currentDate;

          return (
            <div key={i}>

              {/* DATE */}
              {showDate && (
                <div className="text-center my-3">
                  <span className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full">
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

                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm
                  ${isMe
                    ? "bg-[#0F766E] text-white"
                    : "bg-white shadow-sm border border-gray-200 text-gray-800 border border-gray-200"
                  }`}
                >

                  {!isMe && (
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-xs font-semibold text-[#0F766E]">
                        {profile?.name || "User"}
                      </p>

                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                  )}

                  {/* REPLY */}
                  {parent && (
                    <div className="text-xs bg-gray-200 p-2 rounded mb-1 text-gray-700">
                      {parent.content}
                    </div>
                  )}

                  <p>{p.content}</p>

                  <p className="text-[10px] mt-1 opacity-60">
                    {formatTime(p.created_at)}
                  </p>

                  {/* ACTION MENU */}
                  <div className="flex justify-end mt-1 relative">

                    <div className="relative z-20">
  <div className="relative z-20">
  <button
    onClick={() =>
      setActiveMenu(activeMenu === p.id ? null : p.id)
    }
    className="flex items-center justify-center 
               w-6 h-6 rounded-md 
               bg-gray-200 text-gray-700 
               hover:bg-[#0F766E] hover:text-white 
               transition"
  >
    ⋮
  </button>
</div>
</div>

                    {activeMenu === p.id && (
  <div className="absolute right-0 bottom-8 bg-white border border-gray-200 rounded-xl shadow-xl text-sm z-[999] w-40 overflow-hidden animate-fadeIn">

    {/* REPLY */}
    <button
      onClick={() => {
        setReplyTo(p);
        setActiveMenu(null);
      }}
      className="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100 transition"
    >
      <span>Reply</span>
    </button>

    {/* DELETE */}
    {isMe && (
      <button
        onClick={() => {
          deleteMessage(p.id);
          setActiveMenu(null);
        }}
        className="w-full text-left px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 transition"
      >
        <span>Hapus</span>
      </button>
    )}

  </div>
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

    {/* REPLY BAR */}
    {replyTo && (
      <div className="px-3 py-2 bg-gray-200 text-sm flex justify-between">
        <span className="text-gray-700">
          Reply: {replyTo.content.slice(0, 30)}...
        </span>
        <button onClick={() => setReplyTo(null)}>✕</button>
      </div>
    )}

    {/* INPUT */}
    <div className="p-3 flex gap-2 bg-white border-t">

      <input
        className="flex-1 p-3 rounded-xl border text-sm bg-[#f8fafc]"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tulis pesan..."
      />

      <button
        onClick={sendMessage}
        className="bg-[#0F766E] text-white px-4 rounded-xl text-sm"
      >
        {loading ? "..." : "Kirim"}
      </button>

    </div>
  </div>
);
}