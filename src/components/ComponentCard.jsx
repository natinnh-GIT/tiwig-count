import { useNavigate } from "react-router-dom";

// STEP 1 — category color system
const CAT = {
  brass:   { bg: "#78350f", text: "#fde68a", border: "#ca8a04", label: "BRASS" },
  bullets: { bg: "#1e3a8a", text: "#bfdbfe", border: "#2563eb", label: "BULLETS" },
  powder:  { bg: "#7c2d12", text: "#fed7aa", border: "#c2410c", label: "POWDER" },
  primers: { bg: "#14532d", text: "#bbf7d0", border: "#16a34a", label: "PRIMERS" },
};

export default function ComponentCard({ item }) {
  const navigate = useNavigate();
  const cat = CAT[item.category] || { bg: "#1a1a1a", text: "#f97316", border: "#f97316", label: (item.category || "").toUpperCase() };

  return (
    <div
      onClick={() => navigate(`/component/${item.id}`)}
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
        border: `1px solid ${cat.border}33`,
        color: cat.text, fontSize: 12, fontWeight: 800,
      }}>
        {item.photo_url
          ? <img src={item.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : cat.label[0]}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: name + badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {item.name}
          </span>
          <span style={{
            background: cat.bg, color: cat.text, border: `1px solid ${cat.border}`,
            fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 2,
            flexShrink: 0, letterSpacing: "0.06em",
          }}>
            {cat.label}
          </span>
        </div>

        {/* Row 2: brand · caliber */}
        {(item.brand || item.caliber) && (
          <div style={{ color: "#a3a3a3", fontSize: 12, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {[item.brand, item.caliber].filter(Boolean).join(" · ")}
          </div>
        )}

        {/* Row 3: cost left, qty right */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ color: "#6b7280", fontSize: 11 }}>
            {item.cost_per_unit ? `$${Number(item.cost_per_unit).toFixed(4)}/ea` : ""}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ color: "#f97316", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{item.quantity ?? 0}</span>
            <span style={{ color: "#6b7280", fontSize: 11 }}>{item.unit || "count"}</span>
          </div>
        </div>
      </div>


    </div>
  );
}