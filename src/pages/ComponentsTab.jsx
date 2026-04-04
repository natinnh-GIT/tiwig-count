import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Package } from "lucide-react";
import ComponentCard from "@/components/ComponentCard";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "brass", label: "Brass" },
  { id: "bullets", label: "Bullets" },
  { id: "powder", label: "Powder" },
  { id: "primers", label: "Primers" },
];

export default function ComponentsTab({ search, onEdit }) {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    base44.entities.Component.list("-created_date", 200).then((data) => {
      setComponents(data);
      setLoading(false);
    });
  }, []);

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
              className="px-3 py-1 text-xs font-semibold flex-shrink-0 transition-colors"
              style={{
                background: isActive ? "#f97316" : "#1a1a1a",
                color: isActive ? "#fff" : "#a3a3a3",
                borderRadius: "2px",
                border: isActive ? "1px solid #f97316" : "1px solid #2a2a2a",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Count row */}
      <div className="px-4 py-2">
        <span className="text-xs" style={{ color: "#737373" }}>
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="px-3 space-y-2 pb-4">
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
          filtered.map((item) => (
            <ComponentCard key={item.id} item={item} onEdit={onEdit} onRefresh={() => {
              base44.entities.Component.list("-created_date", 200).then(setComponents);
            }} />
          ))
        )}
      </div>
    </div>
  );
}