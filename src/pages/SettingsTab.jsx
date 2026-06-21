import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, User, Download } from "lucide-react";

export default function SettingsTab({ onExport }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "20px 16px" }} className="space-y-5">
      <h2 style={{ color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Settings</h2>

      {user && (
        <div
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div
            style={{ width: 48, height: 48, background: "#242424", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <User style={{ width: 22, height: 22, color: "#f97316" }} />
          </div>
          <div>
            <p style={{ color: "#f5f5f5", fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{user.full_name || "User"}</p>
            <p style={{ color: "#a3a3a3", fontSize: 13 }}>{user.email}</p>
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 20 }}>
        <p style={{ color: "#a3a3a3", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Export Data</p>
        <div className="space-y-3">
          <button
            onClick={() => onExport && onExport("csv")}
            style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#f5f5f5", padding: "16px 20px", fontSize: 15, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", minHeight: 56 }}
          >
            <Download style={{ width: 20, height: 20, color: "#f97316", flexShrink: 0 }} />
            Export CSV
          </button>
          <button
            onClick={() => onExport && onExport("xlsx")}
            style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#f5f5f5", padding: "16px 20px", fontSize: 15, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", minHeight: 56 }}
          >
            <Download style={{ width: 20, height: 20, color: "#f97316", flexShrink: 0 }} />
            Export XLSX
          </button>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 20 }}>
        <button
          onClick={() => base44.auth.logout("/")}
          style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#ef4444", padding: "16px 20px", fontSize: 15, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", minHeight: 56 }}
        >
          <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} />
          Sign Out
        </button>
      </div>
    </div>
  );
}