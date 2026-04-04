// Category and Type styling configurations
const CATEGORY_STYLES = {
  brass: { bg: "#78350f", text: "#fde68a", border: "#ca8a04" },
  bullets: { bg: "#1e3a8a", text: "#bfdbfe", border: "#2563eb" },
  bullet: { bg: "#1e3a8a", text: "#bfdbfe", border: "#2563eb" },
  powder: { bg: "#7c2d12", text: "#fed7aa", border: "#c2410c" },
  primers: { bg: "#14532d", text: "#bbf7d0", border: "#16a34a" },
  primer: { bg: "#14532d", text: "#bbf7d0", border: "#16a34a" },
};

const FIREARM_TYPE_STYLES = {
  Rifle: { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  Pistol: { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  AR: { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  Shotgun: { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  Rimfire: { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  Other: { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
};

export function CategoryPill({ value, isFirearmType = false }) {
  const styles = isFirearmType ? FIREARM_TYPE_STYLES : CATEGORY_STYLES;
  const style = styles[value] || { bg: "#1a1a1a", text: "#f97316", border: "#f97316" };
  
  return (
    <span style={{
      background: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 20,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      display: "inline-block",
    }}>
      {value}
    </span>
  );
}

export function getStyleForCategory(value, isFirearmType = false) {
  const styles = isFirearmType ? FIREARM_TYPE_STYLES : CATEGORY_STYLES;
  return styles[value] || { bg: "#1a1a1a", text: "#f97316", border: "#f97316" };
}