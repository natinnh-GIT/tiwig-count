import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import FirearmModal from "@/components/FirearmModal";
import { formatCurrency } from "@/lib/currencyFormatter";

const S = {
  overlay: { background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2a2a", background: "#1a1a1a", flexShrink: 0, minHeight: 56 },
  headerLeft: { display: "flex", alignItems: "center", gap: 8 },
  headerRight: { display: "flex", alignItems: "center", gap: 6 },
  iconBtn: { background: "#242424", border: "1px solid #2a2a2a", borderRadius: 4, cursor: "pointer", color: "#a3a3a3", padding: 10, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 44, minHeight: 44 },
  deleteBtn: { background: "#242424", border: "1px solid #2a2a2a", borderRadius: 4, cursor: "pointer", padding: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", minWidth: 44, minHeight: 44 },
  body: { flex: 1, overflowY: "auto", padding: "20px 16px" },
  photo: { width: "100%", borderRadius: 8, overflow: "hidden", background: "#242424", marginBottom: 20, border: "1px solid #2a2a2a" },
  section: { marginBottom: 24 },
  sectionTitle: { color: "#a3a3a3", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 10, paddingTop: 4, borderLeft: "2px solid #f97316" },
  row: { paddingTop: 10, paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2a2a" },
  label: { color: "#6b7280", fontSize: 14, flexShrink: 0 },
  value: { color: "#f5f5f5", fontSize: 15, fontWeight: 600, textAlign: "right", flex: 1, paddingLeft: 16 },
};

const TYPE_COLORS = {
  "Rifle":    { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  "Pistol":   { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  "AR":       { bg: "#1e3a1a", text: "#86efac", border: "#22c55e" },
  "Shotgun":  { bg: "#1e1e3a", text: "#c4b5fd", border: "#8b5cf6" },
  "Rimfire":  { bg: "#1c1917", text: "#fde68a", border: "#f59e0b" },
  "Revolver": { bg: "#2a1a1a", text: "#fca5a5", border: "#ef4444" },
  "Other":    { bg: "#242424", text: "#a3a3a3", border: "#3a3a3a" },
};

const CONDITION_COLORS = {
  "New": "#22c55e", "Excellent": "#4ade80", "Very Good": "#86efac",
  "Good": "#a3a3a3", "Fair": "#f59e0b", "Poor": "#ef4444",
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

export default function FirearmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [firearm, setFirearm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadFirearm(); }, [id]);

  const loadFirearm = async () => {
    const data = await base44.entities.Firearm.get(id);
    setFirearm(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this firearm? This cannot be undone.")) return;
    await base44.entities.Firearm.delete(id);
    navigate("/?tab=firearms", { replace: true });
  };

  const handleBack = () => {
    const from = location.state?.from;
    if (!from || from === "firearms") {
      navigate("/?tab=firearms", { replace: true });
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

  if (!firearm) {
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

  const typeStyle = TYPE_COLORS[firearm.type] || null;
  const condColor = CONDITION_COLORS[firearm.condition];
  const hasPurchase = firearm.purchase_date || firearm.purchased_from || firearm.ffl_dealer || firearm.purchase_price || firearm.current_value;
  const hasSupp = firearm.suppressor_model || firearm.suppressor_serial;
  const barrelLifeRemaining = firearm.expected_barrel_life && firearm.current_round_count != null
    ? firearm.expected_barrel_life - firearm.current_round_count
    : null;

  return (
    <div style={S.overlay}>
      <div style={S.header}>
        <div style={S.headerLeft}>
          <button onClick={handleBack} style={S.iconBtn}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "55vw" }}>
            {firearm.name}
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
        {/* Photos */}
        {(() => {
          const photos = [firearm.photo_url, firearm.photo_url_2];
          const hasAny = photos.some(Boolean);
          if (!hasAny) return null;
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
              {photos.map((url, i) => (
                url ? (
                  <img key={i} src={url} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
                ) : (
                  <div key={i} style={{ aspectRatio: "16/9", background: "#1a1a1a" }} />
                )
              ))}
            </div>
          );
        })()}

        {/* Header badges */}
        {(firearm.type || firearm.condition) && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {firearm.type && typeStyle && (
              <span style={{ background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}`, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.05em" }}>
                {firearm.type}
              </span>
            )}
            {firearm.action && (
              <span style={{ background: "#242424", color: "#a3a3a3", border: "1px solid #3a3a3a", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.05em" }}>
                {firearm.action}
              </span>
            )}
            {firearm.condition && (
              <span style={{ background: "#1a1a1a", color: condColor, border: `1px solid ${condColor}40`, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.05em" }}>
                {firearm.condition}
              </span>
            )}
          </div>
        )}

        {/* Identity */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Identity</div>
          <Row label="Name">{firearm.name}</Row>
          <Row label="Make">{firearm.make}</Row>
          <Row label="Model">{firearm.model}</Row>
          <Row label="Caliber">{firearm.caliber}</Row>
          <Row label="Serial Number">{firearm.serial_number}</Row>
          <Row label="Finish">{firearm.finish}</Row>
        </div>

        {/* Barrel & Build */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Barrel & Build</div>
          <Row label="Barrel Length">{firearm.barrel_length && `${firearm.barrel_length}"`}</Row>
          <Row label="Barrel Contour">{firearm.barrel_contour}</Row>
          <Row label="Twist Rate">{firearm.twist_rate}</Row>
          <Row label="Overall Length">{firearm.overall_length}</Row>
          <Row label="Weight">{firearm.weight_lbs && `${firearm.weight_lbs} lbs`}</Row>
          <Row label="Stock">{firearm.stock}</Row>
        </div>

        {/* Performance */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Performance</div>
          <Row label="Expected Barrel Life">{firearm.expected_barrel_life && `${firearm.expected_barrel_life.toLocaleString()} rounds`}</Row>
          <Row label="Current Round Count">{firearm.current_round_count?.toLocaleString()}</Row>
          {barrelLifeRemaining !== null && (
            <Row label="Barrel Life Remaining">
              <span style={{ color: barrelLifeRemaining < 500 ? "#ef4444" : barrelLifeRemaining < 1000 ? "#f59e0b" : "#f5f5f5" }}>
                {barrelLifeRemaining.toLocaleString()} rounds
              </span>
            </Row>
          )}
          <Row label="Trigger">{firearm.trigger_brand}</Row>
          <Row label="Trigger Pull">{firearm.trigger_pull_oz && `${firearm.trigger_pull_oz} oz`}</Row>
        </div>

        {/* Optic */}
        {firearm.optic_name && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Optic</div>
            <Row label="Mounted Optic">{firearm.optic_name}</Row>
          </div>
        )}

        {/* Suppressor */}
        {hasSupp && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Suppressor</div>
            <Row label="Model">{firearm.suppressor_model}</Row>
            <Row label="Type">{firearm.suppressor_type}</Row>
            <Row label="Serial">{firearm.suppressor_serial}</Row>
          </div>
        )}

        {/* Purchase */}
        {hasPurchase && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Purchase</div>
            <Row label="Purchase Date">{firearm.purchase_date}</Row>
            <Row label="Purchased From">{firearm.purchased_from}</Row>
            <Row label="FFL Dealer">{firearm.ffl_dealer}</Row>
            {firearm.purchase_price != null && firearm.purchase_price !== "" && (
              <Row label="Purchase Price">{formatCurrency(firearm.purchase_price)}</Row>
            )}
            {firearm.current_value != null && firearm.current_value !== "" && (
              <Row label="Current Value">{formatCurrency(firearm.current_value)}</Row>
            )}
          </div>
        )}

        {/* Notes */}
        {firearm.notes && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Notes</div>
            <div style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 6, padding: 16, color: "#f5f5f5", fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {firearm.notes}
            </div>
          </div>
        )}

        {/* Record */}
        {(firearm.created_et || firearm.modified_et) && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Record</div>
            <Row label="Created">{firearm.created_et}</Row>
            <Row label="Last Modified">{firearm.modified_et}</Row>
          </div>
        )}
      </div>

      {showModal && (
        <FirearmModal
          item={firearm}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadFirearm(); }}
        />
      )}
    </div>
  );
}