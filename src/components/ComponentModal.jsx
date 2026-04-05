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
  purchased_from: "", barcode: "", photo_url: "", photo_url_2: "", notes: "",
  total_cost: "", purchase_date: "", location_ids: [],
  // primers
  sleeve_count: "", units_per_sleeve: 100, total_unit_count: 0, cost_per_unit: "",
  // bullets
  box_count: "", bullets_per_box: 100, total_bullet_count: 0,
  // powder
  powder_lbs: "", powder_grains: 0, cost_per_grain: "",
  // brass
  brass_box_count: "", cases_per_box: 100, uses_per_case: "", total_cases: 0, total_unit_uses: 0, cost_per_use: "",
});

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

// formatting helpers
const fmt4 = (n) => n !== "" && n !== undefined && !isNaN(n) ? `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}` : "—";
const fmtCount = (n) => Number(n || 0).toLocaleString("en-US");

const getETNow = () => new Date().toLocaleString("en-US", {
  timeZone: "America/New_York", month: "short", day: "numeric",
  year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
});

export default function ComponentModal({ item, onClose, onSaved }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(item ? { ...getDefaults(), ...item } : getDefaults());
  const [allComponents, setAllComponents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState("reid");
  const [showBarcode, setShowBarcode] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showPhoto2, setShowPhoto2] = useState(false);
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
    setForm((f) => ({ ...f, category: v }));
  };

  // ── PRIMERS ──
  const recalcPrimers = (f) => {
    const sleeves = Number(f.sleeve_count) || 0;
    const ups = Number(f.units_per_sleeve) || 100;
    const totalUnits = sleeves * ups;
    const totalCost = Number(f.total_cost) || 0;
    const cpu = totalUnits > 0 ? totalCost / totalUnits : "";
    return { ...f, total_unit_count: totalUnits, cost_per_unit: cpu };
  };
  const handlePrimerField = (k, v) => setForm((f) => recalcPrimers({ ...f, [k]: v }));

  // ── BULLETS ──
  const recalcBullets = (f) => {
    const boxes = Number(f.box_count) || 0;
    const bpb = Number(f.bullets_per_box) || 100;
    const total = boxes * bpb;
    const totalCost = Number(f.total_cost) || 0;
    const cpu = total > 0 ? totalCost / total : "";
    return { ...f, total_bullet_count: total, cost_per_unit: cpu };
  };
  const handleBulletField = (k, v) => setForm((f) => recalcBullets({ ...f, [k]: v }));

  // ── POWDER ──
  const recalcPowder = (f) => {
    const lbs = Number(f.powder_lbs) || 0;
    const grains = lbs * 7000;
    const totalCost = Number(f.total_cost) || 0;
    const cpg = grains > 0 ? totalCost / grains : "";
    return { ...f, powder_grains: grains, cost_per_grain: cpg };
  };
  const handlePowderField = (k, v) => setForm((f) => recalcPowder({ ...f, [k]: v }));

  // ── BRASS ──
  const recalcBrass = (f) => {
    const boxes = Number(f.brass_box_count) || 0;
    const cpb = Number(f.cases_per_box) || 100;
    const totalCases = boxes * cpb;
    const upc = Number(f.uses_per_case) || 0;
    const totalUses = totalCases * upc;
    const totalCost = Number(f.total_cost) || 0;
    const costPerUse = totalUses > 0 ? totalCost / totalUses : "";
    return { ...f, total_cases: totalCases, total_unit_uses: totalUses, cost_per_use: costPerUse };
  };
  const handleBrassField = (k, v) => setForm((f) => recalcBrass({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    if (!item?.id) {
      const all = await base44.entities.Component.list();
      const match = all.find((c) =>
        c.name?.toLowerCase().trim() === form.name?.toLowerCase().trim() &&
        (c.brand || "").toLowerCase().trim() === (form.brand || "").toLowerCase().trim() &&
        (c.caliber || "").toLowerCase().trim() === (form.caliber || "").toLowerCase().trim()
      );
      if (match) { setSaving(false); setDuplicate(match); return; }
    }
    await saveItem();
  };

  const saveItem = async (overrideId) => {
    setSaving(true);
    const toNum = (v) => v !== "" && v !== undefined && v !== null ? Number(v) : undefined;
    const payload = {
      ...form,
      total_cost: toNum(form.total_cost),
      modified_et: getETNow(),
    };
    // per-category calculated fields
    if (form.category === "primers") {
      payload.sleeve_count = toNum(form.sleeve_count);
      payload.units_per_sleeve = toNum(form.units_per_sleeve) ?? 100;
      payload.total_unit_count = toNum(form.total_unit_count);
      payload.cost_per_unit = toNum(form.cost_per_unit);
    } else if (form.category === "bullets") {
      payload.box_count = toNum(form.box_count);
      payload.bullets_per_box = toNum(form.bullets_per_box) ?? 100;
      payload.total_bullet_count = toNum(form.total_bullet_count);
      payload.cost_per_unit = toNum(form.cost_per_unit);
    } else if (form.category === "powder") {
      payload.powder_lbs = toNum(form.powder_lbs);
      payload.powder_grains = toNum(form.powder_grains);
      payload.cost_per_grain = toNum(form.cost_per_grain);
    } else if (form.category === "brass") {
      payload.brass_box_count = toNum(form.brass_box_count);
      payload.cases_per_box = toNum(form.cases_per_box) ?? 100;
      payload.uses_per_case = toNum(form.uses_per_case);
      payload.total_cases = toNum(form.total_cases);
      payload.total_unit_uses = toNum(form.total_unit_uses);
      payload.cost_per_use = toNum(form.cost_per_use);
    }
    if (!item?.id) payload.created_et = getETNow();
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
    setAiMode("reid"); setAiLoading(true);
    const res = await base44.functions.invoke("claudeVision", { image_url: form.photo_url, mode: "reid" });
    const result = res.data?.result;
    if (result?.name) setForm((f) => ({ ...f, ...result }));
    setAiLoading(false);
  };

  const handleEnhance = async () => {
    if (!form.photo_url) return;
    setAiMode("enhance"); setAiLoading(true);
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

  const isP = form.category === "primers";
  const isB = form.category === "bullets";
  const isPw = form.category === "powder";
  const isBr = form.category === "brass";

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
        {/* Photos */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={S.label}>Photo 1</label>
              <button onClick={() => setShowPhoto(true)} style={{ width: "100%", aspectRatio: "1", borderRadius: 6, border: "1px dashed #2a2a2a", background: "#242424", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                {form.photo_url ? <img src={form.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} /> : <Camera style={{ width: 24, height: 24, color: "#6b7280" }} />}
              </button>
            </div>
            <div>
              <label style={S.label}>Photo 2</label>
              <button onClick={() => setShowPhoto2(true)} style={{ width: "100%", aspectRatio: "1", borderRadius: 6, border: "1px dashed #2a2a2a", background: "#242424", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                {form.photo_url_2 ? <img src={form.photo_url_2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} /> : <Camera style={{ width: 24, height: 24, color: "#6b7280" }} />}
              </button>
            </div>
          </div>
          {form.photo_url && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={handleAILookup} disabled={aiLoading} style={{ background: "#242424", border: "1px solid #f97316", borderRadius: 3, color: "#f97316", fontSize: 12, fontWeight: 600, padding: "8px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: aiLoading ? 0.5 : 1 }}>
                <Sparkles style={{ width: 13, height: 13 }} /> Re-ID
              </button>
              <button onClick={handleEnhance} disabled={aiLoading} style={{ background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#a3a3a3", fontSize: 12, fontWeight: 600, padding: "8px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: aiLoading ? 0.5 : 1 }}>
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

        {/* ── PRIMERS ── */}
        {isP && (
          <>
            <div style={S.grid2}>
              <div>
                <label style={S.label}># of Sleeves</label>
                <input type="number" min="0" value={form.sleeve_count} onChange={(e) => handlePrimerField("sleeve_count", e.target.value)} placeholder="" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Units Per Sleeve</label>
                <input type="number" min="1" value={form.units_per_sleeve} onChange={(e) => handlePrimerField("units_per_sleeve", e.target.value)} style={S.input} />
              </div>
            </div>
            <div style={S.section}>
              <label style={S.label}>Total Count <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>calculated</span></label>
              <div style={S.readOnly}>{fmtCount(form.total_unit_count)} count</div>
            </div>
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Total Cost Paid ($)</label>
                <input type="number" min="0" step="0.01" value={form.total_cost} onChange={(e) => handlePrimerField("total_cost", e.target.value)} placeholder="" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Cost Per Unit <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>calculated</span></label>
                <div style={S.readOnly}>{fmt4(form.cost_per_unit)}/ea</div>
              </div>
            </div>
          </>
        )}

        {/* ── BULLETS ── */}
        {isB && (
          <>
            <div style={S.grid2}>
              <div>
                <label style={S.label}># of Boxes</label>
                <input type="number" min="0" value={form.box_count} onChange={(e) => handleBulletField("box_count", e.target.value)} placeholder="" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Bullets Per Box</label>
                <input type="number" min="1" value={form.bullets_per_box} onChange={(e) => handleBulletField("bullets_per_box", e.target.value)} style={S.input} />
              </div>
            </div>
            <div style={S.section}>
              <label style={S.label}>Total Count <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>calculated</span></label>
              <div style={S.readOnly}>{fmtCount(form.total_bullet_count)} count</div>
            </div>
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Total Cost Paid ($)</label>
                <input type="number" min="0" step="0.01" value={form.total_cost} onChange={(e) => handleBulletField("total_cost", e.target.value)} placeholder="" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Cost Per Bullet <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>calculated</span></label>
                <div style={S.readOnly}>{fmt4(form.cost_per_unit)}/ea</div>
              </div>
            </div>
          </>
        )}

        {/* ── POWDER ── */}
        {isPw && (
          <>
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Pounds Purchased (lbs)</label>
                <input type="number" min="0" step="0.001" value={form.powder_lbs} onChange={(e) => handlePowderField("powder_lbs", e.target.value)} placeholder="" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Grains <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>calculated</span></label>
                <div style={S.readOnly}>{fmtCount(form.powder_grains)} gr</div>
              </div>
            </div>
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Total Cost Paid ($)</label>
                <input type="number" min="0" step="0.01" value={form.total_cost} onChange={(e) => handlePowderField("total_cost", e.target.value)} placeholder="" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Cost Per Grain <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>calculated</span></label>
                <div style={S.readOnly}>{fmt4(form.cost_per_grain)}/grain</div>
              </div>
            </div>
          </>
        )}

        {/* ── BRASS ── */}
        {isBr && (
          <>
            <div style={S.grid2}>
              <div>
                <label style={S.label}># of Boxes</label>
                <input type="number" min="0" value={form.brass_box_count} onChange={(e) => handleBrassField("brass_box_count", e.target.value)} placeholder="" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Cases Per Box</label>
                <input type="number" min="1" value={form.cases_per_box} onChange={(e) => handleBrassField("cases_per_box", e.target.value)} style={S.input} />
              </div>
            </div>
            <div style={S.section}>
              <label style={S.label}>Total Cases <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>calculated</span></label>
              <div style={S.readOnly}>{fmtCount(form.total_cases)} cases</div>
            </div>
            <div style={S.section}>
              <label style={S.label}>Expected Uses Per Case</label>
              <input type="number" min="0" value={form.uses_per_case} onChange={(e) => handleBrassField("uses_per_case", e.target.value)} placeholder="" style={S.input} />
            </div>
            <div style={S.section}>
              <label style={S.label}>Total Unit Uses <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>calculated</span></label>
              <div style={S.readOnly}>{fmtCount(form.total_unit_uses)} uses</div>
            </div>
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Total Cost Paid ($)</label>
                <input type="number" min="0" step="0.01" value={form.total_cost} onChange={(e) => handleBrassField("total_cost", e.target.value)} placeholder="" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Cost Per Use <span style={{ color: "#525252", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>calculated</span></label>
                <div style={S.readOnly}>{fmt4(form.cost_per_use)}/use</div>
              </div>
            </div>
          </>
        )}

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

        {/* Notes */}
        <div style={S.section}>
          <label style={S.label}>Notes</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Notes about this component…" rows={3} style={{ ...S.input, resize: "none" }} />
        </div>
      </div>
    </div>
  );
}