import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef();
  const [error, setError] = useState(null);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(true);
  const streamRef = useRef(null);

  useEffect(() => {
    let barcodeDetector;
    let animFrame;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if ("BarcodeDetector" in window) {
          barcodeDetector = new BarcodeDetector({ formats: ["qr_code", "ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"] });

          const scan = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                stopCamera();
                onDetected(barcodes[0].rawValue);
                return;
              }
            }
            animFrame = requestAnimationFrame(scan);
          };
          scan();
        } else {
          setError("Camera scanning not supported on this browser. Please enter manually.");
          setScanning(false);
        }
      } catch (e) {
        setError("Camera access denied. Please enter barcode manually.");
        setScanning(false);
      }
    };

    const stopCamera = () => {
      cancelAnimationFrame(animFrame);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };

    startCamera();
    return () => stopCamera();
  }, []);

  const handleClose = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button onClick={handleClose}><X className="w-5 h-5 text-white" /></button>
        <h2 className="font-semibold text-sm text-white">Scan Barcode</h2>
        <div className="w-5" />
      </div>

      {scanning && !error && (
        <div className="flex-1 relative">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
          {/* Scan overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-40 border-2 border-white rounded-xl relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 animate-pulse" />
            </div>
          </div>
          <p className="absolute bottom-8 inset-x-0 text-center text-white/70 text-sm">Point camera at barcode</p>
        </div>
      )}

      {/* Manual entry fallback */}
      <div className="bg-background px-4 py-4 space-y-3">
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <p className="text-xs text-muted-foreground text-center">Or enter manually</p>
        <div className="flex gap-2">
          <Input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Enter barcode number"
            className="flex-1"
          />
          <Button
            disabled={!manual}
            onClick={() => { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); onDetected(manual); }}
          >
            Use
          </Button>
        </div>
      </div>
    </div>
  );
}