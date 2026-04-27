import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  const getLeaderboard = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("exp", { ascending: false });

    if (!error) setUsers(data || []);
  };

  useEffect(() => {
    getLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">

      {/* NAVBAR */}
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#0F766E]">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600">
            Ranking mahasiswa berdasarkan EXP
          </p>
        </div>

        {/* TOP 3 SPECIAL */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {users.slice(0, 3).map((u, i) => (
            <div
              key={u.id}
              className={`bg-white p-4 rounded-2xl shadow text-center border-2
                ${i === 0 ? "border-yellow-400 scale-105" : ""}
                ${i === 1 ? "border-gray-400" : ""}
                ${i === 2 ? "border-orange-400" : ""}
              `}
            >
              <img
                src={u.avatar_url || "https://via.placeholder.com/80"}
                className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-[#0F766E]"
              />

              <p className="font-semibold text-[#0F766E]">
                {u.name || u.email}
              </p>

              <p className="text-sm text-gray-500">
                Lv {Math.floor(u.exp / 50) + 1}
              </p>

              <p className="font-bold text-lg mt-1">
                {u.exp} EXP
              </p>
            </div>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {users.slice(3).map((u, index) => {
            const rank = index + 4;

            return (
              <div
                key={u.id}
                className="flex justify-between items-center bg-white p-4 rounded-xl shadow border border-gray-200 hover:shadow-lg transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">

                  {/* RANK */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-full font-bold text-white bg-[#0F766E]">
                    {rank}
                  </div>

                  {/* AVATAR */}
                  <img
                    src={u.avatar_url || "https://via.placeholder.com/40"}
                    className="w-10 h-10 rounded-full border"
                  />

                  {/* USER */}
                  <div>
                    <p className="font-semibold text-[#0F766E]">
                      {u.name || u.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Level {Math.floor(u.exp / 50) + 1}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className="font-bold text-lg text-[#0F766E]">
                    {u.exp}
                  </p>
                  <p className="text-xs text-gray-500">
                    EXP
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}