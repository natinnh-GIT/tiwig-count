import { useState, useEffect } from "react";

const REID_MESSAGES = ["Analyzing...", "Reading label...", "Identifying component..."];
const ENHANCE_MESSAGES = ["Enhancing...", "Processing image...", "Almost there..."];

// SVG animation phases (0-4): case → primer → powder fill → bullet → flash
export default function CartridgeLoader({ mode = "reid" }) {
  const [phase, setPhase] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [flash, setFlash] = useState(false);

  const messages = mode === "enhance" ? ENHANCE_MESSAGES : REID_MESSAGES;

  useEffect(() => {
    // Phase cycle: 0→1→2→3→4(flash)→0, ~800ms each
    const phaseTimer = setInterval(() => {
      setPhase((p) => {
        if (p === 4) {
          setFlash(true);
          setTimeout(() => setFlash(false), 300);
          return 0;
        }
        return p + 1;
      });
    }, 800);

    // Message cycle every 2.4s
    const msgTimer = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
    }, 2400);

    return () => { clearInterval(phaseTimer); clearInterval(msgTimer); };
  }, []);

  // Powder fill height based on phase (0-3: 0%, 0%, 30%→80%, 80%)
  const powderH = phase >= 2 ? (phase === 2 ? 40 : 52) : 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.75)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 18,
    }}>
      {/* SVG cartridge */}
      <svg
        width="48" height="80" viewBox="0 0 48 80"
        style={{
          filter: flash ? "drop-shadow(0 0 12px #f97316)" : "drop-shadow(0 0 4px rgba(249,115,22,0.3))",
          transition: "filter 0.2s",
        }}
      >
        {/* Case body */}
        <rect
          x="10" y="28" width="28" height="42"
          rx="2"
          fill={phase >= 0 ? "#f97316" : "transparent"}
          opacity={phase >= 0 ? 1 : 0}
          style={{ transition: "opacity 0.3s" }}
        />

        {/* Powder fill (animates from bottom inside case) */}
        {powderH > 0 && (
          <rect
            x="11" y={70 - powderH} width="26" height={powderH}
            rx="1"
            fill="#fbbf24"
            opacity="0.6"
            style={{ transition: "height 0.5s ease, y 0.5s ease" }}
          />
        )}

        {/* Case rim at base */}
        {phase >= 0 && (
          <rect x="7" y="68" width="34" height="6" rx="1" fill="#ea6500" />
        )}

        {/* Primer dot at base */}
        {phase >= 1 && (
          <circle
            cx="24" cy="74" r="4"
            fill="#fde68a"
            opacity={phase >= 1 ? 1 : 0}
            style={{ transition: "opacity 0.3s" }}
          />
        )}

        {/* Bullet tip seated at top */}
        {phase >= 3 && (
          <ellipse
            cx="24" cy="22" rx="14" ry="10"
            fill="#f97316"
            style={{ transition: "opacity 0.3s" }}
          />
        )}
        {phase >= 3 && (
          <path
            d="M10 22 Q24 4 38 22"
            fill="#d16010"
          />
        )}

        {/* Flash glow ring */}
        {flash && (
          <circle cx="24" cy="40" r="26" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.6" />
        )}
      </svg>

      {/* Pulsing label text */}
      <span
        key={msgIdx}
        style={{
          color: "#a3a3a3",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.03em",
          animation: "pulse-fade 2.4s ease-in-out infinite",
        }}
      >
        {messages[msgIdx]}
      </span>

      <style>{`
        @keyframes pulse-fade {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}