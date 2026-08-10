import { useTranslation } from "react-i18next";
import { TEAM } from "../data/team";
import SocialIconsGroup from "./SocialIcons";

export default function Footer({ setPage }) {
    const { t } = useTranslation();

    return (
        <footer id="site-footer" style={{
            background: "#06111c",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "'Outfit',sans-serif",
            position: "relative",
            overflow: "hidden"
        }}>
            <style>{`
                @media (max-width: 992px) {
                    .footer-grid {
                        grid-template-columns: 1fr 1fr !important;
                    }
                }
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr !important;
                        gap: 32px !important;
                    }
                    .footer-bottom {
                        flex-direction: column !important;
                        align-items: center !important;
                        text-align: center !important;
                        gap: 16px !important;
                    }
                    .footer-brand-col {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                    .footer-brand-col p {
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .vision-mission-card {
                        margin-left: auto;
                        margin-right: auto;
                    }
                }
                .vision-mission-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .vision-mission-card:hover {
                    transform: translateY(-3px);
                    border-color: rgba(23,196,184,0.3) !important;
                    background: rgba(23,196,184,0.06) !important;
                    box-shadow: 0 10px 25px rgba(23,196,184,0.08), inset 0 0 12px rgba(23,196,184,0.05) !important;
                }
                .team-member-row {
                    transition: all 0.25s ease;
                    border-radius: 10px;
                    padding: 6px 8px;
                    margin-left: -8px;
                    margin-right: -8px;
                }
                .team-member-row:hover {
                    transform: translateX(6px);
                    background-color: rgba(255, 255, 255, 0.04);
                }
                .footer-contact-button {
                    transition: all 0.25s ease;
                }
                .footer-contact-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(23,196,184,0.4);
                    filter: brightness(1.1);
                }
            `}</style>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 48px 32px" }}>
                <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.9fr", gap: 40, marginBottom: 40 }}>

                    {/* Brand & Vision/Mission */}
                    <div className="footer-brand-col">
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <img
                                src="/images/hero 2.png"
                                alt="Ceylon Nature Logo"
                                style={{ height: 56, objectFit: "contain" }}
                            />
                        </div>
                        <p style={{ fontSize: "0.82rem", lineHeight: 1.6, maxWidth: 320, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                            {t("footer.tagline")}
                        </p>

                        {/* Vision & Mission Mini Card */}
                        <div className="vision-mission-card" style={{
                            background: "rgba(23,196,184,0.03)",
                            border: "1px solid rgba(23,196,184,0.12)",
                            borderRadius: 14, padding: "14px 16px", maxWidth: 320,
                            boxShadow: "inset 0 0 10px rgba(255,255,255,0.01)"
                        }}>
                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#17c4b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                {t("vision.ourVision")}
                            </div>
                            <p style={{ fontSize: "0.74rem", lineHeight: 1.45, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
                                {t("vision.visionText")}
                            </p>
                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#17c4b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                                {t("vision.ourMission")}
                            </div>
                            <p style={{ fontSize: "0.74rem", lineHeight: 1.45, color: "rgba(255,255,255,0.7)", margin: 0 }}>
                                {t("vision.missionText")}
                            </p>
                        </div>
                    </div>

                    {/* Our Team & Supervisors */}
                    <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            {t("team.title") || "Our Team"}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {TEAM.map(m => (
                                <div key={m.name} className="team-member-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${m.color}, #17c4b8)`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.75rem", fontWeight: 700, color: "#fff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        flexShrink: 0
                                    }}>
                                        {m.initial}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {m.role} · <span style={{ fontSize: "0.65rem" }}>{m.dept}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div style={{
                                marginTop: 12, padding: "10px 12px",
                                background: "rgba(255,255,255,0.02)",
                                borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)"
                            }}>
                                <div style={{ fontSize: "0.72rem", color: "#17c4b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{t("team.supervisors") || "Supervisors"}</div>
                                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Dr. Sanika Wijayasekara</div>
                                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Ms. Rashmika Chandrasena</div>
                                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{t("team.dept")}</div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info & Premium Social Section */}
                    <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            {t("footer.contact")}
                        </div>
                        {[
                            {
                                svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#17c4b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
                                text: t("footer.address")
                            },
                            {
                                svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#17c4b8" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
                                text: t("footer.email")
                            },
                            {
                                svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#17c4b8" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
                                text: t("footer.phone")
                            },
                            {
                                svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#17c4b8" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
                                text: t("footer.support")
                            },
                        ].map(({ svg, text }) => (
                            <div key={text} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                                <span style={{ marginTop: 2 }}>{svg}</span>
                                <span style={{ fontSize: "0.85rem" }}>{text}</span>
                            </div>
                        ))}

                        {/* Social Media Links Header & Component */}
                        <div style={{ marginTop: 20, marginBottom: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#17c4b8" }}>
                            🌐 Connect With Us
                        </div>
                        <SocialIconsGroup size={18} />

                        <button
                            onClick={() => setPage("contact")}
                            className="footer-contact-button"
                            style={{ marginTop: 18, background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", border: "none", color: "#fff", borderRadius: 10, padding: "10px 22px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.83rem", display: "inline-flex", alignItems: "center", gap: 8 }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            {t("footer.contactUs")}
                        </button>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
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

