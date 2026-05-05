import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DESTINATIONS } from "../data/destinations";
import { IMG_SUNSET, IMG_BOATS } from "../constants";
import Pill from "../components/Pill";

function DestinationsPage() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState("All");
    const provinces = ["All", "Western", "Central", "Southern", "Eastern", "Northern", "Uva"];
    const filtered = filter === "All" ? DESTINATIONS : DESTINATIONS.filter(d => d.district === filter);

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh" }}>
            <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
                <img src={IMG_SUNSET} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,32,48,0.62)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff", padding: "0 32px" }}>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "3rem", fontWeight: 700, marginBottom: 12 }}>{t("destinations.title")}</h1>
                    <p style={{ fontSize: "1.05rem", opacity: 0.85 }}>{t("destinations.sub")}</p>
                </div>
            </div>
            <div style={{ padding: "40px 48px", background: "#fafcfd" }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
                    {provinces.map(p => <Pill key={p} active={filter === p} onClick={() => setFilter(p)}>{p}</Pill>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 24 }}>
                    {filtered.map(d => (
                        <div key={d.name} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(10,127,165,0.08)", border: "1px solid #e2ecf0", transition: "transform 0.3s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                            <div style={{ position: "relative", height: 200 }}>
                                <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = IMG_BOATS} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,32,48,0.65),transparent)" }} />
                                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.95)", borderRadius: 8, padding: "4px 12px", fontSize: "0.82rem", fontWeight: 700, color: "#0f2030" }}>{d.rating} ★</div>
                                <div style={{ position: "absolute", bottom: 14, left: 16, color: "#fff" }}>
                                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.25rem", fontWeight: 700 }}>{d.name}</div>
                                </div>
                            </div>
                            <div style={{ padding: 20 }}>
                                <div style={{ fontSize: "0.75rem", color: "#0a7fa5", fontWeight: 600, marginBottom: 8 }}>{d.district} {t("destinations.province")} · {d.best}</div>
                                <p style={{ fontSize: "0.85rem", color: "#6b8999", lineHeight: 1.65 }}>{d.desc}</p>
                                <button style={{ marginTop: 14, background: "#e6f4f9", color: "#0a7fa5", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, fontFamily: "inherit" }}>{t("destinations.explore")}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DestinationsPage;
