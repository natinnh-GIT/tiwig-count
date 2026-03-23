import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PhotoEnhancer({ originalUrl, onSelect, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      generate();
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setVariants([]);

    const prompts = [
      "Remove the background completely and place this reloading component on a clean pure white background. Keep the object sharp and well-lit, enhance image clarity and sharpness. Professional product photo style.",
      "Remove the background and place this reloading component on a clean pure white background. Apply a subtle soft shadow beneath the object for depth. Enhance sharpness and color vibrancy. Clean product photo.",
      "Remove the background and place this reloading component centered on a pure white background. Apply a slight angle/perspective enhancement. Boost contrast and clarity for a crisp, professional catalog-style image.",
    ];

    const results = await Promise.all(
      prompts.map((prompt) =>
        base44.integrations.Core.GenerateImage({
          prompt,
          existing_image_urls: [originalUrl],
        })
      )
    );

    setVariants(results.map((r) => r.url));
    setLoading(false);
  };

  const handleConfirm = () => {
    if (selected !== null) onSelect(variants[selected]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onCancel}>
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="font-semibold text-sm flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-primary" />
          Enhanced Photo
        </h2>
        <Button
          size="sm"
          disabled={selected === null}
          onClick={handleConfirm}
        >
          Use This
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Removing background & enhancing…
              <br />
              <span className="text-xs">Generating 3 variations</span>
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={generate}>Retry</Button>
          </div>
        )}

        {!loading && variants.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground mb-3 text-center">
              Tap a variation to select it
            </p>
            <div className="space-y-3">
              {variants.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-full rounded-2xl border-2 overflow-hidden transition-all ${
                    selected === i
                      ? "border-primary shadow-lg"
                      : "border-border"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={url}
                      alt={`Variation ${i + 1}`}
                      className="w-full aspect-square object-contain bg-white"
                    />
                    {selected === i && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/30 text-white text-xs py-1 text-center">
                      Option {i + 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Original</p>
              <img
                src={originalUrl}
                alt="Original"
                className="w-full rounded-2xl aspect-square object-cover"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}