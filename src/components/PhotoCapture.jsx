import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PhotoCapture({ onCapture, onClose }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    onCapture(file_url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        <h2 className="font-semibold text-sm">Add Photo</h2>
        <div className="w-5" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6">
        {preview ? (
          <div className="w-full max-w-xs">
            <img src={preview} alt="Preview" className="w-full rounded-2xl shadow-lg object-cover max-h-72" />
          </div>
        ) : (
          <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center gap-2">
            <Camera className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">No photo selected</p>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {/* Camera capture */}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => { fileRef.current.accept = "image/*"; fileRef.current.capture = "environment"; fileRef.current.click(); }}
          >
            <Camera className="w-4 h-4" /> Take Photo
          </Button>

          {/* Gallery picker */}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => { fileRef.current.removeAttribute("capture"); fileRef.current.click(); }}
          >
            <Upload className="w-4 h-4" /> Choose from Library
          </Button>

          {preview && (
            <Button onClick={handleUpload} disabled={uploading} className="gap-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {uploading ? "Uploading..." : "Use This Photo"}
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}