import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera, Barcode, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BarcodeScanner from "@/components/BarcodeScanner";
import PhotoCapture from "@/components/PhotoCapture";
import DuplicateDialog from "@/components/DuplicateDialog";

const getDefaults = () => ({
  name: "", description: "",
  category: localStorage.getItem("rt_last_category") || "brass",
  caliber: "",
  brand: "",
  quantity: 0,
  unit: localStorage.getItem("rt_last_unit") || "count",
  purchased_from: "",
  barcode: "", photo_url: "", notes: "", cost_per_unit: "", total_cost: "",
  purchase_date: ""
});

export default function ComponentModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(item ? { ...item } : getDefaults());
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [duplicate, setDuplicate] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCategoryChange = (v) => {
    localStorage.setItem("rt_last_category", v);
    set("category", v);
  };
  const handleUnitChange = (v) => {
    localStorage.setItem("rt_last_unit", v);
    set("unit", v);
  };

  // Auto-calculate cost_per_unit when total_cost or quantity changes
  const handleTotalCostChange = (v) => {
    setForm((f) => {
      const qty = Number(f.quantity);
      const total = Number(v);
      const cpu = qty > 0 && total > 0 ? (total / qty).toFixed(4) : f.cost_per_unit;
      return { ...f, total_cost: v, cost_per_unit: cpu };
    });
  };
  const handleQuantityChange = (v) => {
    setForm((f) => {
      const qty = Number(v);
      const total = Number(f.total_cost);
      const cpu = qty > 0 && total > 0 ? (total / qty).toFixed(4) : f.cost_per_unit;
      return { ...f, quantity: Number(v), cost_per_unit: cpu };
    });
  };

  const handleAILookup = async () => {
    if (!form.photo_url) return;
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert in ammunition reloading components. Analyze this image and identify the reloading component shown. Return the product name, brand, caliber (if applicable), category (one of: brass, bullets, powder, primers), and a short description. Be specific and accurate.`,
      file_urls: [form.photo_url],
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          caliber: { type: "string" },
          category: { type: "string", enum: ["brass", "bullets", "powder", "primers"] },
          description: { type: "string" }
        }
      }
    });
    if (result?.name) setForm((f) => ({ ...f, ...result }));
    setAiLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Only check for duplicates when creating a new item
    if (!item?.id) {
      const all = await base44.entities.Component.list();
      const match = all.find((c) => {
        const sameName = c.name?.toLowerCase().trim() === form.name?.toLowerCase().trim();
        const sameBrand = (c.brand || "").toLowerCase().trim() === (form.brand || "").toLowerCase().trim();
        const sameCaliber = (c.caliber || "").toLowerCase().trim() === (form.caliber || "").toLowerCase().trim();
        return sameName && sameBrand && sameCaliber;
      });
      if (match) {
        setSaving(false);
        setDuplicate(match);
        return;
      }
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
    if (overrideId) {
      await base44.entities.Component.update(overrideId, payload);
    } else if (item?.id) {
      await base44.entities.Component.update(item.id, payload);
    } else {
      await base44.entities.Component.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  const handlePhotoCaptured = async (url) => {
    set("photo_url", url);
    setShowPhoto(false);
    // Auto AI identify after photo
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert in ammunition reloading components. Analyze this image and identify the reloading component shown. Return the product name, brand, caliber (if applicable), category (one of: brass, bullets, powder, primers), and a short description. Be specific and accurate.`,
      file_urls: [url],
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          caliber: { type: "string" },
          category: { type: "string", enum: ["brass", "bullets", "powder", "primers"] },
          description: { type: "string" }
        }
      }
    });
    if (result?.name) setForm((f) => ({ ...f, ...result, photo_url: url }));
    setAiLoading(false);
  };

  if (showBarcode) return <BarcodeScanner onDetected={(code) => { set("barcode", code); setShowBarcode(false); }} onClose={() => setShowBarcode(false)} />;
  if (showPhoto) return <PhotoCapture onCapture={handlePhotoCaptured} onClose={() => setShowPhoto(false)} />;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {duplicate && (
        <DuplicateDialog
          existing={duplicate}
          onAddNew={() => { setDuplicate(null); saveItem(); }}
          onEditExisting={() => { setDuplicate(null); saveItem(duplicate.id); }}
          onCancel={() => setDuplicate(null)}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        <h2 className="font-semibold text-sm">{item ? "Edit Component" : "Add Component"}</h2>
        <Button size="sm" onClick={handleSave} disabled={saving || !form.name}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Photo */}
        <div className="flex gap-3 items-start">
          <button
            onClick={() => setShowPhoto(true)}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center gap-1 flex-shrink-0 overflow-hidden"
          >
            {form.photo_url ? (
              <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Photo</span>
              </>
            )}
          </button>
          <div className="flex-1 space-y-2">
            {aiLoading && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                AI identifying...
              </div>
            )}
            {form.photo_url && !aiLoading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1"
                onClick={handleAILookup}
                disabled={aiLoading}
              >
                <Sparkles className="w-3 h-3" />
                Re-identify with AI
              </Button>
            )}
            <div>
              <Label className="text-xs">Barcode</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={form.barcode}
                  onChange={(e) => set("barcode", e.target.value)}
                  placeholder="Scan or enter"
                  className="h-8 text-sm"
                />
                <button
                  onClick={() => setShowBarcode(true)}
                  className="p-2 rounded-lg bg-muted text-muted-foreground"
                >
                  <Barcode className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <Label className="text-xs">Category *</Label>
          <Select value={form.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brass">Brass / Casings</SelectItem>
              <SelectItem value="bullets">Bullets / Projectiles</SelectItem>
              <SelectItem value="powder">Powder</SelectItem>
              <SelectItem value="primers">Primers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Name */}
        <div>
          <Label className="text-xs">Name *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Hornady FMJ .308" className="mt-1" />
        </div>

        {/* Brand + Caliber */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Brand</Label>
            <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Brand" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Caliber / Type</Label>
            <Input value={form.caliber} onChange={(e) => set("caliber", e.target.value)} placeholder=".308, 9mm..." className="mt-1" />
          </div>
        </div>

        {/* Lot Number */}
        <div>
          <Label className="text-xs">Lot #</Label>
          <Input value={form.lot_number || ""} onChange={(e) => set("lot_number", e.target.value)} placeholder="Lot or batch number" className="mt-1" />
        </div>

        {/* Quantity + Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Quantity</Label>
            <Input type="number" value={form.quantity} onChange={(e) => handleQuantityChange(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Unit</Label>
            <Select value={form.unit} onValueChange={handleUnitChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="lbs">Lbs</SelectItem>
                <SelectItem value="oz">Oz</SelectItem>
                <SelectItem value="grains">Grains</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cost */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Total Cost ($)</Label>
            <Input type="number" min="0" step="0.01" value={form.total_cost} onChange={(e) => handleTotalCostChange(e.target.value)} placeholder="0.00" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Cost Per Unit ($) <span className="text-muted-foreground font-normal">auto</span></Label>
            <Input type="number" min="0" step="0.0001" value={form.cost_per_unit} onChange={(e) => set("cost_per_unit", e.target.value)} placeholder="0.00" className="mt-1" />
          </div>
        </div>

        {/* Purchase Date + Purchased From */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Purchase Date</Label>
            <Input type="date" value={form.purchase_date || ""} onChange={(e) => set("purchase_date", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Purchased From</Label>
            <Input value={form.purchased_from} onChange={(e) => set("purchased_from", e.target.value)} placeholder="Store or website" className="mt-1" />
          </div>
        </div>

        {/* Purchased From (removed standalone) */}
        <div>
          <Label className="text-xs">Purchased From</Label>
          <Input value={form.purchased_from} onChange={(e) => set("purchased_from", e.target.value)} placeholder="Store or website" className="mt-1" />
        </div>

        {/* Description */}
        <div>
          <Label className="text-xs">Description</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Notes about this component..." className="mt-1 text-sm resize-none" rows={2} />
        </div>
      </div>
    </div>
  );
}