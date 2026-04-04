import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { X, Camera, Barcode, Sparkles } from "lucide-react";
import BarcodeScanner from "@/components/BarcodeScanner";
import SuggestInput from "@/components/SuggestInput";
import PhotoCapture from "@/components/PhotoCapture";
import DuplicateDialog from "@/components/DuplicateDialog";
import PhotoEnhancer from "@/components/PhotoEnhancer";
import LocationPickerNew from "@/components/LocationPickerNew";
import CartridgeLoader from "@/components/CartridgeLoader";

const getDefaults = () => ({
  name: "", description: "",
  category: localStorage.getItem("rt_last_category") || "brass",
  caliber: "", brand: "",
  quantity: 0,
  unit: localStorage.getItem("rt_last_unit") || "count",
  purchased_from: "", barcode: "", photo_url: "", photo_url_2: "", notes: "",
  cost_per_unit: "", total_cost: "", purchase_date: "", location_ids: [],
});

const CATEGORY_DEFAULT_UNIT = { powder: "grains", bullets: "count", brass: "count", primers: "count" };

// Inline styles
const S = {
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "#0f0f0f", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2a2a", background: "#1a1a1a", flexShrink: 0 },
  title: { color: "#f5f5f5", fontWeight: 700, fontSize: 15 },
  saveBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 3, padding: "7px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  body: { flex: 1, overflowY: "auto", padding: "16px" },
  label: { display: "block", color: "#a3a3a3", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 },
  input: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, color: "#f5f5f5", padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, color: "#f5f5f5", padding: "9px 12px", fontSize: 13, outline: "none", appearance: "none" },
  section: { marginBottom: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  readOnly: { width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 2, color: "#f97316", padding: "9px 12px", fontSize: 13, fontWeight: 700, boxSizing: "border-box" },
};

