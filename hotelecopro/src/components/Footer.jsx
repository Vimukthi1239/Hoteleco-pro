import { useTranslation } from "react-i18next";

export default function Footer({ setPage }) {
    const { t } = useTranslation();

    const links = [
        { key: "home", page: "home" },
        { key: "destinations", page: "destinations" },
        { key: "hotels", page: "hotels" },
        { key: "map", page: "map" },
        { key: "book", page: "booking" },
        { key: "contact", page: "contact" },
        { key: "vision", page: "vision" },
        { key: "team", page: "team" },
    ];

    return (
        <footer style={{
            background: "#06111c",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "'Outfit',sans-serif",
        }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 48px 32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>

                    {/* Brand */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                                🏨
                            </div>
                            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                                HotelEco <span style={{ color: "#17c4b8" }}>Pro</span>
                            </span>
                        </div>
                        <p style={{ fontSize: "0.87rem", lineHeight: 1.75, maxWidth: 290 }}>
                            {t("footer.tagline")}
                        </p>
                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            {[t("footer.ecoCertified"), t("footer.aiPowered"), t("footer.secureBooking")].map(tag => (
                                <span key={tag} style={{ background: "rgba(23,196,184,0.1)", border: "1px solid rgba(23,196,184,0.2)", color: "#17c4b8", borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600 }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 18 }}>{t("footer.quickLinks")}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                            {links.map(l => (
                                <button
                                    key={l.page}
                                    onClick={() => setPage(l.page)}
                                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.55)", textAlign: "left", padding: "6px 0", cursor: "pointer", fontFamily: "inherit", fontSize: "0.87rem", transition: "color 0.18s" }}
                                    onMouseEnter={e => e.target.style.color = "#17c4b8"}
                                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
                                >
                                    → {t(`navbar.${l.key}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 18 }}>{t("footer.contact")}</div>
                        {[
                            { icon: "📍", text: t("footer.address") },
                            { icon: "📧", text: t("footer.email") },
                            { icon: "📞", text: t("footer.phone") },
                            { icon: "⏰", text: t("footer.support") },
                        ].map(({ icon, text }) => (
                            <div key={text} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                                <span style={{ fontSize: "0.9rem" }}>{icon}</span>
                                <span style={{ fontSize: "0.87rem" }}>{text}</span>
                            </div>
                        ))}
                        <button
                            onClick={() => setPage("contact")}
                            style={{ marginTop: 10, background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", border: "none", color: "#fff", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.82rem" }}
                        >
                            {t("footer.contactUs")}
                        </button>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <p style={{ fontSize: "0.8rem" }}>
                        {t("footer.copyright", { year: new Date().getFullYear() })}
                    </p>
                    <div style={{ display: "flex", gap: 16 }}>
                        {[t("footer.privacy"), t("footer.terms"), t("footer.cookies")].map(text => (
                            <span key={text} style={{ fontSize: "0.78rem", cursor: "pointer", transition: "color 0.18s" }}
                                onMouseEnter={e => e.target.style.color = "#17c4b8"}
                                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
                            >
                                {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
