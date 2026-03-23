import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Package, Layers, Flame, CircleDot, ArrowLeft, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
{ key: "brass", label: "Brass / Casings", icon: Layers, color: "bg-amber-50 border-amber-200 text-amber-700", iconColor: "text-amber-500" },
{ key: "bullets", label: "Bullets / Projectiles", icon: CircleDot, color: "bg-blue-50 border-blue-200 text-blue-700", iconColor: "text-blue-500" },
{ key: "powder", label: "Powder", icon: Flame, color: "bg-red-50 border-red-200 text-red-700", iconColor: "text-red-500" },
{ key: "primers", label: "Primers", icon: Package, color: "bg-green-50 border-green-200 text-green-700", iconColor: "text-green-500" }];


export default function Dashboard() {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    base44.entities.Component.list().then(setComponents);
  }, []);

  const filtered = search.trim() ?
  components.filter((c) =>
  [c.name, c.brand, c.caliber, c.category, c.description, c.lot_number].
  filter(Boolean).
  some((f) => f.toLowerCase().includes(search.toLowerCase()))
  ) :
  components;

  const totalValue = filtered.reduce((sum, c) => sum + (Number(c.total_cost) || 0), 0);

  const summaries = CATEGORIES.map((cat) => {
    const items = filtered.filter((c) => c.category === cat.key);
    const value = items.reduce((sum, c) => sum + (Number(c.total_cost) || 0), 0);
    return { ...cat, count: items.length, value };
  });

  return (
    <div className="min-h-screen bg-background px-4 pt-12 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/inventory")} className="p-1 text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button
          onClick={() => setDark((d) => !d)}
          className="ml-auto p-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme">
          
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && search.trim()) {
              navigate(`/inventory?q=${encodeURIComponent(search.trim())}`);
            }
          }}
          placeholder="Search all components…"
          className="pl-9" />
        
      </div>

      {/* Total value */}
      <div className="bg-primary text-primary-foreground mb-6 p-5 text-center rounded-lg shadow-sm">
        <p className="text-sm opacity-75 mb-1">Total Inventory Value</p>
        <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
        <p className="text-xs opacity-60 mt-1">{filtered.length} item{filtered.length !== 1 ? "s" : ""} across all categories</p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-3">
        {summaries.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.key}
              className={`rounded-2xl border p-4 ${cat.color} cursor-pointer active:scale-95 transition-transform`}
              onClick={() => navigate(`/inventory?category=${cat.key}${search ? `&q=${encodeURIComponent(search)}` : ""}`)}>
              
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                <span className="text-xs font-semibold">{cat.label}</span>
              </div>
              <p className="text-2xl font-bold">{cat.count}</p>
              <p className="text-xs opacity-70 mb-2">item{cat.count !== 1 ? "s" : ""}</p>
              <p className="text-sm font-semibold">${cat.value.toFixed(2)}</p>
              <p className="text-xs opacity-60">est. value</p>
            </div>);

        })}
      </div>

      {/* Search results list */}
      {search.trim() &&
      <div className="mt-6">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            Results ({filtered.length})
          </p>
          {filtered.length === 0 ?
        <p className="text-sm text-muted-foreground text-center py-8">No components found.</p> :

        <div className="space-y-2">
              {filtered.map((c) =>
          <button
            key={c.id}
            onClick={() => navigate(`/inventory?q=${encodeURIComponent(search.trim())}`)}
            className="w-full text-left rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 active:bg-muted transition-colors">
            
                  {c.photo_url ?
            <img src={c.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" /> :

            <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0" />
            }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{[c.brand, c.caliber].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{c.quantity} {c.unit}</p>
                    {c.total_cost ? <p className="text-xs text-muted-foreground">${Number(c.total_cost).toFixed(2)}</p> : null}
                  </div>
                </button>
          )}
            </div>
        }
        </div>
      }
    </div>);

}