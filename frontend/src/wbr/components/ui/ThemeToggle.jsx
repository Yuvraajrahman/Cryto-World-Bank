import Icon from "../ui/Icon";
import { useTheme } from "../../theme/ThemeProvider";

const LABELS = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

const ICONS = {
  system: "system",
  light: "sun",
  dark: "moon",
};

/**
 * Cycles system → light → dark. 44×44 tap target for mobile.
 */
export default function ThemeToggle({ className = "" }) {
  const { preference, cycle } = useTheme();
  const label = LABELS[preference] ?? "Theme";

  return (
    <button
      type="button"
      className={`icon-btn theme-toggle ${className}`}
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
    >
      <Icon name={ICONS[preference] ?? "system"} size={18} />
    </button>
  );
}
