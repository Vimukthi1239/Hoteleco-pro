import { useState, useEffect } from "react";
import { registerCustomer, loginCustomer } from "../data/firebase";

const SLOGANS = [
  {
    text: "Experience golden beaches and gentle breezes.",
    location: "Mirissa, Sri Lanka",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    text: "Witness majestic elephants in wild safaris.",
    location: "Yala National Park, Sri Lanka",
    image: "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=1200&q=80"
  },
  {
    text: "Wander through centuries of ancient temples.",
    location: "Sigiriya & Kandy, Sri Lanka",
    image: "https://images.unsplash.com/photo-1588598130841-3837f1a8c8aa?auto=format&fit=crop&w=1200&q=80"
  },
  {
    text: "An eco-friendly paradise is waiting for you.",
    location: "Ella Hills, Sri Lanka",
    image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80"
  }
];

const CEYLON_COUNTRY = { name: "Sri Lanka", dial: "+94", flag: "🇱🇰" };
const OTHER_COUNTRIES = [
  { name: "India", dial: "+91", flag: "🇮🇳" },
  { name: "China", dial: "+86", flag: "🇨🇳" },
  { name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { name: "United States", dial: "+1", flag: "🇺🇸" },
  { name: "Germany", dial: "+49", flag: "🇩🇪" },
  { name: "Russia", dial: "+7", flag: "🇷🇺" },
  { name: "France", dial: "+33", flag: "🇫🇷" },
  { name: "Australia", dial: "+61", flag: "🇦🇺" },
  { name: "Japan", dial: "+81", flag: "🇯🇵" },
  { name: "Maldives", dial: "+960", flag: "🇲🇻" },
  { name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { name: "Canada", dial: "+1", flag: "🇨🇦" },
  { name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { name: "Qatar", dial: "+974", flag: "🇶🇦" },
  { name: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { name: "Thailand", dial: "+66", flag: "🇹🇭" },
  { name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { name: "Italy", dial: "+39", flag: "🇮🇹" },
  { name: "Spain", dial: "+34", flag: "🇪🇸" },
  { name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { name: "Norway", dial: "+47", flag: "🇳🇴" },
  { name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
  { name: "Nepal", dial: "+977", flag: "🇳🇵" },
  { name: "Afghanistan", dial: "+93", flag: "🇦🇫" },
  { name: "Albania", dial: "+355", flag: "🇦🇱" },
  { name: "Algeria", dial: "+213", flag: "🇩🇿" },
  { name: "Andorra", dial: "+376", flag: "🇦🇩" },
  { name: "Angola", dial: "+244", flag: "🇦🇴" },
  { name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { name: "Armenia", dial: "+374", flag: "🇦🇲" },
  { name: "Austria", dial: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", dial: "+994", flag: "🇦🇿" },
  { name: "Bahamas", dial: "+1", flag: "🇧🇸" },
  { name: "Bahrain", dial: "+973", flag: "🇧🇭" },
  { name: "Belarus", dial: "+375", flag: "🇧🇾" },
  { name: "Belgium", dial: "+32", flag: "🇧🇪" },
  { name: "Bhutan", dial: "+975", flag: "🇧🇹" },
  { name: "Bolivia", dial: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", dial: "+387", flag: "🇧🇦" },
  { name: "Botswana", dial: "+267", flag: "🇧🇼" },
  { name: "Brunei", dial: "+673", flag: "🇧🇳" },
  { name: "Bulgaria", dial: "+359", flag: "🇧🇬" },
  { name: "Cambodia", dial: "+855", flag: "🇰🇭" },
  { name: "Chile", dial: "+56", flag: "🇨🇱" },
  { name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { name: "Croatia", dial: "+385", flag: "🇭🇷" },
  { name: "Cuba", dial: "+53", flag: "🇨🇺" },
  { name: "Cyprus", dial: "+357", flag: "🇨🇾" },
  { name: "Czech Republic", dial: "+420", flag: "🇨🇿" },
  { name: "Denmark", dial: "+45", flag: "🇩🇰" },
  { name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { name: "Egypt", dial: "+20", flag: "🇪🇬" },
  { name: "Estonia", dial: "+372", flag: "🇪🇪" },
  { name: "Ethiopia", dial: "+251", flag: "🇪🇹" },
  { name: "Fiji", dial: "+679", flag: "🇫🇯" },
  { name: "Finland", dial: "+358", flag: "🇫🇮" },
  { name: "Georgia", dial: "+995", flag: "🇬🇪" },
  { name: "Ghana", dial: "+233", flag: "🇬🇭" },
  { name: "Greece", dial: "+30", flag: "🇬🇷" },
  { name: "Hong Kong", dial: "+852", flag: "🇭🇰" },
  { name: "Hungary", dial: "+36", flag: "🇭🇺" },
  { name: "Iceland", dial: "+354", flag: "🇮🇸" },
  { name: "Iran", dial: "+98", flag: "🇮🇷" },
  { name: "Iraq", dial: "+964", flag: "🇮🇶" },
  { name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { name: "Israel", dial: "+972", flag: "🇮🇱" },
  { name: "Jamaica", dial: "+1", flag: "🇯🇲" },
  { name: "Jordan", dial: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", dial: "+7", flag: "🇰🇿" },
  { name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { name: "Kuwait", dial: "+965", flag: "🇰🇼" },
  { name: "Lebanon", dial: "+961", flag: "🇱🇧" },
  { name: "Luxembourg", dial: "+352", flag: "🇱🇺" },
  { name: "Macau", dial: "+853", flag: "🇲🇴" },
  { name: "Mauritius", dial: "+230", flag: "🇲🇺" },
  { name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { name: "Monaco", dial: "+377", flag: "🇲🇨" },
  { name: "Mongolia", dial: "+976", flag: "🇲🇳" },
  { name: "Morocco", dial: "+212", flag: "🇲🇦" },
  { name: "Myanmar", dial: "+95", flag: "🇲🇲" },
  { name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { name: "Oman", dial: "+968", flag: "🇴🇲" },
  { name: "Panama", dial: "+507", flag: "🇵🇦" },
  { name: "Peru", dial: "+51", flag: "🇵🇪" },
  { name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { name: "Poland", dial: "+48", flag: "🇵🇱" },
  { name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { name: "Romania", dial: "+40", flag: "🇷🇴" },
  { name: "Seychelles", dial: "+248", flag: "🇸🇨" },
  { name: "Slovakia", dial: "+421", flag: "🇸🇰" },
  { name: "Slovenia", dial: "+386", flag: "🇸🇮" },
  { name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { name: "Taiwan", dial: "+886", flag: "🇹🇼" },
  { name: "Turkey", dial: "+90", flag: "🇹🇷" },
  { name: "Ukraine", dial: "+380", flag: "🇺🇦" },
  { name: "Vietnam", dial: "+84", flag: "🇻🇳" }
].sort((a, b) => a.name.localeCompare(b.name));

const COUNTRIES = [CEYLON_COUNTRY, ...OTHER_COUNTRIES];

export default function CustomerAuthPage({ setPage, setCustomerUser, redirectOnSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [sloganIdx, setSloganIdx] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState("");

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Slogan rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSloganIdx((prev) => (prev + 1) % SLOGANS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCountryChange = (countryName) => {
    const found = COUNTRIES.find(c => c.name === countryName);
    if (found) {
      setSelectedCountry(found);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }
    if (isRegister && (!fullName || !selectedCountry)) {
      setError("Please fill in your name and select your country.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        // Prepare combined phone field: e.g. "+94 771234567"
        const fullPhone = phone ? `${selectedCountry.dial} ${phone}` : "";
        // Register Customer (Store country name under nationality field for DB schema compatibility)
        const user = await registerCustomer(email, password, fullName, selectedCountry.name, fullPhone);
        setCustomerUser(user);
      } else {
        // Login Customer
        const user = await loginCustomer(email, password);
        setCustomerUser(user);
      }
      // Redirect on success
      setPage(redirectOnSuccess || "home");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already in use.");
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* CSS Styles injection for rich aesthetics and responsive designs */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatEffect {
          0% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-20px) rotate(4deg) scale(1.05); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); }
        }
        @keyframes cardFadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
        @keyframes slideFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .glowing-light {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          z-index: 0;
          opacity: 0.35;
          animation: floatEffect 15s ease-in-out infinite;
        }
        .luxury-card {
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
          animation: cardFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 1050px;
          min-height: 650px;
          background: rgba(10, 22, 38, 0.5);
          border-radius: 32px;
          overflow: hidden;
          z-index: 1;
        }
        @media (max-width: 868px) {
          .luxury-card {
            grid-template-columns: 1fr;
            margin: 20px;
            min-height: auto;
          }
          .showcase-panel {
            display: none !important;
          }
        }
        .tab-btn {
          background: transparent;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
        }
        .tab-btn.active {
          color: #17c4b8;
        }
        .glow-input {
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
        .glow-input:focus {
          border-color: #17c4b8;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 20px rgba(23, 196, 184, 0.18);
        }
        .glow-select {
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
        .glow-select:focus {
          border-color: #17c4b8;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 20px rgba(23, 196, 184, 0.18);
        }
        .btn-hover-effect {
          background: linear-gradient(135deg, #17c4b8 0%, #0a7fa5 100%);
          transition: all 0.3s ease;
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(23, 196, 184, 0.4);
        }
        .btn-hover-effect:active {
          transform: translateY(0px);
        }
        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          margin: 0 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .indicator-dot.active {
          background: #17c4b8;
          width: 24px;
          border-radius: 4px;
        }
        .progress-bar-container {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 15px;
        }
        .progress-bar-fill {
          height: 100%;
          background: #17c4b8;
          animation: slideFill 5s linear infinite;
        }
      `}</style>

      {/* Dynamic Floating Glow Lights */}
      <div className="glowing-light" style={{ top: "8%", left: "12%", width: 400, height: 400, background: "rgba(23,196,184,0.22)" }} />
      <div className="glowing-light" style={{ bottom: "8%", right: "12%", width: 450, height: 450, background: "rgba(10,127,165,0.18)", animationDelay: "-4s" }} />
      <div className="glowing-light" style={{ top: "45%", left: "40%", width: 300, height: 300, background: "rgba(23,196,184,0.12)", animationDelay: "-8s" }} />

      <div className="luxury-card">
        
        {/* Left Side: Creative Dynamic Destination Showcase */}
        <div className="showcase-panel" style={styles.sidebar}>
          {/* Dynamic Crossfade Image layers */}
          {SLOGANS.map((slogan, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${slogan.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "opacity 1.5s ease-in-out, transform 5.5s ease-out",
                opacity: sloganIdx === idx ? 1 : 0,
                transform: sloganIdx === idx ? "scale(1.05)" : "scale(1)",
                zIndex: 0,
              }}
            />
          ))}

          {/* Vignette & Color Grading Overlays */}
          <div style={styles.sidebarOverlay} />
          
          {/* Top Brand Header */}
          <div style={{ ...styles.sidebarHeader, flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <img 
                src="/images/logo_full.png" 
                alt="Ceylon Nature Logo" 
                style={{ height: 56, objectFit: "contain" }} 
            />
            <div style={styles.logoSub}>ECO-TRAVEL PORTAL</div>
          </div>

          {/* Slogan details overlay with blur background */}
          <div style={styles.sloganGlassBox}>
            <span style={styles.sloganKey}>DISCOVER HERITAGE</span>
            <div style={{ minHeight: 90 }}>
              <h2 style={styles.sloganText}>"{SLOGANS[sloganIdx].text}"</h2>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span style={styles.sloganLocation}>📍 {SLOGANS[sloganIdx].location}</span>
              {/* Progress dots */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {SLOGANS.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`indicator-dot ${sloganIdx === idx ? "active" : ""}`}
                    onClick={() => setSloganIdx(idx)}
                  />
                ))}
              </div>
            </div>
            {/* Auto rotating indicator bar */}
            <div className="progress-bar-container">
              <div key={sloganIdx} className="progress-bar-fill" />
            </div>
          </div>

          {/* Bottom Trust Stamp */}
          <div style={styles.sidebarFooter}>
            <span>🌿 Sustainable Eco-Certified Hospitality Platform</span>
          </div>
        </div>

        {/* Right Side: Account Interactive Forms */}
        <div style={styles.formContainer}>
          
          {/* Custom Tabs */}
          <div style={styles.tabContainer}>
            <div style={{ display: "flex", position: "relative", gap: 12 }}>
              <button 
                onClick={() => { setIsRegister(false); setError(""); }}
                className={`tab-btn ${!isRegister ? "active" : ""}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsRegister(true); setError(""); }}
                className={`tab-btn ${isRegister ? "active" : ""}`}
              >
                Create Account
              </button>
              {/* Sliding Bottom Accent Bar */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: !isRegister ? 0 : 100,
                width: !isRegister ? 90 : 160,
                height: 3,
                backgroundColor: "#17c4b8",
                borderRadius: 2,
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
              }} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} style={styles.form}>
            <h2 style={styles.formTitle}>
              {isRegister ? "Start Your Eco Journey" : "Welcome Back Traveller"}
            </h2>
            <p style={styles.formSub}>
              {isRegister 
                ? "Register now to explore custom guides, unlock rewards, and plan green itineraries." 
                : "Log in to check your personalized travel diaries, dynamic tickets, and reservations."}
            </p>

            {error && <div style={styles.errorBox}>⚠️ {error}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {isRegister && (
                <>
                  {/* Full Name field */}
                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>Full Name</label>
                    <span style={styles.fieldIcon}>👤</span>
                    <input 
                      type="text"
                      className="glow-input"
                      style={{ height: "50px", boxSizing: "border-box" }}
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      placeholder="John Doe" 
                      required
                    />
                  </div>
                  
                  {/* Country Select Dropdown */}
                  <div style={{ position: "relative" }}>
                    <label style={styles.inputLabel}>Country of Residence</label>
                    <span style={styles.fieldIcon}>🌐</span>
                    <select 
                      value={selectedCountry.name} 
                      onChange={e => handleCountryChange(e.target.value)}
                      className="glow-select"
                      style={{ height: "50px", boxSizing: "border-box" }}
                      required
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.name} value={c.name} style={{ background: "#0b1521", color: "#fff" }}>
                          {c.flag} {c.name} ({c.dial})
                        </option>
                      ))}
                    </select>
                    <span style={{ position: "absolute", right: 16, top: "54%", color: "rgba(255,255,255,0.4)", pointerEvents: "none" }}>▼</span>
                  </div>

                  {/* Phone Number with Prefix */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 90, position: "relative" }}>
                      <label style={styles.inputLabel}>Prefix</label>
                      <div style={styles.prefixDisplay}>
                        <span>{selectedCountry.flag}</span>
                        <span style={{ color: "#17c4b8", fontWeight: "bold" }}>{selectedCountry.dial}</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                      <label style={styles.inputLabel}>Phone Number (Optional)</label>
                      <span style={{ ...styles.fieldIcon, left: 14 }}>📞</span>
                      <input 
                        type="tel" 
                        className="glow-input"
                        style={{ paddingLeft: 40, height: "50px", boxSizing: "border-box" }}
                        value={phone} 
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} // only numbers
                        placeholder="771234567" 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div style={{ position: "relative" }}>
                <label style={styles.inputLabel}>Email Address</label>
                <span style={styles.fieldIcon}>✉️</span>
                <input 
                  type="email" 
                  className="glow-input"
                  style={{ height: "50px", boxSizing: "border-box" }}
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="traveller@eco.com" 
                  required
                />
              </div>
              
              {/* Password */}
              <div style={{ position: "relative" }}>
                <label style={styles.inputLabel}>Password</label>
                <span style={styles.fieldIcon}>🔒</span>
                <input 
                  type={passwordVisible ? "text" : "password"} 
                  className="glow-input"
                  style={{ height: "50px", boxSizing: "border-box" }}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required
                />
                {/* Show/Hide password toggle */}
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  style={styles.passwordToggleBtn}
                >
                  {passwordVisible ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-hover-effect" style={styles.submitBtn}>
              {loading ? (
                <div style={styles.spinnerContainer}>
                  <div style={styles.spinner} />
                  <span>Processing secure authentication...</span>
                </div>
              ) : (
                isRegister ? "Join Ceylon Paradise" : "Access Personal Portal"
              )}
            </button>
          </form>

          {/* Form Footer */}
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
    background: "radial-gradient(circle at center, #071524 0%, #02070d 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Outfit', sans-serif",
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(7, 21, 36, 0.6) 0%, rgba(2, 7, 13, 0.95) 100%)",
    zIndex: 1,
  },
  sidebarHeader: {
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  logoBadge: {
    fontSize: "1.8rem",
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
    color: "#22c55e",
    fontWeight: 700,
    letterSpacing: "1.5px",
  },
  sloganGlassBox: {
    zIndex: 2,
    background: "rgba(10, 22, 38, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "24px 28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  sloganKey: {
    color: "#17c4b8",
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "3.5px",
    marginBottom: 12,
    display: "block",
  },
  sloganText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.6rem",
    lineHeight: 1.4,
    color: "#fff",
    fontWeight: 500,
  },
  sloganLocation: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  sidebarFooter: {
    zIndex: 2,
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.5px",
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
  form: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  formTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.9rem",
    color: "#fff",
    fontWeight: 600,
    marginBottom: 8,
  },
  formSub: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: "0.88rem",
    lineHeight: 1.5,
    marginBottom: 26,
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
  prefixDisplay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "14px 10px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1.5px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    fontSize: "0.92rem",
    color: "#fff",
    height: "50px",
    boxSizing: "border-box",
  },
  submitBtn: {
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "16px 24px",
    cursor: "pointer",
    fontSize: "0.98rem",
    fontWeight: 700,
    fontFamily: "inherit",
    marginTop: 28,
    boxShadow: "0 8px 30px rgba(23, 196, 184, 0.2)",
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
    marginTop: 28,
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
  }
};
