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

  const iStyle = { background: "#242424", border: "1px solid #2a2a2a", borderRadius: 4, color: "#f5f5f5", padding: "14px 12px", fontSize: 16, outline: "none", flex: 1, minHeight: 48 };

  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Storage Locations</p>
        <button
          onClick={() => { setAdding(true); setNewName(""); }}
          style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 4, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, minHeight: 44 }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add
        </button>
      </div>

      {adding && (
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, padding: 14, marginBottom: 10, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            autoFocus value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Location name…"
            style={iStyle}
          />
          <button onClick={handleAdd} style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", flexShrink: 0, padding: 10, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><Check style={{ width: 22, height: 22 }} /></button>
          <button onClick={() => setAdding(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", flexShrink: 0, padding: 10, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ width: 22, height: 22 }} /></button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
          <div style={{ width: 28, height: 28, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : locations.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: 10 }}>
          <MapPin style={{ width: 44, height: 44, color: "#2a2a2a" }} />
          <p style={{ color: "#a3a3a3", fontSize: 15 }}>No locations yet</p>
          <p style={{ color: "#525252", fontSize: 13 }}>Tap Add to create a storage location</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {locations.map((loc) => (
            <div key={loc.id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, minHeight: 60 }}>
              <MapPin style={{ width: 18, height: 18, color: "#f97316", flexShrink: 0 }} />
              {editingId === loc.id ? (
                <>
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleEdit(loc.id); if (e.key === "Escape") setEditingId(null); }} style={iStyle} />
                  <button onClick={() => handleEdit(loc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", padding: 10, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><Check style={{ width: 20, height: 20 }} /></button>
                  <button onClick={() => setEditingId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 10, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ width: 20, height: 20 }} /></button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#f5f5f5", fontWeight: 600, fontSize: 15 }}>{loc.name}</p>
                    {loc.description && <p style={{ color: "#a3a3a3", fontSize: 13, marginTop: 2 }}>{loc.description}</p>}
                  </div>
                  <button onClick={() => { setEditingId(loc.id); setEditName(loc.name); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 10, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Pencil style={{ width: 16, height: 16 }} />
                  </button>
                  <button onClick={() => handleDelete(loc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 10, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 style={{ width: 16, height: 16 }} />
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