import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import OpticsCard from "@/components/OpticsCard";

export default function OpticsTab({ onCountChange }) {
  const [optics, setOptics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOptics();
  }, []);

  useEffect(() => {
    onCountChange?.(optics.length);
  }, [optics.length, onCountChange]);

  const loadOptics = async () => {
    const data = await base44.entities.Optic.list();
    setOptics(data);
    setLoading(false);
  };

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Sticky header */}
      <div style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 14 }}>Optics</span>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 3, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 12 }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add
        </button>
      </div>

      {/* List or empty state */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 24, height: 24, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : optics.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <p style={{ color: "#a3a3a3", fontSize: 14 }}>No optics yet</p>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#f97316", padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Add your first optic
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {optics.map(o => (
            <OpticsCard key={o.id} item={o} />
          ))}
        </div>
      )}
    </div>
  );
}