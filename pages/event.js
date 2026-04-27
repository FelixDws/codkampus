import Navbar from "../components/Navbar";

export default function Event() {
  const events = [
    {
      title: "Seminar AI",
      date: "27 April 2026",
      desc: "Belajar AI dari dasar sampai implementasi",
      tag: "Seminar"
    },
    {
      title: "Turnamen ML",
      date: "5 Mei 2026",
      desc: "Turnamen antar mahasiswa, hadiah jutaan!",
      tag: "Turnamen"
    },
    {
      title: "Workshop Startup",
      date: "12 Mei 2026",
      desc: "Belajar bikin startup dari nol",
      tag: "Workshop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6fffa] to-[#fef3c7]">

      {/* NAVBAR */}
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0F766E]">
            📅 Event CODKampus
          </h1>
          <p className="text-gray-600">
            Ikuti event, tambah relasi & EXP 🚀
          </p>
        </div>

        {/* LIST */}
        <div className="grid md:grid-cols-2 gap-6">

          {events.map((e, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition border"
            >

              {/* TAG */}
              <span className="text-xs bg-[#0F766E]/10 text-[#0F766E] px-2 py-1 rounded-full">
                {e.tag}
              </span>

              {/* TITLE */}
              <h2 className="font-bold text-xl text-[#0F766E] mt-2">
                {e.title}
              </h2>

              {/* DATE */}
              <p className="text-sm text-gray-500 mt-1">
                📅 {e.date}
              </p>

              {/* DESC */}
              <p className="mt-3 text-gray-700">
                {e.desc}
              </p>

              {/* ACTION */}
              <button className="mt-5 w-full bg-[#F59E0B] text-white py-2 rounded-full font-semibold hover:scale-105 transition">
                🎟️ Ikut Event
              </button>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}