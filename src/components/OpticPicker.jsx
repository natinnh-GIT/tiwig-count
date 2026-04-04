import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown } from "lucide-react";

const S = {
  label: { display: "block", color: "#a3a3a3", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 },
  button: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#f5f5f5", padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, background: "#1a1a1a", border: "1px solid #2a2a2a", borderTop: "none", borderRadius: "0 0 3px 3px", maxHeight: 200, overflowY: "auto", zIndex: 50 },
  item: { padding: "10px 12px", cursor: "pointer", color: "#f5f5f5", fontSize: 13, borderBottom: "1px solid #242424" },
  itemHover: { background: "#242424" },
  divider: { padding: "6px 12px", color: "#6b7280", fontSize: 11, fontWeight: 700, background: "#0f0f0f", textTransform: "uppercase", letterSpacing: "0.05em", borderTop: "1px solid #2a2a2a" },
};

export default function OpticPicker({ value, onChange }) {
  const [optics, setOptics] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    base44.entities.Optic.list().then(setOptics);
  }, []);

  const selected = optics.find(o => o.id === value);
  const unmounted = optics.filter(o => !o.mounted_on_firearm_id);
  const mounted = optics.filter(o => o.mounted_on_firearm_id);

  const handleSelect = (optId) => {
    onChange(optId);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <label style={S.label}>Optic</label>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={S.button}
      >
        <span>{selected ? `${selected.brand} ${selected.model}`.trim() : "Select optic..."}</span>
        <ChevronDown style={{ width: 16, height: 16, color: "#6b7280", flexShrink: 0 }} />
      </button>
      {showDropdown && (
        <div style={S.dropdown}>
          {unmounted.length > 0 && unmounted.map((o, i) => (
            <div
              key={o.id}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => handleSelect(o.id)}
              style={{ ...S.item, ...(hoveredIdx === i ? S.itemHover : {}) }}
            >
              {o.brand} {o.model}
            </div>
          ))}
          {mounted.length > 0 && (
            <>
              {unmounted.length > 0 && <div style={S.divider}>Mounted</div>}
              {mounted.map((o) => (
                <div
                  key={o.id}
                  onClick={() => handleSelect(o.id)}
                  style={{ ...S.item, color: "#a3a3a3", fontStyle: "italic" }}
                >
                  {o.brand} {o.model} — on {o.mounted_on_firearm_name}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}