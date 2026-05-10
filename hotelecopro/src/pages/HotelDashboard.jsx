import { useState, useEffect, useMemo } from "react";
import {
    listenHotelBookings,
    updateBookingStatus,
    deleteBooking,
    logoutHotel,
    listenHotelProfile,
    updateHotelProfile,
    listenHotelMetrics,
    saveHotelDailyMetric,
} from "../data/firebase";

// ── Sri Lanka tourism season data ──────────────────────────────
const SEASONS = [
    { months: [12, 1, 2], name: "Peak Season", desc: "West & South Coast", icon: "☀️" },
    { months: [3, 4, 5], name: "Shoulder Season", desc: "Cultural Triangle", icon: "🌿" },
    { months: [6, 7, 8], name: "East Coast Peak", desc: "Trincomalee & Arugam Bay", icon: "🌊" },
    { months: [9, 10, 11], name: "Low Season", desc: "Budget deals opportunity", icon: "🌧️" },
];

const PLATFORMS = ["Instagram", "Facebook", "X/Twitter", "LinkedIn", "TikTok"];

const TEAL = "#17c4b8";
const NAVY = "#0f2030";
const BLUE = "#0a7fa5";

// ── Style helpers ───────────────────────────────────────────────
const card = (extra = {}) => ({
    background: "#fff",
    borderRadius: 18,
    border: "1px solid #e2ecf0",
    boxShadow: "0 2px 16px rgba(10,127,165,0.07)",
    padding: "24px",
    ...extra,
});

const thS = {
    padding: "11px 14px", textAlign: "left", fontSize: "0.7rem",
    fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
    color: "#6b8999", borderBottom: "2px solid #e2ecf0", background: "#fafcfd",
};
const tdS = {
    padding: "12px 14px", fontSize: "0.87rem", color: "#1e3a4a",
    borderBottom: "1px solid #f0f4f7", verticalAlign: "middle",
};

const statusColors = {
    confirmed: { bg: "#dbeafe", color: "#1e40af" },
    cancelled: { bg: "#f3f4f6", color: "#6b7280" },
    pending: { bg: "#fef3c7", color: "#b7791f" },
};

function Badge({ status }) {
    const c = statusColors[status] || statusColors.pending;
    return (
        <span style={{
            background: c.bg, color: c.color, fontSize: "0.7rem",
            fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            letterSpacing: 0.5, textTransform: "uppercase",
        }}>{status}</span>
    );
}

// ── Tiny button ────────────────────────────────────────────────
function Btn({ label, bg, color, onClick, disabled }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: hov ? color : bg, color: hov ? "#fff" : color,
                border: `1px solid ${color}44`, borderRadius: 7,
                padding: "4px 12px", cursor: disabled ? "not-allowed" : "pointer",
                fontFamily: "inherit", fontWeight: 600, fontSize: "0.75rem",
                transition: "all 0.18s", opacity: disabled ? 0.5 : 1,
            }}
        >{label}</button>
    );
}

