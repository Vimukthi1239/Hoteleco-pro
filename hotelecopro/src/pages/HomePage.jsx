import { useState, useEffect, useMemo } from "react";
import { DESTINATIONS } from "../data/destinations";
import { HOTELS } from "../data/hotels";
import { useTranslation } from "react-i18next";
import Star from "../components/Star";
import HotelProfile from "./HotelProfile";
import { Bot, BarChart3, MapPin, Sparkles, Smartphone, Star as StarIcon } from "lucide-react";

const HERO_IMAGES = [
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
    "/images/7.jpg",
    "/images/8.jpg",
    "/images/9.jpg",
    "/images/10.jpg",
    "/images/11.jpg",
    "/images/12.jpg"
];

const GALLERY_ITEMS = [
    { url: "/images/galle.png", caption: "Galle Fort Lighthouse", category: "Coastal", size: "md:col-span-2 md:row-span-2" },
    { url: "/images/sigiriya.png", caption: "Ancient Sigiriya Fortress", category: "Heritage", size: "md:col-span-1 md:row-span-1" },
    { url: "/images/ella.png", caption: "Nine Arch Bridge Ella", category: "Nature", size: "md:col-span-1 md:row-span-1" },
    { url: "/images/kandy.png", caption: "Sacred Kandy Temple", category: "Heritage", size: "md:col-span-1 md:row-span-1" },
    { url: "/images/nuwara_eliya.png", caption: "Tea Estates Nuwara Eliya", category: "Nature", size: "md:col-span-1 md:row-span-1" },
    { url: "/images/yala.png", caption: "Leopard in Yala Safari", category: "Wildlife", size: "md:col-span-2 md:row-span-1" },
    { url: "/images/mirissa.png", caption: "Coconut Tree Hill Mirissa", category: "Coastal", size: "md:col-span-1 md:row-span-1" },
    { url: "/images/nilaveli.png", caption: "Nilaveli Beach Trincomalee", category: "Coastal", size: "md:col-span-1 md:row-span-1" }
];

