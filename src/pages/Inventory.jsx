import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Package, Download, LayoutDashboard } from "lucide-react";
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
{ id: "primers", label: "Primers" }];


export default function Inventory() {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || "all";
  });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [exportFormat, setExportFormat] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const cardRefs = useRef({});

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Component.list("-created_date", 200);
    setComponents(data);
    setLoading(false);
  };

  useEffect(() => {load();}, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hid = params.get("highlight");
    if (hid) {
      setHighlightId(hid);
      setTimeout(() => {
        cardRefs.current[hid]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      setTimeout(() => setHighlightId(null), 2000);
    }
  }, []);

  const categoryOrder = { brass: 0, bullets: 1, powder: 2, primers: 3 };

  const filtered = components.
  filter((c) => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const matchSearch =
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.caliber?.toLowerCase().includes(search.toLowerCase()) ||
    c.brand?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).
  sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);

  const handleAdd = () => {setEditingItem(null);setShowModal(true);};
  const handleEdit = (item) => {setEditingItem(item);setShowModal(true);};
  const handleClose = () => {setShowModal(false);setEditingItem(null);};
  const handleSaved = () => {handleClose();load();};

  const handleExportStart = (format) => {
    setExportFormat(format);
  };

  const handleExportConfirm = async (filename) => {
    const response = await base44.functions.invoke('exportComponents', { format: exportFormat });

    if (exportFormat === 'xlsx') {
      const binaryString = atob(response.data.file);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    setExportFormat(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 pt-safe-top pb-3">
        <div className="flex items-center justify-between mb-3 pt-3">
          <div>
            <h1 className="text-foreground text-lg font-bold text-center normal-case tracking-tight">TIWIG Count</h1>
            <p className="text-xs text-muted-foreground">{components.length} items</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <Button size="sm" variant="outline" onClick={() => handleExportStart('csv')} className="gap-1 h-10">
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExportStart('xlsx')} className="gap-1 h-10">
              <Download className="w-4 h-4" />
              XLSX
            </Button>

          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)} className="bg-muted px-10 text-sm rounded-lg flex w-full border-input shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-9 border-0" />
          
          
        </div>
        <CategoryFilter
          categories={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory} />
        
      </div>

      {/* List */}
      <div className="px-4 py-3 space-y-2 pb-24">
        {loading ?
        <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div> :
        filtered.length === 0 ?
        <div className="flex flex-col items-center py-20 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No components found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tap + to add your first item</p>
          </div> :

        filtered.map((item) =>
        <div
          key={item.id}
          ref={(el) => {cardRefs.current[item.id] = el;}}
          className={`rounded-2xl transition-all duration-500 ${highlightId === item.id ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""}`}>
          
              <ComponentCard item={item} onEdit={handleEdit} onRefresh={load} />
            </div>
        )
        }
      </div>

      {showModal &&
      <ComponentModal
        item={editingItem}
        onClose={handleClose}
        onSaved={handleSaved} />

      }

      {/* Floating Add Button */}
      <button
        onClick={handleAdd}
        className="fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        
        <Plus className="w-6 h-6" />
      </button>

      {exportFormat &&
      <ExportDialog
        format={exportFormat}
        onExport={handleExportConfirm}
        onCancel={() => setExportFormat(null)} />

      }
    </div>);

}