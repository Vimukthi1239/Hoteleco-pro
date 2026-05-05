import { useTranslation } from "react-i18next";
import { TEAM } from "../data/team";
import { IMG_BOATS } from "../constants";

function TeamPage() {
    const { t } = useTranslation();

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh" }}>
            <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
                <img src={IMG_BOATS} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,32,48,0.68)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "3rem", fontWeight: 700, marginBottom: 10 }}>{t("team.title")}</h1>
                    <p style={{ fontSize: "1rem", opacity: 0.85 }}>{t("team.sub")}</p>
                </div>
            </div>
            <div style={{ padding: "64px 48px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 28, maxWidth: 900, margin: "0 auto" }}>
                    {TEAM.map(m => (
                        <div key={m.name} style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", border: "1px solid #e2ecf0", boxShadow: "0 4px 20px rgba(10,127,165,0.07)", display: "flex", gap: 22, alignItems: "flex-start", transition: "all 0.3s" }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(10,127,165,0.14)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(10,127,165,0.07)"; }}>
                            <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${m.color},#17c4b8)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: "1.9rem", fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: `0 8px 24px ${m.color}40` }}>
                                {m.initial}
                            </div>
                            <div>
                                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", color: "#0f2030", marginBottom: 4 }}>{m.name}</h3>
                                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: m.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{m.role}</div>
                                <p style={{ fontSize: "0.875rem", color: "#6b8999", lineHeight: 1.65 }}>{m.dept}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ maxWidth: 900, margin: "36px auto 0", background: "linear-gradient(135deg,#f0f8fc,#fff)", borderRadius: 20, padding: 36, border: "1px solid #e2ecf0", textAlign: "center" }}>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "#0f2030", marginBottom: 10 }}>{t("team.supervisors")}</h3>
                    <p style={{ color: "#4a6374", fontSize: "0.95rem" }}>
                        <strong style={{ color: "#0a7fa5" }}>Dr. Sanika Wijayasekara</strong> (Supervisor) &nbsp;&amp;&nbsp; <strong style={{ color: "#17c4b8" }}>Ms. Rashmika Chandrasena</strong> (Co-Supervisor)
                    </p>
                    <p style={{ marginTop: 10, fontSize: "0.88rem", color: "#6b8999" }}>{t("team.dept")}</p>
                </div>
            </div>
        </div>
    );
}

export default TeamPage;
