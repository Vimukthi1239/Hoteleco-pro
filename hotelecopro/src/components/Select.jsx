import { useState } from "react";

/**
 * Reusable labeled select dropdown.
 * Props: label, value, onChange, options (array of strings), disabled
 */
export default function FormSelect({ label, value, onChange, options = [], disabled }) {
    const [focused, setFocused] = useState(false);

    return (
        <div>
            {label && (
                <label style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: focused ? "#0a7fa5" : "#6b8999",
                    display: "block",
                    marginBottom: 6,
                    transition: "color 0.18s",
                }}>
                    {label}
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: `1.5px solid ${focused ? "#0a7fa5" : "#e2ecf0"}`,
                    borderRadius: 10,
                    fontSize: "0.9rem",
                    color: "#1e3a4a",
                    background: disabled ? "#f9fbfc" : "#fafcfd",
                    outline: "none",
                    fontFamily: "'Outfit', sans-serif",
                    transition: "border-color 0.18s",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.65 : 1,
                    appearance: "auto",
                }}
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}
