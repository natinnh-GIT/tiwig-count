import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Package } from "lucide-react";
import ComponentCard from "@/components/ComponentCard";
import ExportMenu from "@/components/ExportMenu";

const COMPONENT_COLUMNS = [
  { key: "name",           label: "Name" },
  { key: "category",       label: "Category" },
  { key: "brand",          label: "Brand" },
  { key: "caliber",        label: "Caliber" },
  { key: "lot_number",     label: "Lot #" },
  { key: "total_unit_count",   label: "Primer Count" },
  { key: "total_bullet_count", label: "Bullet Count" },
  { key: "powder_lbs",    label: "Powder (lbs)" },
  { key: "powder_grains", label: "Powder (gr)" },
  { key: "total_cases",   label: "Brass Cases" },
  { key: "total_cost",    label: "Total Cost ($)" },
  { key: "cost_per_unit", label: "Cost/Unit ($)" },
  { key: "purchase_date", label: "Purchase Date" },
  { key: "purchased_from",label: "Purchased From" },
  { key: "notes",         label: "Notes" },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "brass", label: "Brass" },
  { id: "bullets", label: "Bullets" },
  { id: "powder", label: "Powder" },
  { id: "primers", label: "Primers" },
];

export default function ComponentsTab({ search, onEdit, onCountChange, initialCategory }) {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory || "all");

  useEffect(() => {
    base44.entities.Component.list("-created_date", 200).then((data) => {
      setComponents(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filtered = components.filter(c => activeCategory === "all" || c.category === activeCategory);
    onCountChange?.(filtered.length);
  }, [components, activeCategory, onCountChange]);

  const filtered = components.filter((c) => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const q = (search || "").toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.caliber?.toLowerCase().includes(q) ||
      c.brand?.toLowerCase().includes(q) ||
      c.barcode?.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* Category filter */}
      <div
        className="flex gap-1 px-3 py-2 overflow-x-auto flex-shrink-0"
        style={{ background: "#111111", borderBottom: "1px solid #2a2a2a" }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: "4px 12px", fontSize: 11, fontWeight: 600, flexShrink: 0,
                background: isActive ? "#f97316" : "#242424",
                color: isActive ? "#ffffff" : "#6b7280",
                borderRadius: "2px",
                border: isActive ? "1px solid #f97316" : "1px solid #2a2a2a",
                cursor: "pointer",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Count + Export row */}
      <div className="px-4 py-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="text-xs" style={{ color: "#737373" }}>
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
        <ExportMenu
          getData={() => filtered}
          filename={`components-${activeCategory}`}
          columns={COMPONENT_COLUMNS}
          title={`Components — ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
        />
      </div>

      {/* List */}
      <div style={{ paddingBottom: 16 }}>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#f97316", borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package className="w-10 h-10 mb-3" style={{ color: "#2a2a2a" }} />
            <p className="text-sm" style={{ color: "#a3a3a3" }}>No components found</p>
            <p className="text-xs mt-1" style={{ color: "#737373" }}>Tap + to add your first item</p>
          </div>
        ) : (
          <div style={{ background: "#1a1a1a", borderRadius: 3, overflow: "hidden", border: "1px solid #2a2a2a" }}>
            {filtered.map((item, idx) => (
              <ComponentCard key={item.id} item={item} onEdit={onEdit} onRefresh={() => {
                base44.entities.Component.list("-created_date", 200).then(setComponents);
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}