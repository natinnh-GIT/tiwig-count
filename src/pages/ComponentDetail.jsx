import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Pencil, Trash2, Package } from "lucide-react";
import ComponentModal from "@/components/ComponentModal";

const fmtDate = (d) => {
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(y, m - 1, day));
  }
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
};

const fmtDateTime = (d) => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(d));
};

const CAT_COLORS = {
  brass: "#b45309", bullets: "#2563eb", powder: "#16a34a", primers: "#dc2626",
};
const CAT_LABELS = {
  brass: "Brass / Casings", bullets: "Bullets / Projectiles", powder: "Powder", primers: "Primers",
};

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
      <span className="text-xs uppercase tracking-wider" style={{ color: "#a3a3a3" }}>{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]" style={{ color: "#f5f5f5" }}>{value}</span>
    </div>
  );
}

function BarcodeDisplay({ value }) {
  if (!value) return null;
  const bars = [];
  for (let i = 0; i < value.length * 4 + 20; i++) {
    const charCode = value.charCodeAt(i % value.length) + i;
    bars.push({ wide: (charCode + i) % 3 === 0, space: i % 2 === 0 });
  }
  return (
    <div className="py-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
      <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: "#a3a3a3" }}>Barcode</span>
      <div className="flex flex-col items-center p-3" style={{ background: "#fff", borderRadius: "2px" }}>
        <div className="flex items-stretch h-12 gap-px">
          {bars.map((bar, i) =>
            bar.space ? (
              <div key={i} className={bar.wide ? "w-1.5" : "w-0.5"} />
            ) : (
              <div key={i} className={`bg-black h-full ${bar.wide ? "w-1.5" : "w-0.5"}`} />
            )
          )}
        </div>
        <span className="mt-1.5 text-xs font-mono tracking-widest text-black select-all">{value}</span>
      </div>
    </div>
  );
}

export default function ComponentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [locationNames, setLocationNames] = useState([]);

  const load = async () => {
    const data = await base44.entities.Component.list();
    const found = data.find((c) => c.id === id);
    setItem(found || null);
    setLoading(false);
    if (found?.location_ids?.length) {
      const allLocs = await base44.entities.Location.list();
      setLocationNames(allLocs.filter((l) => found.location_ids.includes(l.id)).map((l) => l.name));
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;
    await base44.entities.Component.delete(id);
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f" }}>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#f97316", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "#0f0f0f" }}>
        <Package className="w-10 h-10" style={{ color: "#2a2a2a" }} />
        <p style={{ color: "#a3a3a3" }}>Item not found</p>
        <button onClick={() => navigate("/home")} className="px-4 py-2 text-sm" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "2px", color: "#f5f5f5" }}>
          Back
        </button>
      </div>
    );
  }

  const accentColor = CAT_COLORS[item.category] || "#f97316";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0f0f" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: "#111111", borderBottom: "1px solid #2a2a2a" }}
      >
        <button onClick={() => navigate("/home")} className="p-1" style={{ color: "#a3a3a3" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-sm truncate max-w-[55%]" style={{ color: "#f5f5f5" }}>{item.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="p-1.5"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "2px", color: "#a3a3a3" }}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "2px", color: "#ef4444" }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {/* Photos */}
        {item.photo_url || item.photo_url_2 ? (
          <div className={`w-full grid ${item.photo_url && item.photo_url_2 ? "grid-cols-2" : "grid-cols-1"} max-h-56 overflow-hidden`} style={{ background: "#1a1a1a" }}>
            {item.photo_url && (
              <div className="aspect-square overflow-hidden">
                <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}
            {item.photo_url_2 && (
              <div className="aspect-square overflow-hidden">
                <img src={item.photo_url_2} alt={`${item.name} (2)`} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full h-32 flex items-center justify-center text-3xl font-bold"
            style={{ background: "#1a1a1a", color: accentColor }}
          >
            {CAT_LABELS[item.category]?.[0]}
          </div>
        )}

        <div className="px-4 pt-4">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-xl font-bold" style={{ color: "#f5f5f5" }}>{item.name}</h2>
            <span
              className="flex-shrink-0 text-xs font-semibold px-2 py-0.5"
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
          {item.description && <p className="text-sm mb-4" style={{ color: "#a3a3a3" }}>{item.description}</p>}

          {/* Quantity highlight */}
          <div
            className="flex items-center justify-between px-4 py-3 mb-4"
            style={{ background: "#1a1a1a", border: `1px solid ${accentColor}44`, borderRadius: "3px" }}
          >
            <span className="text-xs uppercase tracking-wider" style={{ color: "#a3a3a3" }}>In Stock</span>
            <span className="text-3xl font-bold" style={{ color: "#f97316" }}>
              {item.quantity ?? 0}
              <span className="text-sm font-normal ml-1" style={{ color: "#a3a3a3" }}>{item.unit || "count"}</span>
            </span>
          </div>

          {/* Details */}
          <div
            className="px-4 mb-4"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px" }}
          >
            <Row label="Brand" value={item.brand} />
            <Row label="Caliber / Type" value={item.caliber} />
            <Row label="Lot #" value={item.lot_number} />
            <Row label="Cost Per Unit" value={item.cost_per_unit ? `$${Number(item.cost_per_unit).toFixed(4)}` : null} />
            <Row label="Total Cost" value={item.total_cost ? `$${Number(item.total_cost).toFixed(2)}` : null} />
            <Row label="Purchase Date" value={item.purchase_date ? fmtDate(item.purchase_date) : null} />
            <Row label="Purchased From" value={item.purchased_from} />
            <BarcodeDisplay value={item.barcode} />
            <Row label="Storage Location" value={locationNames.length > 0 ? locationNames.join(", ") : null} />
          </div>

          {/* Timestamps */}
          <div
            className="px-4 mb-4"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px" }}
          >
            <Row label="Created" value={item.created_date ? fmtDateTime(item.created_date) : null} />
            <Row label="Last Modified" value={item.updated_date ? fmtDateTime(item.updated_date) : null} />
          </div>
        </div>
      </div>

      {showEdit && (
        <ComponentModal item={item} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />
      )}
    </div>
  );
}