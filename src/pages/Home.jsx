import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layers, Crosshair, Eye, MapPin, Home as HomeIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ComponentsTab from "./ComponentsTab";
import FirearmsTab from "./FirearmsTab";
import OpticsTab from "./OpticsTab";
import LocationsTabNew from "./LocationsTabNew";
import ComponentModal from "@/components/ComponentModal";
import ExportDialog from "@/components/ExportDialog";
import HomeTab from "@/pages/HomeTab";

const TABS = [
  { id: "summary",    label: "Home",       icon: HomeIcon, headerTitle: "Armory Overview" },
  { id: "components", label: "Components", icon: Layers },
  { id: "firearms",   label: "Firearms",   icon: Crosshair },
  { id: "optics",     label: "Optics",     icon: Eye },
  { id: "locations",  label: "Locations",  icon: MapPin },
];

const S = {
  app:    { background: "#0f0f0f", height: "100dvh", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" },
  header: { background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, minHeight: 52 },
  title:  { color: "#f97316", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" },
  badge:  { background: "#242424", color: "#a3a3a3", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 2, border: "1px solid #2a2a2a" },
  body:   { flex: 1, overflowY: "auto" },
  nav:    { background: "#1a1a1a", borderTop: "1px solid #2a2a2a", display: "flex", flexShrink: 0, height: 72, paddingBottom: "env(safe-area-inset-bottom)" },
  fab:    { position: "absolute", bottom: 88, right: 16, width: 48, height: 48, borderRadius: 6, background: "#f97316", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 35, fontSize: 28, fontWeight: 300, boxShadow: "0 4px 16px rgba(249,115,22,0.5)", border: "none", cursor: "pointer" },
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "summary");
  const [componentCategory, setComponentCategory] = useState("all");
  const bodyRef = useRef(null);
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [exportFormat, setExportFormat] = useState(null);
  const [user, setUser] = useState(null);
  const [etNow, setEtNow] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setEtNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const etDatetime = etNow.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).replace(",", " ·");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  const handleFab = () => {
    if (activeTab === "firearms" || activeTab === "optics") return;
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
        <span style={S.title}>
          {activeTab === "summary" ? "Armory Overview" : "TIWIG Count"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          {activeTab !== "summary" && <span style={S.badge}>{count} {count === 1 ? "item" : "items"}</span>}
          {user && (
            <div style={{ textAlign: "right", lineHeight: 1.5 }}>
              <div style={{ color: "#a3a3a3", fontSize: 11 }}>{user.full_name || user.email}</div>
              <div style={{ color: "#525252", fontSize: 11 }}>{etDatetime}</div>
              <button onClick={() => base44.auth.logout("/")} style={{ background: "none", border: "none", padding: "2px 0", color: "#ef4444", fontSize: 11, cursor: "pointer", lineHeight: 1.5 }}>Sign Out</button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div ref={bodyRef} style={S.body}>
        {activeTab === "summary" && <HomeTab onNavigate={(tab, category) => { setActiveTab(tab); if (category) setComponentCategory(category); setSearchParams({ tab }); bodyRef.current?.scrollTo(0, 0); }} />}
        {activeTab === "components" && (
          <ComponentsTab onCountChange={setCount} initialCategory={componentCategory} />
        )}
        {activeTab === "firearms" && <FirearmsTab onCountChange={setCount} />}
        {activeTab === "optics"   && <OpticsTab onCountChange={setCount} />}
        {activeTab === "locations" && <LocationsTabNew onCountChange={setCount} />}
      </div>

      {/* FAB — zero-height spacer so button is contained within the centered column */}
      {activeTab !== "summary" && (
        <div style={{ position: "relative", height: 0, flexShrink: 0, zIndex: 35 }}>
          <button
            onClick={handleFab}
            style={{
              position: "absolute", bottom: 16, right: 16,
              width: 52, height: 52, borderRadius: 6,
              background: "#f97316", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 300,
              boxShadow: "0 4px 16px rgba(249,115,22,0.5)",
              border: "none", cursor: "pointer",
            }}
          >+</button>
        </div>
      )}

      {/* Bottom Nav */}
      <nav style={S.nav}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }); bodyRef.current?.scrollTo(0, 0); }}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 3, border: "none", background: "transparent",
                cursor: "pointer", position: "relative",
                color: active ? "#f97316" : "#a3a3a3",
                minHeight: 44,
              }}
            >
              {active && (
                <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: "#f97316", borderRadius: "0 0 2px 2px" }} />
              )}
              <Icon style={{ width: 22, height: 22 }} />
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
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