import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera } from "lucide-react";
import PhotoCapture from "@/components/PhotoCapture";

// ── Catalog ──────────────────────────────────────────────────────────────────

const EQUIP_TYPES = [
  "Press — Single Stage",
  "Press — Turret",
  "Press — Progressive",
  "Die Set",
  "Scale / Auto Trickler",
  "Powder Measure",
  "Case Trimmer",
  "Case Prep Center",
  "Annealer",
  "Brass Tumbler — Vibratory",
  "Brass Tumbler — Rotary/Wet",
  "Ultrasonic Cleaner",
  "Priming Tool",
  "Caliper",
  "Chronograph",
  "Bullet Puller",
  "Loading Block",
  "Case Gauge",
  "Other",
];

const CONSUMABLE_TYPES = [
  "Bore Patches",
  "Bore Brushes / Mops",
  "Cleaning Rods",
  "Cleaning Solvent",
  "Case Lube",
  "Neck Lube",
  "Tumbling Media",
  "Stainless Steel Pins",
  "Shell Holders",
  "Primer Tubes",
  "Decapping Pins",
  "Firearm Lubricant / CLP",
  "Other",
];

const BRANDS_BY_EQUIP_TYPE = {
  "Press — Single Stage":       ["RCBS", "Redding", "Forster", "Lyman", "Lee Precision", "Hornady"],
  "Press — Turret":             ["RCBS", "Redding", "Lee Precision", "Lyman"],
  "Press — Progressive":        ["Dillon Precision", "Hornady", "Lee Precision", "Lyman", "RCBS"],
  "Die Set":                    ["Redding", "RCBS", "Hornady", "Forster", "Lee Precision", "Lyman", "Nosler", "Wilson", "Lapua", "Sinclair"],
  "Scale / Auto Trickler":      ["RCBS", "Lyman", "Prometheus", "AutoTrickler", "Sartorius", "A&D", "Ohaus", "PACT", "Frankford Arsenal"],
  "Powder Measure":             ["RCBS", "Redding", "Lyman", "Dillon Precision", "Hornady", "Lee Precision"],
  "Case Trimmer":               ["RCBS", "Redding", "Lyman", "Forster", "Wilson", "Little Crow Gunworks", "Frankford Arsenal"],
  "Case Prep Center":           ["RCBS", "Hornady", "Lyman", "Frankford Arsenal"],
  "Annealer":                   ["AMP", "Bench Source", "Annealeez", "GinaErick"],
  "Brass Tumbler — Vibratory":  ["Lyman", "RCBS", "Frankford Arsenal", "Berry's", "Hornady"],
  "Brass Tumbler — Rotary/Wet": ["Dillon Precision", "Frankford Arsenal", "Lyman", "RCBS", "Hornady"],
  "Ultrasonic Cleaner":         ["Hornady", "Frankford Arsenal", "RCBS", "Lyman"],
  "Priming Tool":               ["RCBS", "Redding", "Lee Precision", "Hornady", "CPS", "Sinclair"],
  "Caliper":                    ["Mitutoyo", "Hornady", "RCBS", "Wheeler", "Frankford Arsenal", "Starrett"],
  "Chronograph":                ["MagnetoSpeed", "Garmin", "LabRadar", "Caldwell", "Shooting Chrony", "Competition Electronics"],
  "Bullet Puller":              ["RCBS", "Hornady", "Lyman"],
  "Loading Block":              ["RCBS", "Sinclair", "Frankford Arsenal", "Lyman", "MTM"],
  "Case Gauge":                 ["Wilson", "Dillon Precision", "Lyman", "Hornady", "RCBS"],
  "Other":                      [],
};

const BRANDS_BY_CONSUMABLE_TYPE = {
  "Bore Patches":               ["Hoppe's", "Otis", "Pro-Shot", "Kleen-Bore", "Birchwood Casey"],
  "Bore Brushes / Mops":        ["Hoppe's", "Tipton", "Pro-Shot", "Otis", "Bore Tech", "Brownells"],
  "Cleaning Rods":              ["Tipton", "Dewey", "Bore Tech", "Pro-Shot", "Otis"],
  "Cleaning Solvent":           ["Hoppe's", "Bore Tech", "Barnes", "Butch's", "Montana X-Treme", "M-Pro 7", "Ballistol", "Slip 2000", "Wipe-Out", "KG Industries"],
  "Case Lube":                  ["Hornady", "RCBS", "Dillon Precision", "Redding", "Frankford Arsenal", "Imperial", "Lyman"],
  "Neck Lube":                  ["Hornady", "Sinclair", "Imperial", "Redding", "RCBS"],
  "Tumbling Media":             ["Frankford Arsenal", "Lyman", "RCBS", "Berry's", "Dillon Precision", "Midway USA"],
  "Stainless Steel Pins":       ["Frankford Arsenal", "Lyman", "RCBS", "Dillon Precision"],
  "Shell Holders":              ["RCBS", "Redding", "Lee Precision", "Hornady", "Lyman"],
  "Primer Tubes":               ["Dillon Precision", "Lee Precision", "RCBS"],
  "Decapping Pins":             ["RCBS", "Lee Precision", "Redding", "Hornady", "Lyman"],
  "Firearm Lubricant / CLP":    ["Break-Free", "Slip 2000", "Ballistol", "Sentry Solutions", "Hornady", "Hoppe's", "M-Pro 7", "Froglube", "Tipton"],
  "Other":                      [],
};

