import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ExportDialog({ format, onExport, onCancel }) {
  const [filename, setFilename] = useState(`components.${format}`);

  const handleExport = () => {
    const name = filename.includes('.') ? filename : `${filename}.${format}`;
    onExport(name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-2xl p-6 w-96 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Export {format.toUpperCase()}</h2>
          <button onClick={onCancel} className="p-1">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">Filename</Label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="mt-1"
              placeholder="components"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
            <Button onClick={handleExport} size="sm">
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}