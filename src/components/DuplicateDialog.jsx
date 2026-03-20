import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DuplicateDialog({ existing, onAddNew, onEditExisting, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Possible Duplicate</h3>
            <p className="text-sm text-muted-foreground mt-0.5">A similar item already exists in your inventory.</p>
          </div>
        </div>

        <div className="bg-muted rounded-xl p-3 text-sm space-y-1">
          <p className="font-medium text-foreground">{existing.name}</p>
          {existing.brand && <p className="text-muted-foreground">Brand: {existing.brand}</p>}
          {existing.caliber && <p className="text-muted-foreground">Caliber: {existing.caliber}</p>}
          <p className="text-muted-foreground">Qty: {existing.quantity ?? 0} {existing.unit || "count"}</p>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={onEditExisting}>Edit Existing Item</Button>
          <Button variant="outline" className="w-full" onClick={onAddNew}>Add as New Item</Button>
          <button className="w-full text-sm text-muted-foreground py-1" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}