const MODELS_BY_BRAND = {
  "RCBS":               ["Rock Chucker Supreme", "Partner", "Turret Press", "Pro Chucker 5", "Chargemaster Lite", "Chargemaster 1500", "Uniflow", "Match Master Pro", "Case Prep Center", "Trim Pro 3"],
  "Dillon Precision":   ["550C", "650X", "750", "Super 1050", "1100", "SL900", "Square Deal B"],
  "Hornady":            ["Lock-N-Load AP", "Iron Press", "Lock-N-Load Classic", "Concentricity Gauge", "Hot Tub Sonic Cleaner", "One Shot Case Lube", "Unique Case Lube"],
  "Redding":            ["T-7 Turret", "Ultramag", "Big Boss II", "No. 2 Master", "Boss", "G-RX Push Through", "Bushing Neck Sizer", "Competition Seating Die"],
  "Forster":            ["Co-Ax B-2", "Bench Rest", "Classic"],
  "Lyman":              ["All American 8", "Orange Crusher II", "Spartan", "1200 Pro Magnum", "1200 DPS", "TurboSonic 6000", "Universal Trimmer", "Brass Smith", "Crusher II"],
  "Lee Precision":      ["Classic Cast", "Challenger", "Load-Master", "Classic Turret", "Auto-Disk Pro", "Pro 4000"],
  "Prometheus":         ["G1", "G2"],
  "AutoTrickler":       ["AutoTrickler v4", "AutoThrow v3"],
  "Sartorius":          ["ME-215S", "Cubis"],
  "A&D":                ["FX-120i", "FX-300i"],
  "Ohaus":              ["Navigator Pro", "Scout"],
  "MagnetoSpeed":       ["V3", "Sporter"],
  "Garmin":             ["Xero C1 Pro"],
  "LabRadar":           ["LabRadar"],
  "Caldwell":           ["G2", "Ballistic Precision"],
  "AMP":                ["MKII", "Annealer Pro"],
  "Bench Source":       ["Bench Source Annealer"],
  "Annealeez":          ["Annealeez"],
  "Mitutoyo":           ["500-196-30", "Absolute Digimatic CD-6-ASX"],
  "Frankford Arsenal":  ["DS-750", "Platinum Series Tumbler", "Digital Caliper", "Rotary Tumbler", "Flex-Drive Trimmer", "Case Prep Duo", "Anhydrous Lanolin"],
  "Wilson":             ["Case Gauge", "Bullet Comparator", "Inline Seater"],
  "Little Crow Gunworks": ["WFT 2", "WFT 2 Carbide"],
  "Tipton":             ["Carbon Fiber Cleaning Rod", "Deluxe 1-Piece Rod", "Best Gun Vise"],
  "Dewey":              ["1-Piece Coated Rod", "Carbon Fiber Rod"],
  "Bore Tech":          ["Carbon Remover", "Eliminator", "C4 Carbon Remover", "Proof-Positive Rod"],
  "Hoppe's":            ["No. 9", "Bench Rest 9", "Elite Gun Cleaner", "HAC"],
  "Barnes":             ["CR-10", "Copper Remover"],
  "Montana X-Treme":    ["Copper Killer", "Bore Solvent", "Rifle Blend"],
  "Butch's":            ["Bore Shine"],
  "M-Pro 7":            ["Gun Cleaner", "LPX", "Gun Oil"],
  "Ballistol":          ["Multi-Purpose", "BallistoClean"],
  "Slip 2000":          ["EWL", "725 Gun Cleaner", "EWO"],
  "Break-Free":         ["CLP", "Powder Blast"],
  "Imperial":           ["Sizing Die Wax", "Dry Neck Lube"],
  "Sinclair":           ["Neck Lube", "Stainless Steel Pins", "Loading Block", "Primer Pocket Uniformer"],
};

const UNITS = ["pcs", "pack", "box", "oz", "fl oz", "lbs", "roll", "bag", "set", "kit", "bottle", "can", "tube"];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getETNow = () =>
  new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });

const EMPTY = {
  category: "Equipment",
  name: "", type: "", brand: "", model: "",
  serial_number: "", condition: "", caliber_compatibility: "",
  quantity: "", unit: "",
  purchase_date: "", purchased_from: "", purchase_price: "", current_value: "",
  notes: "", photo_url: "", created_et: "", modified_et: "",
};

// ── Styles ────────────────────────────────────────────────────────────────────

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
  catToggle: { display: "flex", gap: 0, marginBottom: 20, borderRadius: 4, overflow: "hidden", border: "1px solid #2a2a2a" },
};

