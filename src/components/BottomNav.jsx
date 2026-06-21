import { Layers, Crosshair, Eye, MapPin, Settings } from "lucide-react";

const TABS = [
  { id: "components", label: "Components", icon: Layers },
  { id: "firearms", label: "Firearms", icon: Crosshair },
  { id: "optics", label: "Optics", icon: Eye },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      style={{
        background: "#111111",
        borderTop: "1px solid #2a2a2a",
        height: 72,
        paddingBottom: "env(safe-area-inset-bottom)",
        flexShrink: 0,
      }}
      className="flex items-stretch w-full"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative"
            style={{ color: isActive ? "#f97316" : "#737373", minHeight: 44 }}
          >
            {isActive && (
              <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: "#f97316", borderRadius: "0 0 2px 2px" }} />
            )}
            <Icon className="w-6 h-6" />
            <span className="font-medium" style={{ fontSize: 11 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}