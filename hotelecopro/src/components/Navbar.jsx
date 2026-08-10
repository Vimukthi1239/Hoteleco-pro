import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../data/i18next";
import { logoutHotel } from "../data/firebase";
import { Hotel, Calendar, User, LogIn, KeyRound, LogOut, ChevronDown, Menu, X } from "lucide-react";

const NAV_PAGES = [
    { key: "home", page: "home" },
    { key: "destinations", page: "destinations" },
    { key: "hotels", page: "hotels" },
    { key: "map", page: "map" },
    { key: "itinerary", page: "itinerary" },
    { key: "contact", page: "contact" },
];

export default function Navbar({ page, setPage, lang, setLang, hotelUser, customerUser, setCustomerUser }) {
    const { t, i18n } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hovered, setHovered] = useState(null);
    const [langOpen, setLangOpen] = useState(false);

    const selectedLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

    const visibleNavPages = NAV_PAGES;

    const handleLangChange = (code) => {
        setLang(code);
        i18n.changeLanguage(code);
        setLangOpen(false);
    };

    return (
        <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
            background: "rgba(10,24,38,0.96)", backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "'Outfit', sans-serif",
        }}>
            <style>{`
            @media (max-width: 768px) {
                .nav-links { display: none !important; }
                .hamburger-btn { display: flex !important; }
                .navbar-logo-img { height: 38px !important; }
            }
        `}</style>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", height: 68, gap: 8 }}>

                {/* Logo */}
                <div
                    onClick={() => setPage("home")}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", marginRight: 16, flexShrink: 0 }}
                >
                    <img
                        className="navbar-logo-img"
                        src="/images/hero 2.png"
                        alt="Ceylon Nature Logo"
                        style={{
                            height: 48,
                            width: "auto",
                            maxHeight: "52px",
                            objectFit: "contain",
                            transition: "transform 0.3s ease, filter 0.3s ease",
                            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.filter = "drop-shadow(0 4px 10px rgba(23,196,184,0.4))";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.4))";
                        }}
                    />
                </div>

                {/* Desktop Nav Links */}
                <div className="nav-links" style={{ display: "flex", gap: 2, flex: 1, alignItems: "center" }}>
                    {visibleNavPages.map(link => {
                        const isActive = page === link.page;
                        const isHov = hovered === link.page;
                        return (
                            <button
                                key={link.page}
                                onClick={() => setPage(link.page)}
                                onMouseEnter={() => setHovered(link.page)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    background: isActive ? "rgba(23,196,184,0.15)" : isHov ? "rgba(255,255,255,0.06)" : "transparent",
                                    border: "none",
                                    color: isActive ? "#17c4b8" : "rgba(255,255,255,0.75)",
                                    padding: "7px 13px",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    fontSize: "0.87rem",
                                    fontWeight: isActive ? 700 : 400,
                                    transition: "all 0.18s",
                                    borderBottom: isActive ? "2px solid #17c4b8" : "2px solid transparent",
                                }}
                            >
                                {t(`navbar.${link.key}`)}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setPage("booking")}
                        onMouseEnter={() => setHovered("booking")}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            background: page === "booking" ? "linear-gradient(135deg,#0a7fa5,#17c4b8)" : "rgba(23,196,184,0.18)",
                            border: "none",
                            color: "#fff",
                            padding: "7px 15px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: "0.87rem",
                            fontWeight: 700,
                            transition: "all 0.18s",
                            marginLeft: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                        }}
                    >
                        <Calendar size={15} />
                        {t("navbar.book")}
                    </button>
                </div>

                {/* Language Switcher */}
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setLangOpen(p => !p)}
                        style={{
                            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                            color: "#fff", borderRadius: 8, padding: "6px 12px",
                            cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem",
                            display: "flex", alignItems: "center", gap: 5, transition: "all 0.18s",
                        }}
                    >
                        <span>{selectedLang.flag}</span>
                        <span>{selectedLang.label}</span>
                        <ChevronDown size={12} style={{ opacity: 0.7 }} />
                    </button>
                    {langOpen && (
                        <div style={{
                            position: "absolute", top: "calc(100% + 8px)", right: 0,
                            background: "#0f2030", border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 12, padding: 8, minWidth: 140,
                            boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 100,
                        }}>
                            {LANGUAGES.map(l => (
                                <button
                                    key={l.code}
                                    onClick={() => handleLangChange(l.code)}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: 8,
                                        background: lang === l.code ? "rgba(23,196,184,0.15)" : "transparent",
                                        border: "none", color: lang === l.code ? "#17c4b8" : "rgba(255,255,255,0.8)",
                                        padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                                        fontFamily: "inherit", fontSize: "0.85rem", textAlign: "left",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    <span>{l.flag}</span><span>{l.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Customer Account Button */}
                {customerUser ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                            style={{
                                background: "rgba(23,196,184,0.15)", border: "1px solid rgba(23,196,184,0.3)",
                                color: "#17c4b8", borderRadius: 10, padding: "8px 14px",
                                fontWeight: 700, fontSize: "0.83rem", whiteSpace: "nowrap",
                                display: "flex", alignItems: "center", gap: 6
                            }}
                        >
                            <User size={15} />
                            {customerUser.fullName ? customerUser.fullName.split(" ")[0] : "Traveler"}
                        </div>
                        <button
                            onClick={() => {
                                logoutHotel().then(() => {
                                    setCustomerUser(null);
                                    setPage("home");
                                });
                            }}
                            style={{
                                background: "transparent", border: "1px solid rgba(255,255,255,0.25)",
                                color: "#fff", borderRadius: 10, padding: "8px 12px",
                                cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.82rem",
                                transition: "all 0.18s", display: "flex", alignItems: "center", gap: 4
                            }}
                        >
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                ) : !hotelUser && (
                    <button
                        onClick={() => setPage("customerAuth")}
                        style={{
                            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
                            color: "#fff", borderRadius: 10, padding: "8px 14px",
                            cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.83rem",
                            whiteSpace: "nowrap", transition: "all 0.18s",
                            marginRight: 4, display: "flex", alignItems: "center", gap: 6
                        }}
                    >
                        <LogIn size={15} />
                        Sign In
                    </button>
                )}

                {/* Hotel Partner Button */}
                {hotelUser ? (
                    <button
                        onClick={() => setPage("hotelDashboard")}
                        style={{
                            background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", border: "none",
                            color: "#fff", borderRadius: 10, padding: "8px 16px",
                            cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.83rem",
                            boxShadow: "0 4px 14px rgba(10,127,165,0.35)", whiteSpace: "nowrap",
                            display: "flex", alignItems: "center", gap: 6
                        }}
                    >
                        <Hotel size={15} />
                        {hotelUser.hotelName}
                    </button>
                ) : (
                    <button
                        onClick={() => setPage("hotelSignin")}
                        style={{
                            background: "rgba(23,196,184,0.12)", border: "1px solid rgba(23,196,184,0.35)",
                            color: "#17c4b8", borderRadius: 10, padding: "8px 16px",
                            cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.83rem",
                            whiteSpace: "nowrap", transition: "all 0.18s",
                            display: "flex", alignItems: "center", gap: 6
                        }}
                    >
                        <KeyRound size={15} />
                        {t("navbar.hotelLogin")}
                    </button>
                )}

                {/* Hamburger button – only visible on mobile via CSS */}
                <button
                    className="hamburger-btn"
                    onClick={() => setMobileOpen(p => !p)}
                    style={{
                        display: "none",
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                        borderRadius: 8,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        lineHeight: 1,
                        marginLeft: 8,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={{ padding: "12px 24px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    {visibleNavPages.map(l => (
                        <button key={l.page} onClick={() => { setPage(l.page); setMobileOpen(false); }}
                            style={{ display: "block", width: "100%", background: "transparent", border: "none", color: "rgba(255,255,255,0.8)", padding: "10px 0", cursor: "pointer", fontFamily: "inherit", fontSize: "0.92rem", textAlign: "left" }}>
                            {t(`navbar.${l.key}`)}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
}
