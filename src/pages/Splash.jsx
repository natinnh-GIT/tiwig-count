import { useNavigate } from "react-router-dom";
import { Package, Zap, BarChart3, Shield } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
      style={{ background: "#0f0f0f" }}
    >
      <div className="text-center space-y-5 w-full" style={{ maxWidth: 400 }}>
        {/* Icon */}
        <div className="flex justify-center mb-2">
          <div
            style={{ width: 80, height: 80, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Package style={{ width: 40, height: 40, color: "#f97316" }} />
          </div>
        </div>

        <h1 style={{ color: "#f5f5f5", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>
          TIWIG Count
        </h1>

        <p style={{ color: "#a3a3a3", fontSize: 15, lineHeight: 1.5 }}>
          Manage your ammunition reloading inventory with precision and ease
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 py-2">
          {[
            { icon: Zap, label: "Quick Add", sub: "Snap photos or scan barcodes" },
            { icon: BarChart3, label: "Track Inventory", sub: "Monitor all categories" },
            { icon: Shield, label: "Secure Data", sub: "Private and safe" },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              style={{ padding: "16px 12px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
            >
              <Icon style={{ width: 24, height: 24, color: "#f97316", marginBottom: 8 }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: "#f5f5f5", marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 11, color: "#737373", lineHeight: 1.4 }}>{sub}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/home")}
          style={{ width: "100%", background: "#f97316", color: "#fff", border: "none", borderRadius: 6, padding: "16px 0", fontSize: 16, fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", minHeight: 56 }}
        >
          GET STARTED
        </button>
      </div>
    </div>
  );
}