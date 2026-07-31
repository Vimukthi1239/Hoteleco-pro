import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Star from "../components/Star";
import BookingTab from "./BookingTab";
import { listenHotelReviews, saveHotelReview, updateHotelProfile } from "../data/firebase";

function HotelProfile({ hotel, onBack, setPage, setMapTarget }) {
    const { t } = useTranslation();
    const [tab, setTab] = useState("overview");
    const [reviews, setReviews] = useState([]);
    const [hasRealReviews, setHasRealReviews] = useState(false);
    const [myReview, setMyReview] = useState("");
    const [myName, setMyName] = useState("");
    const [myRating, setMyRating] = useState(5);
 
    useEffect(() => {
        const unsub = listenHotelReviews(hotel.id, (data) => {
            if (data && data.length > 0) {
                setReviews(data);
                setHasRealReviews(true);
            } else {
                setReviews([
                    { name: "Aiko S.", country: "🇯🇵", rating: 5, text: t("home.review1Text") || "Absolutely breathtaking. The service was exceptional and the food outstanding." },
                    { name: "Priya M.", country: "🇮🇳", rating: 5, text: t("home.review2Text") || "Beautiful location, wonderful staff and amazing Sri Lankan cuisine." },
                    { name: "Hans K.", country: "🇩🇪", rating: 4, text: t("home.review3Text") || "Great hotel with stunning views. Would highly recommend to anyone visiting Sri Lanka." }
                ]);
                setHasRealReviews(false);
            }
        });
        return unsub;
    }, [hotel.id, t]);

    const averageRating = useMemo(() => {
        if (!hasRealReviews) return hotel.rating || 4.5;
        const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
        return Number((sum / reviews.length).toFixed(1));
    }, [reviews, hasRealReviews, hotel.rating]);

    const handleSubmitReview = async () => {
        if (!myReview.trim()) return;

        const newReview = {
            name: myName || t("profile.you"),
            country: "🌍",
            rating: myRating,
            text: myReview,
            createdAt: new Date().toISOString()
        };

        try {
            await saveHotelReview(hotel.id, newReview);
            
            const currentRealReviews = hasRealReviews ? reviews : [];
            const updatedReviews = [...currentRealReviews, newReview];
            const sum = updatedReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
            const avg = Number((sum / updatedReviews.length).toFixed(1));

            await updateHotelProfile(hotel.id, { rating: avg });

            setMyReview("");
            setMyName("");
            setMyRating(5);
        } catch (err) {
            console.error("Error submitting review:", err);
            alert("Failed to submit review.");
        }
    };

    const tabs = hotel.packages && hotel.packages.length > 0 
        ? ["overview", "packages", "amenities", "reviews", "booking"] 
        : ["overview", "amenities", "reviews", "booking"];

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
                        <Star v={averageRating} /><span style={{ opacity: 0.9 }}>({averageRating}/5 · {hasRealReviews ? reviews.length : 3} {t("profile.reviewsCount") || "reviews"})</span>
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
                        {tb === "packages" ? "📦 " + (t("profile.packagesTitle") || "Packages") : t(`profile.${tb}`)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: "40px 48px", background: "#fafcfd", minHeight: 400 }}>
                {tab === "overview" && (
                    <div style={{ maxWidth: 900 }}>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 18 }}>{t("profile.aboutTitle", { name: hotel.name })}</h2>
                        <p style={{ fontSize: "1rem", color: "#4a6374", lineHeight: 1.8, marginBottom: 28 }}>{hotel.desc} {t("profile.aboutSuffix")}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                            {[
                                { l: t("profile.district"), v: hotel.district },
                                { l: t("profile.rooms"), v: hotel.rooms },
                                { l: t("profile.type"), v: hotel.type },
                                { l: t("profile.rating"), v: averageRating + "★" },
                                { l: t("profile.price"), v: `$${hotel.price}${t("profile.night")}` },
                                { l: t("profile.status"), v: t("profile.verified") },
                                {
                                    l: t("signin.location") || "Location",
                                    v: (
                                        <button
                                            onClick={() => {
                                                setMapTarget({
                                                    name: hotel.name,
                                                    lat: hotel.lat,
                                                    lng: hotel.lng,
                                                    isHotel: true,
                                                    img: hotel.img,
                                                    district: hotel.district,
                                                    rating: hotel.rating,
                                                    price: hotel.price
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
                                                fontWeight: 700,
                                                fontSize: "0.95rem",
                                                textAlign: "left"
                                            }}
                                        >
                                            {t("profile.viewOnMap") || t("destinations.viewOnMap")}
                                        </button>
                                    )
                                }
                            ].map(i => (
                                <div key={i.l} style={{ background: "#f0f8fc", border: "1px solid #e2ecf0", borderRadius: 12, padding: 18 }}>
                                    <div style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{i.l}</div>
                                    <div style={{ fontWeight: 700, color: "#0f2030", fontSize: "0.95rem" }}>{i.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "packages" && (
                    <div style={{ maxWidth: 1000 }}>
                        <div style={{ marginBottom: 28 }}>
                            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#0f2030", marginBottom: 6 }}>🎁 {t("profile.curatedPackagesTitle")}</h2>
                            <p style={{ color: "#6b8999", fontSize: "0.9rem" }}>{t("profile.curatedPackagesSub", { name: hotel.name })}</p>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                            {hotel.packages?.map((pkg, i) => {
                                const nameLower = pkg.name.toLowerCase();
                                let icon = "🎁";
                                let gradient = "linear-gradient(135deg, #e2f1f7 0%, #cbdbe5 100%)";
                                let badgeColor = "#0f2030";

                                if (nameLower.includes("eco") || nameLower.includes("forest") || nameLower.includes("nature") || nameLower.includes("green") || nameLower.includes("rainforest") || nameLower.includes("hike")) {
                                    icon = "🌿";
                                    gradient = "linear-gradient(135deg, #e6f7ed 0%, #c2eede 100%)";
                                    badgeColor = "#059669";
                                } else if (nameLower.includes("wellness") || nameLower.includes("yoga") || nameLower.includes("spa") || nameLower.includes("retreat") || nameLower.includes("ayurvedic")) {
                                    icon = "🧘";
                                    gradient = "linear-gradient(135deg, #f5f0ff 0%, #e3d5ff 100%)";
                                    badgeColor = "#7c3aed";
                                } else if (nameLower.includes("pool") || nameLower.includes("beach") || nameLower.includes("surf") || nameLower.includes("ocean") || nameLower.includes("sea")) {
                                    icon = "🌊";
                                    gradient = "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)";
                                    badgeColor = "#0284c7";
                                } else if (nameLower.includes("luxury") || nameLower.includes("suite") || nameLower.includes("vip") || nameLower.includes("honeymoon")) {
                                    icon = "👑";
                                    gradient = "linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)";
                                    badgeColor = "#d97706";
                                }

                                return (
                                    <div 
                                        key={i} 
                                        style={{ 
                                            background: "#fff", 
                                            borderRadius: 20, 
                                            border: "1px solid #e2ecf0", 
                                            padding: 24, 
                                            boxShadow: "0 4px 20px rgba(10,127,165,0.04)",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            position: "relative",
                                            overflow: "hidden",
                                            transition: "all 0.3s ease"
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = "translateY(-6px)";
                                            e.currentTarget.style.boxShadow = "0 12px 30px rgba(10,127,165,0.1)";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 20px rgba(10,127,165,0.04)";
                                        }}
                                    >
                                        {/* Background accent bubble */}
                                        <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: gradient, opacity: 0.6, zIndex: 0 }} />

                                        <div style={{ zIndex: 1 }}>
                                            <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{icon}</div>
                                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.25rem", color: "#0f2030", fontWeight: 700, marginBottom: 8, paddingRight: 36 }}>{pkg.name}</h3>
                                            <div style={{ display: "inline-block", background: `${badgeColor}12`, color: badgeColor, fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: 12, marginBottom: 16, textTransform: "uppercase" }}>
                                                {t("profile.specialPackage") || "Special Package"}
                                            </div>
                                            <p style={{ fontSize: "0.83rem", color: "#6b8999", lineHeight: 1.6, marginBottom: 20 }}>{pkg.desc}</p>
                                        </div>

                                        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
                                            <div>
                                                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>{t("profile.priceLabel") || "PRICE"}</div>
                                                <span style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0a7fa5" }}>${pkg.price}</span>
                                            </div>
                                            <button 
                                                onClick={() => setTab("booking")}
                                                style={{
                                                    background: "linear-gradient(135deg, #0a7fa5, #17c4b8)",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: 10,
                                                    padding: "8px 18px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                    boxShadow: "0 4px 12px rgba(10,127,165,0.18)"
                                                }}
                                            >
                                                {t("profile.bookNow")}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                                <input type="text" value={myName} onChange={e => setMyName(e.target.value)} placeholder={t("profile.namePlaceholder") || "Your Name (Optional)"} style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, outline: "none", fontFamily: "inherit" }} />
                            </div>
                            <textarea value={myReview} onChange={e => setMyReview(e.target.value)} placeholder={t("profile.reviewPlaceholder")} style={{ width: "100%", minHeight: 100, padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
                            <button onClick={handleSubmitReview} style={{ marginTop: 12, background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 26px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>{t("profile.submitReview")}</button>
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
