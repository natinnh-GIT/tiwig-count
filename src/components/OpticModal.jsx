import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera } from "lucide-react";
import PhotoCapture from "@/components/PhotoCapture";
import SuggestInput from "@/components/SuggestInput";

const S = {
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "#0f0f0f", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2a2a", background: "#1a1a1a", flexShrink: 0 },
  title: { color: "#f5f5f5", fontWeight: 700, fontSize: 15 },
  saveBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 3, padding: "7px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  body: { flex: 1, overflowY: "auto", padding: "16px" },
  label: { display: "block", color: "#a3a3a3", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 },
  input: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#f5f5f5", padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#f5f5f5", padding: "9px 12px", fontSize: 13, outline: "none", appearance: "none", boxSizing: "border-box" },
  section: { marginBottom: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  sectionHeader: { color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, paddingLeft: 10, borderLeft: "2px solid #f97316" },
  divider: { borderTop: "1px solid #2a2a2a", marginBottom: 16 },
};

const getETNow = () => new Date().toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });

const EMPTY = { brand: "", model: "", serial_number: "", type: "", magnification: "", objective_lens: "", tube_diameter: "", reticle: "", focal_plane: "", adjustment_units: "", max_elevation: "", max_windage: "", finish: "", condition: "", purchase_date: "", purchased_from: "", purchase_price: "", current_value: "", mounted_on_firearm_id: "", mounted_on_firearm_name: "", mount_info: "", notes: "", photo_url: "" };

