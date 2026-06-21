import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera } from "lucide-react";
import SuggestInput from "@/components/SuggestInput";
import PhotoCapture from "@/components/PhotoCapture";
import OpticPicker from "@/components/OpticPicker";
import EditableCombobox from "@/components/EditableCombobox";

const S = {
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "#0f0f0f", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #2a2a2a", background: "#1a1a1a", flexShrink: 0, minHeight: 56 },
  title: { color: "#f5f5f5", fontWeight: 700, fontSize: 17 },
  saveBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 4, padding: "10px 22px", fontWeight: 700, fontSize: 15, cursor: "pointer", minHeight: 44 },
  body: { flex: 1, overflowY: "auto", padding: "20px 16px" },
  label: { display: "block", color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 4, color: "#f5f5f5", padding: "14px 12px", fontSize: 16, outline: "none", boxSizing: "border-box", minHeight: 48 },
  select: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 4, color: "#f5f5f5", padding: "14px 12px", fontSize: 16, outline: "none", appearance: "none", boxSizing: "border-box", minHeight: 48 },
  section: { marginBottom: 20 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 },
  sectionHeader: { color: "#a3a3a3", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, paddingLeft: 10, borderLeft: "2px solid #f97316" },
  divider: { borderTop: "1px solid #2a2a2a", marginBottom: 20 },
};

const getETNow = () =>
  new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });

const EMPTY = {
  name: "", type: "", make: "", model: "", serial_number: "", caliber: "",
  action: "", barrel_length: "", barrel_contour: "", twist_rate: "",
  overall_length: "", weight_lbs: "", stock: "", finish: "", condition: "",
  trigger_brand: "", trigger_pull_oz: "", expected_barrel_life: "", current_round_count: 0,
  suppressor_model: "", suppressor_type: "", suppressor_serial: "",
  optic_id: "", optic_name: "",
  purchase_date: "", purchased_from: "", ffl_dealer: "", purchase_price: "", current_value: "",
  notes: "", photo_url: "", photo_url_2: "",
};

