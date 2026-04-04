import { useNavigate } from "react-router-dom";
import { Package, Zap, BarChart3, Shield } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
      style={{ background: "#0f0f0f" }}
    >
      <div className="text-center space-y-4 max-w-sm w-full">
        {/* Icon */}
        <div className="flex justify-center mb-2">
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px" }}
          >
            <Package className="w-8 h-8" style={{ color: "#f97316" }} />
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#f5f5f5" }}>
          TIWIG Count
        </h1>

        <p className="text-sm" style={{ color: "#a3a3a3" }}>
          Manage your ammunition reloading inventory with precision and ease
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 py-2">
          {[
            { icon: Zap, label: "Quick Add", sub: "Snap photos or scan barcodes" },
            { icon: BarChart3, label: "Track Inventory", sub: "Monitor all categories" },
            { icon: Shield, label: "Secure Data", sub: "Private and safe" },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="p-3 flex flex-col items-center text-center"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px" }}
            >
              <Icon className="w-5 h-5 mb-1" style={{ color: "#f97316" }} />
              <p className="text-[11px] font-semibold" style={{ color: "#f5f5f5" }}>{label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#737373" }}>{sub}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/home")}
          className="w-full py-3 text-sm font-bold tracking-wide transition-colors active:opacity-90"
          style={{ background: "#f97316", color: "#fff", borderRadius: "2px" }}
        >
          GET STARTED
        </button>
      </div>
    </div>
  );
}