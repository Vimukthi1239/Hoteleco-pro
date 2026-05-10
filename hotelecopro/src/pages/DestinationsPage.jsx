import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DESTINATIONS } from "../data/destinations";
import { saveDestination, listenDestinations } from "../data/firebase";
import { IMG_SUNSET, IMG_BOATS } from "../constants";
import Pill from "../components/Pill";
import DestinationProfile from "./DestinationProfile";

function DestinationsPage() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState("All");
    const [sel, setSel] = useState(null);

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

    const districts = ["All", "Colombo", "Galle", "Kandy", "Jaffna", "Anuradhapura", "Badulla", "Polonnaruwa", "Trincomalee", "Batticaloa", "Gampaha", "Kalutara", "Kurunegala", "Ratnapura", "Kegalle", "Nuwara Eliya", "Monaragala", "Mannar", "Mullaitivu", "Vavuniya", "Kilinochchi", "Puttalam", "Hambantota", "Matale"];

    useEffect(() => {
        const unsub = listenDestinations((data) => {
            console.log("Fetched live destinations from Firebase:", data);
            setLiveDestinations(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const allDestinations = [...liveDestinations, ...DESTINATIONS];
    const filtered = filter === "All" ? allDestinations : allDestinations.filter(d => d.district === filter);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!newDest.name || !newDest.lat || !newDest.lng) {
            alert("Name, Latitude, and Longitude are required.");
            return;
        }
        setAddLoading(true);
        try {
            const formatTimeStr = (tStr) => {
                if(!tStr) return null;
                const [h, m] = tStr.split(':');
                let hrs = parseInt(h, 10);
                const ampm = hrs >= 12 ? 'PM' : 'AM';
                hrs = hrs % 12 || 12;
                return `${hrs < 10 ? '0'+hrs : hrs}:${m} ${ampm}`;
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
                const response = await fetch("http://localhost:8000/add/site", {
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
            const response = await fetch(`http://localhost:8000/recommend/hotels?site_name=${encodeURIComponent(destName)}&top_k=5`);
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

    if (sel) return <DestinationProfile destination={sel} onBack={() => setSel(null)} />;

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh", position: "relative" }}>
            <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
                <img src={IMG_SUNSET} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,32,48,0.62)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff", padding: "0 32px" }}>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "3rem", fontWeight: 700, marginBottom: 12 }}>{t("destinations.title")}</h1>
                    <p style={{ fontSize: "1.05rem", opacity: 0.85 }}>{t("destinations.sub")}</p>
                </div>
            </div>

            <div style={{ padding: "40px 48px", background: "#fafcfd" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 36, gap: 16 }}>
                    <button
                        onClick={() => setShowAddModal(true)}
                        title="Add New Destination"
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
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {districts.map(p => <Pill key={p} active={filter === p} onClick={() => setFilter(p)}>{p}</Pill>)}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "#6b8999" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔄</div>
                        <p style={{ fontSize: "1.1rem" }}>Loading destinations...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "#6b8999" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🌴</div>
                        <p style={{ fontSize: "1.1rem" }}>No destinations found for this district.</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 24 }}>
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
                                    <div style={{ fontSize: "0.75rem", color: "#0a7fa5", fontWeight: 600, marginBottom: 8 }}>{d.district} {t("destinations.province")} · {d.best}</div>
                                    <p style={{ fontSize: "0.85rem", color: "#6b8999", lineHeight: 1.65, flex: 1 }}>{d.desc}</p>
                                    <div style={{ display: "flex", gap: "10px", marginTop: 14 }}>
                                        <button onClick={() => setSel(d)} style={{ flex: 1, background: "#e6f4f9", color: "#0a7fa5", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>Explore</button>
                                        <button onClick={() => handleFindHotels(d.name)} style={{ flex: 1, background: "#17c4b8", color: "#fff", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>Nearest Hotels</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Destination Modal */}
            {showAddModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "400px", maxWidth: "90%" }}>
                        <h2 style={{ marginBottom: "20px", color: "#0f2030", fontFamily: "'Playfair Display',serif" }}>Add New Destination</h2>
                        <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <input placeholder="Name (e.g. Sigiriya)" value={newDest.name} onChange={e => setNewDest({ ...newDest, name: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} required />
                            <select value={newDest.district} onChange={e => setNewDest({ ...newDest, district: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                                {districts.filter(p => p !== "All").map(p => <option key={p} value={p}>{p} District</option>)}
                            </select>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input type="number" step="any" placeholder="Latitude (e.g. 7.95)" value={newDest.lat} onChange={e => setNewDest({ ...newDest, lat: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }} required />
                                <input type="number" step="any" placeholder="Longitude (e.g. 80.76)" value={newDest.lng} onChange={e => setNewDest({ ...newDest, lng: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }} required />
                            </div>
                            <input placeholder="Image URL (optional)" value={newDest.img} onChange={e => setNewDest({ ...newDest, img: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                            <div style={{ display: "flex", gap: "10px" }}>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                    <label style={{ fontSize: "0.8rem", color: "#6b8999", marginBottom: "4px" }}>Open Time</label>
                                    <input type="time" value={newDest.openTime} onChange={e => setNewDest({ ...newDest, openTime: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }} />
                                </div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                    <label style={{ fontSize: "0.8rem", color: "#6b8999", marginBottom: "4px" }}>Close Time</label>
                                    <input type="time" value={newDest.closeTime} onChange={e => setNewDest({ ...newDest, closeTime: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }} />
                                </div>
                            </div>
                            <textarea placeholder="Description" value={newDest.desc} onChange={e => setNewDest({ ...newDest, desc: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minHeight: "80px" }} />
                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "10px", background: "#f1f1f1", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                                <button type="submit" disabled={addLoading} style={{ flex: 1, padding: "10px", background: "#0a7fa5", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                                    {addLoading ? "Submitting..." : "Submit"}
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
                        <h2 style={{ marginBottom: "10px", color: "#0f2030", fontFamily: "'Playfair Display',serif" }}>Hotels Near {selectedDestName}</h2>
                        {recLoading ? (
                            <p style={{ textAlign: "center", padding: "20px" }}>Finding nearest hotels...</p>
                        ) : recommendations.length > 0 ? (
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                {recommendations.map((h, i) => (
                                    <li key={i} style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", border: "1px solid #e2ecf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontWeight: 600, color: "#0a7fa5" }}>{h.hotel_name}</span>
                                        <span style={{ fontSize: "0.85rem", background: "#17c4b8", color: "#fff", padding: "4px 8px", borderRadius: "4px" }}>{h.distance_km} km away</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hotels found nearby.</p>
                        )}
                        <button onClick={() => setShowRecModal(false)} style={{ width: "100%", marginTop: "20px", padding: "10px", background: "#e6f4f9", color: "#0a7fa5", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DestinationsPage;
