import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DESTINATIONS } from "../data/destinations";
import { HOTELS } from "../data/hotels";
import { IMG_AERIAL } from "../constants";
import Pill from "../components/Pill";

function MapPage() {
    const { t } = useTranslation();
    const [selected, setSelected] = useState(null);
    const [hotelSel, setHotelSel] = useState(null);
    const [view, setView] = useState("destinations");

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh", background: "#f0f8fc" }}>
            <div style={{ padding: "32px 48px 20px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 8 }}>{t("map.badge")}</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.4rem", color: "#0f2030", marginBottom: 8 }}>{t("map.title")}</h1>
                <p style={{ fontSize: "0.95rem", color: "#6b8999", marginBottom: 16 }}>{t("map.sub")}</p>
                <div style={{ display: "flex", gap: 10 }}>
                    <Pill active={view === "destinations"} onClick={() => setView("destinations")}>{t("map.destinations")}</Pill>
                    <Pill active={view === "hotels"} onClick={() => setView("hotels")}>{t("map.hotels")}</Pill>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 0, height: "calc(100vh - 240px)", margin: "0 48px 48px", borderRadius: 20, overflow: "hidden", border: "1px solid #e2ecf0", boxShadow: "0 8px 40px rgba(10,127,165,0.1)" }}>
                {/* Sidebar */}
                <div style={{ background: "#fff", overflowY: "auto", borderRight: "1px solid #e2ecf0" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2ecf0", fontWeight: 700, fontSize: "0.9rem", color: "#0f2030" }}>
                        {view === "destinations" ? `📍 ${DESTINATIONS.length} ${t("map.destinations").replace("📍 ", "")}` : `🏨 ${HOTELS.length} ${t("map.hotels").replace("🏨 ", "")}`}
                    </div>
                    {(view === "destinations" ? DESTINATIONS : HOTELS).map(item => (
                        <div key={item.name || item.id}
                            onClick={() => view === "destinations" ? setSelected(item) : setHotelSel(item)}
                            style={{ padding: "14px 20px", borderBottom: "1px solid #f5f8fa", cursor: "pointer", background: (selected?.name === item.name || hotelSel?.id === item.id) ? "#e6f4f9" : "transparent", transition: "background 0.2s", display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <img src={item.img} alt={item.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} onError={e => e.target.src = IMG_AERIAL} />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f2030", marginBottom: 2 }}>{item.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "#6b8999" }}>{item.district} · {item.rating}★</div>
                                {view === "destinations" && <div style={{ fontSize: "0.72rem", color: "#17c4b8", marginTop: 2 }}>{item.best}</div>}
                                {view === "hotels" && <div style={{ fontSize: "0.72rem", color: "#0a7fa5", marginTop: 2 }}>${item.price}{t("map.night")} · {item.type}</div>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Map Panel */}
                <div style={{ position: "relative", background: "#e8f4f8", overflow: "hidden" }}>
                    <img src={IMG_AERIAL} alt="Map" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.25, filter: "blur(2px) saturate(0.6)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(224,240,248,0.85),rgba(200,230,245,0.7))" }} />

                    {/* Markers */}
                    {(view === "destinations" ? DESTINATIONS : HOTELS).slice(0, 12).map((item, i) => (
                        <div key={i}
                            onClick={() => view === "destinations" ? setSelected(item) : setHotelSel(item)}
                            style={{ position: "absolute", left: `${10 + (i % 6) * 14}%`, top: `${15 + Math.floor(i / 6) * 35}%`, cursor: "pointer", zIndex: (selected?.name === item.name || hotelSel?.id === item.id) ? 10 : 1, transition: "transform 0.2s", transform: (selected?.name === item.name || hotelSel?.id === item.id) ? "scale(1.3)" : "scale(1)" }}>
                            <div style={{ background: (selected?.name === item.name || hotelSel?.id === item.id) ? "#0a7fa5" : "#fff", color: (selected?.name === item.name || hotelSel?.id === item.id) ? "#fff" : "#0a7fa5", border: "2.5px solid #0a7fa5", borderRadius: "50% 50% 50% 0", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 700, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", transform: "rotate(-45deg)" }}>
                                <span style={{ transform: "rotate(45deg)" }}>{i + 1}</span>
                            </div>
                            <div style={{ fontSize: "0.65rem", color: "#0f2030", fontWeight: 600, textAlign: "center", marginTop: 4, whiteSpace: "nowrap", background: "rgba(255,255,255,0.92)", borderRadius: 4, padding: "2px 6px" }}>{item.name?.split(" ")[0]}</div>
                        </div>
                    ))}

                    {/* Info Card */}
                    {(selected || hotelSel) && (
                        <div style={{ position: "absolute", bottom: 24, right: 24, background: "rgba(255,255,255,0.97)", border: "1px solid #e2ecf0", borderRadius: 16, padding: 20, maxWidth: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                            <img src={(selected || hotelSel).img} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, marginBottom: 12 }} onError={e => e.target.src = IMG_AERIAL} />
                            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "#0f2030", fontSize: "1.05rem", marginBottom: 4 }}>{(selected || hotelSel).name}</div>
                            <div style={{ fontSize: "0.8rem", color: "#6b8999", marginBottom: 8 }}>{(selected || hotelSel).district} · {(selected || hotelSel).rating}★</div>
                            <p style={{ fontSize: "0.8rem", color: "#4a6374", lineHeight: 1.55 }}>{(selected || hotelSel).desc || (selected || hotelSel).best}</p>
                            {hotelSel && <div style={{ marginTop: 8, fontWeight: 700, color: "#0a7fa5" }}>${hotelSel.price}{t("map.night")}</div>}
                        </div>
                    )}

                    {/* Empty state */}
                    {!selected && !hotelSel && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                            <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 20, padding: "28px 36px", maxWidth: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🗺️</div>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 700, color: "#0f2030", marginBottom: 8 }}>{t("map.mapboxTitle")}</div>
                                <p style={{ fontSize: "0.85rem", color: "#6b8999", lineHeight: 1.65 }}>{t("map.mapboxDesc")}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MapPage;
