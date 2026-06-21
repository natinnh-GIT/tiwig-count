import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import ReloadingEquipModal from "@/components/ReloadingEquipModal";
import { EQUIP_TYPE_COLORS } from "@/components/ReloadingEquipCard";
import { formatCurrency } from "@/lib/currencyFormatter";

const S = {
  overlay: { background: "#0f0f0f", height: "100dvh", display: "flex", flexDirection: "column" },
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

export default function ReloadingEquipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    const data = await base44.entities.ReloadingEquip.get(id);
    setItem(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await base44.entities.ReloadingEquip.delete(id);
    navigate("/?tab=reloading", { replace: true });
  };

  const handleBack = () => {
    const from = location.state?.from;
    if (!from || from === "reloading") {
      navigate("/?tab=reloading", { replace: true });
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

  if (!item) {
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

  const typeStyle = EQUIP_TYPE_COLORS[item.type] || EQUIP_TYPE_COLORS["Other"];
  const condColor = CONDITION_COLORS[item.condition];
  const isConsumable = item.category === "Consumable";
  const hasPurchase = item.purchase_date || item.purchased_from || item.purchase_price || item.current_value;

  return (
    <div style={S.overlay}>
      <div style={S.header}>
        <div style={S.headerLeft}>
          <button onClick={handleBack} style={S.iconBtn}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "55vw" }}>
            {item.name}
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
        {item.photo_url && (
          <div style={S.photo}>
            <img src={item.photo_url} alt="" style={{ width: "100%", display: "block" }} />
          </div>
        )}

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {item.category && (
            <span style={{ background: "#1a1a1a", color: "#f97316", border: "1px solid #f9731640", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.05em" }}>
              {item.category}
            </span>
          )}
          {item.type && (
            <span style={{ background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}`, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.05em" }}>
              {item.type}
            </span>
          )}
          {item.condition && (
            <span style={{ background: "#1a1a1a", color: condColor, border: `1px solid ${condColor}40`, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.05em" }}>
              {item.condition}
            </span>
          )}
        </div>

        {/* Identity */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Identity</div>
          <Row label="Name">{item.name}</Row>
          <Row label="Brand">{item.brand}</Row>
          <Row label="Model">{item.model}</Row>
          {!isConsumable && <Row label="Serial Number">{item.serial_number}</Row>}
          <Row label="Caliber / Compatibility">{item.caliber_compatibility}</Row>
        </div>

        {/* Consumable-specific */}
        {isConsumable && (item.quantity != null || item.unit) && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Stock</div>
            <Row label="Quantity">
              {item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : null}
            </Row>
          </div>
        )}

        {/* Purchase */}
        {hasPurchase && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Purchase</div>
            <Row label="Purchase Date">{item.purchase_date}</Row>
            <Row label="Purchased From">{item.purchased_from}</Row>
            {item.purchase_price != null && item.purchase_price !== "" && (
              <Row label="Purchase Price">{formatCurrency(item.purchase_price)}</Row>
            )}
            {item.current_value != null && item.current_value !== "" && (
              <Row label="Current Value">{formatCurrency(item.current_value)}</Row>
            )}
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Notes</div>
            <div style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 6, padding: 16, color: "#f5f5f5", fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {item.notes}
            </div>
          </div>
        )}

        {/* Record */}
        {(item.created_et || item.modified_et) && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Record</div>
            <Row label="Created">{item.created_et}</Row>
            <Row label="Last Modified">{item.modified_et}</Row>
          </div>
        )}
      </div>

      {showModal && (
        <ReloadingEquipModal
          item={item}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
