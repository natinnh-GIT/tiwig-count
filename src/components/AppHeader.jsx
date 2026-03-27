import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, User, Clock } from "lucide-react";

function useNYTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dateStr = time.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = time.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return { dateStr, timeStr };
}

export default function AppHeader() {
  const [user, setUser] = useState(null);
  const { dateStr, timeStr } = useNYTime();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSignOut = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between gap-2">
      {/* Date + Time */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="hidden sm:inline truncate">{dateStr} &nbsp;·&nbsp;</span>
        <span className="font-mono font-medium text-foreground">{timeStr}</span>
        <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">ET</span>
      </div>

      {/* User + Sign Out */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {user && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground truncate max-w-[120px]">{user.full_name || user.email}</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}