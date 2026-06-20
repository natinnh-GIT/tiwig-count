import { useNavigate } from "react-router-dom";

const TYPE_COLORS = {
  "Rifle":      { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  "Pistol":     { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  "AR":         { bg: "#1e3a1a", text: "#86efac", border: "#22c55e" },
  "Shotgun":    { bg: "#1e1e3a", text: "#c4b5fd", border: "#8b5cf6" },
  "Rimfire":    { bg: "#1c1917", text: "#fde68a", border: "#f59e0b" },
  "Revolver":   { bg: "#2a1a1a", text: "#fca5a5", border: "#ef4444" },
  "Other":      { bg: "#242424", text: "#a3a3a3", border: "#3a3a3a" },
};

const CONDITION_COLORS = {
  "New":       "#22c55e",
  "Excellent": "#4ade80",
  "Very Good": "#86efac",
  "Good":      "#a3a3a3",
  "Fair":      "#f59e0b",
  "Poor":      "#ef4444",
};

export default function FirearmCard({ item }) {
  const navigate = useNavigate();
  const typeStyle = TYPE_COLORS[item.type] || TYPE_COLORS["Other"];
  const condColor = CONDITION_COLORS[item.condition];

  const specParts = [
    item.caliber,
    item.action,
    item.barrel_length && `${item.barrel_length}"`,
  ].filter(Boolean);

  return (
    <div
      onClick={() => navigate(`/firearm/${item.id}`, { state: { from: "firearms" } })}
      style={{
        background: "#1a1a1a",
        borderBottom: "1px solid #1f1f1f",
        padding: "10px 14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 68,
      }}
    >
      {/* Thumbnail */}
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

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: name + condition */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {item.name}
          </span>
          {item.condition && (
            <span style={{ color: condColor, fontSize: 9, fontWeight: 700, flexShrink: 0, letterSpacing: "0.05em" }}>
              {item.condition.toUpperCase()}
            </span>
          )}
        </div>

        {/* Row 2: type chip + make/model */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
          {item.type && (
            <span style={{
              background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}`,
              fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, letterSpacing: "0.05em",
            }}>
              {item.type}
            </span>
          )}
          {(item.make || item.model) && (
            <span style={{ color: "#a3a3a3", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {[item.make, item.model].filter(Boolean).join(" ")}
            </span>
          )}
        </div>

        {/* Row 3: specs */}
        {specParts.length > 0 && (
          <div style={{ color: "#6b7280", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {specParts.join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}
