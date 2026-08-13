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
                .desktop-only-action { display: none !important; }
                .hamburger-btn { display: flex !important; }
                .navbar-logo-img { height: 38px !important; }
                .navbar-container { padding: 0 16px !important; }
            }
        `}</style>
            <div className="navbar-container" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", height: 68, gap: 8, justifyContent: "space-between" }}>

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

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Language Switcher */}
                    <div className="desktop-only-action" style={{ position: "relative" }}>
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
                        <div className="desktop-only-action" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                            className="desktop-only-action"
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
                            className="desktop-only-action"
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
                            className="desktop-only-action"
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

                    {/* Hamburger button – visible on mobile */}
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
            </div>

            {/* Mobile menu drawer */}
            {mobileOpen && (
                <div style={{
                    padding: "16px 20px 24px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    background: "#0a1826",
                    maxHeight: "calc(100vh - 68px)",
                    overflowY: "auto",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                        {visibleNavPages.map(l => (
                            <button key={l.page} onClick={() => { setPage(l.page); setMobileOpen(false); }}
                                style={{ display: "block", width: "100%", background: page === l.page ? "rgba(23,196,184,0.12)" : "transparent", border: "none", color: page === l.page ? "#17c4b8" : "rgba(255,255,255,0.9)", padding: "12px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", textAlign: "left", fontWeight: page === l.page ? 700 : 400, minHeight: 44 }}>
                                {t(`navbar.${l.key}`)}
                            </button>
                        ))}
                        <button onClick={() => { setPage("booking"); setMobileOpen(false); }}
                            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", border: "none", color: "#fff", padding: "12px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 700, marginTop: 4, minHeight: 44, justifyContent: "center" }}>
                            <Calendar size={16} />
                            {t("navbar.book")}
                        </button>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                        {/* Mobile Language Switcher */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff", fontSize: "0.88rem" }}>
                            <span style={{ color: "rgba(255,255,255,0.6)" }}>Language:</span>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {LANGUAGES.map(l => (
                                    <button key={l.code} onClick={() => handleLangChange(l.code)} style={{ background: lang === l.code ? "#17c4b8" : "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: "0.8rem", cursor: "pointer", minHeight: 36 }}>
                                        {l.flag} {l.code.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Customer Actions */}
                        {customerUser ? (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                                <span style={{ color: "#17c4b8", fontWeight: 700, fontSize: "0.9rem" }}>👤 {customerUser.fullName}</span>
                                <button onClick={() => { logoutHotel().then(() => { setCustomerUser(null); setPage("home"); setMobileOpen(false); }); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", minHeight: 40 }}>Logout</button>
                            </div>
                        ) : !hotelUser && (
                            <button onClick={() => { setPage("customerAuth"); setMobileOpen(false); }} style={{ width: "100%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44 }}>
                                <LogIn size={16} />
                                Sign In / Register
                            </button>
                        )}

                        {/* Mobile Hotel Partner Action */}
                        {hotelUser ? (
                            <button onClick={() => { setPage("hotelDashboard"); setMobileOpen(false); }} style={{ width: "100%", background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", border: "none", color: "#fff", padding: "12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44 }}>
                                <Hotel size={16} />
                                {hotelUser.hotelName} (Dashboard)
                            </button>
                        ) : (
                            <button onClick={() => { setPage("hotelSignin"); setMobileOpen(false); }} style={{ width: "100%", background: "rgba(23,196,184,0.15)", border: "1px solid #17c4b8", color: "#17c4b8", padding: "12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44 }}>
                                <KeyRound size={16} />
                                {t("navbar.hotelLogin")}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