function HomePage({ lang, setPage }) {
    const { t } = useTranslation();
    const getCategoryLabel = (cat) => {
        switch (cat) {
            case "All": return t("destinations.all") || "All";
            case "Coastal": return t("itinerary.styleRelaxation") || "Coastal";
            case "Heritage": return t("itinerary.styleCulture") || "Heritage";
            case "Nature": return t("itinerary.styleNature") || "Nature";
            case "Wildlife": return t("home.galleryCategoryWildlife") || "Wildlife";
            default: return cat;
        }
    };
    const [dest, setDest] = useState("");
    const [hotelType, setHotelType] = useState("");
    const [checkin, setCheckin] = useState("");
    const [checkout, setCheckout] = useState("");
    const [guests, setGuests] = useState(2);
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [selHotel, setSelHotel] = useState(null);
    const [currentImg, setCurrentImg] = useState(0);

    const [activeFilter, setActiveFilter] = useState("All");
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const filteredGalleryItems = useMemo(() => {
        return GALLERY_ITEMS.filter(item => activeFilter === "All" || item.category === activeFilter);
    }, [activeFilter]);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setLightboxIndex(null);
            if (e.key === "ArrowRight") {
                setLightboxIndex((prev) => (prev + 1) % filteredGalleryItems.length);
            }
            if (e.key === "ArrowLeft") {
                setLightboxIndex((prev) => (prev - 1 + filteredGalleryItems.length) % filteredGalleryItems.length);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex, filteredGalleryItems]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImg((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const districts = ["All Locations", "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Mathara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];
    const hotelTypes = ["All Types", "Boutique Hotel", "Heritage Hotel", "5-Star Resort", "Eco Resort", "Wildlife Resort", "Boutique Villa", "Guest House", "Tourist Hotel", "Villa"];

    const doSearch = () => {
        let f = HOTELS;
        if (dest && dest !== "All Locations") f = f.filter(h => h.district.toLowerCase().includes(dest.toLowerCase()));
        if (hotelType && hotelType !== "All Types") f = f.filter(h => h.type === hotelType);
        setResults(f); setSearched(true);
        setTimeout(() => { const el = document.getElementById("results"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 450);
    };

    if (selHotel) return <HotelProfile hotel={selHotel} onBack={() => setSelHotel(null)} />;

    return (
        <div>
            <style>{`
                @media (max-width: 992px) {
                    .home-search-grid {
                        grid-template-columns: 1fr 1fr !important;
                    }
                }
                @media (max-width: 768px) {
                    .home-hero-container {
                        height: auto !important;
                        min-height: 580px !important;
                        padding-bottom: 40px !important;
                    }
                    .home-hero-text {
                        padding: 100px 20px 40px !important;
                    }
                    .home-search-container {
                        position: relative !important;
                        bottom: auto !important;
                    }
                    .home-search-box {
                        padding: 20px 16px !important;
                        border-radius: 20px !important;
                        margin: 0 16px !important;
                    }
                    .home-search-grid {
                        grid-template-columns: 1fr !important;
                        gap: 12px !important;
                    }
                    .home-section-padded {
                        padding: 44px 20px !important;
                    }
                    .responsive-three-grid {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                }
            `}</style>
            {/* HERO */}
            <div className="home-hero-container" style={{ position: "relative", height: "100vh", minHeight: 650, overflow: "hidden", display: "flex", alignItems: "center" }}>
                {HERO_IMAGES.map((imgUrl, index) => (
                    <img
                        key={index}
                        src={imgUrl}
                        alt="Sri Lanka"
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "opacity 1.5s ease-in-out",
                            opacity: currentImg === index ? 1 : 0
                        }}
                    />
                ))}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(10,32,48,0.82) 0%,rgba(10,32,48,0.35) 55%,rgba(23,196,184,0.15) 100%)", zIndex: 1 }} />
                <div className="home-hero-text" style={{ position: "relative", zIndex: 2, padding: "0 64px", maxWidth: 780 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 40, padding: "6px 18px", fontSize: "0.78rem", color: "#fff", letterSpacing: 1, marginBottom: 24 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#17c4b8", boxShadow: "0 0 8px #17c4b8", display: "inline-block" }}></span>
                        {t("hero.badge")}
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2.2rem,5.5vw,4.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 18, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                        {t("hero.title")}
                    </h1>
                    <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, marginBottom: 32, maxWidth: 560 }}>{t("hero.sub")}</p>
                    <div className="mobile-stack-buttons" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button onClick={() => setPage("itineraryWizard")} style={{ background: "linear-gradient(135deg, #7b2ff7 0%, #17c4b8 100%)", color: "#fff", border: "none", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: "0.92rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(123,47,247,0.35)", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }} className="transition-all duration-300 transform hover:scale-105 hover:shadow-[0_8px_30px_rgba(23,196,184,0.5)]">
                            PickATrip 🪄
                        </button>
                        <button onClick={() => setPage("booking")} style={{ background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: "0.92rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(10,127,165,0.4)", fontFamily: "inherit" }}>
                            {t("hero.book")} →
                        </button>
                        <button onClick={() => setPage("destinations")} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", padding: "14px 24px", borderRadius: 10, fontSize: "0.92rem", cursor: "pointer", fontFamily: "inherit" }}>
                            {t("hero.explore")}
                        </button>
                    </div>
                </div>

                {/* Search Box */}
                <div className="home-search-container" style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3 }}>
                    <div className="home-search-box" style={{ maxWidth: 1100, margin: "0 auto", background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)", borderRadius: "20px 20px 0 0", padding: "28px 32px", boxShadow: "0 -8px 40px rgba(10,127,165,0.15)" }}>
                        <div className="home-search-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 0.7fr auto", gap: 12, alignItems: "end" }}>
                            <div>
                                <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", display: "block", marginBottom: 6 }}>{t("search.destination")}</label>
                                <select value={dest} onChange={e => setDest(e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", background: "#fafcfd", outline: "none", fontFamily: "inherit" }}>
                                    {districts.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", display: "block", marginBottom: 6 }}>{t("search.type")}</label>
                                <select value={hotelType} onChange={e => setHotelType(e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", background: "#fafcfd", outline: "none", fontFamily: "inherit" }}>
                                    {hotelTypes.map(tp => <option key={tp}>{tp}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", display: "block", marginBottom: 6 }}>{t("search.checkin")}</label>
                                <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", background: "#fafcfd", outline: "none", fontFamily: "inherit" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", display: "block", marginBottom: 6 }}>{t("search.checkout")}</label>
                                <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", background: "#fafcfd", outline: "none", fontFamily: "inherit" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", display: "block", marginBottom: 6 }}>{t("search.guests")}</label>
                                <input type="number" min={1} max={20} value={guests} onChange={e => setGuests(e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", background: "#fafcfd", outline: "none", fontFamily: "inherit" }} />
                            </div>
                            <button onClick={doSearch} style={{ background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", padding: "12px 20px", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(10,127,165,0.35)", fontFamily: "inherit" }}>
                                🔍 {t("search.search")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Results */}
            {searched && (
                <div id="results" style={{ padding: "48px", background: "#f0f8fc" }}>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 8 }}>{results.length} {t("results.found")}</h2>
                    <p style={{ color: "#6b8999", marginBottom: 28, fontSize: "0.9rem" }}>{t("results.clickHint")}</p>
                    {results.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b8999" }}>
                            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
                            <p>{t("results.noResults")}</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
                            {results.map(h => (
                                <div key={h.id} onClick={() => setSelHotel(h)}
                                    style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #e2ecf0", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 2px 12px rgba(10,127,165,0.07)" }}
                                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                                    <img src={h.img} alt={h.name} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                                    <div style={{ padding: 20 }}>
                                        <div style={{ fontSize: "0.72rem", background: "#e6f4f9", color: "#0a7fa5", borderRadius: 6, padding: "3px 8px", display: "inline-block", marginBottom: 8, fontWeight: 600 }}>{h.type}</div>
                                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: "#0f2030", marginBottom: 4 }}>{h.name}</h3>
                                        <div style={{ color: "#6b8999", fontSize: "0.82rem", marginBottom: 8 }}>📍 {h.district} · {h.rooms} rooms</div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Star v={h.rating} />
                                            <span style={{ fontWeight: 700, color: "#0a7fa5", fontSize: "1.05rem" }}>${h.price}<span style={{ fontWeight: 400, fontSize: "0.78rem", color: "#6b8999" }}>/night</span></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Top Destinations */}
            <div className="home-section-padded" style={{ padding: "80px 48px", background: "#fff" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#17c4b8", marginBottom: 10 }}>{t("home.topDestBadge")}</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,3.5vw,2.8rem)", color: "#0f2030", marginBottom: 12 }}>{t("home.topDestTitle")}</h2>
                    <p style={{ color: "#6b8999", maxWidth: 500, margin: "0 auto" }}>{t("home.topDestSub")}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 22 }}>
                    {DESTINATIONS.slice(0, 8).map(d => (
                        <div key={d.name} style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.3s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                            <div style={{ position: "relative", height: 190 }}>
                                <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = "https://www.holidify.com/images/bgImages/ELLA.jpg"} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,32,48,0.72),transparent)" }} />
                                <div style={{ position: "absolute", bottom: 12, left: 14, color: "#fff" }}>
                                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", fontWeight: 700 }}>{d.name}</div>
                                    <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>{d.district} {t("destinations.province")}</div>
                                </div>
                                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 10px", fontSize: "0.8rem", fontWeight: 700, color: "#0f2030" }}>{d.rating} ★</div>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#fff" }}>
                                <div style={{ fontSize: "0.78rem", color: "#17c4b8", fontWeight: 500 }}>{t("destinations.bestTime")}: {d.best}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: "center", marginTop: 36 }}>
                    <button onClick={() => setPage("destinations")} style={{ background: "#0a7fa5", color: "#fff", border: "none", padding: "13px 32px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", fontFamily: "inherit" }}>
                        {t("home.viewAll")}
                    </button>
                </div>
            </div>

            {/* PickATrip AI Trip Planner Section */}
            <div className="home-section-padded" style={{ padding: "80px 48px", background: "linear-gradient(135deg, #071624 0%, #0b1a29 100%)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "center" }} className="grid grid-cols-1 lg:grid-cols-2">
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(23,196,184,0.12)", border: "1px solid rgba(23,196,184,0.25)", borderRadius: 40, padding: "6px 18px", fontSize: "0.78rem", color: "#17c4b8", fontWeight: 700, letterSpacing: 1.5, marginBottom: 24, textTransform: "uppercase" }}>
                            <span style={{ animation: "pulse 2s infinite" }} className="inline-block w-2 h-2 rounded-full bg-[#17c4b8] shadow-[0_0_8px_#17c4b8]"></span>
                            AI Auto Itinerary
                        </div>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", color: "#fff", lineHeight: 1.2, marginBottom: 20 }}>
                            Build Your Dream Sri Lanka Tour with <span style={{ background: "linear-gradient(135deg, #17c4b8 0%, #7b2ff7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PickATrip</span>
                        </h2>
                        <p style={{ color: "#a4b3c6", fontSize: "1.05rem", lineHeight: 1.75, marginBottom: 36 }}>
                            Skip hours of manual research. Our automated wizard estimates international flights, selects certified eco-resorts, constructs optimal geographical routes, assigns local private drivers, and handles consolidated secure payments.
                        </p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
                            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <div style={{ background: "rgba(23,196,184,0.15)", color: "#17c4b8", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: "0.95rem" }}>1</div>
                                <div>
                                    <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>Select Flight Origin & Travel Vibe</h4>
                                    <p style={{ color: "#6b8999", fontSize: "0.88rem", lineHeight: 1.5 }}>Specify your departure city and choose your style (Beach Relaxation, Nature & Safari, or Cultural Heritage).</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <div style={{ background: "rgba(23,196,184,0.15)", color: "#17c4b8", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: "0.95rem" }}>2</div>
                                <div>
                                    <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>Live Ticket Search & Private Vehicle</h4>
                                    <p style={{ color: "#6b8999", fontSize: "0.88rem", lineHeight: 1.5 }}>Find flights to Colombo BIA and match with the perfect local ride (Tuk-Tuk, Sedan, SUV, or family Van).</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <div style={{ background: "rgba(23,196,184,0.15)", color: "#17c4b8", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: "0.95rem" }}>3</div>
                                <div>
                                    <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>Instant Consolidated Booking</h4>
                                    <p style={{ color: "#6b8999", fontSize: "0.88rem", lineHeight: 1.5 }}>Checkout securely with Stripe and instantly chat with your assigned private driver via WhatsApp.</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setPage("itineraryWizard")}
                            style={{ 
                                background: "linear-gradient(135deg, #7b2ff7 0%, #17c4b8 100%)", 
                                color: "#fff", 
                                border: "none", 
                                padding: "16px 36px", 
                                borderRadius: 12, 
                                fontWeight: 700, 
                                fontSize: "1rem", 
                                cursor: "pointer", 
                                boxShadow: "0 8px 30px rgba(123,47,247,0.35)", 
                                fontFamily: "inherit",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10
                            }}
                            className="transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_36px_rgba(23,196,184,0.5)]"
                        >
                            PickATrip 🪄
                        </button>
                    </div>

                    <div style={{ position: "relative" }} className="flex justify-center">
                        {/* Creative interactive visual mockup */}
                        <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", width: "100%", maxWidth: 440, color: "#fff" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: "1.2rem" }}>🪄</span>
                                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#17c4b8", letterSpacing: 0.5 }}>PICKATRIP VACATION</span>
                                </div>
                                <span style={{ background: "rgba(23,196,184,0.15)", color: "#17c4b8", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>AI RECOMMENDATION</span>
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                                    <div style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>FLIGHT DEPARTURE</div>
                                    <div style={{ fontWeight: 600, fontSize: "0.95rem", display: "flex", justifyContent: "space-between" }}>
                                        <span>New York (JFK) ✈️ CMB</span>
                                        <span style={{ color: "#17c4b8" }}>$1,280</span>
                                    </div>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                                    <div style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>SELECTED ECO RESORT</div>
                                    <div style={{ fontWeight: 600, fontSize: "0.95rem", display: "flex", justifyContent: "space-between" }}>
                                        <span>Cinnamon Wild Yala 🏡</span>
                                        <span style={{ color: "#17c4b8" }}>7 Nights</span>
                                    </div>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                                    <div style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>PRIVATE ISLAND TRANSPORT</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>🚙 SUV Chauffeur Assigned</span>
                                        <span style={{ fontSize: "0.75rem", color: "#25d366", background: "rgba(37,211,102,0.1)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>WhatsApp Connect</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "0.7rem", color: "#a4b3c6", fontWeight: 600 }}>CONSOLIDATED PACKAGE TOTAL</div>
                                    <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#fff", background: "linear-gradient(135deg, #fff, #17c4b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$2,310.00</div>
                                </div>
                                <button onClick={() => setPage("itineraryWizard")} style={{ background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(23,196,184,0.3)" }} className="transition-all duration-300 transform hover:scale-105">
                                    Plan Now →
                                </button>
                            </div>
                        </div>

                        {/* Floating elements for premium visual flair */}
                        <div style={{ position: "absolute", top: -20, right: -10, background: "linear-gradient(135deg, #7b2ff7, #17c4b8)", color: "#fff", width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justify: "center", fontSize: "1.6rem", boxShadow: "0 10px 20px rgba(123,47,247,0.4)" }} className="absolute flex items-center justify-center animate-bounce">
                            ✨
                        </div>
                    </div>
                </div>
            </div>

            {/* Why HotelEco Pro */}
            <div className="home-section-padded" style={{ padding: "80px 48px", background: "linear-gradient(135deg,#f0f8fc,#fff)" }}>
                <div style={{ textAlign: "center", marginBottom: 52 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 10 }}>{t("home.whyBadge")}</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.4rem", color: "#0f2030" }}>{t("home.whyTitle")}</h2>
                </div>
                <div className="responsive-three-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
                    {[
                        { icon: <Bot size={28} color="#17c4b8" />, title: t("home.feature1Title"), desc: t("home.feature1Desc") },
                        { icon: <BarChart3 size={28} color="#17c4b8" />, title: t("home.feature2Title"), desc: t("home.feature2Desc") },
                        { icon: <MapPin size={28} color="#17c4b8" />, title: t("home.feature3Title"), desc: t("home.feature3Desc") },
                        { icon: <Sparkles size={28} color="#17c4b8" />, title: t("home.feature4Title"), desc: t("home.feature4Desc") },
                        { icon: <Smartphone size={28} color="#17c4b8" />, title: t("home.feature5Title"), desc: t("home.feature5Desc") },
                        { icon: <StarIcon size={28} color="#17c4b8" />, title: t("home.feature6Title"), desc: t("home.feature6Desc") },
                    ].map(f => (
                        <div key={f.title} style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 16, padding: "32px 26px", transition: "all 0.3s" }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(10,127,165,0.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                            <div style={{ marginBottom: 16 }}>{f.icon}</div>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", color: "#0f2030", marginBottom: 10 }}>{f.title}</h3>
                            <p style={{ fontSize: "0.875rem", color: "#6b8999", lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials */}
            <div className="home-section-padded" style={{ padding: "80px 48px", background: "#0a1825" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 10 }}>{t("home.reviewsBadge")}</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.2rem", color: "#fff" }}>{t("home.reviewsTitle")}</h2>
                </div>
                <div className="responsive-three-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
                    {[
                        { name: "Yuki Tanaka", country: "🇯🇵 Japan", rating: 5, text: t("home.review1Text") },
                        { name: "Priya Sharma", country: "🇮🇳 India", rating: 5, text: t("home.review2Text") },
                        { name: "Klaus Mueller", country: "🇩🇪 Germany", rating: 5, text: t("home.review3Text") },
                    ].map(r => (
                        <div key={r.name} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "28px 24px" }}>
                            <Star v={r.rating} />
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", lineHeight: 1.7, margin: "14px 0" }}>"{r.text}"</p>
                            <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>{r.name}</div>
                            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}>{r.country}</div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Beautiful Image Gallery Section */}
            <div className="home-section-padded" style={{ padding: "80px 48px", background: "#f8fafc" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 10 }}>{t("home.galleryShowcase") || "Gallery Showcase"}</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#0f2030", marginBottom: 12 }}>{t("home.galleryTitle") || "Capture the Moments"}</h2>
                    <p style={{ color: "#6b8999", maxWidth: 500, margin: "0 auto", fontSize: "0.9rem" }}>{t("home.gallerySub") || "Browse visual memories of stunning natural beauty and cultural heritage in Sri Lanka."}</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    {["All", "Coastal", "Heritage", "Nature", "Wildlife"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveFilter(cat);
                                setLightboxIndex(null);
                            }}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                                activeFilter === cat
                                    ? "bg-[#17c4b8] text-white shadow-lg shadow-teal-500/20"
                                    : "bg-white text-[#6b8999] border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div 
                    className={
                        activeFilter === "All"
                            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto"
                            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-7xl mx-auto"
                    }
                >
                    {filteredGalleryItems.map((item, idx) => {
                        const gridClass = activeFilter === "All" ? item.size : "";
                        return (
                            <div
                                key={item.caption}
                                onClick={() => setLightboxIndex(idx)}
                                className={`group relative rounded-2xl overflow-hidden shadow-md border border-slate-100 cursor-pointer h-72 ${gridClass} transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl`}
                            >
                                <img
                                    src={item.url}
                                    alt={item.caption}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    style={{ height: "100%", width: "100%", objectFit: "cover" }}
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />
                                
                                {/* Image Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <span className="text-[10px] bg-[#17c4b8] text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {getCategoryLabel(item.category)}
                                    </span>
                                    <h4 className="text-white font-bold text-base mt-2">{item.caption}</h4>
                                    <p className="text-[#17c4b8] text-xs font-semibold mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5">
                                        <span>{t("home.galleryClickToExpand") || "Click to expand"}</span>
                                        <span>🔍</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Lightbox Modal */}
                {lightboxIndex !== null && filteredGalleryItems[lightboxIndex] && (
                    <div 
                        className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4"
                        onClick={() => setLightboxIndex(null)}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setLightboxIndex(null)}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors text-3xl font-bold bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center focus:outline-none z-10"
                        >
                            &times;
                        </button>

                        {/* Navigation controls */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex((prev) => (prev - 1 + filteredGalleryItems.length) % filteredGalleryItems.length);
                            }}
                            className="absolute left-6 text-white/70 hover:text-white transition-colors text-2xl font-bold bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center focus:outline-none z-10"
                        >
                            &#10094;
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex((prev) => (prev + 1) % filteredGalleryItems.length);
                            }}
                            className="absolute right-6 text-white/70 hover:text-white transition-colors text-2xl font-bold bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center focus:outline-none z-10"
                        >
                            &#10095;
                        </button>

                        {/* Main Container */}
                        <div 
                            className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={filteredGalleryItems[lightboxIndex].url}
                                alt={filteredGalleryItems[lightboxIndex].caption}
                                className="max-w-full max-h-[70vh] object-contain rounded-xl border border-white/10 shadow-2xl transition-all duration-300"
                            />
                            <div className="text-center mt-4 text-white">
                                <span className="text-[10px] bg-[#17c4b8] text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    {getCategoryLabel(filteredGalleryItems[lightboxIndex].category)}
                                </span>
                                <h3 className="text-lg font-bold mt-2">{filteredGalleryItems[lightboxIndex].caption}</h3>
                                <p className="text-xs text-white/50 mt-1">{t("home.galleryImageOf", { count: lightboxIndex + 1, total: filteredGalleryItems.length }) || `Image ${lightboxIndex + 1} of ${filteredGalleryItems.length}`}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;
