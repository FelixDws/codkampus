import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [finished, setFinished] = useState(false);

  const [coins, setCoins] = useState(0);
  const [badge, setBadge] = useState(null);

  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  const questionsPool = [
    { q: "Apa ibu kota Indonesia?", options: ["Jakarta","Bandung","Surabaya","Medan"], answer: "Jakarta" },
    { q: "2 + 2 = ?", options: ["3","4","5","6"], answer: "4" },
    { q: "5 x 3 = ?", options: ["15","10","20","8"], answer: "15" },
    { q: "10 - 4 = ?", options: ["6","5","4","7"], answer: "6" },

    { q: "React itu?", options: ["Library","Database","OS","Compiler"], answer: "Library" },
    { q: "HTML itu?", options: ["Database","Markup","Server","OS"], answer: "Markup" },
    { q: "CSS buat apa?", options: ["Logic","Design","AI","Server"], answer: "Design" },
    { q: "JavaScript itu?", options: ["Bahasa pemrograman","Database","Framework","Server"], answer: "Bahasa pemrograman" },

    { q: "Bitcoin itu?", options: ["Game","Crypto","Bank","App"], answer: "Crypto" },
    { q: "Ethereum itu?", options: ["Crypto","Game","Browser","AI"], answer: "Crypto" },

    { q: "Planet terbesar?", options: ["Mars","Jupiter","Bumi","Venus"], answer: "Jupiter" },
    { q: "Planet terdekat matahari?", options: ["Merkurius","Venus","Mars","Bumi"], answer: "Merkurius" },

    { q: "Siapa presiden pertama Indonesia?", options: ["Soekarno","Soeharto","Jokowi","Habibie"], answer: "Soekarno" },
    { q: "Hari kemerdekaan Indonesia?", options: ["17 Agustus","1 Juni","28 Oktober","10 November"], answer: "17 Agustus" },

    { q: "Air mendidih pada suhu?", options: ["100°C","90°C","80°C","70°C"], answer: "100°C" },
    { q: "1 jam berapa menit?", options: ["60","30","90","120"], answer: "60" },

    { q: "CPU singkatan dari?", options: ["Central Processing Unit","Computer Power Unit","Core Process Unit","Central Power Unit"], answer: "Central Processing Unit" },
    { q: "RAM itu?", options: ["Memory","Storage","CPU","GPU"], answer: "Memory" },

    { q: "Bahasa Jepang 'arigatou' artinya?", options: ["Halo","Terima kasih","Maaf","Selamat"], answer: "Terima kasih" },
    { q: "Bahasa Inggris 'book' artinya?", options: ["Buku","Pensil","Meja","Tas"], answer: "Buku" },

    { q: "Gunung tertinggi di dunia?", options: ["Everest","Kilimanjaro","Fuji","Rinjani"], answer: "Everest" },
    { q: "Samudra terbesar?", options: ["Pasifik","Atlantik","Hindia","Arktik"], answer: "Pasifik" },

    { q: "3^2 = ?", options: ["9","6","3","12"], answer: "9" },
    { q: "Akar dari 16?", options: ["4","2","8","6"], answer: "4" },
  ];

  const getRandomQuestions = () => {
    return [...questionsPool].sort(() => Math.random() - 0.5).slice(0, 5);
  };

  useEffect(() => {
    setQuestions(getRandomQuestions());

    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      setUser(u);

      if (u) {
        const { data: userData } = await supabase
          .from("users")
          .select("coins, badge")
          .eq("id", u.id)
          .single();

        setCoins(userData?.coins || 0);
        setBadge(userData?.badge || null);
      }
    });
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setStarted(true);
      return;
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (!started || finished) return;

    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, finished]);

  const handleNext = async () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setTimeLeft(10);
    } else {
      setFinished(true);

      if (user) {
        await supabase.rpc("add_coin", {
          user_id_input: user.id,
          amount_input: score
        });

        setCoins((c) => c + score);
      }
    }
  };

  const answerQuestion = async (opt) => {
    const current = questions[index];

    if (opt === current.answer) {
      setScore((s) => s + 2.5);
    }

    handleNext();
  };

  const buyBadge = async (type) => {
    const cost = type === "pro" ? 100 : 300;
    if (coins < cost) return alert("Coin kurang");

    await supabase
      .from("users")
      .update({
        coins: coins - cost,
        badge: type
      })
      .eq("id", user.id);

    setCoins(coins - cost);
    setBadge(type);
  };

  if (!questions.length) return null;

  const q = questions[index];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">
      <Navbar />

      <div className="max-w-xl mx-auto p-6 text-center">

        {!started && (
          <div className="text-5xl font-bold text-[#0F766E] animate-pulse">
            {countdown > 0 ? countdown : "GO 🚀"}
          </div>
        )}

        {started && !finished && (
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-red-500 font-bold mb-2">⏱ {timeLeft}s</p>

            <h2 className="font-bold mb-4">
              Soal {index + 1}/5
            </h2>

            <p className="mb-4">{q.q}</p>

            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answerQuestion(opt)}
                className="block w-full mb-2 bg-gray-100 p-2 rounded hover:bg-gray-200"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {finished && (
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold">🎉 Selesai!</h2>
            <p className="mt-2">Kamu dapet {score} coin</p>

            <div className="mt-4">
              <p>💰 Coin: {coins}</p>
              {badge && <p>🏆 {badge}</p>}
            </div>

            {/* 🔥 SHOP FINAL */}
            <div className="mt-6 space-y-4">

              <h3 className="font-bold text-lg">🛒 Shop Badge</h3>

              <div className="border rounded-xl p-4 text-left shadow-sm">
                <h4 className="font-bold text-blue-600">🧠 Quiz Pro</h4>
                <button
                  disabled={badge === "pro" || badge === "king"}
                  onClick={() => buyBadge("pro")}
                  className={`mt-3 w-full py-2 rounded-full
                  ${badge === "pro" || badge === "king"
                    ? "bg-gray-300 text-gray-600"
                    : "bg-blue-500 text-white"}`}
                >
                  {badge === "pro" || badge === "king"
                    ? "✔ Sudah Dibeli"
                    : "Beli (100 coin)"}
                </button>
              </div>

              <div className="border rounded-xl p-4 text-left shadow-sm">
                <h4 className="font-bold text-yellow-600">👑 Quiz King</h4>
                <button
                  disabled={badge === "king"}
                  onClick={() => buyBadge("king")}
                  className={`mt-3 w-full py-2 rounded-full
                  ${badge === "king"
                    ? "bg-gray-300 text-gray-600"
                    : "bg-yellow-500 text-white"}`}
                >
                  {badge === "king"
                    ? "✔ Sudah Dibeli"
                    : "Beli (300 coin)"}
                </button>
              </div>

            </div>

            <button
              onClick={() => {
                setQuestions(getRandomQuestions());
                setIndex(0);
                setScore(0);
                setFinished(false);
                setCountdown(3);
                setStarted(false);
                setTimeLeft(10);
              }}
              className="mt-6 w-full bg-[#0F766E] text-white py-3 rounded-full font-bold"
            >
              🔁 Main Lagi
            </button>

          </div>
        )}

      </div>
    </div>
  );
}