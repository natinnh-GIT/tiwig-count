import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import OpticsCard from "@/components/OpticsCard";
import OpticModal from "@/components/OpticModal";
import ExportMenu from "@/components/ExportMenu";

const OPTIC_COLUMNS = [
  { key: "brand",             label: "Make" },
  { key: "model",             label: "Model" },
  { key: "type",              label: "Type" },
  { key: "serial_number",     label: "Serial #" },
  { key: "magnification",     label: "Magnification" },
  { key: "objective_lens",    label: "Objective Lens" },
  { key: "tube_diameter",     label: "Tube Diameter" },
  { key: "reticle",           label: "Reticle" },
  { key: "focal_plane",       label: "Focal Plane" },
  { key: "adjustment_units",  label: "Adj. Units" },
  { key: "max_elevation",     label: "Max Elevation" },
  { key: "max_windage",       label: "Max Windage" },
  { key: "finish",            label: "Finish" },
  { key: "condition",         label: "Condition" },
  { key: "mount_info",        label: "Mount/Rings" },
  { key: "mounted_on_firearm_name", label: "Mounted On" },
  { key: "purchase_price",    label: "Purchase Price ($)" },
  { key: "current_value",     label: "Current Value ($)" },
  { key: "purchase_date",     label: "Purchase Date" },
  { key: "purchased_from",    label: "Purchased From" },
  { key: "notes",             label: "Notes" },
];

export default function OpticsTab({ onCountChange }) {
  const [optics, setOptics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadOptics(); }, []);
  useEffect(() => { onCountChange?.(optics.length); }, [optics.length, onCountChange]);

  const loadOptics = async () => {
    const data = await base44.entities.Optic.list();
    setOptics(data);
    setLoading(false);
  };

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Sticky header */}
      <div style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, minHeight: 52 }}>
        <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 16 }}>Optics</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ExportMenu
            getData={() => optics}
            filename="optics"
            columns={OPTIC_COLUMNS}
            title="Optics Inventory"
          />
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 4, padding: "10px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14, minHeight: 44 }}
          >
            <Plus style={{ width: 18, height: 18 }} /> Add
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 28, height: 28, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : optics.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <p style={{ color: "#a3a3a3", fontSize: 15 }}>No optics yet</p>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 4, color: "#f97316", padding: "12px 28px", cursor: "pointer", fontSize: 15, fontWeight: 600, minHeight: 48 }}
          >
            Add your first optic
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {optics.map(o => <OpticsCard key={o.id} item={o} />)}
        </div>
      )}

      {showModal && (
        <OpticModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadOptics(); }}
        />
      )}
    </div>
  );
}