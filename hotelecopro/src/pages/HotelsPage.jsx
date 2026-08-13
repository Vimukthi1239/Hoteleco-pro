import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HOTELS } from "../data/hotels";
import { listenHotelRegistrations, listenAllHotelProfiles } from "../data/firebase";
import Star from "../components/Star";
import Pill from "../components/Pill";
import HotelProfile from "./HotelProfile";
import { API_BASE_URL } from "../config";


const districtCoordinates = {
    "Colombo": { lat: 6.9271, lng: 79.8612 },
    "Kandy": { lat: 7.2906, lng: 80.6337 },
    "Galle": { lat: 6.0328, lng: 80.2168 },
    "Matara": { lat: 5.9549, lng: 80.5470 },
    "Hambantota": { lat: 6.1248, lng: 81.1185 },
    "Anuradhapura": { lat: 8.3114, lng: 80.4037 },
    "Matale": { lat: 7.4675, lng: 80.6234 },
    "Jaffna": { lat: 9.6615, lng: 80.0255 },
    "Trincomalee": { lat: 8.5811, lng: 81.2330 },
    "Nuwara Eliya": { lat: 6.9497, lng: 80.7829 },
    "Sri Lanka": { lat: 7.8731, lng: 80.7718 }
};

function HotelsPage({ setPage, setMapTarget }) {
    const { t } = useTranslation();
    const [sel, setSel] = useState(null);
    const [filter, setFilter] = useState("All");
    const [liveHotels, setLiveHotels] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const hotelsPerPage = 12;
    const [regs, setRegs] = useState([]);
    const [profiles, setProfiles] = useState({});
    const [loading, setLoading] = useState(true);

    // ML Feature: Recommendations Modal States
    const [showRecModal, setShowRecModal] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [recLoading, setRecLoading] = useState(false);
    const [selectedHotelName, setSelectedHotelName] = useState("");

    useEffect(() => {
        let loadedRegs = false;
        let loadedProfiles = false;

        const unsubProfiles = listenAllHotelProfiles((data) => {
            setProfiles(data || {});
            loadedProfiles = true;
            if (loadedRegs) setLoading(false);
        });
        const unsubRegs = listenHotelRegistrations((data) => {
            setRegs(data || []);
            loadedRegs = true;
            if (loadedProfiles) setLoading(false);
        });
        return () => {
            unsubProfiles();
            unsubRegs();
        };
    }, []);

    useEffect(() => {
        const approved = regs.filter(r => r.status === "approved" || r.status === "pending");
        const mapped = approved.map(r => {
            const prof = profiles[r.id] || {};
            // Determine the starting price from available packages, fallback to a default if none exist
            const lowestPrice = prof.packages?.length > 0
                ? Math.min(...prof.packages.map(p => Number(p.price)))
                : 150;

            const districtCoords = districtCoordinates[r.district] || districtCoordinates["Sri Lanka"];
            const lat = (r.lat && !isNaN(parseFloat(r.lat))) ? parseFloat(r.lat) : districtCoords.lat;
            const lng = (r.lng && !isNaN(parseFloat(r.lng))) ? parseFloat(r.lng) : districtCoords.lng;

            return {
                id: r.id,
                name: r.hotelName || "Unnamed Hotel",
                type: r.type || "Hotel",
                district: r.district || "Sri Lanka",
                rooms: r.rooms || "10",
                price: lowestPrice,
                rating: prof.rating || 4.5,
                // Fallback image if the hotel partner hasn't uploaded one yet
                img: prof.photoUrl || "https://images.unsplash.com/photo-1542314831-c6a4d14d8379?auto=format&fit=crop&w=800&q=80",
                desc: prof.desc || "A beautiful stay offering comfortable accommodation and exceptional service.",
                packages: prof.packages || [],
                offers: prof.offers || [],
                amenities: prof.amenities && prof.amenities.length > 0 ? prof.amenities : ["WiFi", "Parking", "Restaurant", "Air Conditioning"],
                lat,
                lng
            };
        });
        setLiveHotels(mapped);
    }, [regs, profiles]);

    const allHotels = [...liveHotels, ...HOTELS];
    const types = ["All", "Boutique Hotel", "Heritage Hotel", "5-Star Resort", "Eco Resort", "Wildlife Resort", "Boutique Villa", "Guest House", "Tourist Hotel", "Villa"];
    const filtered = allHotels.filter(h => {
        const matchesFilter = filter === "All" || (h.type && h.type.trim().toLowerCase() === filter.trim().toLowerCase());
        const matchesSearch = searchQuery.trim() === "" ||
            (h.name && h.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (h.district && h.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (h.desc && h.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (h.type && h.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (h.amenities && h.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesFilter && matchesSearch;
    });

    // Reset pagination when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery]);

    // Pagination logic
    const indexOfLastHotel = currentPage * hotelsPerPage;
    const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
    const currentHotels = filtered.slice(indexOfFirstHotel, indexOfLastHotel);
    const totalPages = Math.ceil(filtered.length / hotelsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFindSites = async (e, hotelName) => {
        e.stopPropagation(); // Prevent opening the hotel profile
        setSelectedHotelName(hotelName);
        setShowRecModal(true);
        setRecLoading(true);
        setRecommendations([]);
        try {
            const response = await fetch(`${API_BASE_URL}/recommend/sites?hotel_name=${encodeURIComponent(hotelName)}&top_k=5`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Could not find recommendations.");
            }
            const data = await response.json();
            setRecommendations(data.recommended_sites);
        } catch (error) {
            alert(error.message);
            setShowRecModal(false);
        } finally {
            setRecLoading(false);
        }
    };

    if (sel) return <HotelProfile hotel={sel} onBack={() => setSel(null)} setPage={setPage} setMapTarget={setMapTarget} />;

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh", background: "#fafcfd" }}>
            <style>{`
                @media (max-width: 768px) {
                    .hotels-header {
                        padding: 24px 16px 20px !important;
                    }
                    .hotels-grid-container {
                        padding: 20px 16px !important;
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                }
            `}</style>
            <div className="hotels-header" style={{ padding: "48px 48px 32px", background: "linear-gradient(135deg,#f0f8fc,#fff)", borderBottom: "1px solid #e2ecf0" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 8 }}>{t("hotels.badge")}</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,6vw,2.5rem)", color: "#0f2030", marginBottom: 8 }}>{t("hotels.title")}</h1>
                <p style={{ fontSize: "0.95rem", color: "#6b8999", marginBottom: 20 }}>{t("hotels.sub")}</p>

                {/* Creative Search Console */}
                <div style={{
                    position: "relative",
                    maxWidth: 500,
                    marginBottom: 20,
                }}>
                    <div style={{
                        background: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 14,
                        padding: "4px 14px",
                        boxShadow: "0 4px 18px rgba(10, 127, 165, 0.05)",
                        border: "1.5px solid #e2ecf0",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = "0 6px 22px rgba(10, 127, 165, 0.12)";
                        e.currentTarget.style.borderColor = "#17c4b8";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = "0 4px 18px rgba(10, 127, 165, 0.05)";
                        e.currentTarget.style.borderColor = "#e2ecf0";
                    }}
                    >
                        <span style={{ fontSize: "1.1rem", color: "#17c4b8", userSelect: "none" }}>🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t("hotels.searchPlaceholder")}
                            style={{
                                flex: 1,
                                border: "none",
                                background: "transparent",
                                fontSize: "0.9rem",
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
                                    background: "rgba(10, 32, 48, 0.06)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: 22,
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#6b8999",
                                    fontSize: "0.65rem",
                                    fontWeight: "bold",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(10, 32, 48, 0.12)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(10, 32, 48, 0.06)"}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="horizontal-scroll-pills" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {types.map(tp => <Pill key={tp} active={filter === tp} onClick={() => setFilter(tp)}>{tp === "All" ? t("destinations.all") || "All" : tp}</Pill>)}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#6b8999" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔄</div>
                    <p style={{ fontSize: "1.1rem" }}>{t("hotels.loading")}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#6b8999" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏨</div>
                    <p style={{ fontSize: "1.1rem" }}>{t("hotels.noHotels")}</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className="hotels-grid-container" style={{ padding: "40px 48px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24, width: "100%" }}>
                        {currentHotels.map(h => (
                            <div key={h.id} onClick={() => setSel(h)}
                                style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #e2ecf0", cursor: "pointer", boxShadow: "0 4px 20px rgba(10,127,165,0.07)", transition: "all 0.3s", display: "flex", flexDirection: "column" }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(10,127,165,0.15)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(10,127,165,0.07)"; }}>
                                <div style={{ position: "relative", height: 210 }}>
                                    <img src={h.img} alt={h.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,32,48,0.55),transparent)" }} />
                                    <div style={{ position: "absolute", top: 12, left: 12, background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 700 }}>{h.type}</div>
                                    <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.95)", borderRadius: 8, padding: "4px 12px", fontSize: "0.82rem", fontWeight: 700, color: "#0f2030" }}>{h.rating}★</div>
                                </div>
                                <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", color: "#0f2030", marginBottom: 6 }}>{h.name}</h3>
                                    <div style={{ fontSize: "0.82rem", color: "#6b8999", marginBottom: 12 }}>📍 {h.district} · {h.rooms} {t("hotels.rooms") || "rooms"}</div>
                                    <p style={{ fontSize: "0.83rem", color: "#4a6374", lineHeight: 1.6, marginBottom: 14, flex: 1 }}>{h.desc}</p>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                        <Star v={h.rating} />
                                        <span style={{ fontWeight: 800, color: "#0a7fa5", fontSize: "1.15rem" }}>${h.price}<span style={{ fontWeight: 400, fontSize: "0.78rem", color: "#6b8999" }}>{t("hotels.night") || "/night"}</span></span>
                                    </div>

                                    <button onClick={(e) => handleFindSites(e, h.name)} style={{ background: "#17c4b8", color: "#fff", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, width: "100%", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#14b1a6"} onMouseLeave={e => e.currentTarget.style.background = "#17c4b8"}>
                                        📍 {t("hotels.nearestDestinations")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: "flex", gap: 10, padding: "20px 0 40px" }}>
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2ecf0", background: currentPage === 1 ? "#f0f4f7" : "#fff", color: currentPage === 1 ? "#a0aec0" : "#0f2030", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontWeight: 600 }}
                            >
                                {t("hotels.previous")}
                            </button>

                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                {[...Array(totalPages)].map((_, index) => {
                                    // Show limited page numbers to avoid huge lists
                                    if (totalPages > 7 && index !== 0 && index !== totalPages - 1 && Math.abs(index + 1 - currentPage) > 2) {
                                        if (index + 1 === currentPage - 3 || index + 1 === currentPage + 3) return <span key={index} style={{ color: "#6b8999" }}>...</span>;
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => paginate(index + 1)}
                                            style={{
                                                width: 36, height: 36, borderRadius: "50%", border: "none",
                                                background: currentPage === index + 1 ? "#17c4b8" : "transparent",
                                                color: currentPage === index + 1 ? "#fff" : "#6b8999",
                                                cursor: "pointer", fontWeight: currentPage === index + 1 ? 700 : 500,
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2ecf0", background: currentPage === totalPages ? "#f0f4f7" : "#fff", color: currentPage === totalPages ? "#a0aec0" : "#0f2030", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontWeight: 600 }}
                            >
                                {t("hotels.next")}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Recommendations Modal */}
            {showRecModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "450px", maxWidth: "90%" }}>
                        <h2 style={{ marginBottom: "10px", color: "#0f2030", fontFamily: "'Playfair Display',serif" }}>{t("hotels.destinationsNear", { name: selectedHotelName })}</h2>
                        {recLoading ? (
                            <p style={{ textAlign: "center", padding: "20px" }}>{t("hotels.findingNearestDests")}</p>
                        ) : recommendations.length > 0 ? (
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                {recommendations.map((s, i) => (
                                    <li key={i} style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", border: "1px solid #e2ecf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontWeight: 600, color: "#0a7fa5" }}>{s.site_name}</span>
                                        <span style={{ fontSize: "0.85rem", background: "#17c4b8", color: "#fff", padding: "4px 8px", borderRadius: "4px" }}>{s.distance_km} km {t("destinations.away") || "away"}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{t("hotels.noDestsNearby")}</p>
                        )}
                        <button onClick={() => setShowRecModal(false)} style={{ width: "100%", marginTop: "20px", padding: "10px", background: "#e6f4f9", color: "#0a7fa5", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>{t("hotels.close")}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HotelsPage;