// ── Simple SVG Bar Chart ────────────────────────────────────────
function BarChart({ data, labelKey, valueKey, color = TEAL, unit = "" }) {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    const W = 600, H = 160, padX = 40, padY = 10, barGap = 4;
    const barW = Math.max(4, (W - padX * 2) / data.length - barGap);

    return (
        <div style={{ overflowX: "auto" }}>
            <svg viewBox={`0 0 ${Math.max(W, data.length * (barW + barGap) + padX * 2)} ${H + 32}`}
                style={{ width: "100%", height: "auto", minWidth: 300 }}>
                {/* Y axis */}
                {[0, 0.5, 1].map(f => {
                    const y = padY + (1 - f) * H;
                    return (
                        <g key={f}>
                            <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#f0f4f7" strokeWidth={1} />
                            <text x={padX - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ab">
                                {Math.round(max * f)}{unit}
                            </text>
                        </g>
                    );
                })}
                {/* Bars */}
                {data.map((d, i) => {
                    const bH = Math.max(2, (d[valueKey] / max) * H);
                    const x = padX + i * (barW + barGap);
                    const y = padY + H - bH;
                    return (
                        <g key={i}>
                            <rect x={x} y={y} width={barW} height={bH} rx={3}
                                fill={color} opacity={0.85} />
                            <text x={x + barW / 2} y={H + padY + 20} textAnchor="middle"
                                fontSize={8} fill="#6b8999" transform={`rotate(-30,${x + barW / 2},${H + padY + 20})`}>
                                {d[labelKey]?.slice(-5)}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ── Simple SVG Line Chart ───────────────────────────────────────
function LineChart({ data, labelKey, valueKey, color = BLUE, unit = "" }) {
    const vals = data.map(d => d[valueKey]);
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals, 0);
    const range = max - min || 1;
    const W = 600, H = 140, padX = 40, padY = 10;
    const xStep = (W - padX * 2) / Math.max(data.length - 1, 1);

    const pts = data.map((d, i) => ({
        x: padX + i * xStep,
        y: padY + (1 - (d[valueKey] - min) / range) * H,
    }));
    const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");

    return (
        <div style={{ overflowX: "auto" }}>
            <svg viewBox={`0 0 ${W} ${H + 32}`} style={{ width: "100%", height: "auto", minWidth: 300 }}>
                {[0, 0.5, 1].map(f => {
                    const y = padY + (1 - f) * H;
                    return (
                        <g key={f}>
                            <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#f0f4f7" strokeWidth={1} />
                            <text x={padX - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ab">
                                {Math.round(min + range * f)}{unit}
                            </text>
                        </g>
                    );
                })}
                {/* Area fill */}
                <polygon
                    points={`${pts[0]?.x},${padY + H} ${polyline} ${pts[pts.length - 1]?.x},${padY + H}`}
                    fill={color} opacity={0.08}
                />
                <polyline points={polyline} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
                ))}
                {data.map((d, i) => (
                    <text key={i} x={pts[i].x} y={H + padY + 20} textAnchor="middle"
                        fontSize={8} fill="#6b8999"
                        transform={`rotate(-30,${pts[i].x},${H + padY + 20})`}>
                        {d[labelKey]?.slice(-5)}
                    </text>
                ))}
            </svg>
        </div>
    );
}

// ── Linear regression helper ────────────────────────────────────
function linReg(arr) {
    const n = arr.length;
    if (n < 2) return { slope: 0, intercept: arr[0] || 0 };
    const xs = arr.map((_, i) => i);
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = arr.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((a, i) => a + i * arr[i], 0);
    const sumX2 = xs.reduce((a, i) => a + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

// ── Generate synthetic daily data from real bookings ───────────
function buildDailyData(bookings, days = 30) {
    const today = new Date();
    const map = {};
    bookings.forEach(b => {
        if (!b.createdAt) return;
        const d = b.createdAt.slice(0, 10);
        if (!map[d]) map[d] = { revenue: 0, bookings: 0 };
        map[d].revenue += Number(b.totalPrice) || 0;
        map[d].bookings += 1;
    });
    // Fill last N days
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const dt = new Date(today);
        dt.setDate(dt.getDate() - i);
        const key = dt.toISOString().slice(0, 10);
        result.push({ date: key, revenue: map[key]?.revenue || 0, bookings: map[key]?.bookings || 0 });
    }
    return result;
}

// ── Seed sample data when no real data ─────────────────────────
function sampleDailyData(days = 30) {
    const today = new Date();
    return Array.from({ length: days }, (_, i) => {
        const dt = new Date(today);
        dt.setDate(dt.getDate() - (days - 1 - i));
        const base = 2400 + Math.sin(i / 5) * 800 + Math.random() * 600;
        return { date: dt.toISOString().slice(0, 10), revenue: Math.round(base), bookings: Math.floor(base / 300) };
    });
}

// ── Social Media helpers ────────────────────────────────────────
const POST_TEMPLATES = {
    Instagram: (h, d, t) => [
        `✨ Escape to paradise at ${h}! Nestled in ${d}, our ${t} offers world-class comfort & eco-friendly luxury. 🌿 Book your dream stay today! #HotelEcoPro #${d.replace(/ /g, "")}Hotel #SriLankaTourism #EcoTravel #LuxuryHotel`,
        `🌅 Wake up to breathtaking views every morning at ${h}. Your perfect ${t} experience awaits in beautiful ${d}! DM us to book. 🏨 #SriLanka #Travel #Luxury #EcoResort`,
        `💚 Sustainable luxury meets Sri Lankan hospitality at ${h}. Join us for an unforgettable eco-conscious getaway. 🌺 Link in bio to book! #GreenTravel #EcoHotel`,
    ],
    Facebook: (h, d, t) => [
        `🏨 Welcome to ${h} — your premier ${t} in ${d}, Sri Lanka!\n\nExperience the perfect blend of luxury and sustainability. Our eco-certified property offers:\n✅ Comfortable rooms with stunning views\n✅ Farm-to-table dining\n✅ Curated local experiences\n\n📞 Book now and enjoy exclusive early-bird discounts! Visit HotelEco Pro to reserve your stay.`,
        `📣 Special Offer Alert!\n\nBook your stay at ${h} this month and enjoy complimentary breakfast for two! Our ${t} in ${d} is the perfect base for exploring Sri Lanka.\n\n🗓 Limited rooms available — don't miss out!\n💬 Comment "INFO" to get details.`,
    ],
    "X/Twitter": (h, d, t) => [
        `Discover sustainable luxury at ${h} 🌿 Sri Lanka's finest ${t} in ${d}. Book now on HotelEco Pro 🔗 #SriLanka #EcoTravel #Hotel`,
        `Real Sri Lankan hospitality. Real eco-luxury. ${h} in ${d} is redefining travel. ✨ Check availability today! #Travel #SriLankaTourism`,
        `Why ${d}? Because beauty, culture & ${h} are all waiting for you 🌺 #SriLanka #LuxuryTravel #EcoHotel`,
    ],
    LinkedIn: (h, d, t) => [
        `We're proud to announce that ${h}, a leading ${t} in ${d}, Sri Lanka, is now featured on HotelEco Pro — Sri Lanka's premier sustainable hospitality platform.\n\nOur commitment to eco-friendly operations, community engagement, and exceptional guest experiences makes us a top choice for conscious travellers worldwide.\n\n🌿 Sustainable. 🏨 Luxurious. 🤝 Community-driven.\n\n#Hospitality #SustainableTourism #SriLanka #EcoHotel #HotelManagement`,
    ],
    TikTok: (h, d, t) => [
        `POV: You're staying at ${h} in ${d} 🎬✨ The most beautiful ${t} in Sri Lanka! Follow for more travel inspo 🌴 #Travel #SriLanka #HotelTour #EcoLuxury #TravelTikTok`,
        `Checking in vs checking out at ${h} 🏨💫 (We bet you won't want to leave!) #SriLanka #HotelLife #TravelVibes`,
    ],
};

function generateCalendar(hotelName, district, type) {
    const today = new Date();
    const month = today.getMonth() + 1;
    const season = SEASONS.find(s => s.months.includes(month)) || SEASONS[3];
    const posts = [];
    let dayOffset = 0;

    PLATFORMS.forEach(platform => {
        const templates = POST_TEMPLATES[platform](hotelName, district, type);
        templates.forEach((content, idx) => {
            const dt = new Date(today);
            dt.setDate(dt.getDate() + dayOffset);
            posts.push({
                date: dt.toISOString().slice(0, 10),
                platform,
                type: idx === 0 ? "Awareness" : idx === 1 ? "Promotion" : "Engagement",
                content,
            });
            dayOffset += 2;
        });
    });

    // Fill remaining days
    while (dayOffset < 30) {
        const dt = new Date(today);
        dt.setDate(dt.getDate() + dayOffset);
        const platform = PLATFORMS[dayOffset % PLATFORMS.length];
        posts.push({
            date: dt.toISOString().slice(0, 10),
            platform,
            type: "Story / Reel",
            content: `📸 Behind the scenes at ${hotelName}! ${season.icon} ${season.name} — ${season.desc}. The perfect time to visit ${district}, Sri Lanka. #BehindTheScenes #${district.replace(/ /g, "")} #${season.name.replace(/ /g, "")}`,
        });
        dayOffset += 3;
    }

    return { posts: posts.slice(0, 30), season };
}

const PLATFORM_COLORS = {
    Instagram: "#e1306c",
    Facebook: "#1877f2",
    "X/Twitter": "#000",
    LinkedIn: "#0077b5",
    TikTok: "#69C9D0",
};

// ═══════════════════════════════════════════════════════════════
//  MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════
const TABS = ["profile", "analytics", "predictions", "management", "social"];
const TAB_ICONS = { profile: "🏨", analytics: "📊", predictions: "🔮", management: "🛎", social: "📣" };
const TAB_LABELS = { profile: "Profile", analytics: "Analytics", predictions: "Predictions", management: "Management", social: "Social Media" };

export default function HotelDashboard({ hotelUser, setPage, setHotelUser }) {
    const [tab, setTab] = useState("analytics");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [filterStatus, setFilterStatus] = useState("all");
    const [copiedIdx, setCopiedIdx] = useState(null);
    const [socialPlatform, setSocialPlatform] = useState("All");

    // Profile and Metrics state
    const [hotelProfile, setHotelProfile] = useState({ photoUrl: "", desc: "", packages: [], offers: [], amenities: [] });
    const [hotelMetrics, setHotelMetrics] = useState([]);

    // Profile form state
    const [profileForm, setProfileForm] = useState({ photoUrl: "", desc: "", newAmenity: "", newPkgName: "", newPkgPrice: "", newPkgDesc: "", newOfferName: "", newOfferDiscount: "" });
    const [manualData, setManualData] = useState({ date: new Date().toISOString().slice(0, 10), revenue: "", bookings: "" });

    const hotelName = hotelUser?.hotelName || "Your Hotel";
    const district = hotelUser?.district || "Colombo";
    const hotelType = hotelUser?.type || "Hotel";

    useEffect(() => {
        setLoading(true);
        const unsub = listenHotelBookings(hotelName, (data) => {
            setBookings(data);
            setLoading(false);
        });
        return unsub;
    }, [hotelName]);

    useEffect(() => {
        if (!hotelUser?.id) return;
        const unsubProfile = listenHotelProfile(hotelUser.id, (data) => {
            if (data) setHotelProfile(data);
        });
        const unsubMetrics = listenHotelMetrics(hotelUser.id, (data) => {
            if (data) setHotelMetrics(data);
        });
        return () => {
            unsubProfile();
            unsubMetrics();
        };
    }, [hotelUser?.id]);

    const saveProfileData = async (updatedFields) => {
        if (!hotelUser?.id) return;
        try {
            await updateHotelProfile(hotelUser.id, { ...hotelProfile, ...updatedFields });
            setProfileForm(p => ({ ...p, photoUrl: "", desc: "", newAmenity: "", newPkgName: "", newPkgPrice: "", newPkgDesc: "", newOfferName: "", newOfferDiscount: "" }));
        } catch (err) {
            console.error("Error updating profile:", err);
        }
    };    // ── Analytics data ──────────────────────────────────────────
    const daily = useMemo(() => {
        let base = buildDailyData(bookings, 30);
        // Merge with manually entered metrics
        if (hotelMetrics && hotelMetrics.length > 0) {
            base = base.map(d => {
                const manual = hotelMetrics.find(m => m.date === d.date);
                if (manual) {
                    return { ...d, revenue: d.revenue + (Number(manual.revenue) || 0), bookings: d.bookings + (Number(manual.bookings) || 0) };
                }
                return d;
            });
        }
        const hasData = base.some(d => d.revenue > 0);
        return hasData ? base : sampleDailyData(30);
    }, [bookings, hotelMetrics]);

    const handleAddManualData = async () => {
        if (!hotelUser?.id || !manualData.revenue || !manualData.bookings) return;
        try {
            await saveHotelDailyMetric(hotelUser.id, manualData.date, {
                revenue: Number(manualData.revenue),
                bookings: Number(manualData.bookings),
            });
            setManualData(p => ({ ...p, revenue: "", bookings: "" }));
            alert("Data added successfully!");
        } catch (err) {
            console.error("Error adding metric:", err);
            alert("Failed to add data.");
        }
    };

    const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0);
    const totalBookingsCount = daily.reduce((s, d) => s + d.bookings, 0);
    const avgNightly = totalBookingsCount > 0 ? Math.round(totalRevenue / totalBookingsCount) : 0;
    const occupancy = Math.min(99, Math.round((totalBookingsCount / (30 * Math.max(1, Number(hotelUser?.rooms) || 10))) * 100));

    // ── Predictions ─────────────────────────────────────────────
    const prediction = useMemo(() => {
        const revArr = daily.map(d => d.revenue);
        const { slope, intercept } = linReg(revArr);
        const today = new Date();
        return Array.from({ length: 30 }, (_, i) => {
            const dt = new Date(today);
            dt.setDate(dt.getDate() + i + 1);
            const predicted = Math.max(0, Math.round(intercept + slope * (revArr.length + i)));
            return { date: dt.toISOString().slice(0, 10), revenue: predicted };
        });
    }, [daily]);

    const predTotal = prediction.reduce((s, d) => s + d.revenue, 0);
    const peakDay = prediction.reduce((best, d) => d.revenue > best.revenue ? d : best, prediction[0] || { date: "—", revenue: 0 });
    const trend = prediction[29]?.revenue > prediction[0]?.revenue ? "upward 📈" : "downward 📉";

    // ── Social calendar ─────────────────────────────────────────
    const { posts, season } = useMemo(() => generateCalendar(hotelName, district, hotelType), [hotelName, district, hotelType]);
    const safeSeason = season || SEASONS[3];
    const filteredPosts = socialPlatform === "All" ? posts : posts.filter(p => p.platform === socialPlatform);

    // ── Helpers ─────────────────────────────────────────────────
    const withLoading = async (key, fn) => {
        setActionLoading(p => ({ ...p, [key]: true }));
        try { await fn(); } catch (e) { console.error(e); }
        finally { setActionLoading(p => ({ ...p, [key]: false })); }
    };

    const handleLogout = async () => {
        await logoutHotel();
        setHotelUser(null);
        setPage("home");
    };

    const copyPost = (content, idx) => {
        navigator.clipboard.writeText(content).then(() => {
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 2000);
        });
    };

    const downloadPlan = () => {
        const lines = posts.map(p =>
            `DATE: ${p.date} | PLATFORM: ${p.platform} | TYPE: ${p.type}\n${p.content}\n${"─".repeat(60)}`
        ).join("\n\n");
        const blob = new Blob([`SOCIAL MEDIA MARKETING PLAN — ${hotelName}\nGenerated: ${new Date().toDateString()}\n\n${lines}`], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${hotelName.replace(/ /g, "_")}_social_media_plan.txt`;
        a.click();
    };

    // ── Filtered bookings ───────────────────────────────────────
    const visibleBookings = filterStatus === "all" ? bookings : bookings.filter(b => b.status === filterStatus);

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh", background: "linear-gradient(160deg,#f0f8fc 0%,#fff 60%)" }}>

            {/* ─── Header ─────────────────────────────────────────── */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a50)`, color: "#fff", padding: "36px 48px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
                    <div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 2, color: TEAL, marginBottom: 6, textTransform: "uppercase" }}>
                            🏨 Hotel Partner Dashboard
                        </div>
                        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.2rem", marginBottom: 4 }}>
                            {hotelName}
                        </h1>
                        <p style={{ opacity: 0.65, fontSize: "0.88rem" }}>
                            {hotelType} · {district} · {hotelUser?.email}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s" }}
                    >
                        🚪 Sign Out
                    </button>
                </div>

                {/* KPI cards */}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 0 }}>
                    {[
                        { label: "Total Revenue (30d)", value: `$${totalRevenue.toLocaleString()}`, icon: "💰", color: TEAL },
                        { label: "Total Bookings (30d)", value: totalBookingsCount, icon: "📋", color: "#f39c12" },
                        { label: "Avg Nightly Rate", value: `$${avgNightly}`, icon: "🛏", color: "#9b59b6" },
                        { label: "Occupancy Rate", value: `${occupancy}%`, icon: "📈", color: "#27ae60" },
                    ].map(s => (
                        <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 22px", minWidth: 155, border: "1px solid rgba(255,255,255,0.1)", flex: "1 1 140px" }}>
                            <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{s.icon}</div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: "0.73rem", opacity: 0.65, marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 0, marginTop: 28 }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: "14px 24px", border: "none", background: "transparent", cursor: "pointer",
                            fontFamily: "inherit", fontWeight: tab === t ? 700 : 400, fontSize: "0.88rem",
                            color: tab === t ? TEAL : "rgba(255,255,255,0.55)",
                            borderBottom: tab === t ? `3px solid ${TEAL}` : "3px solid transparent",
                            transition: "all 0.2s",
                        }}>
                            {TAB_ICONS[t]} {TAB_LABELS[t]}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Tab Content ─────────────────────────────────────── */}
            <div style={{ padding: "36px 48px 60px", maxWidth: 1200, margin: "0 auto" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "#6b8999" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔄</div>
                        <p style={{ fontSize: "1rem" }}>Loading your hotel data…</p>
                    </div>
                ) : (
                    <>
                        {/* ══════════ PROFILE TAB ══════════ */}
                        {tab === "profile" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                                <div>
                                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: NAVY, marginBottom: 4 }}>Customize Profile</h2>
                                    <p style={{ color: "#6b8999", fontSize: "0.88rem" }}>Update your hotel's public information, photos, packages, and offers.</p>
                                </div>

                                {/* Photo & Basic Info */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>📸 Hotel Cover Photo</h3>
                                    {hotelProfile.photoUrl && (
                                        <img src={hotelProfile.photoUrl} alt="Hotel Cover" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, marginBottom: 16 }} />
                                    )}
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <input
                                            type="text"
                                            value={profileForm.photoUrl}
                                            onChange={e => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                                            placeholder="Paste new image URL here..."
                                            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2ecf0", fontFamily: "inherit" }}
                                        />
                                        <button
                                            onClick={() => saveProfileData({ photoUrl: profileForm.photoUrl })}
                                            disabled={!profileForm.photoUrl}
                                            style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 8, padding: "0 20px", fontWeight: 600, cursor: profileForm.photoUrl ? "pointer" : "not-allowed", opacity: profileForm.photoUrl ? 1 : 0.5 }}
                                        >
                                            Save Photo
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>📝 Hotel Description</h3>
                                    {hotelProfile.desc && (
                                        <p style={{ fontSize: "0.9rem", color: "#6b8999", marginBottom: 16, lineHeight: 1.6, background: "#f8fbfd", padding: "16px", borderRadius: "8px", border: "1px solid #e2ecf0" }}>
                                            {hotelProfile.desc}
                                        </p>
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        <textarea
                                            value={profileForm.desc}
                                            onChange={e => setProfileForm({ ...profileForm, desc: e.target.value })}
                                            placeholder="Write a captivating description of your hotel..."
                                            rows={4}
                                            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2ecf0", fontFamily: "inherit", resize: "vertical" }}
                                        />
                                        <button
                                            onClick={() => saveProfileData({ desc: profileForm.desc })}
                                            disabled={!profileForm.desc}
                                            style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: profileForm.desc ? "pointer" : "not-allowed", opacity: profileForm.desc ? 1 : 0.5, alignSelf: "flex-start" }}
                                        >
                                            Save Description
                                        </button>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>✨ Amenities & Features</h3>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                                        {hotelProfile.amenities?.map((amenity, i) => (
                                            <div key={i} style={{ background: "#f0f8fc", padding: "8px 14px", borderRadius: 20, border: "1px solid #dbeafe", display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: "0.9rem", color: NAVY, fontWeight: 600 }}>{amenity}</span>
                                                <button
                                                    onClick={() => saveProfileData({ amenities: hotelProfile.amenities.filter((_, idx) => idx !== i) })}
                                                    style={{ background: "transparent", color: "#991b1b", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: 0, display: "flex" }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <input
                                            type="text"
                                            value={profileForm.newAmenity}
                                            onChange={e => setProfileForm({ ...profileForm, newAmenity: e.target.value })}
                                            placeholder="e.g. 🏊 Pool, 📶 WiFi, 🍽️ Restaurant"
                                            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2ecf0", fontFamily: "inherit" }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && profileForm.newAmenity) {
                                                    saveProfileData({ amenities: [...(hotelProfile.amenities || []), profileForm.newAmenity] });
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => saveProfileData({ amenities: [...(hotelProfile.amenities || []), profileForm.newAmenity] })}
                                            disabled={!profileForm.newAmenity}
                                            style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 8, padding: "0 20px", fontWeight: 600, cursor: profileForm.newAmenity ? "pointer" : "not-allowed", opacity: profileForm.newAmenity ? 1 : 0.5 }}
                                        >
                                            Add Amenity
                                        </button>
                                    </div>
                                </div>

                                {/* Packages */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>📦 Your Packages</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16, marginBottom: 20 }}>
                                        {hotelProfile.packages?.map((pkg, i) => (
                                            <div key={i} style={{ background: "#f0f8fc", padding: 16, borderRadius: 12, border: "1px solid #dbeafe" }}>
                                                <div style={{ fontWeight: 700, color: NAVY, fontSize: "1.1rem" }}>{pkg.name}</div>
                                                <div style={{ color: TEAL, fontWeight: 800, margin: "4px 0 8px" }}>${pkg.price}</div>
                                                <div style={{ fontSize: "0.85rem", color: "#6b8999" }}>{pkg.desc}</div>
                                                <button
                                                    onClick={() => saveProfileData({ packages: hotelProfile.packages.filter((_, idx) => idx !== i) })}
                                                    style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", marginTop: 12, cursor: "pointer" }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
                                        <input type="text" placeholder="Package Name" value={profileForm.newPkgName} onChange={e => setProfileForm({ ...profileForm, newPkgName: e.target.value })} style={{ flex: 1, minWidth: 150, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2ecf0" }} />
                                        <input type="number" placeholder="Price ($)" value={profileForm.newPkgPrice} onChange={e => setProfileForm({ ...profileForm, newPkgPrice: e.target.value })} style={{ width: 100, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2ecf0" }} />
                                        <input type="text" placeholder="Description" value={profileForm.newPkgDesc} onChange={e => setProfileForm({ ...profileForm, newPkgDesc: e.target.value })} style={{ flex: 2, minWidth: 200, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2ecf0" }} />
                                        <button
                                            onClick={() => saveProfileData({ packages: [...(hotelProfile.packages || []), { name: profileForm.newPkgName, price: profileForm.newPkgPrice, desc: profileForm.newPkgDesc }] })}
                                            disabled={!profileForm.newPkgName || !profileForm.newPkgPrice}
                                            style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: (profileForm.newPkgName && profileForm.newPkgPrice) ? "pointer" : "not-allowed", opacity: (profileForm.newPkgName && profileForm.newPkgPrice) ? 1 : 0.5 }}
                                        >
                                            Add Package
                                        </button>
                                    </div>
                                </div>

                                {/* Offers */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>🏷️ Special Offers</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
                                        {hotelProfile.offers?.map((offer, i) => (
                                            <div key={i} style={{ background: "#fffbeb", padding: 16, borderRadius: 12, border: "1px solid #fef3c7" }}>
                                                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#d97706" }}>{offer.discount}% OFF</div>
                                                <div style={{ fontWeight: 600, color: NAVY, marginTop: 4 }}>{offer.name}</div>
                                                <button
                                                    onClick={() => saveProfileData({ offers: hotelProfile.offers.filter((_, idx) => idx !== i) })}
                                                    style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", marginTop: 12, cursor: "pointer" }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <input type="text" placeholder="Offer Name (e.g., Summer Sale)" value={profileForm.newOfferName} onChange={e => setProfileForm({ ...profileForm, newOfferName: e.target.value })} style={{ flex: 2, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2ecf0" }} />
                                        <input type="number" placeholder="Discount %" value={profileForm.newOfferDiscount} onChange={e => setProfileForm({ ...profileForm, newOfferDiscount: e.target.value })} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2ecf0" }} />
                                        <button
                                            onClick={() => saveProfileData({ offers: [...(hotelProfile.offers || []), { name: profileForm.newOfferName, discount: profileForm.newOfferDiscount }] })}
                                            disabled={!profileForm.newOfferName || !profileForm.newOfferDiscount}
                                            style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 8, padding: "0 20px", fontWeight: 600, cursor: (profileForm.newOfferName && profileForm.newOfferDiscount) ? "pointer" : "not-allowed", opacity: (profileForm.newOfferName && profileForm.newOfferDiscount) ? 1 : 0.5 }}
                                        >
                                            Add Offer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══════════ ANALYTICS TAB ══════════ */}
                        {tab === "analytics" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                                <div>
                                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: NAVY, marginBottom: 4 }}>Day-to-Day Analytics</h2>
                                    <p style={{ color: "#6b8999", fontSize: "0.88rem" }}>Last 30 days · Live from Firebase + Manual Data</p>
                                </div>

                                {/* Manual Data Entry Form */}
                                <div style={{ background: "#f8fbfd", padding: "20px 24px", borderRadius: 16, border: "1px solid #e2ecf0" }}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 12, fontSize: "0.95rem" }}>➕ Add Past Data</h3>
                                    <p style={{ fontSize: "0.8rem", color: "#6b8999", marginBottom: 16 }}>Input historical revenue and bookings for a specific date to improve your analytics.</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                                        <input type="date" value={manualData.date} onChange={e => setManualData({ ...manualData, date: e.target.value })} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #e2ecf0" }} />
                                        <input type="number" placeholder="Total Revenue ($)" value={manualData.revenue} onChange={e => setManualData({ ...manualData, revenue: e.target.value })} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #e2ecf0", width: 160 }} />
                                        <input type="number" placeholder="Bookings Count" value={manualData.bookings} onChange={e => setManualData({ ...manualData, bookings: e.target.value })} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #e2ecf0", width: 140 }} />
                                        <button
                                            onClick={handleAddManualData}
                                            disabled={!manualData.revenue || !manualData.bookings}
                                            style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: (!manualData.revenue || !manualData.bookings) ? "not-allowed" : "pointer", opacity: (!manualData.revenue || !manualData.bookings) ? 0.5 : 1 }}
                                        >
                                            Save Entry
                                        </button>
                                    </div>
                                </div>

                                {/* Revenue chart */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>💰 Daily Revenue (USD)</h3>
                                    <BarChart data={daily} labelKey="date" valueKey="revenue" color={TEAL} unit="$" />
                                </div>

                                {/* Bookings chart */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>📋 Daily Bookings Count</h3>
                                    <BarChart data={daily} labelKey="date" valueKey="bookings" color={BLUE} unit="" />
                                </div>

                                {/* Daily breakdown table - recent 7 days */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>📅 Recent 7-Day Breakdown</h3>
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr>
                                                    {["Date", "Revenue", "Bookings", "Avg / Booking", "Performance"].map(h => (
                                                        <th key={h} style={thS}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {daily.slice(-7).reverse().map((d, i) => {
                                                    const avg = d.bookings > 0 ? Math.round(d.revenue / d.bookings) : 0;
                                                    const pct = Math.round((d.revenue / Math.max(...daily.map(x => x.revenue), 1)) * 100);
                                                    return (
                                                        <tr key={i}
                                                            onMouseEnter={e => e.currentTarget.style.background = "#f0f7fb"}
                                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                            <td style={{ ...tdS, fontWeight: 600 }}>{d.date}</td>
                                                            <td style={{ ...tdS, color: TEAL, fontWeight: 700 }}>${d.revenue.toLocaleString()}</td>
                                                            <td style={tdS}>{d.bookings}</td>
                                                            <td style={tdS}>${avg}</td>
                                                            <td style={tdS}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                    <div style={{ flex: 1, height: 6, background: "#f0f4f7", borderRadius: 3 }}>
                                                                        <div style={{ width: `${pct}%`, height: "100%", background: pct > 70 ? "#27ae60" : pct > 40 ? TEAL : "#e74c3c", borderRadius: 3 }} />
                                                                    </div>
                                                                    <span style={{ fontSize: "0.75rem", color: "#6b8999" }}>{pct}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══════════ PREDICTIONS TAB ══════════ */}
                        {tab === "predictions" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                                <div>
                                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: NAVY, marginBottom: 4 }}>Next Month Forecast</h2>
                                    <p style={{ color: "#6b8999", fontSize: "0.88rem" }}>AI-powered linear trend projection based on your last 30 days of data</p>
                                </div>

                                {/* Forecast KPIs */}
                                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                    {[
                                        { label: "Predicted Revenue", value: `$${predTotal.toLocaleString()}`, icon: "💰", color: TEAL, bg: "#e6faf9" },
                                        { label: "Peak Revenue Day", value: peakDay.date?.slice(5), icon: "🏆", color: "#f39c12", bg: "#fef9ec" },
                                        { label: "Peak Day Revenue", value: `$${peakDay.revenue?.toLocaleString()}`, icon: "📈", color: "#27ae60", bg: "#e9f7ef" },
                                        { label: "Revenue Trend", value: trend, icon: "🔮", color: "#9b59b6", bg: "#f3eeff" },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "20px 22px", flex: "1 1 200px", border: `1px solid ${s.color}22` }}>
                                            <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{s.icon}</div>
                                            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#6b8999", marginTop: 4 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Forecast chart */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>🔮 Predicted Daily Revenue — Next 30 Days</h3>
                                    <LineChart data={prediction} labelKey="date" valueKey="revenue" color="#9b59b6" unit="$" />
                                </div>

                                {/* Historical vs Predicted */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                    <div style={card()}>
                                        <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 14, fontSize: "0.95rem" }}>📊 Historical (Last 30 Days)</h3>
                                        <LineChart data={daily} labelKey="date" valueKey="revenue" color={TEAL} unit="$" />
                                    </div>
                                    <div style={card()}>
                                        <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 14, fontSize: "0.95rem" }}>💡 Recommendations</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {[
                                                { icon: "💲", title: "Pricing Strategy", desc: predTotal > totalRevenue ? "Revenue is trending up — consider slight price increases on peak dates." : "Revenue is softening — try early-bird or bundle deals to boost bookings." },
                                                { icon: "📅", title: "Peak Day Prep", desc: `${peakDay.date} is forecasted as your highest revenue day. Ensure full staffing and room readiness.` },
                                                { icon: "🌍", title: "Marketing Focus", desc: `${safeSeason?.name || "Current season"} — ${safeSeason?.desc || ""}. Tailor campaigns to this traveller segment.` },
                                                { icon: "🤝", title: "Partner Offers", desc: "Consider partnering with local tour operators to create packages that boost occupancy during low-forecast days." },
                                            ].map(tip => (
                                                <div key={tip.title} style={{ background: "#f8fbfd", borderRadius: 12, padding: "14px 16px", border: "1px solid #e2ecf0" }}>
                                                    <div style={{ fontWeight: 700, color: NAVY, marginBottom: 4, fontSize: "0.88rem" }}>{tip.icon} {tip.title}</div>
                                                    <div style={{ fontSize: "0.82rem", color: "#6b8999", lineHeight: 1.6 }}>{tip.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══════════ MANAGEMENT TAB ══════════ */}
                        {tab === "management" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                                    <div>
                                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: NAVY, marginBottom: 4 }}>Booking Management</h2>
                                        <p style={{ color: "#6b8999", fontSize: "0.88rem" }}>{bookings.length} total booking(s) for {hotelName}</p>
                                    </div>
                                    {/* Filter */}
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {["all", "confirmed", "cancelled", "pending"].map(s => (
                                            <button key={s} onClick={() => setFilterStatus(s)} style={{
                                                padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${filterStatus === s ? BLUE : "#e2ecf0"}`,
                                                background: filterStatus === s ? BLUE : "#fff", color: filterStatus === s ? "#fff" : "#6b8999",
                                                cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.8rem", transition: "all 0.18s",
                                            }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                                        ))}
                                    </div>
                                </div>

                                {visibleBookings.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "60px 0", color: "#6b8999" }}>
                                        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🛎</div>
                                        <p>No {filterStatus !== "all" ? filterStatus : ""} bookings found for {hotelName}.</p>
                                        <p style={{ fontSize: "0.82rem", marginTop: 8 }}>Bookings will appear here when guests book via HotelEco Pro.</p>
                                    </div>
                                ) : (
                                    <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
                                        <div style={{ overflowX: "auto" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                                                <thead>
                                                    <tr>
                                                        {["Guest", "Room", "Check-in", "Check-out", "Nights", "Total", "Status", "Actions"].map(h => (
                                                            <th key={h} style={thS}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {visibleBookings.map(b => (
                                                        <tr key={b.id}
                                                            onMouseEnter={e => e.currentTarget.style.background = "#f0f7fb"}
                                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                            <td style={tdS}>
                                                                <div style={{ fontWeight: 700 }}>{b.name}</div>
                                                                <div style={{ color: "#6b8999", fontSize: "0.75rem" }}>{b.email}</div>
                                                                <div style={{ color: "#6b8999", fontSize: "0.75rem" }}>{b.phone}</div>
                                                            </td>
                                                            <td style={tdS}>{b.room}</td>
                                                            <td style={tdS}>{b.checkin}</td>
                                                            <td style={tdS}>{b.checkout}</td>
                                                            <td style={tdS}>{b.nights}</td>
                                                            <td style={{ ...tdS, fontWeight: 700, color: TEAL }}>${b.totalPrice}</td>
                                                            <td style={tdS}><Badge status={b.status || "confirmed"} /></td>
                                                            <td style={tdS}>
                                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                                    {b.status !== "confirmed" && (
                                                                        <Btn
                                                                            label="✅ Confirm"
                                                                            bg="#d1fae5" color="#065f46"
                                                                            disabled={!!actionLoading[`confirm-${b.id}`]}
                                                                            onClick={() => withLoading(`confirm-${b.id}`, () => updateBookingStatus(b.id, "confirmed"))}
                                                                        />
                                                                    )}
                                                                    {b.status !== "cancelled" && (
                                                                        <Btn
                                                                            label="❌ Cancel"
                                                                            bg="#fee2e2" color="#991b1b"
                                                                            disabled={!!actionLoading[`cancel-${b.id}`]}
                                                                            onClick={() => withLoading(`cancel-${b.id}`, () => updateBookingStatus(b.id, "cancelled"))}
                                                                        />
                                                                    )}
                                                                    <Btn
                                                                        label="🗑"
                                                                        bg="#f3f4f6" color="#6b7280"
                                                                        disabled={!!actionLoading[`del-${b.id}`]}
                                                                        onClick={() => {
                                                                            if (window.confirm(`Delete booking for ${b.name}?`))
                                                                                withLoading(`del-${b.id}`, () => deleteBooking(b.id));
                                                                        }}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Revenue summary for this hotel */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                                    {[
                                        { label: "Confirmed Bookings", value: bookings.filter(b => b.status === "confirmed").length, color: "#065f46", bg: "#d1fae5" },
                                        { label: "Cancelled Bookings", value: bookings.filter(b => b.status === "cancelled").length, color: "#991b1b", bg: "#fee2e2" },
                                        { label: "Total Revenue", value: `$${bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + (Number(b.totalPrice) || 0), 0).toLocaleString()}`, color: BLUE, bg: "#dbeafe" },
                                        { label: "Avg Booking Value", value: bookings.length > 0 ? `$${Math.round(bookings.reduce((s, b) => s + (Number(b.totalPrice) || 0), 0) / bookings.length)}` : "$0", color: "#7c3aed", bg: "#ede9fe" },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "18px 20px", border: `1px solid ${s.color}22` }}>
                                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: "0.76rem", color: "#6b8999", marginTop: 4 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ══════════ SOCIAL MEDIA TAB ══════════ */}
                        {tab === "social" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                                    <div>
                                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: NAVY, marginBottom: 4 }}>
                                            Automated Social Media Marketing
                                        </h2>
                                        <p style={{ color: "#6b8999", fontSize: "0.88rem" }}>
                                            30-day content calendar generated for <strong>{hotelName}</strong> · {safeSeason.icon} {safeSeason.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={downloadPlan}
                                        style={{ background: `linear-gradient(135deg,${BLUE},${TEAL})`, color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 4px 14px rgba(10,127,165,0.3)" }}
                                    >
                                        ⬇️ Download Full Plan
                                    </button>
                                </div>

                                {/* Season banner */}
                                <div style={{ background: `linear-gradient(135deg,${NAVY},#1a4060)`, color: "#fff", borderRadius: 18, padding: "20px 28px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                                    <div style={{ fontSize: "3rem" }}>{safeSeason.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{safeSeason.name} — Sri Lanka Tourism Calendar</div>
                                        <div style={{ opacity: 0.7, fontSize: "0.85rem", marginTop: 4 }}>{safeSeason.desc} · Best time for: {district}</div>
                                    </div>
                                    <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        {["wave", "sun", "culture"].map(theme => (
                                            <span key={theme} style={{ background: "rgba(23,196,184,0.2)", color: TEAL, borderRadius: 20, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600, border: `1px solid ${TEAL}44` }}>
                                                #{theme.charAt(0).toUpperCase() + theme.slice(1)}Campaign
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Platform filter */}
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {["All", ...PLATFORMS].map(p => (
                                        <button key={p} onClick={() => setSocialPlatform(p)} style={{
                                            padding: "7px 16px", borderRadius: 20,
                                            border: `1.5px solid ${socialPlatform === p ? (PLATFORM_COLORS[p] || BLUE) : "#e2ecf0"}`,
                                            background: socialPlatform === p ? (PLATFORM_COLORS[p] || BLUE) : "#fff",
                                            color: socialPlatform === p ? "#fff" : "#6b8999",
                                            cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.8rem", transition: "all 0.18s",
                                        }}>{p}</button>
                                    ))}
                                </div>

                                {/* Content calendar grid */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {filteredPosts.map((post, idx) => (
                                        <div key={idx} style={{
                                            background: "#fff", borderRadius: 16, padding: "20px 24px",
                                            border: `1px solid ${PLATFORM_COLORS[post.platform] || "#e2ecf0"}22`,
                                            boxShadow: "0 2px 12px rgba(10,127,165,0.06)",
                                            borderLeft: `4px solid ${PLATFORM_COLORS[post.platform] || TEAL}`,
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                    <span style={{
                                                        background: PLATFORM_COLORS[post.platform] || TEAL, color: "#fff",
                                                        borderRadius: 8, padding: "4px 12px", fontSize: "0.76rem", fontWeight: 700,
                                                    }}>{post.platform}</span>
                                                    <span style={{ background: "#f0f8fc", color: BLUE, borderRadius: 8, padding: "4px 12px", fontSize: "0.76rem", fontWeight: 600 }}>
                                                        {post.type}
                                                    </span>
                                                    <span style={{ color: "#6b8999", fontSize: "0.78rem" }}>📅 {post.date}</span>
                                                </div>
                                                <button
                                                    onClick={() => copyPost(post.content, idx)}
                                                    style={{
                                                        background: copiedIdx === idx ? "#d1fae5" : "#f0f8fc",
                                                        color: copiedIdx === idx ? "#065f46" : BLUE,
                                                        border: "none", borderRadius: 8, padding: "6px 14px",
                                                        cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.78rem", transition: "all 0.2s",
                                                    }}
                                                >
                                                    {copiedIdx === idx ? "✅ Copied!" : "📋 Copy Post"}
                                                </button>
                                            </div>
                                            <p style={{ color: "#334155", fontSize: "0.88rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                                {post.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Hashtag bank */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 700, marginBottom: 14, fontSize: "1rem" }}>🏷 Your Hashtag Bank</h3>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {[
                                            `#${hotelName.replace(/ /g, "")}`,
                                            `#${district.replace(/ /g, "")}Hotel`,
                                            "#SriLankaTourism", "#HotelEcoPro", "#EcoTravel", "#LuxuryHotel",
                                            "#GreenTravel", "#SustainableTravel", "#VisitSriLanka",
                                            `#${hotelType.replace(/ /g, "")}`,
                                            "#TravelSriLanka", "#SriLankaResort", "#AsiaTravel",
                                            "#BoutiqueHotel", "#TropicalGetaway", "#IslandLife",
                                            `#${safeSeason.name.replace(/ /g, "")}`,
                                            "#SriLankaHoliday", "#HotelLife", "#CheckIn",
                                        ].map(tag => (
                                            <span key={tag} onClick={() => { navigator.clipboard.writeText(tag); }}
                                                style={{ background: "#f0f8fc", color: BLUE, borderRadius: 20, padding: "5px 13px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", border: "1px solid #dbeafe" }}
                                                title="Click to copy"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p style={{ color: "#9ab", fontSize: "0.75rem", marginTop: 12 }}>💡 Click any hashtag to copy it to clipboard</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
