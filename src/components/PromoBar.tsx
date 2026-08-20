import { Link } from "react-router-dom";

const messages = [
  "⚡ Bengaluru Express: Get your order in just 60 minutes via Porter!",
  "🚀 PAN India Delivery: Swift and reliable shipping across India within 3 to 4 business days.",
  "🛡️ Secure Transit: Calculated standard delivery charges applied directly at checkout.",
  "✨ 7-Day Risk-Free Window: Hassle-free returns or exchanges within 7 days (Exclusive to Bengaluru customers).",
  "💬 24/7 Dedicated Assistance — We are here to help: Reach out instantly via WhatsApp, call, or email anytime!",
];

// Duplicate for seamless infinite loop
const ticker = [...messages, ...messages];

const PromoBar = () => {
  return (
    <div style={{ background: "#1a1a1a" }} className="text-white overflow-hidden">
      <div className="flex items-center">
        {/* Left static label */}
        <div
          className="hidden sm:flex flex-shrink-0 items-center gap-2 px-5 py-2.5 border-r border-white/10 z-10"
          style={{ background: "#1a1a1a" }}
        >
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 whitespace-nowrap">
            Divine Interior
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="relative flex-1 overflow-hidden py-2.5">
          <div
            className="flex gap-0 whitespace-nowrap"
            style={{
              animation: "ticker-scroll 40s linear infinite",
            }}
          >
            {ticker.map((msg, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-0 font-sans text-[11px] font-medium text-white/80 px-10"
              >
                {msg}
                <span className="ml-10 text-white/20">|</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right CTA */}
        <div
          className="hidden md:flex flex-shrink-0 items-center px-5 border-l border-white/10 z-10"
          style={{ background: "#1a1a1a" }}
        >
          <Link
            to="/shop"
            className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors whitespace-nowrap"
          >
            Shop Now →
          </Link>
        </div>
      </div>

      {/* Ticker animation */}
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-scroll { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default PromoBar;
