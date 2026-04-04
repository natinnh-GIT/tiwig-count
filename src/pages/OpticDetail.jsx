import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currencyFormatter";

const S = {
  overlay: { background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2a2a", background: "#1a1a1a", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: 8 },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 8, fontSize: 14, display: "flex", alignItems: "center" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", padding: 8, fontSize: 14, display: "flex", alignItems: "center", color: "#ef4444" },
  body: { flex: 1, overflowY: "auto", padding: "16px" },
  photo: { width: "100%", borderRadius: 6, overflow: "hidden", background: "#242424", marginBottom: 16, border: "1px solid #2a2a2a" },
  section: { marginBottom: 20 },
  sectionTitle: { color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid #f97316" },
  row: { paddingBottom: 10, display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2a2a2a" },
  label: { color: "#6b7280", fontSize: 12 },
  value: { color: "#f5f5f5", fontSize: 13, fontWeight: 600, textAlign: "right", flex: 1, paddingLeft: 12 },
};

export default function OpticDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [optic, setOptic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOptic();
  }, [id]);

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

  const handleBackClick = () => {
    const referrer = location.state?.from || "optics";
    if (referrer === "optics") {
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
          <button onClick={handleBackClick} style={S.iconBtn}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 15 }}>Not found</span>
          <div />
        </div>
      </div>
    );
  }

  return (
    <div style={S.overlay}>
      <div style={S.header}>
        <div style={S.headerLeft}>
          <button onClick={handleBackClick} style={S.iconBtn}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {optic.brand} {optic.model}
          </span>
        </div>
        <div style={S.headerRight}>
          <button onClick={handleDelete} style={S.deleteBtn}>
            <Trash2 style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      <div style={S.body}>
        {/* Photo */}
        {optic.photo_url && (
          <div style={S.photo}>
            <img src={optic.photo_url} alt={optic.brand} style={{ width: "100%", height: "auto", objectFit: "contain" }} />
          </div>
        )}

        {/* Basic Info */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Basic Information</div>
          {optic.brand && (
            <div style={S.row}>
              <span style={S.label}>Brand</span>
              <span style={S.value}>{optic.brand}</span>
            </div>
          )}
          {optic.model && (
            <div style={S.row}>
              <span style={S.label}>Model</span>
              <span style={S.value}>{optic.model}</span>
            </div>
          )}
          {optic.serial_number && (
            <div style={S.row}>
              <span style={S.label}>Serial Number</span>
              <span style={S.value}>{optic.serial_number}</span>
            </div>
          )}
        </div>

        {/* Specifications */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Specifications</div>
          {optic.magnification && (
            <div style={S.row}>
              <span style={S.label}>Magnification</span>
              <span style={S.value}>{optic.magnification}</span>
            </div>
          )}
          {optic.reticle && (
            <div style={S.row}>
              <span style={S.label}>Reticle</span>
              <span style={S.value}>{optic.reticle}</span>
            </div>
          )}
          {optic.tube_diameter && (
            <div style={S.row}>
              <span style={S.label}>Tube Diameter</span>
              <span style={S.value}>{optic.tube_diameter}</span>
            </div>
          )}
          {optic.focal_plane && (
            <div style={S.row}>
              <span style={S.label}>Focal Plane</span>
              <span style={S.value}>{optic.focal_plane}</span>
            </div>
          )}
        </div>

        {/* Mounting */}
        {(optic.mounted_on_firearm_id || optic.rings_mounts) && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Mounting</div>
            {optic.mounted_on_firearm_name && (
              <div style={S.row}>
                <span style={S.label}>Mounted On</span>
                <span style={S.value}>{optic.mounted_on_firearm_name}</span>
              </div>
            )}
            {optic.rings_mounts && (
              <div style={S.row}>
                <span style={S.label}>Rings/Mounts</span>
                <span style={S.value}>{optic.rings_mounts}</span>
              </div>
            )}
          </div>
        )}

        {/* Purchase Info */}
        {(optic.purchase_date || optic.purchased_from || optic.purchase_price) && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Purchase Information</div>
            {optic.purchase_date && (
              <div style={S.row}>
                <span style={S.label}>Purchase Date</span>
                <span style={S.value}>{optic.purchase_date}</span>
              </div>
            )}
            {optic.purchased_from && (
              <div style={S.row}>
                <span style={S.label}>Purchased From</span>
                <span style={S.value}>{optic.purchased_from}</span>
              </div>
            )}
            {optic.purchase_price && (
              <div style={S.row}>
                <span style={S.label}>Purchase Price</span>
                <span style={S.value}>{formatCurrency(optic.purchase_price)}</span>
              </div>
            )}
          </div>
        )}

        {/* Timestamps */}
        {(optic.created_et || optic.modified_et) && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Timestamps</div>
            {optic.created_et && (
              <div style={S.row}>
                <span style={S.label}>Created</span>
                <span style={S.value}>{optic.created_et}</span>
              </div>
            )}
            {optic.modified_et && (
              <div style={S.row}>
                <span style={S.label}>Last Modified</span>
                <span style={S.value}>{optic.modified_et}</span>
              </div>
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
      </div>
    </div>
  );
}