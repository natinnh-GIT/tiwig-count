import { useNavigate } from "react-router-dom";
import { CategoryPill, getStyleForCategory } from "@/lib/categoryPill";
import { formatCurrency } from "@/lib/currencyFormatter";

export default function ComponentCard({ item }) {
  const navigate = useNavigate();
  const cat = getStyleForCategory(item.category);

  const handleClick = () => {
    navigate(`/component/${item.id}`, { state: { from: "components" } });
  };

  return (
    <div
      onClick={handleClick}
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
          : item.category?.[0]?.toUpperCase()}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: name + badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {item.name}
          </span>
          <CategoryPill value={item.category} />
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
            {item.cost_per_unit ? `${formatCurrency(item.cost_per_unit)}/ea` : ""}
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