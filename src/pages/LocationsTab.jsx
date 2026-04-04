import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, MapPin, Check, X } from "lucide-react";

export default function LocationsTab() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    const data = await base44.entities.Location.list();
    setLocations(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await base44.entities.Location.create({ name: newName.trim() });
    setNewName("");
    setAdding(false);
    load();
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    await base44.entities.Location.update(id, { name: editName.trim() });
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this location?")) return;
    await base44.entities.Location.delete(id);
    load();
  };

  const inputStyle = {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "2px",
    color: "#f5f5f5",
    padding: "8px 12px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "#a3a3a3" }}>Storage Locations</h2>
        <button
          onClick={() => { setAdding(true); setNewName(""); }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold"
          style={{ background: "#f97316", color: "#fff", borderRadius: "2px" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {adding && (
        <div
          className="flex gap-2 mb-3 p-3"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px" }}
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Location name…"
            style={inputStyle}
          />
          <button onClick={handleAdd} style={{ color: "#22c55e", flexShrink: 0 }}><Check className="w-5 h-5" /></button>
          <button onClick={() => setAdding(false)} style={{ color: "#a3a3a3", flexShrink: 0 }}><X className="w-5 h-5" /></button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#f97316", borderTopColor: "transparent" }} />
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center gap-3">
          <MapPin className="w-10 h-10" style={{ color: "#2a2a2a" }} />
          <p className="text-sm" style={{ color: "#a3a3a3" }}>No locations yet</p>
          <p className="text-xs" style={{ color: "#737373" }}>Tap Add to create your first storage location</p>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-center gap-3 px-3 py-3"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px" }}
            >
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#f97316" }} />
              {editingId === loc.id ? (
                <>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleEdit(loc.id); if (e.key === "Escape") setEditingId(null); }}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={() => handleEdit(loc.id)} style={{ color: "#22c55e" }}><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingId(null)} style={{ color: "#a3a3a3" }}><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm" style={{ color: "#f5f5f5" }}>{loc.name}</span>
                  {loc.description && <span className="text-xs truncate max-w-[30%]" style={{ color: "#a3a3a3" }}>{loc.description}</span>}
                  <button onClick={() => { setEditingId(loc.id); setEditName(loc.name); }} style={{ color: "#a3a3a3" }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(loc.id)} style={{ color: "#ef4444" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}