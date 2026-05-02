import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";
import Link from "next/link";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);

  const getLeaderboard = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("exp", { ascending: false });

    setUsers(data || []);
  };

  useEffect(() => {
    getLeaderboard();

    supabase.auth.getSession().then(({ data }) => {
      setMe(data.session?.user);
    });
  }, []);

  const getLevel = (exp) => Math.floor((exp || 0) / 50) + 1;

  return (
    <div className="min-h-screen bg-[#eef2f6] relative">

      {/* BATIK */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none">
        <img src="/batik.png" className="w-full h-full object-cover" />
      </div>

      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Leaderboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ranking berdasarkan aktivitas dan EXP
          </p>
        </div>

        {/* 🔥 TOP 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          {users.slice(0, 3).map((u, i) => (
            <Link key={u.id} href={`/user/${u.id}`}>
              <div
                className={`cursor-pointer bg-white border rounded-2xl p-5 text-center shadow-sm transition hover:shadow-md
                  ${i === 0 ? "ring-1 ring-yellow-400/40 sm:scale-105" : ""}
                  ${i === 1 ? "ring-1 ring-gray-400/30" : ""}
                  ${i === 2 ? "ring-1 ring-orange-400/30" : ""}
                `}
              >

                {/* LABEL */}
                <p className="text-xs text-gray-400 mb-2">
                  {i === 0 && "Juara 1"}
                  {i === 1 && "Juara 2"}
                  {i === 2 && "Juara 3"}
                </p>

                {/* AVATAR */}
                <img
                  src={u.avatar_url || "https://ui-avatars.com/api/?name=User"}
                  className={`w-14 h-14 rounded-full mx-auto mb-3 object-cover border
                    ${i === 0 ? "border-yellow-400" : ""}
                    ${i === 1 ? "border-gray-400" : ""}
                    ${i === 2 ? "border-orange-400" : ""}
                  `}
                />

                {/* NAME */}
                <p className="font-medium text-gray-800 text-sm hover:underline">
                  {u.name || u.email}
                </p>

                {/* LEVEL */}
                <p className="text-xs text-gray-500 mt-1">
                  Level {getLevel(u.exp)}
                </p>

                {/* EXP */}
                <p className="mt-2 font-semibold text-[#0F766E]">
                  {u.exp || 0} EXP
                </p>

              </div>
            </Link>
          ))}

        </div>

        {/* 🔥 LIST */}
        <div className="space-y-2">

          {users.slice(3).map((u, index) => {
            const rank = index + 4;
            const isMe = me && String(me.id) === String(u.id);

            return (
              <Link key={u.id} href={`/user/${u.id}`}>
                <div
                  className={`cursor-pointer bg-white border rounded-xl px-4 py-3 flex justify-between items-center transition
                    ${isMe
                      ? "ring-1 ring-[#0F766E]/30 bg-[#0F766E]/5"
                      : "hover:bg-gray-50 hover:shadow-sm"}
                  `}
                >

                  {/* LEFT */}
                  <div className="flex items-center gap-3">

                    {/* RANK */}
                    <div className="text-sm text-gray-400 w-6">
                      #{rank}
                    </div>

                    {/* AVATAR */}
                    <img
                      src={u.avatar_url || "https://ui-avatars.com/api/?name=User"}
                      className="w-9 h-9 rounded-full object-cover border"
                    />

                    {/* USER */}
                    <div>
                      <p className="text-sm font-medium text-gray-800 hover:underline">
                        {u.name || u.email}
                        {isMe && (
                          <span className="ml-2 text-[10px] text-[#0F766E]">
                            (Kamu)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Level {getLevel(u.exp)}
                      </p>
                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="text-sm font-medium text-[#0F766E]">
                    {u.exp || 0} EXP
                  </div>

                </div>
              </Link>
            );
          })}

        </div>

      </div>
    </div>
  );
}