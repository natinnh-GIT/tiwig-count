// Category and Type styling configurations
const CATEGORY_STYLES = {
  brass: { bg: "#713f12", text: "#fef08a" },
  bullets: { bg: "#1d4ed8", text: "#dbeafe" },
  bullet: { bg: "#1d4ed8", text: "#dbeafe" },
  powder: { bg: "#c2410c", text: "#ffedd5" },
  primers: { bg: "#15803d", text: "#dcfce7" },
  primer: { bg: "#15803d", text: "#dcfce7" },
};

const FIREARM_TYPE_STYLES = {
  Rifle: { bg: "#1c1917", text: "#d6d3d1" },
  Pistol: { bg: "#1c1917", text: "#d6d3d1" },
  AR: { bg: "#1c1917", text: "#d6d3d1" },
  Shotgun: { bg: "#1c1917", text: "#d6d3d1" },
  Rimfire: { bg: "#1c1917", text: "#d6d3d1" },
  Other: { bg: "#1c1917", text: "#d6d3d1" },
};

export function CategoryPill({ value, isFirearmType = false }) {
  const styles = isFirearmType ? FIREARM_TYPE_STYLES : CATEGORY_STYLES;
  const style = styles[value] || { bg: "#1a1a1a", text: "#f97316" };
  
  return (
    <span style={{
      background: style.bg,
      color: style.text,
      fontSize: 12,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 6,
      textTransform: "lowercase",
      display: "inline-block",
    }}>
      {value}
    </span>
  );
}

export function getStyleForCategory(value, isFirearmType = false) {
  const styles = isFirearmType ? FIREARM_TYPE_STYLES : CATEGORY_STYLES;
  return styles[value] || { bg: "#1a1a1a", text: "#f97316" };
}