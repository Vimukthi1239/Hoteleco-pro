import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IMG_SUNSET } from "../constants";
import Input from "../components/Input";
import FormSelect from "../components/Select";
import { saveContactMessage } from "../data/firebase";
import { SOCIAL_LINKS } from "../components/SocialIcons";

function ContactPage() {
    const { t } = useTranslation();
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", type: "General Inquiry" });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSend = async () => {
        if (!form.name || !form.email || !form.message) {
            setError(t("contact.validationError"));
            return;
        }
        setError("");
        setLoading(true);
        try {
            await saveContactMessage(form);
            setSent(true);
        } catch (err) {
            setError(t("contact.sendError"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        { 
            svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17c4b8" strokeWidth="2.2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, 
            label: t("contact.university"), 
            val: t("contact.universityVal") 
        },
        { 
            svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17c4b8" strokeWidth="2.2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, 
            label: t("contact.email"), 
            val: t("contact.emailVal") 
        },
        { 
            svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17c4b8" strokeWidth="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, 
            label: t("contact.phone"), 
            val: t("contact.phoneVal") 
        },
        { 
            svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17c4b8" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, 
            label: t("contact.officeHours"), 
            val: t("contact.officeHoursVal") 
        },
    ];

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh", background: "#f8fafc" }}>
            <style>{`
                @media (max-width: 768px) {
                    .contact-hero-banner {
                        height: 220px !important;
                    }
                    .contact-main-grid {
                        padding: 32px 16px !important;
                        grid-template-columns: 1fr !important;
                        gap: 36px !important;
                    }
                    .contact-inputs-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
            <div className="contact-hero-banner" style={{ position: "relative", height: 300, overflow: "hidden" }}>
                <img src={IMG_SUNSET} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,32,48,0.75) 0%, rgba(10,32,48,0.88) 100%)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff", padding: "0 16px" }}>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 700, marginBottom: 10 }}>{t("contact.title")}</h1>
                    <p style={{ fontSize: "0.95rem", opacity: 0.85 }}>{t("contact.sub")}</p>
                </div>
            </div>

            <div className="contact-main-grid" style={{ padding: "64px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, maxWidth: 1150, margin: "0 auto" }}>
                <div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.9rem", color: "#0f2030", marginBottom: 28 }}>{t("contact.sendMessage")}</h2>
                    {sent ? (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e6f9f1", color: "#1a7a4a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </div>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", color: "#0f2030", marginBottom: 8 }}>{t("contact.messageSent")}</h3>
                            <p style={{ color: "#6b8999", marginBottom: 12 }}>{t("contact.respondTime")}</p>
                            <div style={{ background: "#e6f9f1", borderRadius: 10, padding: "8px 16px", marginBottom: 18, color: "#1a7a4a", fontSize: "0.83rem", fontWeight: 600, display: "inline-block" }}>
                                ✅ {t("contact.savedFirebase")}
                            </div>
                            <br />
                            <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "", type: "General Inquiry" }); }} style={{ marginTop: 8, background: "#0a7fa5", color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontFamily: "inherit" }}>{t("contact.sendAnother")}</button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div className="contact-inputs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <Input label={t("contact.yourName")} type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t("contact.namePlaceholder")} />
                                <Input label={t("contact.emailAddress")} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder={t("contact.emailPlaceholder")} />
                            </div>
                            <FormSelect label={t("contact.inquiryType")} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={["General Inquiry", "Hotel Registration", "Technical Support", "Partnership", "Feedback", "Media", "Other"]} />
                            <Input label={t("contact.subject")} type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder={t("contact.subjectPlaceholder")} />
                            <div>
                                <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", display: "block", marginBottom: 6 }}>{t("contact.message")}</label>
                                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={5} placeholder={t("contact.messagePlaceholder")} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                            </div>
                            {error && (
                                <div style={{ background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 10, padding: "10px 16px", color: "#c0392b", fontSize: "0.88rem" }}>
                                    ⚠️ {error}
                                </div>
                            )}
                            <button onClick={handleSend} disabled={loading}
                                style={{ background: loading ? "#aaa" : "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", padding: "14px 36px", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.95rem", alignSelf: "flex-start", boxShadow: "0 6px 20px rgba(10,127,165,0.3)", fontFamily: "inherit" }}>
                                {loading ? t("contact.sending") : t("contact.sendBtn")}
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.9rem", color: "#0f2030", marginBottom: 28 }}>{t("contact.getInTouch")}</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                        {contactInfo.map(c => (
                            <div key={c.label} style={{ display: "flex", gap: 16, alignItems: "center", background: "#fff", border: "1px solid #e2ecf0", borderRadius: 16, padding: "18px 20px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(23,196,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {c.svg}
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", marginBottom: 4 }}>{c.label}</div>
                                    <div style={{ fontSize: "0.92rem", color: "#1e3a4a", fontWeight: 600 }}>{c.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Premium Social Media Section */}
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.35rem", color: "#0f2030", marginBottom: 16 }}>{t("contact.followUs")}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
                        {SOCIAL_LINKS.map(s => {
                            const IconComp = s.icon;
                            return (
                                <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                                    style={{
                                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                                        background: "#ffffff", border: `1.5px solid ${s.color}30`, borderRadius: 16,
                                        padding: "16px 12px", textDecoration: "none", textAlign: "center",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = `0 10px 24px ${s.glow}`;
                                        e.currentTarget.style.background = s.gradient;
                                        const iconWrap = e.currentTarget.querySelector('.social-icon-wrapper');
                                        if (iconWrap) iconWrap.style.color = "#ffffff";
                                        const textSpan = e.currentTarget.querySelector('.social-label-text');
                                        if (textSpan) textSpan.style.color = "#ffffff";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
                                        e.currentTarget.style.background = "#ffffff";
                                        const iconWrap = e.currentTarget.querySelector('.social-icon-wrapper');
                                        if (iconWrap) iconWrap.style.color = s.color;
                                        const textSpan = e.currentTarget.querySelector('.social-label-text');
                                        if (textSpan) textSpan.style.color = s.color;
                                    }}>
                                    <div className="social-icon-wrapper" style={{ color: s.color, transition: "color 0.2s" }}>
                                        <IconComp size={24} />
                                    </div>
                                    <span className="social-label-text" style={{ fontSize: "0.82rem", fontWeight: 700, color: s.color, transition: "color 0.2s" }}>
                                        {s.name}
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;
