import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DESTINATIONS } from "../data/destinations";
import { saveDestination, listenDestinations } from "../data/firebase";
import { IMG_SUNSET, IMG_BOATS } from "../constants";
import Pill from "../components/Pill";
import DestinationProfile from "./DestinationProfile";
import { API_BASE_URL } from "../config";

function DestinationsPage({ setPage, setMapTarget, selectedRoutePoints, setSelectedRoutePoints }) {
    const { t } = useTranslation();
    const [filter, setFilter] = useState("All");
    const [sel, setSel] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // ML Feature: Add Destination Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDest, setNewDest] = useState({ name: "", district: "Colombo", lat: "", lng: "", desc: "", img: "", openTime: "", closeTime: "" });
    const [addLoading, setAddLoading] = useState(false);

    // Firebase Data States
    const [liveDestinations, setLiveDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    // ML Feature: Recommendations Modal States
    const [showRecModal, setShowRecModal] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [recLoading, setRecLoading] = useState(false);
    const [selectedDestName, setSelectedDestName] = useState("");

    const districts = ["All", "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Mathara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

    const isSelected = (dest) => {
        return (selectedRoutePoints || []).some(p => p.name === dest.name);
    };

    const handleToggleRoutePoint = (dest) => {
        if (isSelected(dest)) {
            setSelectedRoutePoints((selectedRoutePoints || []).filter(p => p.name !== dest.name));
        } else {
            const pt = {
                name: dest.name,
                lat: parseFloat(dest.lat),
                lng: parseFloat(dest.lng || dest.lon || dest.longitude),
                isHotel: false,
                img: dest.img,
                district: dest.district,
                rating: dest.rating,
                best: dest.best
            };
            setSelectedRoutePoints([...(selectedRoutePoints || []), pt]);
        }
    };

    useEffect(() => {
        const unsub = listenDestinations((data) => {
            console.log("Fetched live destinations from Firebase:", data);
            setLiveDestinations(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const allDestinations = [...liveDestinations, ...DESTINATIONS];
    const filtered = allDestinations.filter(d => {
        const matchesFilter = filter === "All" || d.district === filter;
        const matchesSearch = searchQuery.trim() === "" ||
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.desc && d.desc.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!newDest.name || !newDest.lat || !newDest.lng) {
            alert("Name, Latitude, and Longitude are required.");
            return;
        }
        setAddLoading(true);
        try {
            const formatTimeStr = (tStr) => {
                if (!tStr) return null;
                const [h, m] = tStr.split(':');
                let hrs = parseInt(h, 10);
                const ampm = hrs >= 12 ? 'PM' : 'AM';
                hrs = hrs % 12 || 12;
                return `${hrs < 10 ? '0' + hrs : hrs}:${m} ${ampm}`;
            };

            const newEntry = {
                name: newDest.name,
                district: newDest.district,
                lat: parseFloat(newDest.lat),
                lng: parseFloat(newDest.lng),
                desc: newDest.desc || "A beautifully discovered destination.",
                img: newDest.img || IMG_BOATS,
                openTime: formatTimeStr(newDest.openTime) || "06:00 AM",
                closeTime: formatTimeStr(newDest.closeTime) || "06:00 PM",
                rating: "4.5",
                best: "Anytime"
            };

            // 1. Save to Firebase FIRST
            await saveDestination(newEntry);

            // 2. Try to train ML backend (Optional / Non-blocking)
            try {
                const response = await fetch(`${API_BASE_URL}/add/site`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: newDest.name,
                        latitude: parseFloat(newDest.lat),
                        longitude: parseFloat(newDest.lng)
                    })
                });
                if (!response.ok) {
                    console.warn("ML backend training skipped or rejected.");
                }
            } catch (mlError) {
                console.warn("ML backend is unreachable:", mlError.message);
            }

            setShowAddModal(false);
            setNewDest({ name: "", district: "Colombo", lat: "", lng: "", desc: "", img: "", openTime: "", closeTime: "" });
            alert("Destination Added Successfully!");
        } catch (error) {
            alert("Database Error: " + error.message);
        } finally {
            setAddLoading(false);
        }
    };

    const handleFindHotels = async (destName) => {
        setSelectedDestName(destName);
        setShowRecModal(true);
        setRecLoading(true);
        setRecommendations([]);
        try {
            const response = await fetch(`${API_BASE_URL}/recommend/hotels?site_name=${encodeURIComponent(destName)}&top_k=5`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Could not find recommendations.");
            }
            const data = await response.json();
            setRecommendations(data.recommended_hotels);
        } catch (error) {
            alert(error.message);
            setShowRecModal(false);
        } finally {
            setRecLoading(false);
        }
    };

    if (sel) return <DestinationProfile destination={sel} onBack={() => setSel(null)} setPage={setPage} setMapTarget={setMapTarget} />;

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh", position: "relative" }}>
            <style>{`
                @media (max-width: 768px) {
                    .destinations-hero-content {
                        padding: 0 16px !important;
                    }
                    .destinations-container {
                        padding: 24px 16px !important;
                    }
                    .destinations-grid {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                    .destinations-dock {
                        padding: 12px 16px !important;
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 12px !important;
                        bottom: 12px !important;
                        width: calc(100vw - 32px) !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>
            <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
                <img src={IMG_SUNSET} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,32,48,0.62)" }} />
                <div className="destinations-hero-content" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff", padding: "0 32px" }}>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 700, marginBottom: 12 }}>{t("destinations.title")}</h1>
                    <p style={{ fontSize: "1rem", opacity: 0.85 }}>{t("destinations.sub")}</p>
                </div>
            </div>

            {/* Floating Glassmorphic Search Console */}
            <div style={{
                position: "relative",
                maxWidth: 680,
                margin: "-30px auto 0",
                zIndex: 10,
                padding: "0 16px"
            }}>
                <div style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 20,
                    padding: "8px 16px",
                    boxShadow: "0 12px 30px rgba(10, 32, 48, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "all 0.3s ease",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 15px 35px rgba(23, 196, 184, 0.25)";
                    e.currentTarget.style.borderColor = "rgba(23, 196, 184, 0.4)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(10, 32, 48, 0.12)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.6)";
                }}
                >
                    <span style={{ fontSize: "1.2rem", color: "#17c4b8", userSelect: "none" }}>🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t("destinations.searchPlaceholder")}
                        style={{
                            flex: 1,
                            border: "none",
                            background: "transparent",
                            fontSize: "0.95rem",
                            color: "#0f2030",
                            outline: "none",
                            padding: "8px 0",
                            fontFamily: "inherit"
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            style={{
                                background: "rgba(10, 32, 48, 0.08)",
                                border: "none",
                                borderRadius: "50%",
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#6b8999",
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(10, 32, 48, 0.15)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(10, 32, 48, 0.08)"}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="destinations-container" style={{ padding: "40px 48px", background: "#fafcfd" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 36, gap: 16 }}>
                    <button
                        onClick={() => setShowAddModal(true)}
                        title={t("destinations.addTitle")}
                        style={{
                            width: 44, height: 44, borderRadius: "50%",
                            background: "linear-gradient(135deg, #0a7fa5, #17c4b8)",
                            color: "#fff", border: "none", fontSize: "1.8rem",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", boxShadow: "0 4px 15px rgba(10,127,165,0.3)",
                            transition: "all 0.3s",
                            flexShrink: 0
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "rotate(90deg) scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(10,127,165,0.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "rotate(0deg) scale(1)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(10,127,165,0.3)"; }}
                    >
                        +
                    </button>
                    <div className="horizontal-scroll-pills" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {districts.map(p => <Pill key={p} active={filter === p} onClick={() => setFilter(p)}>{p === "All" ? t("destinations.all") || "All" : p}</Pill>)}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "#6b8999" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔄</div>
                        <p style={{ fontSize: "1.1rem" }}>{t("hotels.loading")}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "#6b8999" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🌴</div>
                        <p style={{ fontSize: "1.1rem" }}>{t("destinations.noneFound") || "No destinations found for this district."}</p>
                    </div>
                ) : (
                    <div className="destinations-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 24 }}>
                        {filtered.map(d => (
                            <div key={d.name} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(10,127,165,0.08)", border: "1px solid #e2ecf0", transition: "transform 0.3s", display: "flex", flexDirection: "column" }}
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
                                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                                    <div style={{ fontSize: "0.75rem", color: "#0a7fa5", fontWeight: 600, marginBottom: 8 }}>{d.district} {t("profile.district")} · {d.best}</div>
                                    <p style={{ fontSize: "0.85rem", color: "#6b8999", lineHeight: 1.65, flex: 1 }}>{d.desc}</p>
                                    <div style={{ display: "flex", gap: "8px", marginTop: 14 }}>
                                        <button onClick={() => setSel(d)} style={{ flex: 1, background: "#e6f4f9", color: "#0a7fa5", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>{t("destinations.explore")}</button>
                                        <button onClick={() => handleFindHotels(d.name)} style={{ flex: 1, background: "#17c4b8", color: "#fff", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>{t("destinations.nearestHotels")}</button>
                                        <button 
                                            onClick={() => handleToggleRoutePoint(d)} 
                                            style={{ 
                                                width: 36, 
                                                background: isSelected(d) ? "#7b2ff7" : "#f1f5f9", 
                                                color: isSelected(d) ? "#fff" : "#4b5563", 
                                                border: "none", 
                                                borderRadius: 8, 
                                                cursor: "pointer", 
                                                fontSize: "0.95rem", 
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.2s"
                                            }}
                                            title={isSelected(d) ? "Remove from Route" : "Add to Route"}
                                        >
                                            {isSelected(d) ? "✓" : "📍"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                       {/* Add Destination Modal */}
            {showAddModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "400px", maxWidth: "90%" }}>
                        <h2 style={{ marginBottom: "20px", color: "#0f2030", fontFamily: "'Playfair Display',serif" }}>{t("destinations.addTitle")}</h2>
                        <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <input placeholder={t("destinations.addNamePlaceholder") || "Name (e.g. Sigiriya)"} value={newDest.name} onChange={e => setNewDest({ ...newDest, name: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} required />
                            <select value={newDest.district} onChange={e => setNewDest({ ...newDest, district: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                                {districts.filter(p => p !== "All").map(p => <option key={p} value={p}>{p} {t("profile.district")}</option>)}
                            </select>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input type="number" step="any" placeholder={`${t("signin.latitude") || "Latitude"} (e.g. 7.95)`} value={newDest.lat} onChange={e => setNewDest({ ...newDest, lat: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }} required />
                                <input type="number" step="any" placeholder={`${t("signin.longitude") || "Longitude"} (e.g. 80.76)`} value={newDest.lng} onChange={e => setNewDest({ ...newDest, lng: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }} required />
                            </div>
                            <input placeholder={t("destinations.addImagePlaceholder") || "Image URL (optional)"} value={newDest.img} onChange={e => setNewDest({ ...newDest, img: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                            <div style={{ display: "flex", gap: "10px" }}>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                    <label style={{ fontSize: "0.8rem", color: "#6b8999", marginBottom: "4px" }}>{t("destinations.openingTime") || "Opening Time"}</label>
                                    <input type="time" value={newDest.openTime} onChange={e => setNewDest({ ...newDest, openTime: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }} />
                                </div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                    <label style={{ fontSize: "0.8rem", color: "#6b8999", marginBottom: "4px" }}>{t("destinations.closingTime") || "Closing Time"}</label>
                                    <input type="time" value={newDest.closeTime} onChange={e => setNewDest({ ...newDest, closeTime: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }} />
                                </div>
                            </div>
                            <textarea placeholder={t("destinations.addDescPlaceholder") || "Description"} value={newDest.desc} onChange={e => setNewDest({ ...newDest, desc: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minHeight: "80px" }} />
                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "10px", background: "#f1f1f1", border: "none", borderRadius: "6px", cursor: "pointer" }}>{t("destinations.cancel") || t("destinations.close") || "Cancel"}</button>
                                <button type="submit" disabled={addLoading} style={{ flex: 1, padding: "10px", background: "#0a7fa5", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                                    {addLoading ? t("signin.waiting") : t("destinations.submit") || "Submit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recommendations Modal */}
            {showRecModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "450px", maxWidth: "90%" }}>
                        <h2 style={{ marginBottom: "10px", color: "#0f2030", fontFamily: "'Playfair Display',serif" }}>{t("destinations.nearestHotels")} - {selectedDestName}</h2>
                        {recLoading ? (
                            <p style={{ textAlign: "center", padding: "20px" }}>{t("destinations.findingNearest")}</p>
                        ) : recommendations.length > 0 ? (
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                {recommendations.map((h, i) => (
                                     <li key={i} style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", border: "1px solid #e2ecf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                         <span style={{ fontWeight: 600, color: "#0a7fa5" }}>{h.hotel_name}</span>
                                         <span style={{ fontSize: "0.85rem", background: "#17c4b8", color: "#fff", padding: "4px 8px", borderRadius: "4px" }}>{h.distance_km} km {t("destinations.away") || "away"}</span>
                                     </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{t("destinations.noneNearby")}</p>
                        )}
                        <button onClick={() => setShowRecModal(false)} style={{ width: "100%", marginTop: "20px", padding: "10px", background: "#e6f4f9", color: "#0a7fa5", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>{t("destinations.close")}</button>
                    </div>
                </div>
            )}
            {/* Floating Glassmorphic Route Dock */}
            {selectedRoutePoints && selectedRoutePoints.length > 0 && (
                <div className="destinations-dock" style={{
                    position: "fixed",
                    bottom: 24,

                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 999,
                    background: "rgba(10, 32, 48, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 20,
                    padding: "14px 28px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    width: "max-content",
                    maxWidth: "90%"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.3rem" }}>🗺️</span>
                        <div style={{ color: "#fff" }}>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Route Planner</div>
                            <div style={{ fontSize: "0.75rem", color: "#a4b3c6" }}>
                                {selectedRoutePoints.length === 1 
                                    ? "1 destination selected" 
                                    : `${selectedRoutePoints.length} destinations selected`}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button 
                            onClick={() => setSelectedRoutePoints([])} 
                            style={{ 
                                background: "rgba(255,255,255,0.1)", 
                                border: "none", 
                                color: "#fff", 
                                padding: "8px 16px", 
                                borderRadius: 10, 
                                fontSize: "0.8rem", 
                                fontWeight: 600, 
                                cursor: "pointer", 
                                transition: "all 0.2s" 
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        >
                            Clear
                        </button>
                        <button 
                            onClick={() => setPage("map")} 
                            style={{ 
                                background: "linear-gradient(135deg, #17c4b8 0%, #0a7fa5 100%)", 
                                border: "none", 
                                color: "#fff", 
                                padding: "8px 20px", 
                                borderRadius: 10, 
                                fontSize: "0.8rem", 
                                fontWeight: 700, 
                                cursor: "pointer", 
                                boxShadow: "0 4px 12px rgba(23,196,184,0.3)",
                                transition: "all 0.2s" 
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        >
                            Plot Route →
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
}

export default DestinationsPage;
