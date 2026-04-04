import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, Crosshair, Eye, MapPin } from "lucide-react";

const S = {
  container: { padding: "16px", paddingBottom: 32 },
  header: { marginBottom: 24, textAlign: "center" },
  title: { color: "#f97316", fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em", marginBottom: 4 },
  subtitle: { color: "#a3a3a3", fontSize: 13, fontWeight: 500 },
  card: { background: "#1a1a1a", borderRadius: 3, border: "1px solid #2a2a2a", borderLeft: "4px solid #f97316", padding: 16, marginBottom: 12, cursor: "pointer", transition: "all 0.2s", minHeight: 120 },
  cardHover: { background: "#242424", borderColor: "#3a3a3a" },
  cardTitle: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 14, fontWeight: 700, color: "#f5f5f5" },
  icon: { width: 18, height: 18, color: "#f97316", flexShrink: 0 },
  stat: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1px solid #2a2a2a" },
  statLabel: { color: "#a3a3a3", fontSize: 12 },
  statValue: { color: "#f97316", fontWeight: 700, fontSize: 14 },
  breakdown: { marginTop: 10, paddingTop: 10, borderTop: "1px solid #2a2a2a" },
  breakdownRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, paddingBottom: 6, color: "#f5f5f5" },
  breakdownDot: { width: 6, height: 6, borderRadius: "50%", marginRight: 6, flexShrink: 0 },
  footer: { textAlign: "center", color: "#6b7280", fontSize: 11, marginTop: 20, paddingTop: 20, borderTop: "1px solid #2a2a2a" },
};

const categoryColors = {
  brass: "#d4a574",
  bullets: "#64a3ff",
  powder: "#8b6914",
  primers: "#4ade80",
};

export default function HomeTab({ onNavigate }) {
  const [components, setComponents] = useState([]);
  const [firearms, setFirearms] = useState([]);
  const [optics, setOptics] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [comp, fire, opt, loc] = await Promise.all([
        base44.entities.Component.list(),
        base44.entities.Firearm.list(),
        base44.entities.Optic.list(),
        base44.entities.Location.list(),
      ]);
      setComponents(comp);
      setFirearms(fire);
      setOptics(opt);
      setLocations(loc);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ ...S.container, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ width: 24, height: 24, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Calculate component stats
  const componentsByCategory = {
    brass: components.filter(c => c.category === "brass").length,
    bullets: components.filter(c => c.category === "bullets").length,
    powder: components.filter(c => c.category === "powder").length,
    primers: components.filter(c => c.category === "primers").length,
  };
  const totalCost = components.reduce((sum, c) => sum + (c.total_cost || 0), 0);

  // Calculate firearm stats
  const firearmsByType = {};
  firearms.forEach(f => {
    firearmsByType[f.type] = (firearmsByType[f.type] || 0) + 1;
  });

  // Calculate optic stats
  const mountedOptics = optics.filter(o => o.mounted_on_firearm_id).length;
  const availableOptics = optics.length - mountedOptics;

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>TIWIG Count</div>
        <div style={S.subtitle}>Inventory Summary</div>
      </div>

      {/* Reloading Components Card */}
      <div
        style={{ ...S.card, ...(hoveredCard === "components" ? S.cardHover : {}) }}
        onMouseEnter={() => setHoveredCard("components")}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => onNavigate("components")}
      >
        <div style={S.cardTitle}>
          <Zap style={S.icon} />
          Reloading Components
        </div>
        <div style={S.stat}>
          <span style={S.statLabel}>Total Items</span>
          <span style={S.statValue}>{components.length}</span>
        </div>
        <div style={S.breakdown}>
          {[
            { label: "Brass", count: componentsByCategory.brass, color: categoryColors.brass },
            { label: "Bullets", count: componentsByCategory.bullets, color: categoryColors.bullets },
            { label: "Powder", count: componentsByCategory.powder, color: categoryColors.powder },
            { label: "Primers", count: componentsByCategory.primers, color: categoryColors.primers },
          ].map(item => (
            <div key={item.label} style={S.breakdownRow}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ ...S.breakdownDot, background: item.color }} />
                {item.label}
              </div>
              <span style={{ color: "#f97316" }}>{item.count}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between" }}>
          <span style={S.statLabel}>Total Value</span>
          <span style={{ color: "#f97316", fontWeight: 700, fontSize: 13 }}>${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Firearms Card */}
      <div
        style={{ ...S.card, ...(hoveredCard === "firearms" ? S.cardHover : {}) }}
        onMouseEnter={() => setHoveredCard("firearms")}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => onNavigate("firearms")}
      >
        <div style={S.cardTitle}>
          <Crosshair style={S.icon} />
          Firearms
        </div>
        <div style={S.stat}>
          <span style={S.statLabel}>Total Firearms</span>
          <span style={S.statValue}>{firearms.length}</span>
        </div>
        <div style={S.breakdown}>
          {Object.entries(firearmsByType).map(([type, count]) => (
            <div key={type} style={S.breakdownRow}>
              <span>{type}</span>
              <span style={{ color: "#f97316" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optics Card */}
      <div
        style={{ ...S.card, ...(hoveredCard === "optics" ? S.cardHover : {}) }}
        onMouseEnter={() => setHoveredCard("optics")}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => onNavigate("optics")}
      >
        <div style={S.cardTitle}>
          <Eye style={S.icon} />
          Optics
        </div>
        <div style={S.stat}>
          <span style={S.statLabel}>Total Optics</span>
          <span style={S.statValue}>{optics.length}</span>
        </div>
        <div style={S.breakdown}>
          <div style={S.breakdownRow}>
            <span>Available</span>
            <span style={{ color: "#f97316" }}>{availableOptics}</span>
          </div>
          <div style={S.breakdownRow}>
            <span>Mounted</span>
            <span style={{ color: "#f97316" }}>{mountedOptics}</span>
          </div>
        </div>
      </div>

      {/* Locations Card */}
      <div
        style={{ ...S.card, ...(hoveredCard === "locations" ? S.cardHover : {}) }}
        onMouseEnter={() => setHoveredCard("locations")}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => onNavigate("locations")}
      >
        <div style={S.cardTitle}>
          <MapPin style={S.icon} />
          Locations
        </div>
        <div style={S.stat}>
          <span style={S.statLabel}>Total Locations</span>
          <span style={S.statValue}>{locations.length}</span>
        </div>
      </div>

      <div style={S.footer}>Tap any card to browse</div>
    </div>
  );
}