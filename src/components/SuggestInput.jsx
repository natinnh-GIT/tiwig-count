import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SuggestInput({ value, onChange, suggestions = [], placeholder, className }) {
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

  const handleSelect = (s) => {
    onChange(s);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <Input
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={cn("mt-1", className)}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <li
              key={s}
              onMouseDown={() => handleSelect(s)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}