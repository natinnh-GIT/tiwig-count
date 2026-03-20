import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "barcode-scanner-container",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText) => {
      scanner.clear();
      onDetected(decodedText);
    };

    const onScanError = (errorMessage) => {
      console.error("Barcode scanner error:", errorMessage);
      setError("Failed to start camera: " + errorMessage);
      setScanning(false);
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [onDetected]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    onClose();
  };

  const handleManualSubmit = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    onDetected(manual);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={handleClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        <h2 className="font-semibold text-sm">Scan Barcode</h2>
        <div className="w-5" />
      </div>

      <div id="barcode-scanner-container" className="flex-1" style={{ width: "100%" }} />

      {/* Manual entry fallback */}
      <div className="bg-card border-t border-border px-4 py-4 space-y-3">
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
            onClick={handleManualSubmit}
          >
            Use
          </Button>
        </div>
      </div>
    </div>
  );
}