import { useState, useRef } from "react";
import { Layers, Crosshair, Eye, MapPin } from "lucide-react";
import ComponentsTab from "./ComponentsTab";
import FirearmsTab from "./FirearmsTab";
import OpticsTab from "./OpticsTab";
import LocationsTabNew from "./LocationsTabNew";
import ComponentModal from "@/components/ComponentModal";
import ExportDialog from "@/components/ExportDialog";
import { base44 } from "@/api/base44Client";

const TABS = [
  { id: "components", label: "Components", icon: Layers },
  { id: "firearms",   label: "Firearms",   icon: Crosshair },
  { id: "optics",     label: "Optics",     icon: Eye },
  { id: "locations",  label: "Locations",  icon: MapPin },
];

const S = {
  app:    { background: "#0f0f0f", minHeight: "100dvh", display: "flex", flexDirection: "column" },
  header: { background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 },
  title:  { color: "#f97316", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" },
  badge:  { background: "#242424", color: "#a3a3a3", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 2, border: "1px solid #2a2a2a" },
  body:   { flex: 1, overflowY: "auto", paddingBottom: 80 },
  nav:    { position: "fixed", bottom: 0, left: 0, right: 0, background: "#1a1a1a", borderTop: "1px solid #2a2a2a", display: "flex", zIndex: 40, height: 60 },
  fab:    { position: "fixed", bottom: 72, right: 16, width: 44, height: 44, borderRadius: 3, background: "#f97316", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 35, fontSize: 24, fontWeight: 300, boxShadow: "0 4px 12px rgba(249,115,22,0.4)", border: "none", cursor: "pointer" },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("components");
  const bodyRef = useRef(null);
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [exportFormat, setExportFormat] = useState(null);

  const handleFab = () => {
    if (activeTab === "firearms" || activeTab === "optics") {
      alert("Coming Soon — this feature is not yet available.");
      return;
    }
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleExportConfirm = async (filename) => {
    const response = await base44.functions.invoke("exportComponents", { format: exportFormat });
    if (exportFormat === "xlsx") {
      const binaryString = atob(response.data.file);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); window.URL.revokeObjectURL(url);
    }
    setExportFormat(null);
  };

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.title}>TIWIG Count</span>
        <span style={S.badge}>{count} items</span>
      </div>

      {/* Body */}
      <div ref={bodyRef} style={S.body}>
        {activeTab === "components" && (
          <ComponentsTab onCountChange={setCount} onEdit={handleEdit} onExport={setExportFormat} />
        )}
        {activeTab === "firearms" && <FirearmsTab onCountChange={setCount} />}
        {activeTab === "optics"   && <OpticsTab onCountChange={setCount} />}
        {activeTab === "locations" && <LocationsTabNew onCountChange={setCount} />}
      </div>

      {/* FAB */}
      <button style={S.fab} onClick={handleFab}>+</button>

      {/* Bottom Nav */}
      <nav style={S.nav}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); bodyRef.current?.scrollTo(0, 0); }}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 2, border: "none", background: "transparent",
                cursor: "pointer", position: "relative",
                color: active ? "#f97316" : "#a3a3a3",
                paddingBottom: 4,
              }}
            >
              {active && (
                <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: "#f97316", borderRadius: "0 0 2px 2px" }} />
              )}
              <Icon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Component Modal */}
      {showModal && (
        <ComponentModal
          item={editingItem}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSaved={() => { setShowModal(false); setEditingItem(null); }}
        />
      )}

      {exportFormat && (
        <ExportDialog
          format={exportFormat}
          onExport={handleExportConfirm}
          onCancel={() => setExportFormat(null)}
        />
      )}
    </div>
  );
}