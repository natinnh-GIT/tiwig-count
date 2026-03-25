import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LocationPicker({ value = [], onChange }) {
  const [locations, setLocations] = useState([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    base44.entities.Location.list().then(setLocations);
  }, []);

  const selected = locations.filter((l) => value.includes(l.id));
  const unselected = locations.filter((l) => !value.includes(l.id));

  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const created = await base44.entities.Location.create({ name: newName.trim() });
    setLocations((prev) => [...prev, created]);
    onChange([...value, created.id]);
    setNewName("");
    setAdding(false);
  };

  return (
    <div className="space-y-2">
      {/* Selected locations */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((l) => (
            <span
              key={l.id}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
            >
              <MapPin className="w-3 h-3" />
              {l.name}
              <button onClick={() => toggle(l.id)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available locations */}
      {unselected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {unselected.map((l) => (
            <button
              key={l.id}
              onClick={() => toggle(l.id)}
              className="inline-flex items-center gap-1 border border-border text-muted-foreground text-xs px-2 py-1 rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              <MapPin className="w-3 h-3" />
              {l.name}
            </button>
          ))}
        </div>
      )}

      {/* Add new */}
      {adding ? (
        <div className="flex gap-2 items-center">
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Location name..."
            className="h-7 text-xs"
          />
          <button onClick={handleCreate} className="text-xs text-primary font-medium">Add</button>
          <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
          New location
        </button>
      )}
    </div>
  );
}