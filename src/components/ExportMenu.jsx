import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, Loader2, X } from "lucide-react";

/**
 * ExportMenu — opens a dialog to name the file and choose format before exporting.
 *
 * Props:
 *   getData   () => any[]          — returns the current (filtered) rows to export
 *   filename  string               — default filename without extension
 *   columns   { key, label }[]     — which fields to include and their display names
 *   title     string               — report title shown in the PDF header
 */
export default function ExportMenu({ getData, filename, columns, title }) {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState(filename);
  const [format, setFormat] = useState("csv");
  const [busy, setBusy] = useState(false);

  // Sync default name if prop changes
  useEffect(() => { setCustomName(filename); }, [filename]);

  // ── CSV ──────────────────────────────────────────────────────────────────
  const exportCSV = (name) => {
    const rows = getData();
    const header = columns.map(c => `"${c.label}"`).join(",");
    const body = rows.map(r =>
      columns.map(c => {
        const v = r[c.key] ?? "";
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");
    download(`${name}.csv`, "text/csv", header + "\n" + body);
  };

  // ── XLSX ─────────────────────────────────────────────────────────────────
  const exportXLSX = async (name) => {
    const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
    const rows = getData();
    const wsData = [
      columns.map(c => c.label),
      ...rows.map(r => columns.map(c => r[c.key] ?? ""))
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = columns.map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  // ── PDF ──────────────────────────────────────────────────────────────────
  const exportPDF = async (name) => {
    const { jsPDF } = await import("jspdf");
    const rows = getData();
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageW, 48, "F");
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 48, pageW, 3, "F");
    doc.setTextColor(245, 245, 245);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 24, 32);
    doc.setFontSize(8);
    doc.setTextColor(163, 163, 163);
    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    doc.text(`Exported ${dateStr}`, pageW - 24, 32, { align: "right" });

    const margin = 24;
    const colW = (pageW - margin * 2) / columns.length;
    let y = 70;

    doc.setFillColor(36, 36, 36);
    doc.rect(margin, y - 12, pageW - margin * 2, 20, "F");
    doc.setTextColor(163, 163, 163);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    columns.forEach((c, i) => doc.text(c.label.toUpperCase(), margin + i * colW + 6, y + 1));
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    rows.forEach((r, ri) => {
      if (y > pageH - 40) {
        doc.addPage();
        y = 40;
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
      doc.setDrawColor(42, 42, 42);
      doc.line(margin, y + 8, pageW - margin, y + 8);
      y += 18;
    });

    doc.setFillColor(26, 26, 26);
    doc.rect(0, pageH - 24, pageW, 24, "F");
    doc.setFillColor(249, 115, 22);
    doc.rect(0, pageH - 24, pageW, 2, "F");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text("TIWIG Inventory", 24, pageH - 8);
    doc.text(`${rows.length} record${rows.length !== 1 ? "s" : ""}`, pageW - 24, pageH - 8, { align: "right" });

    doc.save(`${name}.pdf`);
  };

  const download = (name, mime, content) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const name = (customName || filename).trim() || filename;
    setBusy(true);
    if (format === "csv") exportCSV(name);
    if (format === "xlsx") await exportXLSX(name);
    if (format === "pdf") await exportPDF(name);
    setBusy(false);
    setOpen(false);
  };

  const formats = [
    { id: "csv",  label: "CSV",   Icon: FileText },
    { id: "xlsx", label: "Excel", Icon: FileSpreadsheet },
    { id: "pdf",  label: "PDF",   Icon: FileText },
  ];

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "#242424", border: "1px solid #2a2a2a", borderRadius: 3,
          color: "#a3a3a3", padding: "6px 10px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
        }}
        title="Export"
      >
        <Download style={{ width: 14, height: 14 }} />
        Export
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6,
            width: "90%", maxWidth: 380, padding: 24, boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 15 }}>Export Data</span>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a3a3a3", padding: 4 }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Filename input */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                File Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={filename}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#242424", border: "1px solid #3a3a3a", borderRadius: 3,
                  color: "#f5f5f5", fontSize: 13, padding: "8px 10px",
                  outline: "none",
                }}
                onFocus={e => e.target.style.borderColor = "#f97316"}
                onBlur={e => e.target.style.borderColor = "#3a3a3a"}
              />
            </div>

            {/* Format selector */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Format
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {formats.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setFormat(id)}
                    style={{
                      flex: 1, background: format === id ? "#f97316" : "#242424",
                      border: `1px solid ${format === id ? "#f97316" : "#3a3a3a"}`,
                      borderRadius: 3, color: format === id ? "#fff" : "#a3a3a3",
                      padding: "8px 4px", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 700, transition: "all 0.15s",
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export button */}
            <button
              onClick={handleExport}
              disabled={busy}
              style={{
                width: "100%", background: "#f97316", border: "none", borderRadius: 3,
                color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px",
                cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              {busy
                ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 0.7s linear infinite" }} /> Exporting…</>
                : <><Download style={{ width: 14, height: 14 }} /> Export {format.toUpperCase()}</>
              }
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </button>
          </div>
        </div>
      )}
    </>
  );
}