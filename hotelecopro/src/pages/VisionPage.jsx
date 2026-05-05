import { useTranslation } from "react-i18next";
import { IMG_COASTAL } from "../constants";

function VisionPage() {
    const { t } = useTranslation();

    const goals = [
        { icon: "🤖", titleKey: "goal1Title", descKey: "goal1Desc" },
        { icon: "🗺️", titleKey: "goal2Title", descKey: "goal2Desc" },
        { icon: "📊", titleKey: "goal3Title", descKey: "goal3Desc" },
        { icon: "🌏", titleKey: "goal4Title", descKey: "goal4Desc" },
        { icon: "♻️", titleKey: "goal5Title", descKey: "goal5Desc" },
        { icon: "⭐", titleKey: "goal6Title", descKey: "goal6Desc" },
    ];

    const techStack = ["React.js", "Node.js", "Python", "PostgreSQL", "MongoDB", "Dialogflow", "TensorFlow", "Scikit-learn", "Mapbox GL JS", "BeautifulSoup", "D3.js", "Chart.js", "GPT API", "AWS", "Google Cloud"];

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh" }}>
            <div style={{ position: "relative", height: 360, overflow: "hidden" }}>
                <img src={IMG_COASTAL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,32,48,0.68)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff", padding: "0 32px" }}>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "3rem", fontWeight: 700, marginBottom: 12 }}>{t("vision.title")}</h1>
                    <p style={{ fontSize: "1.05rem", opacity: 0.85, maxWidth: 600 }}>{t("vision.sub")}</p>
                </div>
            </div>
            <div style={{ padding: "64px 48px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 1000, margin: "0 auto 64px" }}>
                    <div style={{ background: "linear-gradient(135deg,#0a7fa5,#0890b5)", borderRadius: 20, padding: "40px 36px", color: "#fff" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🌟</div>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", marginBottom: 16 }}>{t("vision.ourVision")}</h2>
                        <p style={{ fontSize: "0.97rem", lineHeight: 1.8, opacity: 0.92 }}>{t("vision.visionText")}</p>
                    </div>
                    <div style={{ background: "linear-gradient(135deg,#17c4b8,#0ea5a0)", borderRadius: 20, padding: "40px 36px", color: "#fff" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🎯</div>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", marginBottom: 16 }}>{t("vision.ourMission")}</h2>
                        <p style={{ fontSize: "0.97rem", lineHeight: 1.8, opacity: 0.92 }}>{t("vision.missionText")}</p>
                    </div>
                </div>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.2rem", color: "#0f2030" }}>{t("vision.objectivesTitle")}</h2>
                    <p style={{ color: "#6b8999", marginTop: 10 }}>{t("vision.objectivesSub")}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
                    {goals.map(g => (
                        <div key={g.titleKey} style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 16, padding: "30px 24px", transition: "all 0.3s" }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(10,127,165,0.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                            <div style={{ fontSize: "2.2rem", marginBottom: 14 }}>{g.icon}</div>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: "#0f2030", marginBottom: 10 }}>{t(`vision.${g.titleKey}`)}</h3>
                            <p style={{ fontSize: "0.86rem", color: "#6b8999", lineHeight: 1.7 }}>{t(`vision.${g.descKey}`)}</p>
                        </div>
                    ))}
                </div>
                <div style={{ maxWidth: 1000, margin: "60px auto 0", textAlign: "center" }}>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: "#0f2030", marginBottom: 28 }}>{t("vision.techStack")}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                        {techStack.map(tech => (
                            <div key={tech} style={{ background: "#f0f8fc", border: "1px solid #e2ecf0", borderRadius: 8, padding: "8px 18px", fontSize: "0.83rem", color: "#0a7fa5", fontWeight: 500 }}>{tech}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VisionPage;
