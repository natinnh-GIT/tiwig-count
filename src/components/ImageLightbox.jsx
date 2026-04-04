import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageLightbox({ images, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && images.length > 1) setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft" && images.length > 1) setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.96)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16, zIndex: 101,
          background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 3,
          color: "#fff", width: 40, height: 40, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X style={{ width: 20, height: 20 }} />
      </button>

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
          style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 3,
            color: "#fff", width: 40, height: 40, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 101,
          }}
        >
          <ChevronLeft style={{ width: 22, height: 22 }} />
        </button>
      )}

      {/* Image */}
      <img
        src={images[current]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain", borderRadius: 2 }}
      />

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 3,
            color: "#fff", width: 40, height: 40, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 101,
          }}
        >
          <ChevronRight style={{ width: 22, height: 22 }} />
        </button>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {images.map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === current ? "#f97316" : "#555" }} />
          ))}
        </div>
      )}
    </div>
  );
}