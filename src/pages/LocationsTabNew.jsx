import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, MapPin, Check, X } from "lucide-react";

export default function LocationsTabNew({ onCountChange }) {
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
  useEffect(() => { onCountChange(locations.length); }, [locations.length]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await base44.entities.Location.create({ name: newName.trim() });
    setNewName(""); setAdding(false); load();
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    await base44.entities.Location.update(id, { name: editName.trim() });
    setEditingId(null); load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this location?")) return;
    await base44.entities.Location.delete(id); load();
  };

  const iStyle = { background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, color: "#f5f5f5", padding: "7px 10px", fontSize: 13, outline: "none", flex: 1 };

  return (
    <div style={{ padding: "16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ color: "#a3a3a3", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Storage Locations</p>
        <button
          onClick={() => { setAdding(true); setNewName(""); }}
          style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 2, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
        >
          <Plus style={{ width: 13, height: 13 }} /> Add
        </button>
      </div>

      {adding && (
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3, padding: 12, marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <input
            autoFocus value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Location name…"
            style={iStyle}
          />
          <button onClick={handleAdd} style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", flexShrink: 0 }}><Check style={{ width: 18, height: 18 }} /></button>
          <button onClick={() => setAdding(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", flexShrink: 0 }}><X style={{ width: 18, height: 18 }} /></button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <div style={{ width: 22, height: 22, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : locations.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 8 }}>
          <MapPin style={{ width: 36, height: 36, color: "#2a2a2a" }} />
          <p style={{ color: "#a3a3a3", fontSize: 13 }}>No locations yet</p>
          <p style={{ color: "#525252", fontSize: 11 }}>Tap Add to create a storage location</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {locations.map((loc) => (
            <div key={loc.id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <MapPin style={{ width: 15, height: 15, color: "#f97316", flexShrink: 0 }} />
              {editingId === loc.id ? (
                <>
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleEdit(loc.id); if (e.key === "Escape") setEditingId(null); }} style={iStyle} />
                  <button onClick={() => handleEdit(loc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e" }}><Check style={{ width: 16, height: 16 }} /></button>
                  <button onClick={() => setEditingId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3" }}><X style={{ width: 16, height: 16 }} /></button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#f5f5f5", fontWeight: 600, fontSize: 13 }}>{loc.name}</p>
                    {loc.description && <p style={{ color: "#a3a3a3", fontSize: 11, marginTop: 1 }}>{loc.description}</p>}
                  </div>
                  <button onClick={() => { setEditingId(loc.id); setEditName(loc.name); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 4 }}>
                    <Pencil style={{ width: 13, height: 13 }} />
                  </button>
                  <button onClick={() => handleDelete(loc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}>
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}