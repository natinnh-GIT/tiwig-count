import { useNavigate } from "react-router-dom";

export const EQUIP_TYPE_COLORS = {
  "Press — Single Stage":      { bg: "#1a1a3a", text: "#a5b4fc", border: "#6366f1" },
  "Press — Turret":            { bg: "#1a1a3a", text: "#c4b5fd", border: "#8b5cf6" },
  "Press — Progressive":       { bg: "#0f2a2a", text: "#5eead4", border: "#14b8a6" },
  "Die Set":                   { bg: "#2a1a10", text: "#fdba74", border: "#f97316" },
  "Scale / Auto Trickler":     { bg: "#1e3a1a", text: "#86efac", border: "#22c55e" },
  "Powder Measure":            { bg: "#2a2a10", text: "#fde68a", border: "#f59e0b" },
  "Case Trimmer":              { bg: "#2a1a2a", text: "#c4b5fd", border: "#8b5cf6" },
  "Case Prep Center":          { bg: "#2a1a2a", text: "#d8b4fe", border: "#a855f7" },
  "Annealer":                  { bg: "#3a1a10", text: "#fca5a5", border: "#ef4444" },
  "Brass Tumbler — Vibratory": { bg: "#1c1917", text: "#d6d3d1", border: "#78716c" },
  "Brass Tumbler — Rotary/Wet":{ bg: "#1c1917", text: "#d6d3d1", border: "#78716c" },
  "Ultrasonic Cleaner":        { bg: "#0f1a2a", text: "#93c5fd", border: "#3b82f6" },
  "Priming Tool":              { bg: "#2a1a10", text: "#fdba74", border: "#ea580c" },
  "Caliper":                   { bg: "#0f2a2a", text: "#67e8f9", border: "#06b6d4" },
  "Chronograph":               { bg: "#2a2610", text: "#fde68a", border: "#ca8a04" },
  "Bullet Puller":             { bg: "#2a1a1a", text: "#fca5a5", border: "#ef4444" },
  "Loading Block":             { bg: "#242424", text: "#a3a3a3", border: "#3a3a3a" },
  "Case Gauge":                { bg: "#1a3320", text: "#86efac", border: "#22c55e" },
  "Bore Patches":              { bg: "#1c1917", text: "#d6d3d1", border: "#57534e" },
  "Bore Brushes / Mops":       { bg: "#1c1917", text: "#d6d3d1", border: "#57534e" },
  "Cleaning Rods":             { bg: "#1c1917", text: "#d6d3d1", border: "#57534e" },
  "Cleaning Solvent":          { bg: "#0f1a2a", text: "#93c5fd", border: "#3b82f6" },
  "Case Lube":                 { bg: "#1e3a1a", text: "#86efac", border: "#22c55e" },
  "Neck Lube":                 { bg: "#1e3a1a", text: "#86efac", border: "#22c55e" },
  "Tumbling Media":            { bg: "#2a2a10", text: "#fde68a", border: "#f59e0b" },
  "Stainless Steel Pins":      { bg: "#242424", text: "#a3a3a3", border: "#3a3a3a" },
  "Shell Holders":             { bg: "#242424", text: "#a3a3a3", border: "#3a3a3a" },
  "Primer Tubes":              { bg: "#2a1a10", text: "#fdba74", border: "#ea580c" },
  "Decapping Pins":            { bg: "#242424", text: "#a3a3a3", border: "#3a3a3a" },
  "Firearm Lubricant / CLP":   { bg: "#0f2a2a", text: "#67e8f9", border: "#06b6d4" },
  "Other":                     { bg: "#242424", text: "#a3a3a3", border: "#3a3a3a" },
};

const CONDITION_COLORS = {
  "New": "#22c55e", "Excellent": "#4ade80", "Very Good": "#86efac",
  "Good": "#a3a3a3", "Fair": "#f59e0b", "Poor": "#ef4444",
};

export default function ReloadingEquipCard({ item }) {
  const navigate = useNavigate();
  const typeStyle = EQUIP_TYPE_COLORS[item.type] || EQUIP_TYPE_COLORS["Other"];
  const condColor = CONDITION_COLORS[item.condition];
  const isConsumable = item.category === "Consumable";

  return (
    <div
      onClick={() => navigate(`/reloading-equip/${item.id}`, { state: { from: "reloading" } })}
      style={{
        background: "#1a1a1a", borderBottom: "1px solid #1f1f1f",
        padding: "10px 14px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 12, minHeight: 68,
      }}
    >
      <div style={{
        width: 52, height: 52, flexShrink: 0, borderRadius: 6,
        background: "#242424", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid #2a2a2a",
      }}>
        {item.photo_url
          ? <img src={item.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ color: "#f97316", fontSize: 18, fontWeight: 800 }}>{item.name?.[0]?.toUpperCase()}</span>
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {item.name}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            {isConsumable && item.quantity != null && (
              <span style={{ color: "#f97316", fontSize: 10, fontWeight: 700 }}>
                ×{item.quantity}{item.unit ? ` ${item.unit}` : ""}
              </span>
            )}
            {item.condition && (
              <span style={{ color: condColor, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }}>
                {item.condition.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
          {item.type && (
            <span style={{
              background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}`,
              fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, letterSpacing: "0.05em",
            }}>
              {item.type}
            </span>
          )}
          {(item.brand || item.model) && (
            <span style={{ color: "#a3a3a3", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {[item.brand, item.model].filter(Boolean).join(" ")}
            </span>
          )}
        </div>

        {item.caliber_compatibility && (
          <div style={{ color: "#6b7280", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.caliber_compatibility}
          </div>
        )}
      </div>
    </div>
  );
}
