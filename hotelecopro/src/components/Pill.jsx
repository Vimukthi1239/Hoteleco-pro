/**
 * Reusable Pill / Badge component.
 * Props: children, color (text color), bg (background color), small (boolean)
 */
export default function Pill({ children, color = "#0a7fa5", bg = "#e6f4f9", small = false, active, onClick }) {
    const isClickable = typeof onClick === "function";
    const currentBg = active ? "#0a7fa5" : bg;
    const currentColor = active ? "#fff" : color;

    return (
        <span
            onClick={onClick}
            style={{
                background: currentBg,
                color: currentColor,
                fontSize: small ? "0.68rem" : "0.75rem",
                fontWeight: 700,
                padding: small ? "2px 8px" : (isClickable ? "8px 16px" : "4px 12px"),
                borderRadius: 20,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                display: "inline-block",
                whiteSpace: "nowrap",
                fontFamily: "'Outfit', sans-serif",
                cursor: isClickable ? "pointer" : "default",
                border: isClickable ? (active ? "1px solid #0a7fa5" : "1px solid #e2ecf0") : "none",
                transition: "all 0.2s"
            }}>
            {children}
        </span>
    );
}
