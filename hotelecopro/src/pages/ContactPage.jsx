import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IMG_SUNSET } from "../constants";
import Input from "../components/Input";
import FormSelect from "../components/Select";
import { saveContactMessage } from "../data/firebase";

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
        { icon: "🏫", label: t("contact.university"), val: t("contact.universityVal") },
        { icon: "📧", label: t("contact.email"), val: t("contact.emailVal") },
        { icon: "📱", label: t("contact.phone"), val: t("contact.phoneVal") },
        { icon: "🕒", label: t("contact.officeHours"), val: t("contact.officeHoursVal") },
    ];

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh" }}>
            <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
                <img src={IMG_SUNSET} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,32,48,0.65)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "3rem", fontWeight: 700, marginBottom: 10 }}>{t("contact.title")}</h1>
                    <p style={{ fontSize: "1rem", opacity: 0.85 }}>{t("contact.sub")}</p>
                </div>
            </div>

            <div style={{ padding: "64px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, maxWidth: 1100, margin: "0 auto" }}>
                <div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.9rem", color: "#0f2030", marginBottom: 28 }}>{t("contact.sendMessage")}</h2>
                    {sent ? (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <div style={{ fontSize: "3.5rem", marginBottom: 14 }}>📬</div>
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
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
                            <div key={c.label} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fff", border: "1px solid #e2ecf0", borderRadius: 14, padding: "16px 18px" }}>
                                <span style={{ fontSize: "1.5rem" }}>{c.icon}</span>
                                <div>
                                    <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", marginBottom: 4 }}>{c.label}</div>
                                    <div style={{ fontSize: "0.9rem", color: "#1e3a4a" }}>{c.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", color: "#0f2030", marginBottom: 18 }}>{t("contact.followUs")}</h3>
                    <div style={{ display: "flex", gap: 14 }}>
                        {[
                            { icon: "📘", label: "Facebook", color: "#1877f2", url: "https://facebook.com", bg: "#e7f0fd" },
                            { icon: "📸", label: "Instagram", color: "#e4405f", url: "https://instagram.com", bg: "#fde8ed" },
                            { icon: "💼", label: "LinkedIn", color: "#0a66c2", url: "https://linkedin.com", bg: "#e7f0fa" },
                        ].map(s => (
                            <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: s.bg, border: "1px solid #e2ecf0", borderRadius: 16, padding: "20px 24px", textDecoration: "none", flex: 1, textAlign: "center", transition: "all 0.25s" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                                <span style={{ fontSize: "2rem" }}>{s.icon}</span>
                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: s.color }}>{s.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;
