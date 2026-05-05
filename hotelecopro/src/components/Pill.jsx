/**
 * Reusable Pill / Badge component.
 * Props: children, color (text color), bg (background color), small (boolean)
 */
export default function Pill({ children, color = "#0a7fa5", bg = "#e6f4f9", small = false }) {
    return (
        <span style={{
            background: bg,
            color: color,
            fontSize: small ? "0.68rem" : "0.75rem",
            fontWeight: 700,
            padding: small ? "2px 8px" : "4px 12px",
            borderRadius: 20,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            display: "inline-block",
            whiteSpace: "nowrap",
            fontFamily: "'Outfit', sans-serif",
        }}>
            {children}
        </span>
    );
}
