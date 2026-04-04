import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, MapPin, Check } from "lucide-react";

export default function LocationPickerNew({ value = [], onChange }) {
  const [locations, setLocations] = useState([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => { base44.entities.Location.list().then(setLocations); }, []);

  const selected = locations.filter((l) => value.includes(l.id));
  const unselected = locations.filter((l) => !value.includes(l.id));

  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const created = await base44.entities.Location.create({ name: newName.trim() });
    setLocations((prev) => [...prev, created]);
    onChange([...value, created.id]);
    setNewName(""); setAdding(false);
  };

  const chipBase = { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 2, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid" };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {selected.map((l) => (
        <span key={l.id} style={{ ...chipBase, background: "#f97316", borderColor: "#f97316", color: "#fff" }}>
          <MapPin style={{ width: 10, height: 10 }} />
          {l.name}
          <button onClick={() => toggle(l.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 0, lineHeight: 1 }}>
            <X style={{ width: 10, height: 10 }} />
          </button>
        </span>
      ))}
      {unselected.map((l) => (
        <button key={l.id} onClick={() => toggle(l.id)} style={{ ...chipBase, background: "#242424", borderColor: "#2a2a2a", color: "#a3a3a3" }}>
          <MapPin style={{ width: 10, height: 10 }} />
          {l.name}
        </button>
      ))}
      {adding ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", width: "100%", marginTop: 4 }}>
          <input
            autoFocus value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Location name…"
            style={{ flex: 1, background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, color: "#f5f5f5", padding: "6px 10px", fontSize: 12, outline: "none" }}
          />
          <button onClick={handleCreate} style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e" }}><Check style={{ width: 16, height: 16 }} /></button>
          <button onClick={() => setAdding(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3" }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 2, fontSize: 11, background: "none", border: "1px dashed #2a2a2a", color: "#525252", cursor: "pointer" }}
        >
          <Plus style={{ width: 10, height: 10 }} /> New location
        </button>
      )}
    </div>
  );
}