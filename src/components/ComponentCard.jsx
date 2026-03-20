import { Pencil, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORY_COLORS = {
  brass: "bg-amber-100 text-amber-700",
  bullets: "bg-blue-100 text-blue-700",
  powder: "bg-green-100 text-green-700",
  primers: "bg-red-100 text-red-700",
};

const CATEGORY_LABELS = {
  brass: "Brass",
  bullets: "Bullets",
  powder: "Powder",
  primers: "Primers",
};

import { useNavigate } from "react-router-dom";

export default function ComponentCard({ item, onEdit, onRefresh }) {
  const navigate = useNavigate();
  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;
    await base44.entities.Component.delete(item.id);
    onRefresh();
  };

  return (
    <div className="flex gap-3 bg-card rounded-2xl p-3 border border-border shadow-sm">
      {/* Photo */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${CATEGORY_COLORS[item.category]}`}>
            {CATEGORY_LABELS[item.category]?.[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
          <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category]}`}>
            {CATEGORY_LABELS[item.category]}
          </span>
        </div>
        {item.brand && <p className="text-xs text-muted-foreground truncate">{item.brand}</p>}
        {item.caliber && <p className="text-xs text-muted-foreground">{item.caliber}</p>}
        <div className="flex items-center justify-between mt-1">
          <p className="text-base font-bold text-foreground">
            {item.quantity ?? 0}
            <span className="text-xs font-normal text-muted-foreground ml-1">{item.unit || "count"}</span>
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}