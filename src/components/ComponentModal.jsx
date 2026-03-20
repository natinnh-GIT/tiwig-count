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

const EMPTY = {
  name: "", description: "", category: "brass", caliber: "",
  brand: "", quantity: 0, unit: "count", purchased_from: "",
  barcode: "", photo_url: "", notes: "", cost_per_unit: "", total_cost: ""
};

export default function ComponentModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(item ? { ...item } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
    if (item?.id) {
      await base44.entities.Component.update(item.id, form);
    } else {
      await base44.entities.Component.create(form);
    }
    setSaving(false);
    onSaved();
  };

  if (showBarcode) return <BarcodeScanner onDetected={(code) => { set("barcode", code); setShowBarcode(false); }} onClose={() => setShowBarcode(false)} />;
  if (showPhoto) return <PhotoCapture onCapture={(url) => { set("photo_url", url); setShowPhoto(false); }} onClose={() => setShowPhoto(false)} />;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
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
            {form.photo_url && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1"
                onClick={handleAILookup}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {aiLoading ? "Identifying..." : "AI Identify"}
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
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
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

        {/* Quantity + Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Quantity</Label>
            <Input type="number" value={form.quantity} onChange={(e) => set("quantity", Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Unit</Label>
            <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
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

        {/* Purchased From */}
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