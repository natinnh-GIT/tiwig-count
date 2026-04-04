import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera } from "lucide-react";
import SuggestInput from "@/components/SuggestInput";
import PhotoCapture from "@/components/PhotoCapture";
import OpticPicker from "@/components/OpticPicker";
import StockInput from "@/components/StockInput";

const S = {
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "#0f0f0f", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2a2a", background: "#1a1a1a", flexShrink: 0 },
  title: { color: "#f5f5f5", fontWeight: 700, fontSize: 15 },
  saveBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 3, padding: "7px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  body: { flex: 1, overflowY: "auto", padding: "16px" },
  label: { display: "block", color: "#a3a3a3", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 },
  input: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#f5f5f5", padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3, color: "#f5f5f5", padding: "9px 12px", fontSize: 13, outline: "none", appearance: "none" },
  section: { marginBottom: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  collapsibleHeader: { display: "flex", alignItems: "center", gap: 8, padding: "0 0 8px 0", cursor: "pointer", marginBottom: 12, borderLeft: "2px solid #f97316", paddingLeft: 10 },
  headerText: { color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" },
};

const getETNow = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default function FirearmModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(item || {
    name: "", type: "Rifle", make: "", model: "", caliber: "", serial_number: "", stock: "Factory",
    barrel_length: "", barrel_contour: "Sporter", expected_barrel_life: "", current_round_count: 0,
    trigger_brand: "", trigger_pull_oz: "", suppressor_model: "", suppressor_type: "N/A", suppressor_serial: "",
    optic_id: "", optic_name: "", notes: "", photo_url: "", created_et: "", modified_et: "",
  });
  const [allFirearms, setAllFirearms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [expandSuppressor, setExpandSuppressor] = useState(false);

  useEffect(() => {
    base44.entities.Firearm.list().then(setAllFirearms);
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const unique = (arr) => [...new Set(arr.filter(Boolean))].sort();
  const makeSuggestions = unique(allFirearms.map(f => f.make));
  const modelSuggestions = unique(allFirearms.map(f => f.model));
  const caliberSuggestions = unique(allFirearms.map(f => f.caliber));
  const barrelLengthSuggestions = unique(allFirearms.map(f => f.barrel_length));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      expected_barrel_life: form.expected_barrel_life ? Number(form.expected_barrel_life) : undefined,
      current_round_count: form.current_round_count ? Number(form.current_round_count) : 0,
      trigger_pull_oz: form.trigger_pull_oz ? Number(form.trigger_pull_oz) : undefined,
      modified_et: getETNow(),
    };
    if (!item?.id) {
      payload.created_et = getETNow();
    }
    if (item?.id) {
      await base44.entities.Firearm.update(item.id, payload);
    } else {
      await base44.entities.Firearm.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  const handlePhotoCaptured = (url) => {
    set("photo_url", url);
    setShowPhoto(false);
  };

  if (showPhoto) return <PhotoCapture onCapture={handlePhotoCaptured} onClose={() => setShowPhoto(false)} />;

  return (
    <div style={S.overlay}>
      <div style={S.header}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 4 }}>
          <X style={{ width: 20, height: 20 }} />
        </button>
        <span style={S.title}>{item ? "Edit Firearm" : "Add Firearm"}</span>
        <button onClick={handleSave} disabled={saving || !form.name} style={{ ...S.saveBtn, opacity: (saving || !form.name) ? 0.5 : 1 }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div style={S.body}>
        {/* Photo */}
        <div style={S.section}>
          <label style={S.label}>Photo</label>
          <button
            onClick={() => setShowPhoto(true)}
            style={{ width: "100%", aspectRatio: "1", borderRadius: 6, border: "1px dashed #2a2a2a", background: "#242424", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            {form.photo_url
              ? <img src={form.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
              : <Camera style={{ width: 24, height: 24, color: "#6b7280" }} />}
          </button>
        </div>

        {/* Name */}
        <div style={S.section}>
          <label style={S.label}>Name *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Savage 110 6.5CM" style={S.input} />
        </div>

        {/* Type */}
        <div style={S.section}>
          <label style={S.label}>Type</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} style={S.select}>
            <option value="Rifle">Rifle</option>
            <option value="Pistol">Pistol</option>
            <option value="Shotgun">Shotgun</option>
            <option value="AR">AR</option>
            <option value="Rimfire">Rimfire</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Make + Model */}
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Make</label>
            <SuggestInput value={form.make} onChange={(v) => set("make", v)} suggestions={makeSuggestions} placeholder="Savage, Remington..." darkStyle />
          </div>
          <div>
            <label style={S.label}>Model</label>
            <SuggestInput value={form.model} onChange={(v) => set("model", v)} suggestions={modelSuggestions} placeholder="110, 700..." darkStyle />
          </div>
        </div>

        {/* Caliber + Serial */}
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Caliber</label>
            <SuggestInput value={form.caliber} onChange={(v) => set("caliber", v)} suggestions={caliberSuggestions} placeholder=".308, 6.5CM..." darkStyle />
          </div>
          <div>
            <label style={S.label}>Serial Number</label>
            <input value={form.serial_number || ""} onChange={(e) => set("serial_number", e.target.value)} placeholder="Serial..." style={S.input} />
          </div>
        </div>

        {/* Stock */}
        <div style={S.section}>
          <StockInput value={form.stock} onChange={(v) => set("stock", v)} />
        </div>

        {/* Barrel Length + Contour */}
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Barrel Length</label>
            <SuggestInput value={form.barrel_length} onChange={(v) => set("barrel_length", v)} suggestions={barrelLengthSuggestions} placeholder="24" darkStyle />
          </div>
          <div>
            <label style={S.label}>Barrel Contour</label>
            <select value={form.barrel_contour} onChange={(e) => set("barrel_contour", e.target.value)} style={S.select}>
              <option value="Sporter">Sporter</option>
              <option value="Bull">Bull</option>
              <option value="Varmint">Varmint</option>
              <option value="Sendero">Sendero</option>
              <option value="Palma">Palma</option>
              <option value="Fluted">Fluted</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Barrel Life + Round Count */}
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Expected Barrel Life (rounds)</label>
            <input type="number" value={form.expected_barrel_life || ""} onChange={(e) => set("expected_barrel_life", e.target.value)} placeholder="0" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Current Round Count</label>
            <input type="number" value={form.current_round_count || 0} onChange={(e) => set("current_round_count", e.target.value)} placeholder="0" style={S.input} />
          </div>
        </div>

        {/* Trigger */}
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Trigger Brand/Model</label>
            <input value={form.trigger_brand || ""} onChange={(e) => set("trigger_brand", e.target.value)} placeholder="Timney 510..." style={S.input} />
          </div>
          <div>
            <label style={S.label}>Trigger Pull (oz)</label>
            <input type="number" value={form.trigger_pull_oz || ""} onChange={(e) => set("trigger_pull_oz", e.target.value)} placeholder="0.0" step="0.1" style={S.input} />
          </div>
        </div>

        {/* Suppressor Section */}
        <div style={S.section}>
          <div style={S.collapsibleHeader} onClick={() => setExpandSuppressor(!expandSuppressor)}>
            <span style={S.headerText}>Suppressor</span>
          </div>
          {expandSuppressor && (
            <>
              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Model</label>
                  <input value={form.suppressor_model || ""} onChange={(e) => set("suppressor_model", e.target.value)} placeholder="SilencerCo Omega..." style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Type</label>
                  <select value={form.suppressor_type} onChange={(e) => set("suppressor_type", e.target.value)} style={S.select}>
                    <option value="Direct Thread">Direct Thread</option>
                    <option value="Quick Detach">Quick Detach</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
              </div>
              <div style={S.section}>
                <label style={S.label}>Serial</label>
                <input value={form.suppressor_serial || ""} onChange={(e) => set("suppressor_serial", e.target.value)} placeholder="Serial..." style={S.input} />
              </div>
            </>
          )}
        </div>

        {/* Optic Picker */}
        <div style={S.section}>
          <OpticPicker value={form.optic_id} onChange={(id) => {
            const opt = allFirearms.length; // Just to have access
            set("optic_id", id);
            // Note: optic_name would be set in detail view or on load
          }} />
        </div>

        {/* Notes */}
        <div style={S.section}>
          <label style={S.label}>Notes</label>
          <textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Notes..." rows={3} style={{ ...S.input, resize: "none" }} />
        </div>
      </div>
    </div>
  );
}