import { useState } from "react";
import { ChevronRight, X } from "lucide-react";

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Selamat Datang di CODKampus",
      desc: "Platform jual beli khusus mahasiswa. Simple, cepat, dan tanpa ribet.",
    },
    {
      title: "Marketplace",
      desc: "Jual barang atau cari kebutuhan kampus dengan sistem COD langsung.",
    },
    {
      title: "Forum & Komunitas",
      desc: "Diskusi, tanya jawab, dan berbagi info dengan mahasiswa lain.",
    },
    {
      title: "Siap Mulai",
      desc: "Sekarang kamu siap untuk jual, beli, dan berkembang di CODKampus.",
    },
  ];

  const next = () => {
    if (step === steps.length - 1) {
      onFinish();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* CARD */}
      <div className="relative bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl animate-[fadeIn_.3s_ease]">

        {/* CLOSE */}
        <button
          onClick={onFinish}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-100"
        >
          <X size={18} className="text-gray-500" />
        </button>

        {/* LOGO */}
        <div className="flex flex-col items-center text-center">

          <img
            src="/logo/logo.png"
            className="w-28 mb-3"
          />

          <h2 className="text-lg font-semibold text-gray-800">
            {steps[step].title}
          </h2>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {steps[step].desc}
          </p>

        </div>

        {/* PROGRESS */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all
                ${i === step ? "w-6 bg-[#0F766E]" : "w-2 bg-gray-300"}
              `}
            />
          ))}
        </div>

        {/* ACTION */}
        <div className="mt-6 space-y-3">

          <button
            onClick={next}
            className="w-full bg-[#0F766E] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            {step === steps.length - 1 ? "Mulai Sekarang" : "Lanjut"}
            <ChevronRight size={16} />
          </button>

          {/* SKIP */}
          <button
            onClick={onFinish}
            className="w-full text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Lewati
          </button>

        </div>

      </div>

      {/* ANIMATION STYLE */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

    </div>
  );
}