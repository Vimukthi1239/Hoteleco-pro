import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Star from "../components/Star";
import BookingTab from "./BookingTab";
import { listenHotelReviews, saveHotelReview } from "../data/firebase";

function HotelProfile({ hotel, onBack }) {
    const { t } = useTranslation();
    const [tab, setTab] = useState("overview");
    const [reviews, setReviews] = useState([]);
    const [myReview, setMyReview] = useState("");
    const [myName, setMyName] = useState("");
    const [myRating, setMyRating] = useState(5);

    useEffect(() => {
        const unsub = listenHotelReviews(hotel.id, (data) => {
            if (data && data.length > 0) {
                setReviews(data);
            } else {
                setReviews([
                    { name: "Aiko S.", country: "🇯🇵", rating: 5, text: "Absolutely breathtaking. The service was exceptional and the food outstanding." },
                    { name: "Priya M.", country: "🇮🇳", rating: 5, text: "Beautiful location, wonderful staff and amazing Sri Lankan cuisine." },
                    { name: "Hans K.", country: "🇩🇪", rating: 4, text: "Great hotel with stunning views. Would highly recommend to anyone visiting Sri Lanka." }
                ]);
            }
        });
        return unsub;
    }, [hotel.id]);

    const tabs = ["overview", "amenities", "reviews", "booking"];

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh" }}>
            {/* Hero */}
            <div style={{ position: "relative", height: 420, overflow: "hidden" }}>
                <img src={hotel.img} alt={hotel.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,32,48,0.88),rgba(10,32,48,0.2))" }} />
                <div style={{ position: "absolute", bottom: 40, left: 48, color: "#fff" }}>
                    <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "7px 16px", cursor: "pointer", marginBottom: 18, fontSize: "0.82rem", fontFamily: "inherit" }}>{t("profile.back")}</button>
                    <div style={{ fontSize: "0.78rem", opacity: 0.75, marginBottom: 6 }}>{hotel.type} · {hotel.district}, Sri Lanka</div>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.8rem", fontWeight: 700, marginBottom: 10 }}>{hotel.name}</h1>
                    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                        <Star v={hotel.rating} /><span style={{ opacity: 0.9 }}>({hotel.rating}/5)</span>
                        <span>📍 {hotel.district}</span>
                        <span>🛏️ {hotel.rooms} {t("profile.rooms")}</span>
                        <span style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "5px 16px", fontWeight: 700, fontSize: "1.1rem" }}>${hotel.price}{t("profile.night")}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: "1px solid #e2ecf0", background: "#fff", display: "flex", gap: 0, padding: "0 48px" }}>
                {tabs.map(tb => (
                    <button key={tb} onClick={() => setTab(tb)} style={{ background: "transparent", border: "none", borderBottom: tab === tb ? "3px solid #0a7fa5" : "3px solid transparent", color: tab === tb ? "#0a7fa5" : "#6b8999", padding: "16px 22px", cursor: "pointer", fontWeight: tab === tb ? 700 : 400, fontSize: "0.9rem", textTransform: "capitalize", transition: "all 0.2s", fontFamily: "inherit" }}>
                        {t(`profile.${tb}`)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: "40px 48px", background: "#fafcfd", minHeight: 400 }}>
                {tab === "overview" && (
                    <div style={{ maxWidth: 900 }}>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 18 }}>{t("profile.aboutTitle", { name: hotel.name })}</h2>
                        <p style={{ fontSize: "1rem", color: "#4a6374", lineHeight: 1.8, marginBottom: 28 }}>{hotel.desc} {t("profile.aboutSuffix")}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                            {[
                                { l: t("profile.district"), v: hotel.district },
                                { l: t("profile.rooms"), v: hotel.rooms },
                                { l: t("profile.type"), v: hotel.type },
                                { l: t("profile.rating"), v: hotel.rating + "★" },
                                { l: t("profile.price"), v: `$${hotel.price}${t("profile.night")}` },
                                { l: t("profile.status"), v: t("profile.verified") }
                            ].map(i => (
                                <div key={i.l} style={{ background: "#f0f8fc", border: "1px solid #e2ecf0", borderRadius: 12, padding: 18 }}>
                                    <div style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{i.l}</div>
                                    <div style={{ fontWeight: 700, color: "#0f2030", fontSize: "0.95rem" }}>{i.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "amenities" && (
                    <div style={{ maxWidth: 900 }}>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 24 }}>{t("profile.amenitiesTitle")}</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
                            {hotel.amenities.map(a => (
                                <div key={a} style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 12, padding: "20px 18px", textAlign: "center", fontSize: "0.92rem", color: "#1e3a4a", fontWeight: 500, boxShadow: "0 2px 8px rgba(10,127,165,0.05)" }}>{a}</div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "reviews" && (
                    <div style={{ maxWidth: 800 }}>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 24 }}>{t("profile.reviewsTitle")}</h2>
                        
                        <div style={{ background: "#f0f8fc", border: "1px solid #e2ecf0", borderRadius: 16, padding: 28, marginBottom: 32 }}>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", marginBottom: 16, color: "#0f2030" }}>{t("profile.leaveReview")}</h3>
                            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setMyRating(s)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.6rem", color: s <= myRating ? "#f59e0b" : "#d1d5db", padding: 0 }}>
                                        {s <= myRating ? "★" : "☆"}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                                <input type="text" value={myName} onChange={e => setMyName(e.target.value)} placeholder="Your Name (Optional)" style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, outline: "none", fontFamily: "inherit" }} />
                            </div>
                            <textarea value={myReview} onChange={e => setMyReview(e.target.value)} placeholder={t("profile.reviewPlaceholder")} style={{ width: "100%", minHeight: 100, padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
                            <button onClick={async () => { if (myReview.trim()) { await saveHotelReview(hotel.id, { name: myName || t("profile.you"), country: "🌍", rating: myRating, text: myReview }); setMyReview(""); setMyName(""); setMyRating(5); } }} style={{ marginTop: 12, background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 26px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>{t("profile.submitReview")}</button>
                        </div>

                        {reviews.map((r, i) => (
                            <div key={i} style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 14, padding: 22, marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                    <div><span style={{ fontWeight: 700, color: "#0f2030" }}>{r.name}</span> <span style={{ color: "#6b8999", fontSize: "0.85rem" }}>{r.country}</span></div>
                                    <Star v={r.rating} />
                                </div>
                                <p style={{ fontSize: "0.9rem", color: "#6b8999", lineHeight: 1.65 }}>{r.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {tab === "booking" && <BookingTab hotel={hotel} />}
            </div>
        </div>
    );
}

export default HotelProfile;
