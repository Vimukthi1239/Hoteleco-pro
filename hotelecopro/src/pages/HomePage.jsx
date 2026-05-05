import { useState } from "react";
import { DESTINATIONS } from "../data/destinations";
import { HOTELS } from "../data/hotels";
import { useTranslation } from "react-i18next";
import Star from "../components/Star";
import HotelProfile from "./HotelProfile";

function HomePage({ lang, setPage }) {
    const { t } = useTranslation();
    const [dest, setDest] = useState("");
    const [hotelType, setHotelType] = useState("");
    const [checkin, setCheckin] = useState("");
    const [checkout, setCheckout] = useState("");
    const [guests, setGuests] = useState(2);
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [selHotel, setSelHotel] = useState(null);

    const districts = ["All Locations", "Colombo", "Kandy", "Galle", "Matara", "Hambantota", "Anuradhapura", "Matale", "Trincomalee", "Jaffna", "Nuwara Eliya"];
    const hotelTypes = ["All Types", "Boutique Hotel", "Heritage Hotel", "5-Star Resort", "Eco Resort", "Wildlife Resort", "Boutique Villa"];

    const doSearch = () => {
        let f = HOTELS;
        if (dest && dest !== "All Locations") f = f.filter(h => h.district.toLowerCase().includes(dest.toLowerCase()));
        if (hotelType && hotelType !== "All Types") f = f.filter(h => h.type === hotelType);
        setResults(f); setSearched(true);
        setTimeout(() => { const el = document.getElementById("results"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 100);
    };

    if (selHotel) return <HotelProfile hotel={selHotel} onBack={() => setSelHotel(null)} />;

    return (
        <div>
            {/* HERO */}
            <div style={{ position: "relative", height: "100vh", minHeight: 650, overflow: "hidden", display: "flex", alignItems: "center" }}>
                <img src={"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/70/43/e4/nine-arch-bridge-demodara.jpg"} alt="Sri Lanka" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", objectPosition: "left" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(10,32,48,0.82) 0%,rgba(10,32,48,0.35) 55%,rgba(23,196,184,0.15) 100%)" }} />
                <div style={{ position: "relative", zIndex: 2, padding: "0 64px", maxWidth: 780 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 40, padding: "6px 18px", fontSize: "0.78rem", color: "#fff", letterSpacing: 1, marginBottom: 24 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#17c4b8", boxShadow: "0 0 8px #17c4b8", display: "inline-block" }}></span>
                        AI-Powered · Sri Lanka Tourism Platform · Est. 2025
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2.5rem,5.5vw,4.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 18, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                        {t("hero.title")}
                    </h1>
                    <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, marginBottom: 40, maxWidth: 560 }}>{t("hero.sub")}</p>
                    <div style={{ display: "flex", gap: 14 }}>
                        <button onClick={() => setPage("booking")} style={{ background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", padding: "15px 32px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(10,127,165,0.4)", fontFamily: "inherit" }}>
                            {t("hero.book")} →
                        </button>
                        <button onClick={() => setPage("destinations")} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", padding: "15px 28px", borderRadius: 10, fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit" }}>
                            Explore Destinations
                        </button>
                    </div>
                </div>

                {/* Search Box */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3 }}>
                    <div style={{ maxWidth: 1100, margin: "0 auto", background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)", borderRadius: "20px 20px 0 0", padding: "28px 32px", boxShadow: "0 -8px 40px rgba(10,127,165,0.15)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 0.7fr auto", gap: 12, alignItems: "end" }}>
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
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 8 }}>{results.length} Hotels Found</h2>
                    <p style={{ color: "#6b8999", marginBottom: 28, fontSize: "0.9rem" }}>Click a hotel to view full profile and book</p>
                    {results.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b8999" }}>
                            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
                            <p>No hotels match your search. Try different filters.</p>
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
            <div style={{ padding: "80px 48px", background: "#fff" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#17c4b8", marginBottom: 10 }}>Explore Sri Lanka</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,3.5vw,2.8rem)", color: "#0f2030", marginBottom: 12 }}>Top Destinations</h2>
                    <p style={{ color: "#6b8999", maxWidth: 500, margin: "0 auto" }}>From ancient ruins to pristine beaches — Sri Lanka has it all</p>
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
                                    <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>{d.district} Province</div>
                                </div>
                                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 10px", fontSize: "0.8rem", fontWeight: 700, color: "#0f2030" }}>{d.rating} ★</div>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#fff" }}>
                                <div style={{ fontSize: "0.78rem", color: "#17c4b8", fontWeight: 500 }}>Best time: {d.best}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: "center", marginTop: 36 }}>
                    <button onClick={() => setPage("destinations")} style={{ background: "#0a7fa5", color: "#fff", border: "none", padding: "13px 32px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", fontFamily: "inherit" }}>
                        View All Destinations →
                    </button>
                </div>
            </div>

            {/* Why HotelEco Pro */}
            <div style={{ padding: "80px 48px", background: "linear-gradient(135deg,#f0f8fc,#fff)" }}>
                <div style={{ textAlign: "center", marginBottom: 52 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 10 }}>Why HotelEco Pro</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.4rem", color: "#0f2030" }}>Intelligent Hospitality Platform</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
                    {[
                        { icon: "🤖", title: "AI Chatbot Assistant", desc: "Dialogflow NLP chatbot available 24/7 for instant guest support, booking assistance and multilingual communication." },
                        { icon: "📊", title: "Analytics Dashboard", desc: "Real-time hotel performance monitoring with demand forecasting, revenue analytics and customer sentiment tracking." },
                        { icon: "🗺️", title: "Smart Map Services", desc: "Mapbox GL JS integration with nearby attraction suggestions, real-time navigation and AI-powered location recommendations." },
                        { icon: "🔮", title: "Predictive ML Models", desc: "Random Forest & Linear Regression models forecast demand trends, enabling smarter staffing and pricing decisions." },
                        { icon: "📱", title: "Auto Social Marketing", desc: "GPT-powered automated content generation creates targeted hotel social media campaigns instantly from your data." },
                        { icon: "⭐", title: "Ratings & Reviews", desc: "Comprehensive review system capturing multilingual guest sentiment to improve services and build long-term loyalty." },
                    ].map(f => (
                        <div key={f.title} style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 16, padding: "32px 26px", transition: "all 0.3s" }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(10,127,165,0.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                            <div style={{ fontSize: "2rem", marginBottom: 16 }}>{f.icon}</div>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", color: "#0f2030", marginBottom: 10 }}>{f.title}</h3>
                            <p style={{ fontSize: "0.875rem", color: "#6b8999", lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials */}
            <div style={{ padding: "80px 48px", background: "#0a1825" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 10 }}>Guest Reviews</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.2rem", color: "#fff" }}>Loved by Travellers Worldwide</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
                    {[
                        { name: "Yuki Tanaka", country: "🇯🇵 Japan", rating: 5, text: "Outstanding AI recommendations led us to hidden gems we never would have found. Perfect Sri Lanka experience!" },
                        { name: "Priya Sharma", country: "🇮🇳 India", rating: 5, text: "The multilingual support in Hindi made everything so easy. Booking was smooth and the hotels were spectacular." },
                        { name: "Klaus Mueller", country: "🇩🇪 Germany", rating: 5, text: "Best hotel platform for Sri Lanka. The map integration showed us amazing coastal spots near our hotel." },
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
        </div>
    );
}

export default HomePage;
