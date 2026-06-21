import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import ReloadingEquipCard from "@/components/ReloadingEquipCard";
import ReloadingEquipModal from "@/components/ReloadingEquipModal";
import ExportMenu from "@/components/ExportMenu";

const COLUMNS = [
  { key: "category",             label: "Category" },
  { key: "name",                 label: "Name" },
  { key: "type",                 label: "Type" },
  { key: "brand",                label: "Brand" },
  { key: "model",                label: "Model" },
  { key: "serial_number",        label: "Serial #" },
  { key: "condition",            label: "Condition" },
  { key: "caliber_compatibility",label: "Caliber Compatibility" },
  { key: "quantity",             label: "Quantity" },
  { key: "unit",                 label: "Unit" },
  { key: "purchase_date",        label: "Purchase Date" },
  { key: "purchased_from",       label: "Purchased From" },
  { key: "purchase_price",       label: "Purchase Price ($)" },
  { key: "current_value",        label: "Current Value ($)" },
  { key: "notes",                label: "Notes" },
];

const CATEGORIES = ["Equipment", "Consumable"];

export default function ReloadingEquipTab({ onCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Equipment");
  const filterRef = useRef(null);

  useEffect(() => { load(); }, []);
  useEffect(() => { onCountChange?.(items.length); }, [items.length, onCountChange]);

  const load = async () => {
    const data = await base44.entities.ReloadingEquip.list();
    setItems(data);
    setLoading(false);
  };

  const filtered = items.filter(i => (i.category || "Equipment") === activeCategory);

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Sticky header */}
      <div style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, minHeight: 52 }}>
        <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 16 }}>Bench</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ExportMenu
            getData={() => filtered}
            filename={`bench-${activeCategory.toLowerCase()}`}
            columns={COLUMNS}
            title={`Bench — ${activeCategory}s`}
          />
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 4, padding: "10px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14, minHeight: 44 }}
          >
            <Plus style={{ width: 18, height: 18 }} /> Add
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div
        ref={filterRef}
        style={{ display: "flex", gap: 8, padding: "10px 14px", overflowX: "auto", background: "#0f0f0f", position: "sticky", top: 52, zIndex: 9, flexShrink: 0 }}
      >
        {CATEGORIES.map(cat => {
          const isActive = cat === activeCategory;
          const count = items.filter(i => (i.category || "Equipment") === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "10px 18px", fontSize: 13, fontWeight: 700, flexShrink: 0,
                minHeight: 44,
                background: isActive ? "#f97316" : "#242424",
                color: isActive ? "#fff" : "#6b7280",
                borderRadius: 4,
                border: isActive ? "1px solid #f97316" : "1px solid #2a2a2a",
                cursor: "pointer",
              }}
            >
              {cat}s {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 28, height: 28, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <p style={{ color: "#a3a3a3", fontSize: 15 }}>No {activeCategory.toLowerCase()}s yet</p>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 4, color: "#f97316", padding: "12px 28px", cursor: "pointer", fontSize: 15, fontWeight: 600, minHeight: 48 }}
          >
            Add your first {activeCategory.toLowerCase()}
          </button>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          {filtered.map(i => <ReloadingEquipCard key={i.id} item={i} />)}
        </div>
      )}

      {showModal && (
        <ReloadingEquipModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