export default function ComponentModal({ item, onClose, onSaved }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(item ? { ...item } : getDefaults());
  const [allComponents, setAllComponents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState("reid");
  const [showBarcode, setShowBarcode] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showPhoto2, setShowPhoto2] = useState(false);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [duplicate, setDuplicate] = useState(null);

  useEffect(() => { base44.entities.Component.list().then(setAllComponents); }, []);

  const catItems = allComponents.filter((c) => c.category === form.category && c.id !== item?.id);
  const unique = (arr) => [...new Set(arr.filter(Boolean))].sort();
  const nameSuggestions = unique(catItems.map((c) => c.name));
  const brandSuggestions = unique(catItems.map((c) => c.brand));
  const caliberSuggestions = unique(catItems.map((c) => c.caliber));
  const lotSuggestions = unique(catItems.map((c) => c.lot_number));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCategoryChange = (v) => {
    localStorage.setItem("rt_last_category", v);
    const u = CATEGORY_DEFAULT_UNIT[v] || "count";
    localStorage.setItem("rt_last_unit", u);
    setForm((f) => ({ ...f, category: v, unit: u }));
  };

  const handleUnitChange = (v) => { localStorage.setItem("rt_last_unit", v); set("unit", v); };

  const handleCostPerUnitChange = (v) => {
    setForm((f) => {
      const qty = Number(f.quantity);
      const cpu = Number(v);
      const total = qty > 0 && cpu > 0 ? (qty * cpu).toFixed(2) : f.total_cost;
      return { ...f, cost_per_unit: v, total_cost: total };
    });
  };

  const handleQuantityChange = (v) => {
    setForm((f) => {
      const qty = Number(v);
      const cpu = Number(f.cost_per_unit);
      const total = qty > 0 && cpu > 0 ? (qty * cpu).toFixed(2) : f.total_cost;
      return { ...f, quantity: Number(v), total_cost: total };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    if (!item?.id) {
      const all = await base44.entities.Component.list();
      const match = all.find((c) => {
        return c.name?.toLowerCase().trim() === form.name?.toLowerCase().trim() &&
          (c.brand || "").toLowerCase().trim() === (form.brand || "").toLowerCase().trim() &&
          (c.caliber || "").toLowerCase().trim() === (form.caliber || "").toLowerCase().trim();
      });
      if (match) { setSaving(false); setDuplicate(match); return; }
    }
    await saveItem();
  };

  const saveItem = async (overrideId) => {
    setSaving(true);
    const payload = {
      ...form,
      total_cost: form.total_cost !== "" && form.total_cost !== undefined ? Number(form.total_cost) : undefined,
      cost_per_unit: form.cost_per_unit !== "" && form.cost_per_unit !== undefined ? Number(form.cost_per_unit) : undefined,
    };
    if (overrideId) await base44.entities.Component.update(overrideId, payload);
    else if (item?.id) await base44.entities.Component.update(item.id, payload);
    else await base44.entities.Component.create(payload);
    setSaving(false);
    onSaved();
  };

  const handlePhotoCaptured = async (url) => {
    set("photo_url", url);
    setShowPhoto(false);
    setAiMode("reid");
    setAiLoading(true);
    const res = await base44.functions.invoke("claudeVision", { image_url: url, mode: "reid" });
    const result = res.data?.result;
    if (result?.name) setForm((f) => ({ ...f, ...result, photo_url: url }));
    setAiLoading(false);
  };

  const handlePhoto2Captured = (url) => { set("photo_url_2", url); setShowPhoto2(false); };

  const handleAILookup = async () => {
    if (!form.photo_url) return;
    setAiMode("reid");
    setAiLoading(true);
    const res = await base44.functions.invoke("claudeVision", { image_url: form.photo_url, mode: "reid" });
    const result = res.data?.result;
    if (result?.name) setForm((f) => ({ ...f, ...result }));
    setAiLoading(false);
  };

  const handleEnhance = async () => {
    if (!form.photo_url) return;
    setShowEnhancer(false);
    setAiMode("enhance");
    setAiLoading(true);
    const res = await base44.functions.invoke("claudeVision", { image_url: form.photo_url, mode: "enhance" });
    const description = res.data?.description;
    if (description) setForm((f) => ({ ...f, description }));
    setAiLoading(false);
  };

  const handleBarcodeDetected = async (code) => {
    setShowBarcode(false);
    const existing = allComponents.find((c) => c.barcode === code);
    if (existing) { onClose(); navigate(`/component/${existing.id}`); return; }
    set("barcode", code);
    setAiLoading(true);
    const res = await base44.functions.invoke("lookupBarcode", { barcode: code });
    const info = res.data?.result;
    if (info) setForm((f) => ({ ...f, barcode: code, name: info.name || f.name, brand: info.brand || f.brand, caliber: info.caliber || f.caliber, category: info.category || f.category, description: info.description || f.description }));
    setAiLoading(false);
  };

  if (showBarcode) return <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowBarcode(false)} />;
  if (showPhoto) return <PhotoCapture onCapture={handlePhotoCaptured} onClose={() => setShowPhoto(false)} />;
  if (showPhoto2) return <PhotoCapture onCapture={handlePhoto2Captured} onClose={() => setShowPhoto2(false)} />;

  const computedTotal = form.cost_per_unit && form.quantity ? (Number(form.cost_per_unit) * Number(form.quantity)).toFixed(2) : "";

  return (
    <div style={S.overlay}>
      {aiLoading && <CartridgeLoader mode={aiMode} />}
      {duplicate && <DuplicateDialog existing={duplicate} onAddNew={() => { setDuplicate(null); saveItem(); }} onEditExisting={() => { setDuplicate(null); saveItem(duplicate.id); }} onCancel={() => setDuplicate(null)} />}

      <div style={S.header}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 4 }}>
          <X style={{ width: 20, height: 20 }} />
        </button>
        <span style={S.title}>{item ? "Edit Component" : "Add Component"}</span>
        <button onClick={handleSave} disabled={saving || !form.name} style={{ ...S.saveBtn, opacity: (saving || !form.name) ? 0.5 : 1 }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div style={S.body}>
        {/* Photos section */}
        <div style={{ marginBottom: 16 }}>
          {/* 2-column photo grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {/* Photo 1 */}
            <div>
              <label style={S.label}>Photo 1</label>
              <button
                onClick={() => setShowPhoto(true)}
                style={{ width: "100%", aspectRatio: "1", borderRadius: 6, border: "1px dashed #2a2a2a", background: "#242424", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                {form.photo_url
                  ? <img src={form.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                  : <Camera style={{ width: 24, height: 24, color: "#6b7280" }} />}
              </button>
            </div>
            {/* Photo 2 */}
            <div>
              <label style={S.label}>Photo 2</label>
              <button
                onClick={() => setShowPhoto2(true)}
                style={{ width: "100%", aspectRatio: "1", borderRadius: 6, border: "1px dashed #2a2a2a", background: "#242424", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                {form.photo_url_2
                  ? <img src={form.photo_url_2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                  : <Camera style={{ width: 24, height: 24, color: "#6b7280" }} />}
              </button>
            </div>
          </div>

          {/* AI buttons row — only shown when photo_url exists */}
          {form.photo_url && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={handleAILookup}
                disabled={aiLoading}
                style={{ background: "#242424", border: "1px solid #f97316", borderRadius: 3, color: "#f97316", fontSize: 12, fontWeight: 600, padding: "8px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: aiLoading ? 0.5 : 1 }}
              >
                <Sparkles style={{ width: 13, height: 13 }} /> Re-ID
              </button>
              <button
                onClick={handleEnhance}
                disabled={aiLoading}
                style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#a3a3a3", fontSize: 12, fontWeight: 600, padding: "8px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: aiLoading ? 0.5 : 1 }}
              >
                <Sparkles style={{ width: 13, height: 13 }} /> Enhance
              </button>
            </div>
          )}
        </div>

        {/* Barcode */}
        <div style={S.section}>
          <label style={S.label}>Barcode</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="Scan or enter" style={S.input} />
            <button onClick={() => setShowBarcode(true)} style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 2, padding: "0 12px", color: "#a3a3a3", cursor: "pointer" }}>
              <Barcode style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Category */}
        <div style={S.section}>
          <label style={S.label}>Category *</label>
          <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)} style={S.select}>
            <option value="brass">Brass / Casings</option>
            <option value="bullets">Bullets / Projectiles</option>
            <option value="powder">Powder</option>
            <option value="primers">Primers</option>
          </select>
        </div>

        {/* Name */}
        <div style={S.section}>
          <label style={S.label}>Name *</label>
          <SuggestInput value={form.name} onChange={(v) => set("name", v)} suggestions={nameSuggestions} placeholder="e.g. Hornady FMJ .308" darkStyle />
        </div>

        {/* Brand + Caliber */}
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Brand</label>
            <SuggestInput value={form.brand} onChange={(v) => set("brand", v)} suggestions={brandSuggestions} placeholder="Brand" darkStyle />
          </div>
          <div>
            <label style={S.label}>Caliber / Type</label>
            <SuggestInput value={form.caliber} onChange={(v) => set("caliber", v)} suggestions={caliberSuggestions} placeholder=".308, 9mm…" darkStyle />
          </div>
        </div>

        {/* Lot */}
        <div style={S.section}>
          <label style={S.label}>Lot #</label>
          <SuggestInput value={form.lot_number || ""} onChange={(v) => set("lot_number", v)} suggestions={lotSuggestions} placeholder="Lot or batch number" darkStyle />
        </div>

        {/* Qty + Unit */}
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Quantity</label>
            <input type="number" value={form.quantity} onChange={(e) => handleQuantityChange(e.target.value)} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Unit</label>
            <select value={form.unit} onChange={(e) => handleUnitChange(e.target.value)} style={S.select}>
              <option value="count">Count</option>
              <option value="lbs">Lbs</option>
              <option value="oz">Oz</option>
              <option value="grains">Grains</option>
            </select>
          </div>
        </div>

        {/* Cost */}
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Cost Per Unit ($)</label>
            <input type="number" min="0" step="0.0001" value={form.cost_per_unit} onChange={(e) => handleCostPerUnitChange(e.target.value)} placeholder="0.00" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Total Cost ($) <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>auto</span></label>
            <div style={S.readOnly}>{computedTotal || "—"}</div>
          </div>
        </div>

        {/* Purchase Date */}
        <div style={{ ...S.section, maxWidth: "50%" }}>
          <label style={S.label}>Purchase Date</label>
          <input type="date" value={form.purchase_date || ""} onChange={(e) => set("purchase_date", e.target.value)} style={S.input} />
        </div>

        {/* Purchased From */}
        <div style={S.section}>
          <label style={S.label}>Purchased From</label>
          <input value={form.purchased_from} onChange={(e) => set("purchased_from", e.target.value)} placeholder="Store or website" style={S.input} />
        </div>

        {/* Locations */}
        <div style={S.section}>
          <label style={S.label}>Storage Locations</label>
          <LocationPickerNew value={form.location_ids || []} onChange={(v) => set("location_ids", v)} />
        </div>

        {/* Description */}
        <div style={S.section}>
          <label style={S.label}>Notes</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Notes about this component…" rows={3} style={{ ...S.input, resize: "none" }} />
        </div>
      </div>
    </div>
  );
}