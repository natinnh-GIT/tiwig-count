import { Pencil, Trash2, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const CAT_COLORS = {
  brass: "#b45309",
  bullets: "#2563eb",
  powder: "#16a34a",
  primers: "#dc2626",
};

const CAT_LABELS = {
  brass: "Brass",
  bullets: "Bullets",
  powder: "Powder",
  primers: "Primers",
};

export default function ComponentCard({ item, onEdit, onRefresh }) {
  const navigate = useNavigate();
  const [locationNames, setLocationNames] = useState([]);

  useEffect(() => {
    if (item.location_ids?.length) {
      base44.entities.Location.list().then((all) => {
        setLocationNames(all.filter((l) => item.location_ids.includes(l.id)).map((l) => l.name));
      });
    }
  }, [item.location_ids]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this item?")) return;
    await base44.entities.Component.delete(item.id);
    onRefresh();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(item);
  };

  const accentColor = CAT_COLORS[item.category] || "#f97316";

  return (
    <div
      className="flex gap-3 cursor-pointer active:opacity-70 transition-opacity"
      style={{
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: "3px",
        padding: "10px 12px",
      }}
      onClick={() => navigate(`/component/${item.id}`)}
    >
      {/* Photo / Thumb */}
      <div
        className="w-14 h-14 flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold"
        style={{
          background: "#242424",
          borderRadius: "2px",
          color: accentColor,
          border: `1px solid #2a2a2a`,
        }}
      >
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          CAT_LABELS[item.category]?.[0]
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <p className="font-semibold text-sm truncate" style={{ color: "#f5f5f5" }}>{item.name}</p>
          <span
            className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5"
            style={{
              background: `${accentColor}22`,
              color: accentColor,
              borderRadius: "2px",
              border: `1px solid ${accentColor}44`,
            }}
          >
            {CAT_LABELS[item.category]}
          </span>
        </div>

        {(item.brand || item.caliber) && (
          <p className="text-xs truncate mb-1" style={{ color: "#a3a3a3" }}>
            {[item.brand, item.caliber].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold leading-none" style={{ color: "#f97316" }}>
              {item.quantity ?? 0}
              <span className="text-xs font-normal ml-1" style={{ color: "#a3a3a3" }}>{item.unit || "count"}</span>
            </p>
            {item.total_cost ? (
              <p className="text-[11px] mt-0.5" style={{ color: "#737373" }}>${Number(item.total_cost).toFixed(2)}</p>
            ) : null}
            {locationNames.length > 0 && (
              <p className="text-[11px] flex items-center gap-0.5 mt-0.5" style={{ color: "#737373" }}>
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {locationNames.join(", ")}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleEdit}
              className="p-1.5 transition-colors"
              style={{ background: "#242424", borderRadius: "2px", color: "#a3a3a3" }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 transition-colors"
              style={{ background: "#242424", borderRadius: "2px", color: "#ef4444" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}