export default function FirearmModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(item ? { ...EMPTY, ...item } : { ...EMPTY });
  const [allFirearms, setAllFirearms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showPhoto2, setShowPhoto2] = useState(false);
  const [showSuppressor, setShowSuppressor] = useState(!!(item?.suppressor_model));

  useEffect(() => { base44.entities.Firearm.list().then(setAllFirearms); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const unique = arr => [...new Set(arr.filter(Boolean))].sort();
  const makeSuggestions = unique(allFirearms.map(f => f.make));
  const modelSuggestions = unique(allFirearms.map(f => f.model));
  const caliberSuggestions = unique(allFirearms.map(f => f.caliber));
  const finishSuggestions = unique([...allFirearms.map(f => f.finish), "Matte Black", "Flat Dark Earth", "Parkerized", "Blued", "Stainless", "Cerakote"]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      expected_barrel_life: form.expected_barrel_life ? Number(form.expected_barrel_life) : undefined,
      current_round_count: Number(form.current_round_count) || 0,
      trigger_pull_oz: form.trigger_pull_oz ? Number(form.trigger_pull_oz) : undefined,
      weight_lbs: form.weight_lbs ? Number(form.weight_lbs) : undefined,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : undefined,
      current_value: form.current_value ? Number(form.current_value) : undefined,
      modified_et: getETNow(),
    };
    if (!item?.id) payload.created_et = getETNow();
    if (item?.id) {
      await base44.entities.Firearm.update(item.id, payload);
    } else {
      await base44.entities.Firearm.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  if (showPhoto) return <PhotoCapture onCapture={url => { set("photo_url", url); setShowPhoto(false); }} onClose={() => setShowPhoto(false)} />;
  if (showPhoto2) return <PhotoCapture onCapture={url => { set("photo_url_2", url); setShowPhoto2(false); }} onClose={() => setShowPhoto2(false)} />;

  return (
    <div style={S.overlay}>
      <div style={S.header}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 10, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X style={{ width: 22, height: 22 }} />
        </button>
        <span style={S.title}>{item ? "Edit Firearm" : "Add Firearm"}</span>
        <button
          onClick={handleSave}
          disabled={saving || !form.name}
          style={{ ...S.saveBtn, opacity: (saving || !form.name) ? 0.5 : 1 }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div style={S.body}>
        {/* Photos */}
        <div style={{ ...S.section, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={S.label}>Photo 1</label>
            <button onClick={() => setShowPhoto(true)} style={{ width: "100%", aspectRatio: "16/9", borderRadius: 6, border: "1px dashed #2a2a2a", background: "#242424", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {form.photo_url ? <img src={form.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera style={{ width: 24, height: 24, color: "#6b7280" }} />}
            </button>
          </div>
          <div>
            <label style={S.label}>Photo 2</label>
            <button onClick={() => setShowPhoto2(true)} style={{ width: "100%", aspectRatio: "16/9", borderRadius: 6, border: "1px dashed #2a2a2a", background: "#242424", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {form.photo_url_2 ? <img src={form.photo_url_2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera style={{ width: 24, height: 24, color: "#6b7280" }} />}
            </button>
          </div>
        </div>

        {/* Identity */}
        <div style={S.sectionHeader}>Identity</div>

        <div style={S.section}>
          <label style={S.label}>Name *</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Savage 110 6.5CM" style={S.input} />
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} style={S.select}>
              <option value="">— Select —</option>
              {["Rifle", "Pistol", "Shotgun", "AR", "Rimfire", "Revolver", "Other"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>Action</label>
            <select value={form.action} onChange={e => set("action", e.target.value)} style={S.select}>
              <option value="">— Select —</option>
              {["Bolt-Action", "Semi-Auto", "Lever-Action", "Pump", "Single-Shot", "Break-Action", "Revolver", "Other"].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Make</label>
            <SuggestInput value={form.make} onChange={v => set("make", v)} suggestions={makeSuggestions} placeholder="Savage, Remington…" darkStyle />
          </div>
          <div>
            <label style={S.label}>Model</label>
            <SuggestInput value={form.model} onChange={v => set("model", v)} suggestions={modelSuggestions} placeholder="110, 700…" darkStyle />
          </div>
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Caliber</label>
            <SuggestInput value={form.caliber} onChange={v => set("caliber", v)} suggestions={caliberSuggestions} placeholder=".308, 6.5CM…" darkStyle />
          </div>
          <div>
            <label style={S.label}>Serial Number</label>
            <input value={form.serial_number || ""} onChange={e => set("serial_number", e.target.value)} placeholder="Serial…" style={S.input} />
          </div>
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Condition</label>
            <select value={form.condition} onChange={e => set("condition", e.target.value)} style={S.select}>
              <option value="">— Select —</option>
              {["New", "Excellent", "Very Good", "Good", "Fair", "Poor"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>Finish</label>
            <SuggestInput value={form.finish || ""} onChange={v => set("finish", v)} suggestions={finishSuggestions} placeholder="Matte Black, Cerakote…" darkStyle />
          </div>
        </div>

        <div style={S.divider} />

        {/* Barrel & Build */}
        <div style={{ ...S.sectionHeader, marginTop: 4 }}>Barrel & Build</div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Barrel Length (in)</label>
            <input value={form.barrel_length || ""} onChange={e => set("barrel_length", e.target.value)} placeholder='24"' style={S.input} />
          </div>
          <div>
            <label style={S.label}>Twist Rate</label>
            <input value={form.twist_rate || ""} onChange={e => set("twist_rate", e.target.value)} placeholder="1:10, 1:8…" style={S.input} />
          </div>
        </div>

        <div style={S.grid2}>
          <div>
            <EditableCombobox
              label="Barrel Contour"
              value={form.barrel_contour}
              onChange={v => set("barrel_contour", v)}
              presetOptions={["Sporter", "Bull", "Varmint", "Sendero", "Palma", "Fluted", "Other"]}
              entityName="BarrelContourOption"
            />
          </div>
          <div>
            <EditableCombobox
              label="Stock"
              value={form.stock}
              onChange={v => set("stock", v)}
              presetOptions={["Factory", "Wood", "Chassis", "Laminate", "Thumbhole", "Folding", "Other"]}
              entityName="StockOption"
            />
          </div>
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Overall Length</label>
            <input value={form.overall_length || ""} onChange={e => set("overall_length", e.target.value)} placeholder='44.5"' style={S.input} />
          </div>
          <div>
            <label style={S.label}>Weight (lbs)</label>
            <input type="number" step="0.1" value={form.weight_lbs || ""} onChange={e => set("weight_lbs", e.target.value)} placeholder="8.5" style={S.input} />
          </div>
        </div>

        <div style={S.divider} />

        {/* Performance */}
        <div style={{ ...S.sectionHeader, marginTop: 4 }}>Performance</div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Expected Barrel Life (rds)</label>
            <input type="number" value={form.expected_barrel_life || ""} onChange={e => set("expected_barrel_life", e.target.value)} placeholder="3000" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Current Round Count</label>
            <input type="number" value={form.current_round_count || 0} onChange={e => set("current_round_count", e.target.value)} placeholder="0" style={S.input} />
          </div>
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Trigger Brand/Model</label>
            <input value={form.trigger_brand || ""} onChange={e => set("trigger_brand", e.target.value)} placeholder="Timney 510…" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Trigger Pull (oz)</label>
            <input type="number" step="0.1" value={form.trigger_pull_oz || ""} onChange={e => set("trigger_pull_oz", e.target.value)} placeholder="0.0" style={S.input} />
          </div>
        </div>

        <div style={S.divider} />

        {/* Optic */}
        <div style={{ ...S.sectionHeader, marginTop: 4 }}>Optic</div>
        <div style={S.section}>
          <OpticPicker value={form.optic_id} onChange={id => set("optic_id", id)} />
        </div>

        <div style={S.divider} />

        {/* Suppressor */}
        <div
          style={{ ...S.sectionHeader, marginTop: 4, cursor: "pointer", userSelect: "none" }}
          onClick={() => setShowSuppressor(s => !s)}
        >
          Suppressor {showSuppressor ? "▲" : "▼"}
        </div>
        {showSuppressor && (
          <>
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Model</label>
                <input value={form.suppressor_model || ""} onChange={e => set("suppressor_model", e.target.value)} placeholder="SilencerCo Omega…" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Type</label>
                <select value={form.suppressor_type || ""} onChange={e => set("suppressor_type", e.target.value)} style={S.select}>
                  <option value="">— Select —</option>
                  <option value="Direct Thread">Direct Thread</option>
                  <option value="Quick Detach">Quick Detach</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
            </div>
            <div style={S.section}>
              <label style={S.label}>Serial</label>
              <input value={form.suppressor_serial || ""} onChange={e => set("suppressor_serial", e.target.value)} placeholder="Serial…" style={S.input} />
            </div>
          </>
        )}

        <div style={S.divider} />

        {/* Purchase */}
        <div style={{ ...S.sectionHeader, marginTop: 4 }}>Purchase</div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Purchase Date</label>
            <input type="date" value={form.purchase_date || ""} onChange={e => set("purchase_date", e.target.value)} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Purchased From</label>
            <input value={form.purchased_from || ""} onChange={e => set("purchased_from", e.target.value)} placeholder="Retailer…" style={S.input} />
          </div>
        </div>

        <div style={S.section}>
          <label style={S.label}>FFL Dealer</label>
          <input value={form.ffl_dealer || ""} onChange={e => set("ffl_dealer", e.target.value)} placeholder="Dealer name for transfer…" style={S.input} />
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Purchase Price ($)</label>
            <input type="number" step="0.01" value={form.purchase_price || ""} onChange={e => set("purchase_price", e.target.value)} placeholder="0.00" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Current Value ($)</label>
            <input type="number" step="0.01" value={form.current_value || ""} onChange={e => set("current_value", e.target.value)} placeholder="0.00" style={S.input} />
          </div>
        </div>

        <div style={S.divider} />

        {/* Notes */}
        <div style={{ ...S.sectionHeader, marginTop: 4 }}>Notes</div>
        <div style={S.section}>
          <textarea
            value={form.notes || ""}
            onChange={e => set("notes", e.target.value)}
            placeholder="Modifications, accessories, history…"
            rows={4}
            style={{ ...S.input, resize: "vertical" }}
          />
        </div>
      </div>
    </div>
  );
}