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
  const [shuffledOptions, setShuffledOptions] = useState([]);
  // 🔥 TAMBAH STATE
const [ready, setReady] = useState(false);
const [questionCount, setQuestionCount] = useState(5);

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
  const arr = [...questionsPool];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, questionCount); // 🔥 DINAMIS
};

  useEffect(() => {
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
  if (!ready) return; // 🔥 kunci utama

  if (countdown <= 0) {
    setStarted(true);
    return;
  }

  const t = setTimeout(() => setCountdown(countdown - 1), 1000);
  return () => clearTimeout(t);
}, [countdown, ready]);



  useEffect(() => {
    if (!started || finished) return;

    

    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, finished]);

  useEffect(() => {
  if (!started || finished) return;

  if (timeLeft <= 0) {
    handleNext();
    return;
  }

  const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
  return () => clearTimeout(t);
}, [timeLeft, started, finished]);

// 🔥 TAMBAHKAN DI SINI
useEffect(() => {
  if (!started) return;
  if (!questions.length) return;

  const current = questions[index];
  if (!current?.options) return;

  const shuffled = [...current.options].sort(() => Math.random() - 0.5);
  setShuffledOptions(shuffled);
}, [index, started, questions]);

  useEffect(() => {
  if (!ready) return; // 🔥 STOP kalau belum klik mulai

  if (countdown <= 0) {
    setStarted(true);
    return;
  }

  const t = setTimeout(() => setCountdown(countdown - 1), 1000);
  return () => clearTimeout(t);
}, [countdown, ready]);

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


  const q = questions[index] || {};

  return (
  <div className="min-h-screen bg-[#eef2f6] relative">

    {/* BATIK */}
    <div className="fixed inset-0 opacity-[0.04] pointer-events-none">
      <img src="/batik.png" className="w-full h-full object-cover" />
    </div>

    <Navbar />

    <div className="max-w-xl mx-auto px-4 py-10 text-center">

      {/* 🔥 PRE START */}
      {!ready && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm text-left">

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Mulai Quiz
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Pilih jumlah soal sebelum mulai
          </p>

          <div className="flex gap-2 mb-4">
            {[5, 10].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                className={`px-3 py-2 rounded-xl border text-sm
                ${questionCount === num
                  ? "bg-[#0F766E] text-white"
                  : "bg-white hover:bg-gray-50"}`}
              >
                {num} Soal
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setQuestions(getRandomQuestions());
              setReady(true);
              setCountdown(3);
            }}
            className="w-full bg-[#0F766E] text-white py-3 rounded-xl font-medium"
          >
            Mulai Quiz
          </button>

        </div>
      )}

      {/* COUNTDOWN */}
      {ready && !started && (
        <div className="bg-white border rounded-2xl p-10 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">
            Quiz dimulai dalam
          </p>
          <h1 className="text-4xl font-semibold text-[#0F766E]">
            {countdown > 0 ? countdown : "Mulai"}
          </h1>
        </div>
      )}

      {/* QUIZ */}
      {started && !finished && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm text-left">

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Soal {index + 1}/{questionCount}
            </p>
            <p className="text-sm font-medium text-red-500">
              {timeLeft}s
            </p>
          </div>

          <h2 className="font-semibold text-gray-800 mb-4">
            {q.q}
          </h2>

          <div className="space-y-2">
            {shuffledOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => answerQuestion(opt)}
                className="w-full text-left px-4 py-3 rounded-xl border 
                           hover:border-[#0F766E] hover:bg-gray-50 transition"
              >
                {opt}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* RESULT */}
      {finished && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-gray-800">
            Hasil Quiz
          </h2>

          <p className="mt-2 text-gray-600">
            Kamu mendapatkan <span className="font-semibold">{score}</span> coin
          </p>

          <div className="mt-4 text-sm text-gray-500">
            Coin kamu: {coins}
            {badge && <span> • {badge}</span>}
          </div>

          <div className="mt-6 space-y-3 text-left">

            <p className="text-sm font-medium text-gray-700">
              Upgrade Badge
            </p>

            <div className="border rounded-xl p-4">
              <p className="font-medium text-gray-800">Quiz Pro</p>
              <button
                disabled={badge === "pro" || badge === "king"}
                onClick={() => buyBadge("pro")}
                className={`mt-3 w-full py-2 rounded-xl text-sm
                ${badge === "pro" || badge === "king"
                  ? "bg-gray-200 text-gray-500"
                  : "bg-[#0F766E] text-white"}`}
              >
                {badge === "pro" || badge === "king"
                  ? "Sudah dimiliki"
                  : "Beli (100 coin)"}
              </button>
            </div>

            <div className="border rounded-xl p-4">
              <p className="font-medium text-gray-800">Quiz King</p>
              <button
                disabled={badge === "king"}
                onClick={() => buyBadge("king")}
                className={`mt-3 w-full py-2 rounded-xl text-sm
                ${badge === "king"
                  ? "bg-gray-200 text-gray-500"
                  : "bg-yellow-500 text-white"}`}
              >
                {badge === "king"
                  ? "Sudah dimiliki"
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
              setReady(false); // 🔥 RESET
              setTimeLeft(10);
            }}
            className="mt-6 w-full bg-[#0F766E] text-white py-3 rounded-xl font-medium"
          >
            Ulangi Quiz
          </button>

        </div>
      )}

    </div>
  </div>
);
}