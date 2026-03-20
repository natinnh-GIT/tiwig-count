import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Package, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CategoryFilter from "@/components/CategoryFilter";
import ComponentCard from "@/components/ComponentCard";
import ComponentModal from "@/components/ComponentModal";
import ExportDialog from "@/components/ExportDialog";
import ThemeToggle from "@/components/ThemeToggle";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "brass", label: "Brass" },
  { id: "bullets", label: "Bullets" },
  { id: "powder", label: "Powder" },
  { id: "primers", label: "Primers" },
];

export default function Inventory() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [exportFormat, setExportFormat] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Component.list("-created_date", 200);
    setComponents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = components.filter((c) => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.caliber?.toLowerCase().includes(search.toLowerCase()) ||
      c.brand?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = () => { setEditingItem(null); setShowModal(true); };
  const handleEdit = (item) => { setEditingItem(item); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingItem(null); };
  const handleSaved = () => { handleClose(); load(); };

  const handleExport = async (format) => {
    const response = await base44.functions.invoke('exportComponents', { format });
    const blob = new Blob([response.data], {
      type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `components.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 pt-safe-top pb-3">
        <div className="flex items-center justify-between mb-3 pt-3">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">ReloadTrack</h1>
            <p className="text-xs text-muted-foreground">{components.length} items</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" variant="outline" onClick={() => handleExport('csv')} className="gap-1 h-10">
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport('xlsx')} className="gap-1 h-10">
              <Download className="w-4 h-4" />
              XLSX
            </Button>
            <Button size="icon" onClick={handleAdd} className="rounded-full w-10 h-10">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm rounded-xl bg-muted border-0"
          />
        </div>
        <CategoryFilter
          categories={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* List */}
      <div className="px-4 py-3 space-y-2 pb-24">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No components found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tap + to add your first item</p>
          </div>
        ) : (
          filtered.map((item) => (
            <ComponentCard key={item.id} item={item} onEdit={handleEdit} onRefresh={load} />
          ))
        )}
      </div>

      {showModal && (
        <ComponentModal
          item={editingItem}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}