export default function ReloadingEquipModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(item ? { ...EMPTY, ...item } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isConsumable = form.category === "Consumable";
  const typeOptions = isConsumable ? CONSUMABLE_TYPES : EQUIP_TYPES;
  const brandsForType = isConsumable
    ? (BRANDS_BY_CONSUMABLE_TYPE[form.type] || [])
    : (BRANDS_BY_EQUIP_TYPE[form.type] || []);
  const modelsForBrand = MODELS_BY_BRAND[form.brand] || [];

  const handleCategoryChange = (cat) => {
    set("category", cat);
    set("type", "");
    set("brand", "");
    set("model", "");
  };

  const handleTypeChange = (t) => {
    set("type", t);
    set("brand", "");
    set("model", "");
  };

  const handleBrandChange = (b) => {
    set("brand", b);
    set("model", "");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : undefined,
      current_value: form.current_value ? Number(form.current_value) : undefined,
      quantity: form.quantity ? Number(form.quantity) : undefined,
      modified_et: getETNow(),
    };
    if (!item?.id) payload.created_et = getETNow();
    if (item?.id) {
      await base44.entities.ReloadingEquip.update(item.id, payload);
    } else {
      await base44.entities.ReloadingEquip.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  if (showPhoto) return (
    <PhotoCapture
      onCapture={url => { set("photo_url", url); setShowPhoto(false); }}
      onClose={() => setShowPhoto(false)}
    />
  );

  return (
    <div style={S.overlay}>
      <div style={S.header}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 10, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X style={{ width: 22, height: 22 }} />
        </button>
        <span style={S.title}>{item ? "Edit Item" : "Add to Bench"}</span>
        <button
          onClick={handleSave}
          disabled={saving || !form.name}
          style={{ ...S.saveBtn, opacity: (saving || !form.name) ? 0.5 : 1 }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div style={S.body}>
        {/* Category toggle */}
        <div style={S.catToggle}>
          {["Equipment", "Consumable"].map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                flex: 1, border: "none", cursor: "pointer",
                padding: "12px 0", fontSize: 14, fontWeight: 700,
                background: form.category === cat ? "#f97316" : "#1a1a1a",
                color: form.category === cat ? "#fff" : "#6b7280",
                minHeight: 48,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photo */}
        <div style={S.section}>
          <label style={S.label}>Photo</label>
          <button
            onClick={() => setShowPhoto(true)}
            style={{ width: "100%", aspectRatio: "16/9", borderRadius: 6, border: "1px dashed #2a2a2a", background: "#242424", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            {form.photo_url
              ? <img src={form.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <Camera style={{ width: 28, height: 28, color: "#6b7280" }} />
            }
          </button>
        </div>

        {/* Identity */}
        <div style={S.sectionHeader}>Identity</div>

        <div style={S.section}>
          <label style={S.label}>Name *</label>
          <input
            value={form.name}
            onChange={e => set("name", e.target.value)}
            placeholder={isConsumable ? "e.g. Hoppe's No. 9 Solvent" : "e.g. Dillon 750 Press"}
            style={S.input}
          />
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Type</label>
            <select value={form.type} onChange={e => handleTypeChange(e.target.value)} style={S.select}>
              <option value="">— Select —</option>
              {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Condition</label>
            <select value={form.condition} onChange={e => set("condition", e.target.value)} style={S.select}>
              <option value="">— Select —</option>
              {["New", "Excellent", "Very Good", "Good", "Fair", "Poor"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Brand</label>
            <input
              value={form.brand || ""}
              onChange={e => handleBrandChange(e.target.value)}
              list="re-brand-list"
              placeholder="Select or type…"
              style={S.input}
            />
            <datalist id="re-brand-list">
              {brandsForType.map(b => <option key={b} value={b} />)}
            </datalist>
          </div>
          <div>
            <label style={S.label}>Model</label>
            <input
              value={form.model || ""}
              onChange={e => set("model", e.target.value)}
              list="re-model-list"
              placeholder="Select or type…"
              style={S.input}
            />
            <datalist id="re-model-list">
              {modelsForBrand.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>
        </div>

        {!isConsumable && (
          <div style={S.section}>
            <label style={S.label}>Serial Number</label>
            <input value={form.serial_number || ""} onChange={e => set("serial_number", e.target.value)} placeholder="Serial…" style={S.input} />
          </div>
        )}

        {isConsumable && (
          <div style={S.grid2}>
            <div>
              <label style={S.label}>Quantity</label>
              <input type="number" min="0" value={form.quantity || ""} onChange={e => set("quantity", e.target.value)} placeholder="0" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Unit</label>
              <select value={form.unit || ""} onChange={e => set("unit", e.target.value)} style={S.select}>
                <option value="">— Select —</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        )}

        <div style={S.section}>
          <label style={S.label}>Caliber / Cartridge Compatibility</label>
          <input
            value={form.caliber_compatibility || ""}
            onChange={e => set("caliber_compatibility", e.target.value)}
            placeholder="e.g. .308, 6.5 CM, Universal…"
            style={S.input}
          />
        </div>

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
            placeholder="Modifications, accessories, usage notes…"
            rows={4}
            style={{ ...S.input, resize: "vertical" }}
          />
        </div>
      </div>
    </div>
  );
}
