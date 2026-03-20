import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import ComponentModal from "@/components/ComponentModal";
const fmtDate = (d) => {
  // Parse date-only strings (YYYY-MM-DD) without timezone conversion
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(y, m - 1, day));
  }
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
};
const fmtDateTime = (d) => {
  const date = new Date(d);
  return new Intl.DateTimeFormat("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric", 
    hour: "numeric", 
    minute: "2-digit", 
    hour12: true 
  }).format(date);
};

const CATEGORY_COLORS = {
  brass: "bg-amber-100 text-amber-700",
  bullets: "bg-blue-100 text-blue-700",
  powder: "bg-green-100 text-green-700",
  primers: "bg-red-100 text-red-700",
};

const CATEGORY_LABELS = {
  brass: "Brass / Casings",
  bullets: "Bullets / Projectiles",
  powder: "Powder",
  primers: "Primers",
};

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function ComponentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const load = async () => {
    const data = await base44.entities.Component.list();
    const found = data.find((c) => c.id === id);
    setItem(found || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;
    await base44.entities.Component.delete(id);
    navigate("/");
  };

  const handleSaved = () => {
    setShowEdit(false);
    load();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Package className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Item not found</p>
        <Button variant="outline" onClick={() => navigate("/")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="font-semibold text-sm truncate max-w-[60%]">{item.name}</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowEdit(true)} className="p-1.5 rounded-lg bg-muted text-muted-foreground">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className="p-1.5 rounded-lg bg-muted text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {/* Photo */}
        {item.photo_url ? (
          <div className="w-full aspect-square max-h-64 overflow-hidden bg-muted">
            <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`w-full h-40 flex items-center justify-center text-4xl font-bold ${CATEGORY_COLORS[item.category]}`}>
            {CATEGORY_LABELS[item.category]?.[0]}
          </div>
        )}

        <div className="px-4 pt-4">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-xl font-bold text-foreground">{item.name}</h2>
            <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full ${CATEGORY_COLORS[item.category]}`}>
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
          )}

          {/* Quantity highlight */}
          <div className="bg-primary/5 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">In Stock</span>
            <span className="text-3xl font-bold text-primary">
              {item.quantity ?? 0}
              <span className="text-base font-normal text-muted-foreground ml-1">{item.unit || "count"}</span>
            </span>
          </div>

          {/* Details */}
          <div className="bg-card rounded-2xl border border-border px-4 mb-4">
            <Row label="Brand" value={item.brand} />
            <Row label="Caliber / Type" value={item.caliber} />
            <Row label="Lot #" value={item.lot_number} />
            <Row label="Cost Per Unit" value={item.cost_per_unit ? `$${Number(item.cost_per_unit).toFixed(2)}` : null} />
            <Row label="Total Cost" value={item.total_cost ? `$${Number(item.total_cost).toFixed(2)}` : null} />
            <Row label="Purchase Date" value={item.purchase_date ? fmtDate(item.purchase_date) : null} />
            <Row label="Purchased From" value={item.purchased_from} />
            <Row label="Barcode" value={item.barcode} />
          </div>

          {/* Timestamps */}
          <div className="bg-card rounded-2xl border border-border px-4 mb-4">
            <Row label="Created" value={item.created_date ? fmtDateTime(item.created_date) : null} />
            <Row label="Last Modified" value={item.updated_date ? fmtDateTime(item.updated_date) : null} />
          </div>
        </div>
      </div>

      {showEdit && (
        <ComponentModal item={item} onClose={() => setShowEdit(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}