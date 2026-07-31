import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { loginHotel, registerHotelAuth, saveHotelRegistration, getHotelProfile } from "../data/firebase";
import { IMG_AERIAL } from "../constants";

const SIDEBAR_SLIDES = [
  {
    title: "AI-Powered Demand Forecasting",
    desc: "Predict booking demand spikes and optimize occupancy using advanced machine learning models.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    stat: "+35% Revenue"
  },
  {
    title: "1-Click GPT Social Marketing",
    desc: "Generate complete 30-day social media campaigns and hashtag banks automatically from your hotel metrics.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    stat: "Save 15+ Hours/Mo"
  },
  {
    title: "Multilingual Guest Support",
    desc: "Engage global travellers with auto-translated reviews and automated Dialogflow eco-assistance.",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80",
    stat: "8+ Languages"
  },
  {
    title: "Realtime Analytics Dashboard",
    desc: "Monitor check-ins, occupancy percentages, and revenue streams live from Firebase Realtime Database.",
    image: IMG_AERIAL || "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80",
    stat: "100% Live Sync"
  }
];

function HotelSigninPage({ setPage, setHotelUser }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState("login"); // login | register
  const [slideIdx, setSlideIdx] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Form Fields State
  const [form, setForm] = useState({
    hotelName: "",
    email: "",
    password: "",
    contact: "",
    district: "",
    type: "",
    rooms: "",
    location: "",
    lat: "",
    lng: ""
  });

  // Wizard state (for Registration)
  const [step, setStep] = useState(1); // Step 1: Account, Step 2: Specs, Step 3: Location

  // Status States
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Slide rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % SIDEBAR_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!form.hotelName) { setError(t("signin.errHotelName") || "Hotel name is required."); return; }
      if (!form.email || !form.password) { setError(t("signin.errEmailPassword") || "Email and password are required."); return; }
      if (form.password.length < 6) { setError(t("signin.errWeakPassword") || "Password should be at least 6 characters."); return; }
      setStep(2);
    } else if (step === 2) {
      if (!form.type || form.type === (t("signin.selectType") || "Select type")) { setError("Please select a hotel type."); return; }
      if (!form.district || form.district === (t("signin.selectDistrict") || "Select district")) { setError("Please select a district."); return; }
      if (!form.rooms || parseInt(form.rooms) <= 0) { setError("Please enter a valid number of available rooms."); return; }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    // Validate Sign In
    if (mode === "login") {
      if (!form.email || !form.password) {
        setError(t("signin.errEmailPassword") || "Email and password are required.");
        return;
      }
    } else {
      // Validate Final Step Registration
      if (!form.location) { setError("Location address is required."); return; }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const cred = await loginHotel(form.email, form.password);
        const profile = await getHotelProfile(form.email);
        setHotelUser({
          uid: cred.user.uid,
          email: cred.user.email,
          hotelName: profile?.hotelName || form.email.split("@")[0],
          district: profile?.district || "",
          type: profile?.type || "",
          id: profile?.id || cred.user.uid,
          status: profile?.status || "approved",
        });
        setPage("hotelDashboard");
      } else {
        // Register Hotel Account
        await registerHotelAuth(form.email, form.password);
        await saveHotelRegistration({
          hotelName: form.hotelName,
          email: form.email,
          contact: form.contact,
          district: form.district,
          type: form.type,
          rooms: form.rooms,
          location: form.location,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null
        });
        setDone(true);
      }
    } catch (err) {
      console.error(err);
      const msg = err.code === "auth/user-not-found" ? t("signin.errNotFound")
        : err.code === "auth/wrong-password" ? t("signin.errWrongPassword")
          : err.code === "auth/invalid-credential" ? t("signin.errInvalidCred")
            : err.code === "auth/email-already-in-use" ? t("signin.errEmailInUse")
              : err.code === "auth/weak-password" ? t("signin.errWeakPassword")
                : err.message || t("signin.errGeneric") || "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Success Confirmation Screen
  if (done) return (
    <div style={styles.successContainer}>
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .success-card {
          animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          backdrop-filter: blur(25px);
          background: rgba(10, 22, 38, 0.75);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 50px 40px;
          text-align: center;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          color: #fff;
        }
        .checkmark-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(23, 196, 184, 0.1);
          border: 2px dashed #17c4b8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 2.5rem;
          color: #17c4b8;
        }
      `}</style>

      <div className="success-card">
        <div className="checkmark-icon">🏨</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.1rem", marginBottom: 12, fontWeight: 600 }}>
          {t("signin.doneTitle") || "Registration Submitted!"}
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 24 }}>
          {t("signin.doneMsg") || "Your hotel registration is saved. Our team will review and approve within 48 hours. Then you can sign in to access your dashboard."}
        </p>
        <div style={{ background: "rgba(23, 196, 184, 0.1)", borderRadius: 12, padding: "12px 20px", marginBottom: 30, color: "#17c4b8", fontSize: "0.85rem", fontWeight: 700, display: "inline-block", border: "1px solid rgba(23, 196, 184, 0.2)" }}>
          {t("signin.savedFirebase") || "Saved to Firebase Realtime Database"}
        </div>
        <br />
        <button 
          onClick={() => setPage("hotels")} 
          style={{
            background: "linear-gradient(135deg, #17c4b8 0%, #0a7fa5 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "14px 32px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.95rem",
            fontFamily: "inherit",
            boxShadow: "0 6px 20px rgba(23, 196, 184, 0.25)",
            transition: "all 0.3s ease"
          }}
        >
          {t("signin.viewListings") || "View Hotel Listings"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Dynamic CSS injections */}
      <style>{`
        @keyframes floatPulse {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.03); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes cardSlideUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
        .glowing-bg {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          z-index: 0;
          opacity: 0.35;
          animation: floatPulse 12s ease-in-out infinite;
        }
        .partner-card {
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
          animation: cardSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 1080px;
          min-height: 680px;
          background: rgba(10, 22, 38, 0.55);
          border-radius: 32px;
          overflow: hidden;
          z-index: 1;
        }
        @media (max-width: 868px) {
          .partner-card {
            grid-template-columns: 1fr;
            margin: 20px;
            min-height: auto;
          }
          .partner-sidebar {
            display: none !important;
          }
        }
        .hotel-tab {
          background: transparent;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          transition: all 0.3s;
          position: relative;
        }
        .hotel-tab.active {
          color: #17c4b8;
        }
        .partner-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: rgba(255, 255, 255, 0.02);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          font-size: 0.92rem;
          color: #fff;
          outline: none;
          font-family: inherit;
          transition: all 0.3s ease;
        }
        .partner-input:focus {
          border-color: #17c4b8;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 20px rgba(23, 196, 184, 0.18);
        }
        .partner-select {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: rgba(255, 255, 255, 0.02);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          font-size: 0.92rem;
          color: #fff;
          outline: none;
          font-family: inherit;
          transition: all 0.3s ease;
          appearance: none;
          cursor: pointer;
        }
        .partner-select:focus {
          border-color: #17c4b8;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 20px rgba(23, 196, 184, 0.18);
        }
        .action-btn {
          background: linear-gradient(135deg, #17c4b8 0%, #0a7fa5 100%);
          transition: all 0.3s ease;
          color: #fff;
          border: none;
          cursor: pointer;
          font-weight: 700;
          box-shadow: 0 6px 20px rgba(23, 196, 184, 0.25);
        }
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(23, 196, 184, 0.4);
        }
        .secondary-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.25s;
          font-weight: 600;
        }
        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        .slide-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          transition: all 0.3s;
        }
        .slide-indicator.active {
          background: #17c4b8;
          width: 20px;
          border-radius: 3px;
        }
        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .step-circle.active {
          background: #17c4b8;
          border-color: #17c4b8;
          color: #071524;
          box-shadow: 0 0 15px rgba(23, 196, 184, 0.3);
        }
        .step-circle.completed {
          background: rgba(23, 196, 184, 0.15);
          border-color: #17c4b8;
          color: #17c4b8;
        }
        .step-connector {
          flex: 1;
          height: 2px;
          background: rgba(255, 255, 255, 0.06);
          margin: 0 8px;
          transition: all 0.3s ease;
        }
        .step-connector.active {
          background: #17c4b8;
        }
      `}</style>

      {/* Decorative Lights */}
      <div className="glowing-bg" style={{ top: "10%", right: "10%", width: 450, height: 450, background: "rgba(10,127,165,0.22)" }} />
      <div className="glowing-bg" style={{ bottom: "10%", left: "10%", width: 400, height: 400, background: "rgba(23,196,184,0.18)", animationDelay: "-3s" }} />

      <div className="partner-card">
        
        {/* Left Side: Business & Value Showcase */}
        <div className="partner-sidebar" style={styles.sidebar}>
          {SIDEBAR_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "opacity 1.5s ease-in-out, transform 6s ease-out",
                opacity: slideIdx === idx ? 1 : 0,
                transform: slideIdx === idx ? "scale(1.05)" : "scale(1)",
                zIndex: 0,
              }}
            />
          ))}

          {/* Gradient overlay */}
          <div style={styles.sidebarOverlay} />

          {/* Top Brand Tag */}
          <div style={styles.sidebarHeader}>
            <div style={styles.logoBadge}>🏨</div>
            <div>
              <strong style={styles.logoText}>HOTELECO PRO</strong>
              <div style={styles.logoSub}>PARTNER NETWORK</div>
            </div>
          </div>

          {/* Highlight Slide Card */}
          <div style={styles.slideCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={styles.slideKey}>PLATFORM MODULE</span>
              <span style={styles.statBadge}>{SIDEBAR_SLIDES[slideIdx].stat}</span>
            </div>
            
            <div style={{ minHeight: 90 }}>
              <h2 style={styles.slideTitle}>{SIDEBAR_SLIDES[slideIdx].title}</h2>
              <p style={styles.slideDesc}>{SIDEBAR_SLIDES[slideIdx].desc}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>PARTNER BENEFITS</span>
              {/* Dots */}
              <div style={{ display: "flex", gap: 6 }}>
                {SIDEBAR_SLIDES.map((_, idx) => (
                  <div key={idx} className={`slide-indicator ${slideIdx === idx ? "active" : ""}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Footer certification */}
          <div style={styles.sidebarFooter}>
            <span>🔒 Protected with Enterprise SSL & Firebase Vault</span>
          </div>
        </div>

        {/* Right Side: Tabbed Interactive Portal Forms */}
        <div style={styles.formContainer}>
          
          {/* Custom Tabs selector */}
          <div style={styles.tabContainer}>
            <div style={{ display: "flex", position: "relative", gap: 12 }}>
              <button 
                onClick={() => { setMode("login"); setError(""); setStep(1); }}
                className={`hotel-tab ${mode === "login" ? "active" : ""}`}
              >
                {t("signin.signInTab") || "Sign In"}
              </button>
              <button 
                onClick={() => { setMode("register"); setError(""); }}
                className={`hotel-tab ${mode === "register" ? "active" : ""}`}
              >
                {t("signin.registerTab") || "Register Hotel"}
              </button>
              {/* Sliding Bottom Accent Bar */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: mode === "login" ? 0 : 96,
                width: mode === "login" ? 80 : 150,
                height: 3,
                backgroundColor: "#17c4b8",
                borderRadius: 2,
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
              }} />
            </div>
          </div>

          {/* Header Title */}
          <div style={{ marginBottom: mode === "register" ? 18 : 24 }}>
            <h2 style={styles.formTitle}>
              {mode === "login" ? "Partner Console" : "Register Your Property"}
            </h2>
            <p style={styles.formSub}>
              {mode === "login" 
                ? "Access your dashboard to manage bookings, track revenue forecasting, and run marketing." 
                : "Fill in the property details to apply for verification and join Ceylon's premier network."}
            </p>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {/* --- LOGIN FORM --- */}
          {mode === "login" && (
            <form onSubmit={handleSubmit} style={styles.formBody}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Email Address */}
                <div style={{ position: "relative" }}>
                  <label style={styles.inputLabel}>{t("signin.emailAddress") || "Email Address"}</label>
                  <span style={styles.fieldIcon}>✉️</span>
                  <input 
                    type="email" 
                    className="partner-input"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="hotel@email.com" 
                    required
                  />
                </div>
                
                {/* Password */}
                <div style={{ position: "relative" }}>
                  <label style={styles.inputLabel}>{t("signin.password") || "Password"}</label>
                  <span style={styles.fieldIcon}>🔒</span>
                  <input 
                    type={passwordVisible ? "text" : "password"} 
                    className="partner-input"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••" 
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    style={styles.passwordToggleBtn}
                  >
                    {passwordVisible ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="action-btn" style={styles.submitBtn}>
                {loading ? (
                  <div style={styles.spinnerContainer}>
                    <div style={styles.spinner} />
                    <span>{t("signin.waiting") || "Please wait…"}</span>
                  </div>
                ) : (
                  t("signin.signInBtn") || "Sign In to Dashboard →"
                )}
              </button>
            </form>
          )}

          {/* --- REGISTER WIZARD FORM --- */}
          {mode === "register" && (
            <div style={styles.formBody}>
              
              {/* Step indicator bar */}
              <div style={styles.stepIndicatorRow}>
                <div className={`step-circle ${step === 1 ? "active" : "completed"}`}>1</div>
                <div className={`step-connector ${step > 1 ? "active" : ""}`} />
                <div className={`step-circle ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>2</div>
                <div className={`step-connector ${step > 2 ? "active" : ""}`} />
                <div className={`step-circle ${step === 3 ? "active" : ""}`}>3</div>
              </div>
              <div style={styles.stepLabelsRow}>
                <span style={{ color: step >= 1 ? "#17c4b8" : "rgba(255,255,255,0.3)" }}>Account</span>
                <span style={{ color: step >= 2 ? "#17c4b8" : "rgba(255,255,255,0.3)" }}>Specs</span>
                <span style={{ color: step >= 3 ? "#17c4b8" : "rgba(255,255,255,0.3)" }}>Location</span>
              </div>

              {/* Wizard Step 1: Account Setup */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>{t("signin.hotelName") || "Hotel Name"}</label>
                    <span style={styles.fieldIcon}>🏨</span>
                    <input 
                      type="text"
                      className="partner-input"
                      value={form.hotelName}
                      onChange={e => setForm(p => ({ ...p, hotelName: e.target.value }))}
                      placeholder={t("signin.hotelNamePlaceholder") || "Your hotel name"}
                      required
                    />
                  </div>

                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>{t("signin.contactNumber") || "Contact Number"}</label>
                    <span style={styles.fieldIcon}>📞</span>
                    <input 
                      type="tel"
                      className="partner-input"
                      value={form.contact}
                      onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                      placeholder="+94 77 123 4567"
                      required
                    />
                  </div>

                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>{t("signin.emailAddress") || "Email Address"}</label>
                    <span style={styles.fieldIcon}>✉️</span>
                    <input 
                      type="email"
                      className="partner-input"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="hotel@email.com"
                      required
                    />
                  </div>

                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>{t("signin.password") || "Password"}</label>
                    <span style={styles.fieldIcon}>🔒</span>
                    <input 
                      type={passwordVisible ? "text" : "password"}
                      className="partner-input"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={styles.passwordToggleBtn}
                    >
                      {passwordVisible ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>
              )}

              {/* Wizard Step 2: Property Specifications */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>{t("signin.hotelType") || "Hotel Type"}</label>
                    <span style={styles.fieldIcon}>⭐️</span>
                    <select
                      className="partner-select"
                      value={form.type}
                      onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                      required
                    >
                      {[t("signin.selectType") || "Select type", "Boutique Hotel", "Heritage Hotel", "5-Star Resort", "Eco Resort", "Wildlife Resort", "Boutique Villa", "Guest House", "Tourist Hotel", "Villa"].map(opt => (
                        <option key={opt} value={opt} style={{ background: "#0b1521", color: "#fff" }}>{opt}</option>
                      ))}
                    </select>
                    <span style={{ position: "absolute", right: 16, top: "54%", color: "rgba(255,255,255,0.4)", pointerEvents: "none" }}>▼</span>
                  </div>

                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>{t("signin.district") || "District"}</label>
                    <span style={styles.fieldIcon}>📍</span>
                    <select
                      className="partner-select"
                      value={form.district}
                      onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                      required
                    >
                      {[t("signin.selectDistrict") || "Select district", "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Mathara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"].map(opt => (
                        <option key={opt} value={opt} style={{ background: "#0b1521", color: "#fff" }}>{opt}</option>
                      ))}
                    </select>
                    <span style={{ position: "absolute", right: 16, top: "54%", color: "rgba(255,255,255,0.4)", pointerEvents: "none" }}>▼</span>
                  </div>

                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>{t("signin.availableRooms") || "Available Rooms"}</label>
                    <span style={styles.fieldIcon}>🚪</span>
                    <input 
                      type="number"
                      className="partner-input"
                      value={form.rooms}
                      onChange={e => setForm(p => ({ ...p, rooms: e.target.value }))}
                      placeholder="10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Wizard Step 3: Location Details */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>{t("signin.location") || "Street Address"}</label>
                    <span style={styles.fieldIcon}>🗺️</span>
                    <input 
                      type="text"
                      className="partner-input"
                      value={form.location}
                      onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      placeholder={t("signin.locationPlaceholder") || "e.g. 123, Galle Road, Hikkaduwa"}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", gap: "14px" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <label style={styles.inputLabel}>{t("signin.latitude") || "Latitude"}</label>
                      <span style={styles.fieldIcon}>🌐</span>
                      <input 
                        type="number"
                        className="partner-input"
                        value={form.lat}
                        onChange={e => setForm(p => ({ ...p, lat: e.target.value }))}
                        placeholder="e.g. 6.123"
                        step="any"
                      />
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                      <label style={styles.inputLabel}>{t("signin.longitude") || "Longitude"}</label>
                      <span style={styles.fieldIcon}>🌐</span>
                      <input 
                        type="number"
                        className="partner-input"
                        value={form.lng}
                        onChange={e => setForm(p => ({ ...p, lng: e.target.value }))}
                        placeholder="e.g. 80.123"
                        step="any"
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.4, marginTop: 4 }}>
                    💡 Coordinates help guests find your property on the Ceylon Interactive Map. If unknown, they can be configured later.
                  </p>
                </div>
              )}

              {/* Navigation controls */}
              <div style={styles.wizardNavigation}>
                {step > 1 && (
                  <button type="button" onClick={handlePrevStep} className="secondary-btn" style={styles.wizardBtn}>
                    ← Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={handleNextStep} className="action-btn" style={{ ...styles.wizardBtn, flex: 1 }}>
                    Continue →
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading} className="action-btn" style={{ ...styles.wizardBtn, flex: 1 }}>
                    {loading ? (
                      <div style={styles.spinnerContainer}>
                        <div style={styles.spinner} />
                        <span>Registering...</span>
                      </div>
                    ) : (
                      t("signin.submitBtn") || "Submit Hotel Registration →"
                    )}
                  </button>
                )}
              </div>

            </div>
          )}

          {/* Brand stamp footer */}
          <div style={styles.formFooter}>
            <span style={styles.backBtn} onClick={() => setPage("home")}>
              ← Back to Homepage
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: 100,
    paddingBottom: 80,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at center, #06111f 0%, #010408 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Outfit', sans-serif",
  },
  successContainer: {
    paddingTop: 100,
    paddingBottom: 80,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at center, #06111f 0%, #010408 100%)",
    padding: "20px"
  },
  sidebar: {
    position: "relative",
    padding: "50px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
  },
  sidebarOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "linear-gradient(135deg, rgba(6, 17, 31, 0.65) 0%, rgba(1, 4, 8, 0.96) 100%)",
    zIndex: 1,
  },
  sidebarHeader: {
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  logoBadge: {
    fontSize: "1.7rem",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "14px",
    padding: "4px 8px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  logoText: {
    color: "#fff",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "1.1rem",
    fontWeight: 800,
    letterSpacing: "3px",
    display: "block",
  },
  logoSub: {
    fontSize: "0.68rem",
    color: "#17c4b8",
    fontWeight: 700,
    letterSpacing: "1.5px",
  },
  slideCard: {
    zIndex: 2,
    background: "rgba(10, 22, 38, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "24px 28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  slideKey: {
    color: "#17c4b8",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "3.5px",
  },
  statBadge: {
    background: "rgba(23, 196, 184, 0.15)",
    color: "#17c4b8",
    borderRadius: "8px",
    padding: "4px 10px",
    fontSize: "0.78rem",
    fontWeight: 700,
    border: "1px solid rgba(23, 196, 184, 0.25)",
  },
  slideTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.55rem",
    lineHeight: 1.3,
    color: "#fff",
    fontWeight: 600,
    marginBottom: 8,
  },
  slideDesc: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "0.85rem",
    lineHeight: 1.5,
  },
  sidebarFooter: {
    zIndex: 2,
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  formContainer: {
    padding: "50px 48px",
    background: "rgba(7, 16, 28, 0.7)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  tabContainer: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: 2,
    marginBottom: 24,
  },
  formTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.85rem",
    color: "#fff",
    fontWeight: 600,
    marginBottom: 8,
  },
  formSub: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: "0.88rem",
    lineHeight: 1.5,
  },
  errorBox: {
    background: "rgba(231, 76, 60, 0.08)",
    borderLeft: "4px solid #e74c3c",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#e74c3c",
    fontSize: "0.85rem",
    fontWeight: 500,
    marginBottom: 20,
  },
  formBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  inputLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.45)",
    display: "block",
    marginBottom: 8,
  },
  fieldIcon: {
    position: "absolute",
    left: 15,
    top: "56%",
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: "1.05rem",
    pointerEvents: "none",
  },
  passwordToggleBtn: {
    position: "absolute",
    right: 15,
    top: "54%",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: "1.1rem",
    outline: "none",
    padding: 0,
  },
  submitBtn: {
    width: "100%",
    borderRadius: 14,
    padding: "16px 24px",
    fontSize: "0.98rem",
    marginTop: 28,
  },
  spinnerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  spinner: {
    width: 20,
    height: 20,
    border: "2.5px solid rgba(255,255,255,0.2)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  formFooter: {
    marginTop: 24,
    textAlign: "center",
  },
  backBtn: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "color 0.25s",
    padding: "5px 10px",
    borderRadius: "8px",
  },
  stepIndicatorRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepLabelsRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0 10px",
    fontSize: "0.72rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: 28,
  },
  wizardNavigation: {
    display: "flex",
    gap: 12,
    marginTop: 28,
  },
  wizardBtn: {
    padding: "14px 24px",
    borderRadius: 14,
    fontSize: "0.95rem",
  }
};

export default HotelSigninPage;
