import { useNavigate } from "react-router-dom";
import { CategoryPill, getStyleForCategory } from "@/lib/categoryPill";

const ghost = { color: "#6b7280", fontSize: 12 };
const bigOrange = { color: "#f97316", fontWeight: 800, fontSize: 24, lineHeight: 1 };

function fmt4(n) {
  if (n === "" || n === undefined || n === null || isNaN(Number(n))) return null;
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
}
function fmtCount(n) { return Number(n || 0).toLocaleString("en-US"); }

export default function ComponentCard({ item }) {
  const navigate = useNavigate();
  const cat = getStyleForCategory(item.category);

  return (
    <div
      onClick={() => navigate(`/component/${item.id}`, { state: { from: "components" } })}
      style={{ background: "#1a1a1a", borderBottom: "1px solid #1f1f1f", padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, minHeight: 68 }}
    >
      {/* Thumbnail */}
      <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 6, background: "#242424", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${cat.border}33`, color: cat.text, fontSize: 12, fontWeight: 800 }}>
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

        {/* Row 3: unit cost (left) + quantity display (right) */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          {/* Unit cost — left */}
          <span style={ghost}>
            {item.category === "powder" && fmt4(item.cost_per_grain) ? `${fmt4(item.cost_per_grain)}/grain` : null}
            {item.category === "brass" && fmt4(item.cost_per_use) ? `${fmt4(item.cost_per_use)}/use` : null}
            {(item.category === "bullets" || item.category === "primers") && fmt4(item.cost_per_unit) ? `${fmt4(item.cost_per_unit)}/ea` : null}
          </span>

          {/* Quantity — right */}
          {item.category === "primers" && (
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end" }}>
                <span style={bigOrange}>{fmtCount(item.total_unit_count)}</span>
                <span style={ghost}>count</span>
              </div>
              <div style={ghost}>{item.sleeve_count || 0} Sleeves</div>
            </div>
          )}
          {item.category === "bullets" && (
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end" }}>
                <span style={bigOrange}>{fmtCount(item.total_bullet_count)}</span>
                <span style={ghost}>count</span>
              </div>
              <div style={ghost}>{item.box_count || 0} Boxes</div>
            </div>
          )}
          {item.category === "powder" && (
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end" }}>
                <span style={bigOrange}>{item.powder_lbs || 0}</span>
                <span style={ghost}>lbs</span>
              </div>
              <div style={ghost}>{fmtCount(item.powder_grains)} grains</div>
            </div>
          )}
          {item.category === "brass" && (
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end" }}>
                <span style={bigOrange}>{fmtCount(item.total_cases)}</span>
                <span style={ghost}>cases</span>
              </div>
              <div style={ghost}>{fmtCount(item.total_unit_uses)} uses</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}