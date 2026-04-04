import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Pencil, Trash2, Package } from "lucide-react";
import ComponentModal from "@/components/ComponentModal";
import ImageLightbox from "@/components/ImageLightbox";
import { formatET } from "@/lib/dateFormatter";
import { CategoryPill } from "@/lib/categoryPill";
import { formatCurrency } from "@/lib/currencyFormatter";



function Row({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  if (value === 0) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #2a2a2a" }}>
      <span style={{ color: "#a3a3a3", fontSize: 12 }}>{label}</span>
      <span style={{ color: "#f5f5f5", fontSize: 13, fontWeight: 500, maxWidth: "60%", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function BarcodeDisplay({ value }) {
  if (!value) return null;
  const bars = [];
  for (let i = 0; i < value.length * 4 + 20; i++) {
    const charCode = value.charCodeAt(i % value.length) + i;
    bars.push({ wide: (charCode + i) % 3 === 0, space: i % 2 === 0 });
  }
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid #2a2a2a" }}>
      <span style={{ color: "#a3a3a3", fontSize: 12, display: "block", marginBottom: 8 }}>Barcode</span>
      <div style={{ background: "#fff", borderRadius: 2, padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "stretch", height: 48, gap: 1 }}>
          {bars.map((bar, i) => bar.space
            ? <div key={i} style={{ width: bar.wide ? 6 : 2 }} />
            : <div key={i} style={{ background: "#000", height: "100%", width: bar.wide ? 6 : 2 }} />
          )}
        </div>
        <span style={{ marginTop: 6, fontSize: 10, fontFamily: "monospace", letterSpacing: 2, color: "#000" }}>{value}</span>
      </div>
    </div>
  );
}

export default function ComponentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [locationNames, setLocationNames] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const load = async () => {
    const data = await base44.entities.Component.list();
    const found = data.find((c) => c.id === id);
    setItem(found || null);
    setLoading(false);
    if (found?.location_ids?.length) {
      const allLocs = await base44.entities.Location.list();
      setLocationNames(allLocs.filter((l) => found.location_ids.includes(l.id)).map((l) => l.name));
    }
  };

  useEffect(() => { window.scrollTo(0, 0); load(); }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;
    await base44.entities.Component.delete(id);
    navigate("/?tab=components", { replace: true });
  };

  const handleBackClick = () => {
    const referrer = location.state?.from || "components";
    if (referrer === "components") {
      navigate("/?tab=components", { replace: true });
    } else {
      navigate(-1);
    }
  };

  if (loading) return (
    <div style={{ background: "#0f0f0f", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!item) return (
    <div style={{ background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Package style={{ width: 40, height: 40, color: "#2a2a2a" }} />
      <p style={{ color: "#a3a3a3", fontSize: 14 }}>Item not found</p>
      <button onClick={handleBackClick} style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, color: "#f5f5f5", padding: "8px 20px", cursor: "pointer", fontSize: 13 }}>Back</button>
    </div>
  );

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={handleBackClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 4 }}>
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "55%" }}>{item.name}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowEdit(true)} style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, padding: "6px 8px", color: "#a3a3a3", cursor: "pointer" }}>
            <Pencil style={{ width: 15, height: 15 }} />
          </button>
          <button onClick={handleDelete} style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, padding: "6px 8px", color: "#ef4444", cursor: "pointer" }}>
            <Trash2 style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {/* Photos */}
        {(() => {
          const photos = [item.photo_url, item.photo_url_2].filter(Boolean);
          return photos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: photos.length > 1 ? "1fr 1fr" : "1fr", maxHeight: 220, overflow: "hidden" }}>
              {photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  onClick={() => setLightboxIndex(i)}
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover", cursor: "zoom-in" }}
                />
              ))}
            </div>
          ) : (
            <div style={{ height: 100, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#f97316", fontWeight: 900, fontSize: 40 }}>{item.name?.[0]?.toUpperCase()}</span>
            </div>
          );
        })()}

        <div style={{ padding: "16px 16px 0" }}>
          {/* Title + badge */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <h2 style={{ color: "#f5f5f5", fontWeight: 800, fontSize: 20, margin: 0 }}>{item.name}</h2>
            <CategoryPill value={item.category} />
          </div>
          {item.description && <p style={{ color: "#a3a3a3", fontSize: 13, marginBottom: 12 }}>{item.description}</p>}

          {/* Qty highlight */}
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#a3a3a3", fontSize: 13 }}>In Stock</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: "#f97316", fontWeight: 900, fontSize: 32, lineHeight: 1 }}>{item.quantity ?? 0}</span>
              <span style={{ color: "#a3a3a3", fontSize: 14 }}>{item.unit || "count"}</span>
            </div>
          </div>

          {/* Details card */}
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3, padding: "0 14px", marginBottom: 12 }}>
            <Row label="Brand" value={item.brand} />
            <Row label="Caliber / Type" value={item.caliber} />
            <Row label="Lot #" value={item.lot_number} />
            <Row label="Cost Per Unit" value={item.cost_per_unit ? formatCurrency(item.cost_per_unit) : null} />
            <Row label="Total Cost" value={item.total_cost ? formatCurrency(item.total_cost) : null} />
            <Row label="Purchase Date" value={item.purchase_date ? formatET(item.purchase_date) : null} />
            <Row label="Purchased From" value={item.purchased_from} />
            <BarcodeDisplay value={item.barcode} />
            <Row label="Storage" value={locationNames.length > 0 ? locationNames.join(", ") : null} />
          </div>

          {/* Timestamps */}
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3, padding: "0 14px" }}>
            <Row label="Created" value={item.created_et} />
            <Row label="Modified" value={item.modified_et} />
          </div>
        </div>
      </div>

      {showEdit && <ComponentModal item={item} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={[item.photo_url, item.photo_url_2].filter(Boolean)}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}