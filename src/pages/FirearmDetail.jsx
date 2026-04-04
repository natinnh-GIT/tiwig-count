import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import FirearmModal from "@/components/FirearmModal";

const S = {
  overlay: { background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2a2a", background: "#1a1a1a", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: 8 },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 8, fontSize: 14, display: "flex", alignItems: "center" },
  deleteBtn: { ...{ background: "none", border: "none", cursor: "pointer", padding: 8, fontSize: 14, display: "flex", alignItems: "center", color: "#ef4444" } },
  body: { flex: 1, overflowY: "auto", padding: "16px" },
  photo: { width: "100%", aspectRatio: "1", borderRadius: 6, overflow: "hidden", background: "#242424", marginBottom: 16, border: "1px solid #2a2a2a" },
  section: { marginBottom: 20 },
  sectionTitle: { color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid #f97316" },
  row: { paddingBottom: 10, display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2a2a2a" },
  label: { color: "#6b7280", fontSize: 12 },
  value: { color: "#f5f5f5", fontSize: 13, fontWeight: 600, textAlign: "right", flex: 1, paddingLeft: 12 },
};

export default function FirearmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [firearm, setFirearm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadFirearm();
  }, [id]);

  const loadFirearm = async () => {
    const data = await base44.entities.Firearm.get(id);
    setFirearm(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this firearm? This cannot be undone.")) return;
    await base44.entities.Firearm.delete(id);
    navigate("/");
  };

  const handleEdit = () => {
    setShowModal(true);
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
          <button onClick={() => navigate(-1)} style={S.iconBtn}>
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
          <button onClick={() => navigate(-1)} style={S.iconBtn}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {firearm.name}
          </span>
        </div>
        <div style={S.headerRight}>
          <button onClick={handleEdit} style={S.iconBtn}>
            <Pencil style={{ width: 18, height: 18 }} />
          </button>
          <button onClick={handleDelete} style={S.deleteBtn}>
            <Trash2 style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      <div style={S.body}>
        {/* Photo */}
        {firearm.photo_url && (
          <div style={S.photo}>
            <img src={firearm.photo_url} alt={firearm.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Basic Info */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Basic Information</div>
          {firearm.type && (
            <div style={S.row}>
              <span style={S.label}>Type</span>
              <span style={S.value}>{firearm.type}</span>
            </div>
          )}
          {firearm.make && (
            <div style={S.row}>
              <span style={S.label}>Make</span>
              <span style={S.value}>{firearm.make}</span>
            </div>
          )}
          {firearm.model && (
            <div style={S.row}>
              <span style={S.label}>Model</span>
              <span style={S.value}>{firearm.model}</span>
            </div>
          )}
          {firearm.caliber && (
            <div style={S.row}>
              <span style={S.label}>Caliber</span>
              <span style={S.value}>{firearm.caliber}</span>
            </div>
          )}
          {firearm.serial_number && (
            <div style={S.row}>
              <span style={S.label}>Serial Number</span>
              <span style={S.value}>{firearm.serial_number}</span>
            </div>
          )}
        </div>

        {/* Barrel & Stock */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Barrel & Stock</div>
          {firearm.barrel_length && (
            <div style={S.row}>
              <span style={S.label}>Barrel Length</span>
              <span style={S.value}>{firearm.barrel_length}"</span>
            </div>
          )}
          {firearm.barrel_contour && (
            <div style={S.row}>
              <span style={S.label}>Barrel Contour</span>
              <span style={S.value}>{firearm.barrel_contour}</span>
            </div>
          )}
          {firearm.stock && (
            <div style={S.row}>
              <span style={S.label}>Stock</span>
              <span style={S.value}>{firearm.stock}</span>
            </div>
          )}
        </div>

        {/* Barrel Life & Round Count */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Performance</div>
          {firearm.expected_barrel_life && (
            <div style={S.row}>
              <span style={S.label}>Expected Barrel Life</span>
              <span style={S.value}>{firearm.expected_barrel_life} rounds</span>
            </div>
          )}
          {firearm.current_round_count != null && (
            <div style={S.row}>
              <span style={S.label}>Current Round Count</span>
              <span style={S.value}>{firearm.current_round_count}</span>
            </div>
          )}
          {firearm.expected_barrel_life && firearm.current_round_count != null && (
            <div style={S.row}>
              <span style={S.label}>Barrel Life Remaining</span>
              <span style={S.value}>{firearm.expected_barrel_life - firearm.current_round_count} rounds</span>
            </div>
          )}
        </div>

        {/* Trigger */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Trigger</div>
          {firearm.trigger_brand && (
            <div style={S.row}>
              <span style={S.label}>Brand/Model</span>
              <span style={S.value}>{firearm.trigger_brand}</span>
            </div>
          )}
          {firearm.trigger_pull_oz && (
            <div style={S.row}>
              <span style={S.label}>Pull Weight</span>
              <span style={S.value}>{firearm.trigger_pull_oz} oz</span>
            </div>
          )}
        </div>

        {/* Suppressor */}
        {(firearm.suppressor_model || firearm.suppressor_type || firearm.suppressor_serial) && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Suppressor</div>
            {firearm.suppressor_model && (
              <div style={S.row}>
                <span style={S.label}>Model</span>
                <span style={S.value}>{firearm.suppressor_model}</span>
              </div>
            )}
            {firearm.suppressor_type && (
              <div style={S.row}>
                <span style={S.label}>Type</span>
                <span style={S.value}>{firearm.suppressor_type}</span>
              </div>
            )}
            {firearm.suppressor_serial && (
              <div style={S.row}>
                <span style={S.label}>Serial</span>
                <span style={S.value}>{firearm.suppressor_serial}</span>
              </div>
            )}
          </div>
        )}

        {/* Optic */}
        {firearm.optic_name && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Optic</div>
            <div style={S.row}>
              <span style={S.label}>Mounted Optic</span>
              <span style={S.value}>{firearm.optic_name}</span>
            </div>
          </div>
        )}

        {/* Timestamps */}
        {(firearm.created_et || firearm.modified_et) && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Timestamps</div>
            {firearm.created_et && (
              <div style={S.row}>
                <span style={S.label}>Created</span>
                <span style={S.value}>{firearm.created_et}</span>
              </div>
            )}
            {firearm.modified_et && (
              <div style={S.row}>
                <span style={S.label}>Last Modified</span>
                <span style={S.value}>{firearm.modified_et}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {firearm.notes && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Notes</div>
            <div style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, padding: 12, color: "#f5f5f5", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {firearm.notes}
            </div>
          </div>
        )}
      </div>

      {showModal && <FirearmModal item={firearm} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadFirearm(); }} />}
    </div>
  );
}