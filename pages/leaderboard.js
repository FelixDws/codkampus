import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  const getLeaderboard = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("exp", { ascending: false });

    setUsers(data || []);
  };

  useEffect(() => {
    getLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">
      <Navbar />

      <div className="container-main">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="title">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Ranking mahasiswa berdasarkan EXP
          </p>
        </div>

        {/* TOP 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {users.slice(0, 3).map((u, i) => (
            <div
              key={u.id}
              className={`card text-center border-2 transition
                ${i === 0 ? "border-yellow-400 sm:scale-105" : ""}
                ${i === 1 ? "border-gray-400" : ""}
                ${i === 2 ? "border-orange-400" : ""}
              `}
            >
              <img
                src={u.avatar_url || "https://via.placeholder.com/80"}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 border-2 border-[#0F766E]"
              />

              <p className="font-semibold text-[#0F766E] text-sm sm:text-base">
                {u.name || u.email}
              </p>

              <p className="text-xs sm:text-sm text-gray-500">
                Lv {Math.floor((u.exp || 0) / 50) + 1}
              </p>

              <p className="font-bold text-base sm:text-lg mt-1">
                {u.exp || 0} EXP
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
                className="card flex justify-between items-center hover:shadow-lg transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-3 sm:gap-4">

                  {/* RANK */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-bold text-white bg-[#0F766E] text-sm sm:text-base">
                    {rank}
                  </div>

                  {/* AVATAR */}
                  <img
                    src={u.avatar_url || "https://via.placeholder.com/40"}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border"
                  />

                  {/* USER */}
                  <div>
                    <p className="font-semibold text-[#0F766E] text-sm sm:text-base">
                      {u.name || u.email}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Level {Math.floor((u.exp || 0) / 50) + 1}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className="font-bold text-base sm:text-lg text-[#0F766E]">
                    {u.exp || 0}
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