export default function OpticModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(item ? { ...EMPTY, ...item } : { ...EMPTY });
  const [allOptics, setAllOptics] = useState([]);
  const [allFirearms, setAllFirearms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  useEffect(() => {
    base44.entities.Optic.list().then(setAllOptics);
    base44.entities.Firearm.list().then(setAllFirearms);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const unique = arr => [...new Set(arr.filter(Boolean))].sort();
  const brandSuggestions = unique(allOptics.map(o => o.brand));
  const modelSuggestions = unique(allOptics.map(o => o.model));
  const reticleSuggestions = unique(allOptics.map(o => o.reticle));
  const finishSuggestions = unique([...allOptics.map(o => o.finish), "Matte Black", "Flat Dark Earth", "OD Green", "Graphite", "Cerakote", "Silver"]);

  const handleFirearmChange = (id) => {
    const firearm = allFirearms.find(f => f.id === id);
    set("mounted_on_firearm_id", id);
    set("mounted_on_firearm_name", firearm?.name || "");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, purchase_price: form.purchase_price ? Number(form.purchase_price) : undefined, current_value: form.current_value ? Number(form.current_value) : undefined, max_elevation: form.max_elevation ? Number(form.max_elevation) : undefined, max_windage: form.max_windage ? Number(form.max_windage) : undefined, modified_et: getETNow() };
    if (!item?.id) payload.created_et = getETNow();
    if (item?.id) { await base44.entities.Optic.update(item.id, payload); } else { await base44.entities.Optic.create(payload); }
    setSaving(false);
    onSaved();
  };

  if (showPhoto) return <PhotoCapture onCapture={url => { set("photo_url", url); setShowPhoto(false); }} onClose={() => setShowPhoto(false)} />;

  return (
    <div style={S.overlay}>
      <div style={S.header}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 4 }}><X style={{ width: 20, height: 20 }} /></button>
        <span style={S.title}>{item ? "Edit Optic" : "Add Optic"}</span>
        <button onClick={handleSave} disabled={saving || !form.brand || !form.model} style={{ ...S.saveBtn, opacity: (saving || !form.brand || !form.model) ? 0.5 : 1 }}>{saving ? "Saving…" : "Save"}</button>
      </div>
      <div style={S.body}>
        <div style={S.section}>
          <label style={S.label}>Photo</label>
          <button onClick={() => setShowPhoto(true)} style={{ width: "100%", aspectRatio: "16/9", borderRadius: 6, border: "1px dashed #2a2a2a", background: "#242424", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            {form.photo_url ? <img src={form.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera style={{ width: 28, height: 28, color: "#6b7280" }} />}
          </button>
        </div>
        <div style={S.sectionHeader}>Identity</div>
        <div style={S.grid2}>
          <div><label style={S.label}>Make *</label><SuggestInput value={form.brand} onChange={v => set("brand", v)} suggestions={brandSuggestions} placeholder="Vortex, Leupold…" darkStyle /></div>
          <div><label style={S.label}>Model *</label><SuggestInput value={form.model} onChange={v => set("model", v)} suggestions={modelSuggestions} placeholder="Razor HD, Mark 5…" darkStyle /></div>
        </div>
        <div style={S.grid2}>
          <div><label style={S.label}>Type</label><select value={form.type} onChange={e => set("type", e.target.value)} style={S.select}><option value="">— Select —</option>{["Scope","LPVO","Red Dot","Holographic","Prism","Binocular","Monocular","Rangefinder","Night Vision","Thermal","Other"].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.label}>Serial Number</label><input value={form.serial_number} onChange={e => set("serial_number", e.target.value)} placeholder="Serial…" style={S.input} /></div>
        </div>
        <div style={S.grid2}>
          <div><label style={S.label}>Condition</label><select value={form.condition} onChange={e => set("condition", e.target.value)} style={S.select}><option value="">— Select —</option>{["New","Excellent","Very Good","Good","Fair","Poor"].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label style={S.label}>Finish</label><SuggestInput value={form.finish} onChange={v => set("finish", v)} suggestions={finishSuggestions} placeholder="Matte Black, FDE…" darkStyle /></div>
        </div>
        <div style={S.divider} />
        <div style={{ ...S.sectionHeader, marginTop: 4 }}>Optical Specs</div>
        <div style={S.grid2}>
          <div><label style={S.label}>Magnification</label><input value={form.magnification} onChange={e => set("magnification", e.target.value)} placeholder="5-25x, 1-6x, 4x…" style={S.input} /></div>
          <div><label style={S.label}>Objective Lens</label><input value={form.objective_lens} onChange={e => set("objective_lens", e.target.value)} placeholder="50mm, 44mm…" style={S.input} /></div>
        </div>
        <div style={S.grid2}>
          <div><label style={S.label}>Tube Diameter</label><select value={form.tube_diameter} onChange={e => set("tube_diameter", e.target.value)} style={S.select}><option value="">— Select —</option>{["1 inch","30mm","34mm","35mm","other"].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.label}>Focal Plane</label><select value={form.focal_plane} onChange={e => set("focal_plane", e.target.value)} style={S.select}><option value="">— Select —</option><option value="FFP">FFP (First Focal Plane)</option><option value="SFP">SFP (Second Focal Plane)</option></select></div>
        </div>
        <div style={S.section}><label style={S.label}>Reticle</label><SuggestInput value={form.reticle} onChange={v => set("reticle", v)} suggestions={reticleSuggestions} placeholder="EBR-2C, Horus H59, BDC…" darkStyle /></div>
        <div style={S.grid2}>
          <div><label style={S.label}>Adjustment Units</label><select value={form.adjustment_units} onChange={e => set("adjustment_units", e.target.value)} style={S.select}><option value="">— Select —</option><option value="MOA">MOA</option><option value="MRAD">MRAD</option></select></div>
          <div />
        </div>
        <div style={S.grid2}>
          <div><label style={S.label}>Max Elevation {form.adjustment_units ? `(${form.adjustment_units})` : ""}</label><input type="number" value={form.max_elevation} onChange={e => set("max_elevation", e.target.value)} placeholder="0" style={S.input} /></div>
          <div><label style={S.label}>Max Windage {form.adjustment_units ? `(${form.adjustment_units})` : ""}</label><input type="number" value={form.max_windage} onChange={e => set("max_windage", e.target.value)} placeholder="0" style={S.input} /></div>
        </div>
        <div style={S.divider} />
        <div style={{ ...S.sectionHeader, marginTop: 4 }}>Mount</div>
        <div style={S.section}><label style={S.label}>Mounted On Firearm</label><select value={form.mounted_on_firearm_id} onChange={e => handleFirearmChange(e.target.value)} style={S.select}><option value="">— Not mounted —</option>{allFirearms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <div style={S.section}><label style={S.label}>Mount / Rings Info</label><input value={form.mount_info || form.rings_mounts || ""} onChange={e => set("mount_info", e.target.value)} placeholder="Badger Ordnance 30mm, 20 MOA base…" style={S.input} /></div>
        <div style={S.divider} />
        <div style={{ ...S.sectionHeader, marginTop: 4 }}>Purchase</div>
        <div style={S.grid2}>
          <div><label style={S.label}>Purchase Date</label><input type="date" value={form.purchase_date} onChange={e => set("purchase_date", e.target.value)} style={S.input} /></div>
          <div><label style={S.label}>Purchased From</label><input value={form.purchased_from} onChange={e => set("purchased_from", e.target.value)} placeholder="Retailer…" style={S.input} /></div>
        </div>
        <div style={S.grid2}>
          <div><label style={S.label}>Purchase Price ($)</label><input type="number" step="0.01" value={form.purchase_price} onChange={e => set("purchase_price", e.target.value)} placeholder="0.00" style={S.input} /></div>
          <div><label style={S.label}>Current Value ($)</label><input type="number" step="0.01" value={form.current_value} onChange={e => set("current_value", e.target.value)} placeholder="0.00" style={S.input} /></div>
        </div>
        <div style={S.divider} />
        <div style={{ ...S.sectionHeader, marginTop: 4 }}>Notes</div>
        <div style={S.section}><textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Zero data, maintenance log, accessories…" rows={4} style={{ ...S.input, resize: "vertical" }} /></div>
      </div>
    </div>
  );
}