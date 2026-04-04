import { useState, useRef, useEffect } from "react";

export default function SuggestInput({ value, onChange, suggestions = [], placeholder, darkStyle }) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    const q = val.toLowerCase();
    setFiltered(q ? suggestions.filter((s) => s.toLowerCase().includes(q)) : suggestions);
    setOpen(true);
  };

  const handleFocus = () => {
    const q = value?.toLowerCase() || "";
    setFiltered(q ? suggestions.filter((s) => s.toLowerCase().includes(q)) : suggestions);
    if (suggestions.length > 0) setOpen(true);
  };

  const handleSelect = (s) => { onChange(s); setOpen(false); };

  const inputStyle = darkStyle ? {
    width: "100%", background: "#242424", border: "1px solid #2a2a2a",
    borderRadius: 2, color: "#f5f5f5", padding: "9px 12px",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  } : {};

  const dropdownStyle = darkStyle ? {
    position: "absolute", zIndex: 50, top: "calc(100% + 2px)", left: 0, right: 0,
    background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)", maxHeight: 180, overflowY: "auto",
  } : {
    position: "absolute", zIndex: 50, top: "calc(100% + 2px)", left: 0, right: 0,
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: 180, overflowY: "auto",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {darkStyle ? (
        <input value={value} onChange={handleChange} onFocus={handleFocus} placeholder={placeholder} style={inputStyle} />
      ) : (
        <input
          value={value} onChange={handleChange} onFocus={handleFocus} placeholder={placeholder}
          className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
        />
      )}
      {open && filtered.length > 0 && (
        <ul style={dropdownStyle}>
          {filtered.map((s) => (
            <li
              key={s}
              onMouseDown={() => handleSelect(s)}
              style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", color: darkStyle ? "#f5f5f5" : "#111" }}
              onMouseEnter={(e) => e.currentTarget.style.background = darkStyle ? "#242424" : "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}