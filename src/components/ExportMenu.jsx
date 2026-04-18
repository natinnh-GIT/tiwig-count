import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";

/**
 * ExportMenu — a small dropdown button that exports data to CSV, XLSX, or PDF.
 *
 * Props:
 *   getData   () => any[]          — returns the current (filtered) rows to export
 *   filename  string               — base filename without extension
 *   columns   { key, label }[]     — which fields to include and their display names
 *   title     string               — report title shown in the PDF header
 */
export default function ExportMenu({ getData, filename, columns, title }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null); // "csv" | "xlsx" | "pdf"
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── CSV ──────────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = getData();
    const header = columns.map(c => `"${c.label}"`).join(",");
    const body = rows.map(r =>
      columns.map(c => {
        const v = r[c.key] ?? "";
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");
    download(`${filename}.csv`, "text/csv", header + "\n" + body);
  };

  // ── XLSX ─────────────────────────────────────────────────────────────────
  const exportXLSX = async () => {
    setBusy("xlsx");
    // Dynamically import SheetJS (xlsx) from CDN — tiny, cached after first use
    const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
    const rows = getData();
    const wsData = [
      columns.map(c => c.label),
      ...rows.map(r => columns.map(c => r[c.key] ?? ""))
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws["!cols"] = columns.map(() => ({ wch: 20 }));

    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${filename}.xlsx`);
    setBusy(null);
  };

  // ── PDF ──────────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    setBusy("pdf");
    const { jsPDF } = await import("jspdf");
    const rows = getData();
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── Dark header bar
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageW, 48, "F");

    // ── Orange accent line
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 48, pageW, 3, "F");

    // ── Title
    doc.setTextColor(245, 245, 245);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 24, 32);

    // ── Date
    doc.setFontSize(8);
    doc.setTextColor(163, 163, 163);
    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    doc.text(`Exported ${dateStr}`, pageW - 24, 32, { align: "right" });

    // ── Column widths (evenly distribute usable width)
    const margin = 24;
    const colW = (pageW - margin * 2) / columns.length;

    let y = 70;

    // ── Table header row
    doc.setFillColor(36, 36, 36);
    doc.rect(margin, y - 12, pageW - margin * 2, 20, "F");
    doc.setTextColor(163, 163, 163);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    columns.forEach((c, i) => {
      doc.text(c.label.toUpperCase(), margin + i * colW + 6, y + 1);
    });
    y += 20;

    // ── Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    rows.forEach((r, ri) => {
      if (y > pageH - 40) {
        doc.addPage();
        y = 40;
        // Repeat header
        doc.setFillColor(36, 36, 36);
        doc.rect(margin, y - 12, pageW - margin * 2, 20, "F");
        doc.setTextColor(163, 163, 163);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        columns.forEach((c, i) => doc.text(c.label.toUpperCase(), margin + i * colW + 6, y + 1));
        y += 20;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
      }

      // Alternating row bg
      if (ri % 2 === 0) {
        doc.setFillColor(22, 22, 22);
        doc.rect(margin, y - 10, pageW - margin * 2, 18, "F");
      }

      doc.setTextColor(245, 245, 245);
      columns.forEach((c, i) => {
        const val = String(r[c.key] ?? "");
        const maxChars = Math.floor(colW / 5.2);
        const truncated = val.length > maxChars ? val.slice(0, maxChars - 1) + "…" : val;
        doc.text(truncated, margin + i * colW + 6, y + 2);
      });

      // Row divider
      doc.setDrawColor(42, 42, 42);
      doc.line(margin, y + 8, pageW - margin, y + 8);
      y += 18;
    });

    // ── Footer
    doc.setFillColor(26, 26, 26);
    doc.rect(0, pageH - 24, pageW, 24, "F");
    doc.setFillColor(249, 115, 22);
    doc.rect(0, pageH - 24, pageW, 2, "F");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text("TIWIG Inventory", 24, pageH - 8);
    doc.text(`${rows.length} record${rows.length !== 1 ? "s" : ""}`, pageW - 24, pageH - 8, { align: "right" });

    doc.save(`${filename}.pdf`);
    setBusy(null);
  };

  // ── helper
  const download = (name, mime, content) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const handle = async (type) => {
    setOpen(false);
    if (type === "csv") { setBusy("csv"); exportCSV(); setBusy(null); }
    if (type === "xlsx") await exportXLSX();
    if (type === "pdf") await exportPDF();
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={!!busy}
        style={{
          background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3,
          color: "#a3a3a3", padding: "6px 10px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
          opacity: busy ? 0.6 : 1,
        }}
        title="Export"
      >
        {busy
          ? <Loader2 style={{ width: 14, height: 14, animation: "spin 0.7s linear infinite" }} />
          : <Download style={{ width: 14, height: 14 }} />}
        Export
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
          background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: 150, overflow: "hidden",
        }}>
          {[
            { id: "csv",  label: "Export CSV",  Icon: FileText },
            { id: "xlsx", label: "Export Excel", Icon: FileSpreadsheet },
            { id: "pdf",  label: "Export PDF",   Icon: FileText },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handle(id)}
              style={{
                width: "100%", background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", color: "#f5f5f5", fontSize: 12, fontWeight: 600,
                textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#242424"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <Icon style={{ width: 13, height: 13, color: "#f97316" }} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}