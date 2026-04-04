import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const CAT_LABELS = { brass: "BRASS", bullets: "BULLETS", powder: "POWDER", primers: "PRIMERS" };

export default function ComponentCardNew({ item, onEdit, onRefresh }) {
  const navigate = useNavigate();
  const [locationNames, setLocationNames] = useState([]);

  useEffect(() => {
    if (item.location_ids?.length) {
      base44.entities.Location.list().then((all) => {
        setLocationNames(all.filter((l) => item.location_ids.includes(l.id)).map((l) => l.name));
      });
    }
  }, [item.location_ids]);

  return (
    <div
      onClick={() => navigate(`/component/${item.id}`)}
      style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3,
        padding: "12px 14px", cursor: "pointer", display: "flex", gap: 12,
      }}
    >
      {/* Photo */}
      <div style={{ width: 60, height: 60, borderRadius: 2, overflow: "hidden", background: "#242424", flexShrink: 0 }}>
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", fontSize: 18, fontWeight: 700 }}>
            {item.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: name + badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.name}
          </span>
          <span style={{ background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 2, flexShrink: 0, letterSpacing: "0.06em" }}>
            {CAT_LABELS[item.category]}
          </span>
        </div>

        {/* Row 2: brand + caliber */}
        {(item.brand || item.caliber) && (
          <p style={{ color: "#a3a3a3", fontSize: 12, marginBottom: 4 }}>
            {[item.brand, item.caliber].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Row 3: quantity */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
          <span style={{ color: "#f97316", fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{item.quantity ?? 0}</span>
          <span style={{ color: "#a3a3a3", fontSize: 11 }}>{item.unit || "count"}</span>
        </div>

        {/* Row 4: cost + location */}
        <div>
          {item.cost_per_unit && (
            <span style={{ color: "#525252", fontSize: 11 }}>${Number(item.cost_per_unit).toFixed(4)}/unit</span>
          )}
          {locationNames.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
              <MapPin style={{ width: 10, height: 10, color: "#525252" }} />
              <span style={{ color: "#525252", fontSize: 10 }}>{locationNames.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}