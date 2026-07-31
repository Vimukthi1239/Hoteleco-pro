import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Star from "../components/Star";
import { listenDestinationReviews, saveDestinationReview } from "../data/firebase";

function DestinationProfile({ destination, onBack, setPage, setMapTarget }) {
    const { t } = useTranslation();
    const [tab, setTab] = useState("overview");
    const [reviews, setReviews] = useState([]);
    const [myReview, setMyReview] = useState("");
    const [myName, setMyName] = useState("");
    const [myRating, setMyRating] = useState(5);

    useEffect(() => {
        if (!destination || !destination.name) return;
        const unsub = listenDestinationReviews(destination.name, (data) => {
            if (data && data.length > 0) {
                setReviews(data);
            } else {
                setReviews([
                    { name: t("destinations.placeholderReviewName") || "Local Explorer", country: "🇱🇰", rating: 5, text: t("destinations.placeholderReviewText") || "A must-visit place! The scenery is beautiful and the atmosphere is wonderful." }
                ]);
            }
        });
        return unsub;
    }, [destination, t]);

    const tabs = ["overview", "experience", "reviews"];

    // Default open/close times if not specified
    const openTime = destination.openTime || "06:00 AM";
    const closeTime = destination.closeTime || "06:00 PM";

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh" }}>
            {/* Hero Section */}
            <div style={{ position: "relative", height: 420, overflow: "hidden" }}>
                <img src={destination.img} alt={destination.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,32,48,0.88),rgba(10,32,48,0.2))" }} />
                <div style={{ position: "absolute", bottom: 40, left: 48, color: "#fff" }}>
                    <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "7px 16px", cursor: "pointer", marginBottom: 18, fontSize: "0.82rem", fontFamily: "inherit" }}>{t("destinations.back")}</button>
                    <div style={{ fontSize: "0.78rem", opacity: 0.75, marginBottom: 6 }}>{destination.district} {t("profile.district")}, Sri Lanka</div>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.8rem", fontWeight: 700, marginBottom: 10 }}>{destination.name}</h1>
                    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                        <Star v={destination.rating || 4.5} /><span style={{ opacity: 0.9 }}>({destination.rating || 4.5}/5)</span>
                        <span>📍 {destination.district}</span>
                        <span>🌟 {t("destinations.bestTime")}: {destination.best}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: "1px solid #e2ecf0", background: "#fff", display: "flex", gap: 0, padding: "0 48px" }}>
                {tabs.map(tb => (
                    <button key={tb} onClick={() => setTab(tb)} style={{ background: "transparent", border: "none", borderBottom: tab === tb ? "3px solid #0a7fa5" : "3px solid transparent", color: tab === tb ? "#0a7fa5" : "#6b8999", padding: "16px 22px", cursor: "pointer", fontWeight: tab === tb ? 700 : 400, fontSize: "0.9rem", textTransform: "capitalize", transition: "all 0.2s", fontFamily: "inherit" }}>
                        {tb === "overview" ? t("profile.overview") : tb === "experience" ? t("destinations.experienceTitle") : t("profile.reviews")}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: "40px 48px", background: "#fafcfd", minHeight: 400 }}>
                {tab === "overview" && (
                    <div style={{ maxWidth: 900 }}>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 18 }}>{t("destinations.about", { name: destination.name })}</h2>
                        <p style={{ fontSize: "1rem", color: "#4a6374", lineHeight: 1.8, marginBottom: 28 }}>{destination.desc}</p>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                            <div style={{ background: "#f0f8fc", border: "1px solid #e2ecf0", borderRadius: 12, padding: 18 }}>
                                <div style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{t("profile.district")}</div>
                                <div style={{ fontWeight: 700, color: "#0f2030", fontSize: "0.95rem" }}>{destination.district}</div>
                            </div>
                            <div style={{ background: "#f0f8fc", border: "1px solid #e2ecf0", borderRadius: 12, padding: 18 }}>
                                <div style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{t("destinations.openingHours")}</div>
                                <div style={{ fontWeight: 700, color: "#0f2030", fontSize: "0.95rem" }}>{openTime} - {closeTime}</div>
                            </div>
                            <div style={{ background: "#f0f8fc", border: "1px solid #e2ecf0", borderRadius: 12, padding: 18 }}>
                                <div style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{t("signin.location") || "Location"}</div>
                                <div style={{ fontWeight: 700, color: "#0f2030", fontSize: "0.95rem" }}>
                                    <button
                                        onClick={() => {
                                            setMapTarget({
                                                name: destination.name,
                                                lat: destination.lat,
                                                lng: destination.lon || destination.lng,
                                                isHotel: false,
                                                img: destination.img,
                                                district: destination.district,
                                                rating: destination.rating,
                                                best: destination.best
                                            });
                                            setPage("map");
                                        }}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            padding: 0,
                                            font: "inherit",
                                            color: "#0a7fa5",
                                            textDecoration: "underline",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5
                                        }}
                                    >
                                        {t("destinations.viewOnMap")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "experience" && (
                    <div style={{ maxWidth: 900 }}>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 24 }}>{t("destinations.experienceTitle")}</h2>
                        <div style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 14, padding: 24, boxShadow: "0 4px 20px rgba(10,127,165,0.05)" }}>
                            <p style={{ fontSize: "1rem", color: "#4a6374", lineHeight: 1.8, marginBottom: 16 }}>
                                {t("destinations.experienceDesc", { name: destination.name })}
                            </p>
                            <ul style={{ paddingLeft: 20, color: "#4a6374", lineHeight: 1.8 }}>
                                <li><strong>{t("destinations.sightseeing")}:</strong> {t("destinations.sightseeingDesc")}</li>
                                <li><strong>{t("destinations.photography")}:</strong> {t("destinations.photographyDesc")}</li>
                                <li><strong>{t("destinations.localCulture")}:</strong> {t("destinations.localCultureDesc")}</li>
                                <li><strong>{t("destinations.natureWalks")}:</strong> {t("destinations.natureWalksDesc")}</li>
                            </ul>
                        </div>
                    </div>
                )}

                {tab === "reviews" && (
                    <div style={{ maxWidth: 800 }}>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 24 }}>{t("destinations.reviewsTitle")}</h2>

                        <div style={{ background: "#f0f8fc", border: "1px solid #e2ecf0", borderRadius: 16, padding: 28, marginBottom: 32 }}>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", marginBottom: 16, color: "#0f2030" }}>{t("destinations.leaveReview")}</h3>
                            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setMyRating(s)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.6rem", color: s <= myRating ? "#f59e0b" : "#d1d5db", padding: 0 }}>
                                        {s <= myRating ? "★" : "☆"}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                                <input type="text" value={myName} onChange={e => setMyName(e.target.value)} placeholder={t("destinations.namePlaceholder")} style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, outline: "none", fontFamily: "inherit" }} />
                            </div>
                            <textarea value={myReview} onChange={e => setMyReview(e.target.value)} placeholder={t("destinations.reviewPlaceholder")} style={{ width: "100%", minHeight: 100, padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
                            <button onClick={async () => {
                                if (myReview.trim()) {
                                    await saveDestinationReview(destination.name, { name: myName || t("profile.you") || "Guest", country: "🌍", rating: myRating, text: myReview });
                                    setMyReview("");
                                    setMyName("");
                                    setMyRating(5);
                                }
                            }} style={{ marginTop: 12, background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 26px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>{t("destinations.submitReview")}</button>
                        </div>

                        {reviews.length > 0 ? reviews.map((r, i) => (
                            <div key={i} style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 14, padding: 22, marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                    <div><span style={{ fontWeight: 700, color: "#0f2030" }}>{r.name}</span> <span style={{ color: "#6b8999", fontSize: "0.85rem" }}>{r.country}</span></div>
                                    <Star v={r.rating} />
                                </div>
                                <p style={{ fontSize: "0.9rem", color: "#6b8999", lineHeight: 1.65 }}>{r.text}</p>
                            </div>
                        )) : (
                            <p style={{ color: "#6b8999" }}>{t("destinations.noReviews")}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DestinationProfile;
