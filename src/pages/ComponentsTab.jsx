import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Package, Plus } from "lucide-react";
import ComponentCard from "@/components/ComponentCard";
import ComponentModal from "@/components/ComponentModal";
import ExportMenu from "@/components/ExportMenu";

const COMPONENT_COLUMNS = [
  { key: "name",            label: "Name" },
  { key: "category",        label: "Category" },
  { key: "brand",           label: "Brand" },
  { key: "caliber",         label: "Caliber" },
  { key: "condition",       label: "Condition" },
  { key: "lot_number",      label: "Lot #" },
  { key: "bullet_weight",   label: "Bullet Weight (gr)" },
  { key: "bullet_type",     label: "Bullet Type" },
  { key: "primer_type",     label: "Primer Type" },
  { key: "burn_rate",       label: "Burn Rate" },
  { key: "total_unit_count",    label: "Primer Count" },
  { key: "total_bullet_count",  label: "Bullet Count" },
  { key: "powder_lbs",     label: "Powder (lbs)" },
  { key: "powder_grains",  label: "Powder (gr)" },
  { key: "total_cases",    label: "Brass Cases" },
  { key: "total_cost",     label: "Total Cost ($)" },
  { key: "current_value",  label: "Current Value ($)" },
  { key: "cost_per_unit",  label: "Cost/Unit ($)" },
  { key: "purchase_date",  label: "Purchase Date" },
  { key: "purchased_from", label: "Purchased From" },
  { key: "notes",          label: "Notes" },
];

const CATEGORIES = [
  { id: "all",     label: "All" },
  { id: "brass",   label: "Brass" },
  { id: "bullets", label: "Bullets" },
  { id: "powder",  label: "Powder" },
  { id: "primers", label: "Primers" },
];

export default function ComponentsTab({ search, onCountChange, initialCategory }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory || "all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadComponents();
  }, []);

  useEffect(() => {
    const filtered = components.filter(c => activeCategory === "all" || c.category === activeCategory);
    onCountChange?.(filtered.length);
  }, [components, activeCategory, onCountChange]);

  const loadComponents = () => {
    base44.entities.Component.list("-created_date", 200).then(data => {
      setComponents(data);
      setLoading(false);
    });
  };

  const filtered = components.filter(c => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const q = (search || "").toLowerCase();
    const matchSearch = !q ||
      c.name?.toLowerCase().includes(q) ||
      c.caliber?.toLowerCase().includes(q) ||
      c.brand?.toLowerCase().includes(q) ||
      c.barcode?.includes(q);
    return matchCat && matchSearch;
  });

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Sticky header */}
      <div style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 14 }}>Components</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExportMenu
            getData={() => filtered}
            filename={`components-${activeCategory}`}
            columns={COMPONENT_COLUMNS}
            title={`Components — ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
          />
          <button
            onClick={handleAdd}
            style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 3, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 12 }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Add
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div style={{ background: "#111111", borderBottom: "1px solid #2a2a2a", padding: "8px 12px", display: "flex", gap: 6, overflowX: "auto", flexShrink: 0 }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: "10px 16px", fontSize: 13, fontWeight: 600, flexShrink: 0,
                minHeight: 44,
                background: isActive ? "#f97316" : "#242424",
                color: isActive ? "#ffffff" : "#6b7280",
                borderRadius: "4px",
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
      <div className="px-4 py-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 44 }}>
        <span style={{ color: "#737373", fontSize: 13 }}>
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
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 24, height: 24, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Package style={{ width: 36, height: 36, color: "#2a2a2a" }} />
          <p style={{ color: "#a3a3a3", fontSize: 14 }}>No components found</p>
          {activeCategory === "all" && (
            <button
              onClick={handleAdd}
              style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#f97316", padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              Add your first component
            </button>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map(item => (
            <ComponentCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {showModal && (
        <ComponentModal
          item={editingItem}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSaved={() => { setShowModal(false); setEditingItem(null); loadComponents(); }}
        />
      )}
    </div>
  );
}
