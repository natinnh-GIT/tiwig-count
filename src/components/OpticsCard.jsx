import { useNavigate } from "react-router-dom";

const TYPE_COLORS = {
  "Scope":       { bg: "#1e3a5f", text: "#7dd3fc", border: "#2563eb" },
  "LPVO":        { bg: "#1e3a5f", text: "#93c5fd", border: "#3b82f6" },
  "Red Dot":     { bg: "#4c1d1d", text: "#fca5a5", border: "#ef4444" },
  "Holographic": { bg: "#4c1d1d", text: "#fca5a5", border: "#ef4444" },
  "Prism":       { bg: "#2d1d4c", text: "#c4b5fd", border: "#8b5cf6" },
  "Binocular":   { bg: "#1a3320", text: "#86efac", border: "#22c55e" },
  "Monocular":   { bg: "#1a3320", text: "#86efac", border: "#22c55e" },
  "Rangefinder": { bg: "#2a2a10", text: "#fde68a", border: "#f59e0b" },
  "Night Vision":{ bg: "#0f2a1a", text: "#6ee7b7", border: "#10b981" },
  "Thermal":     { bg: "#2a1a0f", text: "#fdba74", border: "#f97316" },
  "Other":       { bg: "#242424", text: "#a3a3a3", border: "#3a3a3a" },
};

const CONDITION_COLORS = {
  "New":       "#22c55e",
  "Excellent": "#4ade80",
  "Very Good": "#86efac",
  "Good":      "#a3a3a3",
  "Fair":      "#f59e0b",
  "Poor":      "#ef4444",
};

export default function OpticsCard({ item }) {
  const navigate = useNavigate();
  const mounted = item.mounted_on_firearm_id && item.mounted_on_firearm_name;
  const typeStyle = TYPE_COLORS[item.type] || TYPE_COLORS["Other"];
  const condColor = CONDITION_COLORS[item.condition];

  const specParts = [
    item.magnification && `${item.magnification}`,
    item.objective_lens && `obj. ${item.objective_lens}`,
    item.focal_plane,
  ].filter(Boolean);

  return (
    <div
      onClick={() => navigate(`/optic/${item.id}`, { state: { from: "optics" } })}
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
          : <span style={{ color: "#f97316", fontSize: 10, fontWeight: 800, textAlign: "center", lineHeight: 1.2, padding: 4 }}>
              {item.brand?.split(" ")[0]?.slice(0, 6)}
            </span>
        }
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: name + mounted badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {[item.brand, item.model].filter(Boolean).join(" ")}
          </span>
          <span style={{
            background: mounted ? "#92400e" : "#166534",
            color: mounted ? "#fde68a" : "#86efac",
            border: `1px solid ${mounted ? "#b45309" : "#22c55e"}`,
            fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
            flexShrink: 0, letterSpacing: "0.06em", whiteSpace: "nowrap",
          }}>
            {mounted ? "Mounted" : "Available"}
          </span>
        </div>

        {/* Row 2: type chip + specs */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
          {item.type && (
            <span style={{
              background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}`,
              fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, letterSpacing: "0.05em",
            }}>
              {item.type}
            </span>
          )}
          {specParts.length > 0 && (
            <span style={{ color: "#a3a3a3", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {specParts.join(" · ")}
            </span>
          )}
        </div>

        {/* Row 3: reticle or mount info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          {item.reticle ? (
            <span style={{ color: "#6b7280", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.reticle}
            </span>
          ) : mounted ? (
            <span style={{ color: "#6b7280", fontSize: 11, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              on {item.mounted_on_firearm_name}
            </span>
          ) : <span />}
          {item.condition && (
            <span style={{ color: condColor, fontSize: 9, fontWeight: 700, flexShrink: 0, letterSpacing: "0.05em" }}>
              {item.condition.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
