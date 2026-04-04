import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, User, Download } from "lucide-react";

export default function SettingsTab({ onExport }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#a3a3a3" }}>Settings</h2>

      {user && (
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px" }}
        >
          <div
            className="w-9 h-9 flex items-center justify-center"
            style={{ background: "#242424", borderRadius: "2px" }}
          >
            <User className="w-4 h-4" style={{ color: "#f97316" }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{user.full_name || "User"}</p>
            <p className="text-xs" style={{ color: "#a3a3a3" }}>{user.email}</p>
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid #2a2a2a" }} className="pt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#a3a3a3" }}>Export Data</p>
        <button
          onClick={() => onExport && onExport("csv")}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px", color: "#f5f5f5" }}
        >
          <Download className="w-4 h-4" style={{ color: "#f97316" }} />
          Export CSV
        </button>
        <button
          onClick={() => onExport && onExport("xlsx")}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px", color: "#f5f5f5" }}
        >
          <Download className="w-4 h-4" style={{ color: "#f97316" }} />
          Export XLSX
        </button>
      </div>

      <div style={{ borderTop: "1px solid #2a2a2a" }} className="pt-4">
        <button
          onClick={() => base44.auth.logout("/")}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px", color: "#ef4444" }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}