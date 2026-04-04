import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown } from "lucide-react";

const S = {
  label: { display: "block", color: "#a3a3a3", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 },
  wrapper: { position: "relative" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  input: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, color: "#f5f5f5", padding: "9px 12px 9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", paddingRight: 32 },
  chevron: { position: "absolute", right: 10, width: 16, height: 16, color: "#6b7280", pointerEvents: "none", flexShrink: 0 },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, background: "#1a1a1a", border: "1px solid #2a2a2a", borderTop: "none", borderRadius: "0 0 2px 2px", maxHeight: 180, overflowY: "auto", zIndex: 50, marginTop: -1 },
  item: { padding: "8px 12px", cursor: "pointer", color: "#f5f5f5", fontSize: 13, borderBottom: "1px solid #242424" },
  itemHover: { background: "#242424" },
  saveBtn: { marginTop: 6, background: "transparent", border: "1px solid #f97316", borderRadius: 2, color: "#f97316", padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%" },
};

export default function EditableCombobox({ label, value, onChange, presetOptions, entityName }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customOptions, setCustomOptions] = useState([]);
  const [inputValue, setInputValue] = useState(value || "");
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    loadCustomOptions();
  }, [entityName]);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCustomOptions = async () => {
    if (!entityName) return;
    const opts = await base44.entities[entityName].list();
    setCustomOptions(opts.map(o => o.value));
  };

  const allOptions = [...new Set([...presetOptions, ...customOptions])];
  const isModified = inputValue && !allOptions.includes(inputValue);
  const canSave = isModified && inputValue.trim() !== "";

  const handleSelectOption = (opt) => {
    setInputValue(opt);
    onChange(opt);
    setShowDropdown(false);
  };

  const handleSaveToList = async () => {
    if (!canSave) return;
    await base44.entities[entityName].create({ value: inputValue });
    setCustomOptions([...customOptions, inputValue]);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div>
      <label style={S.label}>{label}</label>
      <div style={S.wrapper} ref={wrapperRef}>
        <div style={S.inputWrapper}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onClick={() => setShowDropdown(true)}
            placeholder="Select or type..."
            style={S.input}
          />
          <ChevronDown
            style={{ ...S.chevron, cursor: "pointer" }}
            onClick={() => setShowDropdown(!showDropdown)}
          />
        </div>

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

        {canSave && (
          <button onClick={handleSaveToList} style={S.saveBtn}>
            ＋ Save to list
          </button>
        )}
      </div>
    </div>
  );
}