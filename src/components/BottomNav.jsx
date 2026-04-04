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
      style={{ background: "#111111", borderTop: "1px solid #2a2a2a" }}
      className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            style={{ color: isActive ? "#f97316" : "#737373" }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}