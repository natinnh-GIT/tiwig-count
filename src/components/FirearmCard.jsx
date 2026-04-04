import { useNavigate } from "react-router-dom";
import { CategoryPill } from "@/lib/categoryPill";

export default function FirearmCard({ item }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/firearm/${item.id}`, { state: { from: "firearms" } });
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
        border: "1px solid #2a2a2a",
        color: "#f97316", fontSize: 12, fontWeight: 800,
      }}>
        {item.photo_url
          ? <img src={item.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : item.name?.[0]?.toUpperCase()}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: name + type badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {item.name}
          </span>
          {item.type && <CategoryPill value={item.type} isFirearmType={true} />}
        </div>

        {/* Row 2: make/model */}
        {(item.make || item.model) && (
          <div style={{ color: "#a3a3a3", fontSize: 12, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {[item.make, item.model].filter(Boolean).join(" ")}
          </div>
        )}

        {/* Row 3: caliber */}
        {item.caliber && (
          <div style={{ color: "#6b7280", fontSize: 11 }}>
            {item.caliber}
          </div>
        )}
      </div>
    </div>
  );
}