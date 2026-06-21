import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, User, Clock } from "lucide-react";
import { formatET } from "@/lib/dateFormatter";

export default function AppHeader() {
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSignOut = () => {
    base44.auth.logout("/");
  };

  const timeDisplay = now.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="bg-card border-b border-border px-4 flex items-center justify-between gap-2" style={{ minHeight: 52, paddingTop: 10, paddingBottom: 10 }}>
      {/* Date + Time */}
      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline truncate text-sm">{formatET(now).split(',')[0]} &nbsp;·&nbsp;</span>
        <span className="font-mono font-medium text-foreground text-sm">{timeDisplay}</span>
        <span className="text-xs text-muted-foreground/60 hidden sm:inline">ET</span>
      </div>

      {/* User + Sign Out */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {user && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span className="font-medium text-foreground text-sm truncate max-w-[140px]">{user.full_name || user.email}</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
          style={{ minHeight: 44, minWidth: 44, padding: "0 10px" }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}