import { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../components/Input";
import FormSelect from "../components/Select";
import { loginHotel, registerHotelAuth, saveHotelRegistration, getHotelProfile } from "../data/firebase";
import { IMG_AERIAL } from "../constants";

function HotelSigninPage({ setPage, setHotelUser }) {
    const { t } = useTranslation();
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ hotelName: "", email: "", password: "", contact: "", district: "", type: "", rooms: "", location: "" });
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");
        if (!form.email || !form.password) { setError(t("signin.errEmailPassword")); return; }
        if (mode === "register" && !form.hotelName) { setError(t("signin.errHotelName")); return; }
        setLoading(true);
        try {
            if (mode === "login") {
                const cred = await loginHotel(form.email, form.password);
                const profile = await getHotelProfile(form.email);
                setHotelUser({
                    uid: cred.user.uid, email: cred.user.email,
                    hotelName: profile?.hotelName || form.email.split("@")[0],
                    district: profile?.district || "", type: profile?.type || "",
                    id: profile?.id || cred.user.uid, status: profile?.status || "approved",
                });
                setPage("hotelDashboard");
            } else {
                await registerHotelAuth(form.email, form.password);
                await saveHotelRegistration({ hotelName: form.hotelName, email: form.email, contact: form.contact, district: form.district, type: form.type, rooms: form.rooms, location: form.location });
                setDone(true);
            }
        } catch (err) {
            const msg = err.code === "auth/user-not-found" ? t("signin.errNotFound")
                : err.code === "auth/wrong-password" ? t("signin.errWrongPassword")
                    : err.code === "auth/invalid-credential" ? t("signin.errInvalidCred")
                        : err.code === "auth/email-already-in-use" ? t("signin.errEmailInUse")
                            : err.code === "auth/weak-password" ? t("signin.errWeakPassword")
                                : err.message || t("signin.errGeneric");
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (done) return (
        <div style={{ paddingTop: 88, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f0f8fc,#fff)" }}>
            <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "4rem", marginBottom: 16 }}>🏨</div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.2rem", color: "#0f2030", marginBottom: 10 }}>{t("signin.doneTitle")}</h2>
                <p style={{ color: "#6b8999", marginBottom: 16, maxWidth: 400 }}>{t("signin.doneMsg")}</p>
                <div style={{ background: "#e6f9f1", borderRadius: 10, padding: "10px 18px", marginBottom: 24, color: "#1a7a4a", fontSize: "0.85rem", fontWeight: 600, display: "inline-block" }}>
                    {t("signin.savedFirebase")}
                </div>
                <br />
                <button onClick={() => setPage("hotels")} style={{ background: "#0a7fa5", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
                    {t("signin.viewListings")}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{
            paddingTop: 88, minHeight: "100vh",
            background: `linear-gradient(rgba(10,32,48,0.6), rgba(10,32,48,0.8)), url(${IMG_AERIAL}) center/cover no-repeat`,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 32px 60px"
        }}>
            <div style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 24, padding: "48px 44px", maxWidth: 520, width: "100%", boxShadow: "0 12px 56px rgba(10,127,165,0.12)" }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "1.6rem" }}>🏨</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.9rem", color: "#0f2030", marginBottom: 6 }}>
                        {mode === "login" ? t("signin.signIn") : t("signin.register")}
                    </h2>
                    <p style={{ fontSize: "0.88rem", color: "#6b8999" }}>{t("signin.portal")}</p>
                </div>

                {/* Tab toggle */}
                <div style={{ display: "flex", gap: 0, background: "#f0f8fc", borderRadius: 12, padding: 4, marginBottom: 30 }}>
                    {["login", "register"].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(""); }}
                            style={{ flex: 1, background: mode === m ? "#fff" : "transparent", border: "none", borderRadius: 9, padding: "10px", cursor: "pointer", fontSize: "0.88rem", fontWeight: mode === m ? 700 : 400, color: mode === m ? "#0a7fa5" : "#6b8999", boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s", fontFamily: "inherit" }}>
                            {m === "login" ? t("signin.signInTab") : t("signin.registerTab")}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {mode === "register" && (
                        <Input label={t("signin.hotelName")} type="text" value={form.hotelName} onChange={e => setForm(p => ({ ...p, hotelName: e.target.value }))} placeholder={t("signin.hotelNamePlaceholder")} />
                    )}
                    <Input label={t("signin.emailAddress")} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="hotel@email.com" />
                    <Input label={t("signin.password")} type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
                    {mode === "register" && (
                        <>
                            <Input label={t("signin.contactNumber")} type="tel" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder="+94 77 000 0000" />
                            <FormSelect label={t("signin.district")} value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} options={["Select district", "Colombo", "Kandy", "Galle", "Matara", "Hambantota", "Anuradhapura", "Matale", "Jaffna", "Trincomalee", "Nuwara Eliya"]} />
                            <FormSelect label={t("signin.hotelType")} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={["Select type", "Boutique Hotel", "5-Star Resort", "Guest House", "Tourist Hotel", "Eco Resort", "Heritage Hotel", "Villa"]} />
                            <Input label={t("signin.availableRooms")} type="number" value={form.rooms} onChange={e => setForm(p => ({ ...p, rooms: e.target.value }))} placeholder="10" />
                            <Input label={t("signin.location")} type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder={t("signin.locationPlaceholder")} />
                        </>
                    )}
                </div>

                {error && (
                    <div style={{ marginTop: 16, background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 10, padding: "10px 16px", color: "#c0392b", fontSize: "0.87rem" }}>
                        ⚠️ {error}
                    </div>
                )}

                <button onClick={handleSubmit} disabled={loading}
                    style={{ width: "100%", marginTop: 24, background: loading ? "#aaa" : "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", padding: "15px", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "1rem", boxShadow: "0 6px 20px rgba(10,127,165,0.3)", fontFamily: "inherit" }}>
                    {loading ? t("signin.waiting") : mode === "login" ? t("signin.signInBtn") : t("signin.submitBtn")}
                </button>

                <p style={{ textAlign: "center", marginTop: 18, fontSize: "0.78rem", color: "#6b8999" }}>
                    {t("signin.securedBy")}
                </p>
            </div>
        </div>
    );
}

export default HotelSigninPage;
