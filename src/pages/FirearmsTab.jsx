import { useEffect } from "react";
import { Crosshair } from "lucide-react";

const FIELDS = [
  "Make / Model", "Caliber", "Serial Number", "Finish",
  "Barrel Length", "Acquired Date", "Estimated Value", "Notes", "Photo"
];

export default function FirearmsTab({ onCountChange }) {
  useEffect(() => { onCountChange(0); }, []);

  return (
    <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ width: 64, height: 64, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Crosshair style={{ width: 32, height: 32, color: "#f97316" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Firearm Catalog</p>
        <p style={{ color: "#a3a3a3", fontSize: 13 }}>No firearms cataloged yet. Tap + to add your first.</p>
      </div>
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3, padding: "14px 16px", width: "100%", maxWidth: 360 }}>
        <p style={{ color: "#a3a3a3", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Planned Fields</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FIELDS.map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 4, borderRadius: 1, background: "#f97316", flexShrink: 0 }} />
              <span style={{ color: "#737373", fontSize: 12 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}