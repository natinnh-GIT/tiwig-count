import { useNavigate } from "react-router-dom";

export default function OpticsCard({ item }) {
  const navigate = useNavigate();
  const mounted = item.mounted_on_firearm_id && item.mounted_on_firearm_name;

  return (
    <div
      onClick={() => navigate(`/optic/${item.id}`)}
      style={{
        background: "#1a1a1a",
        borderBottom: "1px solid #1f1f1f",
        padding: "10px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        minHeight: 64,
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 44, height: 44, flexShrink: 0, borderRadius: 6,
        background: "#242424", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid #2a2a2a",
        color: "#f97316", fontSize: 11, fontWeight: 700, textAlign: "center", padding: "2px",
      }}>
        {item.photo_url
          ? <img src={item.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : item.brand?.split(' ')[0]}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: brand + model + badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
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

        {/* Row 2: mag + reticle */}
        {(item.magnification || item.reticle) && (
          <div style={{ color: "#a3a3a3", fontSize: 12, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {[item.magnification, item.reticle].filter(Boolean).join(" · ")}
          </div>
        )}

        {/* Row 3: mounted on */}
        {mounted && (
          <div style={{ color: "#a3a3a3", fontSize: 11, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            on {item.mounted_on_firearm_name}
          </div>
        )}
      </div>
    </div>
  );
}