import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import FirearmCard from "@/components/FirearmCard";
import FirearmModal from "@/components/FirearmModal";
import ExportMenu from "@/components/ExportMenu";

const FIREARM_COLUMNS = [
  { key: "name",              label: "Name" },
  { key: "type",              label: "Type" },
  { key: "action",            label: "Action" },
  { key: "make",              label: "Make" },
  { key: "model",             label: "Model" },
  { key: "caliber",           label: "Caliber" },
  { key: "serial_number",     label: "Serial #" },
  { key: "condition",         label: "Condition" },
  { key: "finish",            label: "Finish" },
  { key: "barrel_length",     label: "Barrel Length" },
  { key: "barrel_contour",    label: "Barrel Contour" },
  { key: "twist_rate",        label: "Twist Rate" },
  { key: "overall_length",    label: "Overall Length" },
  { key: "weight_lbs",        label: "Weight (lbs)" },
  { key: "stock",             label: "Stock" },
  { key: "trigger_brand",     label: "Trigger" },
  { key: "trigger_pull_oz",   label: "Trigger Pull (oz)" },
  { key: "current_round_count", label: "Round Count" },
  { key: "expected_barrel_life", label: "Expected Barrel Life" },
  { key: "optic_name",        label: "Optic" },
  { key: "suppressor_model",  label: "Suppressor" },
  { key: "purchase_date",     label: "Purchase Date" },
  { key: "purchased_from",    label: "Purchased From" },
  { key: "ffl_dealer",        label: "FFL Dealer" },
  { key: "purchase_price",    label: "Purchase Price ($)" },
  { key: "current_value",     label: "Current Value ($)" },
  { key: "notes",             label: "Notes" },
];

export default function FirearmsTab({ onCountChange }) {
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadFirearms(); }, []);
  useEffect(() => { onCountChange?.(firearms.length); }, [firearms.length, onCountChange]);

  const loadFirearms = async () => {
    const data = await base44.entities.Firearm.list();
    setFirearms(data);
    setLoading(false);
  };

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 14 }}>Firearms</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExportMenu getData={() => firearms} filename="firearms" columns={FIREARM_COLUMNS} title="Firearms Inventory" />
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 3, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 12 }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Add
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 24, height: 24, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : firearms.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <p style={{ color: "#a3a3a3", fontSize: 14 }}>No firearms yet</p>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#f97316", padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Add your first firearm
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {firearms.map(f => <FirearmCard key={f.id} item={f} />)}
        </div>
      )}

      {showModal && (
        <FirearmModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadFirearms(); }}
        />
      )}
    </div>
  );
}
