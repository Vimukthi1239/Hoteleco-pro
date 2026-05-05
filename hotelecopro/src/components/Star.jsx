const Star = ({ v = 5 }) => (
    <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>
        {"★".repeat(Math.round(v))}{"☆".repeat(5 - Math.round(v))}
    </span>
);

export default Star;
