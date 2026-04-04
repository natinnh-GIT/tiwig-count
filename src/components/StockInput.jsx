import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown } from "lucide-react";

const PRESET_OPTIONS = ["Factory", "Wood", "Chassis", "Laminate", "Thumbhole", "Folding", "Other"];

const S = {
  label: { display: "block", color: "#a3a3a3", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 },
  wrapper: { position: "relative" },
  dropdownBtn: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, color: "#f5f5f5", padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, background: "#1a1a1a", border: "1px solid #2a2a2a", borderTop: "none", borderRadius: "0 0 2px 2px", maxHeight: 180, overflowY: "auto", zIndex: 50, marginTop: -8 },
  item: { padding: "8px 12px", cursor: "pointer", color: "#f5f5f5", fontSize: 13, borderBottom: "1px solid #242424" },
  itemHover: { background: "#242424" },
  input: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, color: "#f5f5f5", padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 8 },
  saveBtn: { background: "transparent", border: "1px solid #f97316", borderRadius: 2, color: "#f97316", padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%" },
};

export default function StockInput({ value, onChange }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customOptions, setCustomOptions] = useState([]);
  const [inputValue, setInputValue] = useState(value || "");
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    loadCustomOptions();
  }, []);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const loadCustomOptions = async () => {
    const opts = await base44.entities.StockOption.list();
    setCustomOptions(opts.map(o => o.value));
  };

  const allOptions = [...new Set([...PRESET_OPTIONS, ...customOptions])];

  const handleSelectOption = (opt) => {
    setInputValue(opt);
    onChange(opt);
    setShowDropdown(false);
  };

  const handleSaveAsOption = async () => {
    if (!inputValue.trim() || customOptions.includes(inputValue)) return;
    await base44.entities.StockOption.create({ value: inputValue });
    setCustomOptions([...customOptions, inputValue]);
  };

  return (
    <div style={S.label}>
      <label style={S.label}>Stock</label>
      <div style={S.wrapper}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={S.dropdownBtn}
        >
          <span>Select stock type...</span>
          <ChevronDown style={{ width: 16, height: 16, color: "#6b7280", flexShrink: 0 }} />
        </button>

        {showDropdown && (
          <div style={S.dropdown}>
            {allOptions.map((opt, i) => (
              <div
                key={opt}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => handleSelectOption(opt)}
                style={{ ...S.item, ...(hoveredIdx === i ? S.itemHover : {}) }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="Type or select from dropdown..."
          style={S.input}
        />

        {inputValue && !PRESET_OPTIONS.includes(inputValue) && !customOptions.includes(inputValue) && (
          <button onClick={handleSaveAsOption} style={S.saveBtn}>
            Save as option
          </button>
        )}
      </div>
    </div>
  );
}