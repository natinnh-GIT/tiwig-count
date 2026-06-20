import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currencyFormatter";
import OpticModal from "@/components/OpticModal";

const S = {
  overlay: { background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2a2a", background: "#1a1a1a", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: 8 },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 8, display: "flex", alignItems: "center" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", alignItems: "center", color: "#ef4444" },
  body: { flex: 1, overflowY: "auto", padding: "16px" },
  section: { marginBottom: 20 },
  sectionTitle: { color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 10, paddingTop: 4, borderLeft: "2px solid #f97316" },
  row: { paddingTop: 8, paddingBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2a2a" },
  label: { color: "#6b7280", fontSize: 12, flexShrink: 0 },
  value: { color: "#f5f5f5", fontSize: 13, fontWeight: 600, textAlign: "right", flex: 1, paddingLeft: 12 },
};

const TYPE_COLORS = {
  "Scope":       { bg: "#1e3a5f", text: "#7dd3fc", border: "#2563eb" },
  "LPVO":        { bg: "#1e3a5f", text: "#93c5fd", border: "#3b82f6" },
  "Red Dot":     { bg: "#4c1d1d", text: "#fca5a5", border: "#ef4444" },
  "Holographic": { bg: "#4c1d1d", text: "#fca5a5", border: "#ef4444" },
  "Prism":       { bg: "#2d1d4c", text: "#c4b5fd", border: "#8b5cf6" },
  "Binocular":   { bg: "#1a3320", text: "#86efac", border: "#22c55e" },
  "Monocular":   { bg: "#1a3320", text: "#86efac", border: "#22c55e" },
  "Rangefinder": { bg: "#2a2a10", text: "#fde68a", border: "#f59e0b" },
  "Night Vision":{ bg: "#0f2a1a", text: "#6ee7b7", border: "#10b981" },
  "Thermal":     { bg: "#2a1a0f", text: "#fdba74", border: "#f97316" },
  "Other":       { bg: "#242424", text: "#a3a3a3", border: "#3a3a3a" },
};

const CONDITION_COLORS = {
  "New":       "#22c55e",
  "Excellent": "#4ade80",
  "Very Good": "#86efac",
  "Good":      "#a3a3a3",
  "Fair":      "#f59e0b",
  "Poor":      "#ef4444",
};

function Row({ label, children }) {
  if (!children && children !== 0) return null;
  return (
    <div style={S.row}>
      <span style={S.label}>{label}</span>
      <span style={S.value}>{children}</span>
    </div>
  );
}

export default function OpticDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [optic, setOptic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadOptic(); }, [id]);

  const loadOptic = async () => {
    const data = await base44.entities.Optic.get(id);
    setOptic(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this optic? This cannot be undone.")) return;
    await base44.entities.Optic.delete(id);
    navigate("/?tab=optics", { replace: true });
  };

  const handleBack = () => {
    const from = location.state?.from;
    if (!from || from === "optics") {
      navigate("/?tab=optics", { replace: true });
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div style={S.overlay}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 24, height: 24, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!optic) {
    return (
      <div style={S.overlay}>
        <div style={S.header}>
          <button onClick={handleBack} style={S.iconBtn}><ChevronLeft style={{ width: 20, height: 20 }} /></button>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 15 }}>Not found</span>
          <div />
        </div>
      </div>
    );
  }

  const typeStyle = TYPE_COLORS[optic.type] || null;
  const condColor = CONDITION_COLORS[optic.condition];
  const mountInfo = optic.mount_info || optic.rings_mounts;
  const hasPurchase = optic.purchase_date || optic.purchased_from || optic.purchase_price || optic.current_value;
  const hasAdjustment = optic.adjustment_units || optic.max_elevation || optic.max_windage;
  const hasMount = optic.mounted_on_firearm_name || mountInfo;

  return (
    <div style={S.overlay}>
      <div style={S.header}>
        <div style={S.headerLeft}>
          <button onClick={handleBack} style={S.iconBtn}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "55vw" }}>
            {optic.brand} {optic.model}
          </span>
        </div>
        <div style={S.headerRight}>
          <button onClick={() => setShowModal(true)} style={S.iconBtn}>
            <Pencil style={{ width: 18, height: 18 }} />
          </button>
          <button onClick={handleDelete} style={S.deleteBtn}>
            <Trash2 style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      <div style={S.body}>
        {/* Photo */}
        {optic.photo_url && (
          <div style={{ borderRadius: 6, overflow: "hidden", background: "#242424", marginBottom: 16, border: "1px solid #2a2a2a" }}>
            <img src={optic.photo_url} alt={optic.model} style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }} />
          </div>
        )}

        {/* Header badges */}
        {(optic.type || optic.condition) && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {optic.type && typeStyle && (
              <span style={{ background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}`, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.05em" }}>
                {optic.type}
              </span>
            )}
            {optic.condition && (
              <span style={{ background: "#1a1a1a", color: condColor, border: `1px solid ${condColor}40`, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.05em" }}>
                {optic.condition}
              </span>
            )}
            {optic.mounted_on_firearm_id && (
              <span style={{ background: "#92400e", color: "#fde68a", border: "1px solid #b45309", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.05em" }}>
                Mounted
              </span>
            )}
          </div>
        )}

        {/* Identity */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Identity</div>
          <Row label="Make">{optic.brand}</Row>
          <Row label="Model">{optic.model}</Row>
          <Row label="Serial Number">{optic.serial_number}</Row>
          <Row label="Finish">{optic.finish}</Row>
        </div>

        {/* Optical Specs */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Optical Specs</div>
          <Row label="Magnification">{optic.magnification}</Row>
          <Row label="Objective Lens">{optic.objective_lens}</Row>
          <Row label="Tube Diameter">{optic.tube_diameter}</Row>
          <Row label="Reticle">{optic.reticle}</Row>
          <Row label="Focal Plane">{optic.focal_plane}</Row>
        </div>

        {/* Turrets */}
        {hasAdjustment && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Turrets</div>
            <Row label="Adjustment Units">{optic.adjustment_units}</Row>
            {optic.max_elevation != null && optic.max_elevation !== "" && (
              <Row label="Max Elevation">{optic.max_elevation} {optic.adjustment_units}</Row>
            )}
            {optic.max_windage != null && optic.max_windage !== "" && (
              <Row label="Max Windage">{optic.max_windage} {optic.adjustment_units}</Row>
            )}
          </div>
        )}

        {/* Mount */}
        {hasMount && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Mount</div>
            <Row label="Mounted On">{optic.mounted_on_firearm_name}</Row>
            <Row label="Mount / Rings">{mountInfo}</Row>
          </div>
        )}

        {/* Purchase */}
        {hasPurchase && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Purchase</div>
            <Row label="Purchase Date">{optic.purchase_date}</Row>
            <Row label="Purchased From">{optic.purchased_from}</Row>
            {optic.purchase_price != null && optic.purchase_price !== "" && (
              <Row label="Purchase Price">{formatCurrency(optic.purchase_price)}</Row>
            )}
            {optic.current_value != null && optic.current_value !== "" && (
              <Row label="Current Value">{formatCurrency(optic.current_value)}</Row>
            )}
          </div>
        )}

        {/* Notes */}
        {optic.notes && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Notes</div>
            <div style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, padding: 12, color: "#f5f5f5", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {optic.notes}
            </div>
          </div>
        )}

        {/* Timestamps */}
        {(optic.created_et || optic.modified_et) && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Record</div>
            <Row label="Created">{optic.created_et}</Row>
            <Row label="Last Modified">{optic.modified_et}</Row>
          </div>
        )}
      </div>

      {showModal && (
        <OpticModal
          item={optic}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadOptic(); }}
        />
      )}
    </div>
  );
}
