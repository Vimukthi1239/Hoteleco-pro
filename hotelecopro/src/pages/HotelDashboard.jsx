import { useState, useEffect, useMemo, useRef } from "react";
import {
    listenHotelBookings,
    updateBookingStatus,
    deleteBooking,
    logoutHotel,
    listenHotelProfile,
    updateHotelProfile,
    listenHotelMetrics,
    saveHotelDailyMetric,
    saveHotelMetricsBatch,
    assignBookingRoom,
} from "../data/firebase";

// ── Sri Lanka tourism season data ──────────────────────────────
const SEASONS = [
    { months: [12, 1, 2], name: "Peak Season", desc: "West & South Coast", icon: "☀️" },
    { months: [3, 4, 5], name: "Shoulder Season", desc: "Cultural Triangle", icon: "🌿" },
    { months: [6, 7, 8], name: "East Coast Peak", desc: "Trincomalee & Arugam Bay", icon: "🌊" },
    { months: [9, 10, 11], name: "Low Season", desc: "Budget deals opportunity", icon: "🌧️" },
];

const PLATFORMS = ["Instagram", "Facebook", "X/Twitter", "LinkedIn", "TikTok"];

const NAVY = "#011f4b"; // Deep Dark Navy Blue
const TEAL = "#92d2f9"; // Vibrant Light Sky Blue
const BLUE = "#a8daf9"; // Softer Light Blue
const LIGHT_BG = "#e4edf2"; // Very Light Soft Blue/Gray

// ── Style helpers ───────────────────────────────────────────────
const card = (extra = {}) => ({
    background: "#fff",
    borderRadius: 18,
    border: "1px solid #e4edf2",
    boxShadow: "0 4px 20px rgba(1, 31, 75, 0.05)",
    padding: "24px",
    ...extra,
});

const thS = {
    padding: "11px 14px", textAlign: "left", fontSize: "0.7rem",
    fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
    color: "#4f6891", borderBottom: "2px solid #e4edf2", background: "#f8fafc",
};
const tdS = {
    padding: "12px 14px", fontSize: "0.87rem", color: "#011f4b",
    borderBottom: "1px solid #e4edf2", verticalAlign: "middle",
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
    
    // Default background is Navy Blue (#011f4b), default text is white (#ffffff)
    const defaultBg = bg || "#011f4b";
    const defaultColor = color || "#ffffff"; 
    const defaultBorder = bg ? `1.5px solid ${bg}` : "1.5px solid #011f4b";
    
    // Default hover states (Navy defaults to Light Blue hover)
    let hoverBg = "#92d2f9";
    let hoverColor = "#011f4b";
    let hoverBorder = "1.5px solid #92d2f9";
    
    // Custom hover colors for specific semantic buttons
    if (bg === "#d1fae5") { // Confirm (Success Green)
        hoverBg = "#a7f3d0";
        hoverColor = "#065f46";
        hoverBorder = "1.5px solid #a7f3d0";
    } else if (bg === "#fee2e2") { // Cancel (Danger Red)
        hoverBg = "#fecaca";
        hoverColor = "#991b1b";
        hoverBorder = "1.5px solid #fecaca";
    } else if (bg === "#f3f4f6") { // Delete (Neutral Gray)
        hoverBg = "#e5e7eb";
        hoverColor = "#374151";
        hoverBorder = "1.5px solid #e5e7eb";
    }
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: hov ? hoverBg : defaultBg, 
                color: hov ? hoverColor : defaultColor,
                border: hov ? hoverBorder : defaultBorder,
                borderRadius: 10,
                padding: "6px 16px",
                cursor: disabled ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: "0.78rem",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: disabled ? 0.5 : 1,
                boxShadow: hov && !disabled ? "0 4px 12px rgba(1, 31, 75, 0.12)" : "none",
                transform: hov && !disabled ? "translateY(-1.5px)" : "none",
                outline: "none"
            }}
        >{label}</button>
    );
}

// ── Simple SVG Bar Chart ────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
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
// eslint-disable-next-line no-unused-vars
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

// ── Generate daily data from real bookings ──────────────────────
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

// ── Seed zero data when self-registered and first time logging in ────
function zeroDailyData(days = 30) {
    const today = new Date();
    return Array.from({ length: days }, (_, i) => {
        const dt = new Date(today);
        dt.setDate(dt.getDate() - (days - 1 - i));
        return { date: dt.toISOString().slice(0, 10), revenue: 0, bookings: 0 };
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

// ── Sustainability Milestones Data ──────────────────────────────
const SUSTAINABILITY_MILESTONES = [
    { id: "solar", title: "☀️ Solar Energy Grid", desc: "100% powered by roof solar panels", points: 150 },
    { id: "rainwater", title: "💧 Rainwater Harvesting", desc: "Collecting & filtering rain for landscaping", points: 100 },
    { id: "plastic_free", title: "🚫 Zero Single-Use Plastics", desc: "Eliminated all plastic water bottles & toiletries", points: 120 },
    { id: "led_motion", title: "💡 Smart LED & Motion Sensors", desc: "Energy efficient lighting in common areas", points: 50 },
    { id: "organic_garden", title: "🍎 Organic Farm-to-Table Garden", desc: "Grow organic vegetables on hotel grounds", points: 80 },
    { id: "compost", title: "🍂 Guest Room Composting Bins", desc: "Segregated organic waste composting system", points: 40 },
    { id: "greywater", title: "♻️ Greywater Recycling System", desc: "Treat and reuse sink & shower water", points: 110 },
];

function getDemographics(bookings, totalBookings = 0) {
    if (totalBookings === 0) {
        return [
            { label: "Germany", value: 0, color: "#27ae60" },
            { label: "United Kingdom", value: 0, color: "#2980b9" },
            { label: "Sri Lanka", value: 0, color: "#f1c40f" },
            { label: "France", value: 0, color: "#e74c3c" },
            { label: "Australia", value: 0, color: "#8e44ad" }
        ];
    }
    const total = Math.max(totalBookings, 5);
    return [
        { label: "Germany", value: Math.round(total * 0.35), color: "#27ae60" },
        { label: "United Kingdom", value: Math.round(total * 0.25), color: "#2980b9" },
        { label: "Sri Lanka", value: Math.round(total * 0.20), color: "#f1c40f" },
        { label: "France", value: Math.round(total * 0.12), color: "#e74c3c" },
        { label: "Australia", value: total - Math.round(total * 0.92), color: "#8e44ad" }
    ];
}

function getChannels(bookings, totalBookings = 0) {
    if (totalBookings === 0) {
        return [
            { label: "HotelEco Search", value: 0, color: "#17c4b8" },
            { label: "Social Media", value: 0, color: "#0a7fa5" },
            { label: "Direct Booking", value: 0, color: "#2c3e50" },
            { label: "Partner Links", value: 0, color: "#e67e22" }
        ];
    }
    const total = Math.max(totalBookings, 5);
    return [
        { label: "HotelEco Search", value: Math.round(total * 0.55), color: "#17c4b8" },
        { label: "Social Media", value: Math.round(total * 0.22), color: "#0a7fa5" },
        { label: "Direct Booking", value: Math.round(total * 0.15), color: "#2c3e50" },
        { label: "Partner Links", value: total - Math.round(total * 0.92), color: "#e67e22" }
    ];
}


function getDistrictAdvice(district = "Colombo", month = new Date().getMonth() + 1) {
    const dist = district.toLowerCase().trim();
    const isSouthWestBeach = ["galle", "matara", "hambantota", "colombo", "negombo", "gampaha", "kalutara", "bentota", "hikkaduwa", "mirissa", "unawatuna"].some(d => dist.includes(d));
    const isEastCoast = ["trincomalee", "batticaloa", "ampara", "arugam bay", "kalmunai"].some(d => dist.includes(d));
    const isHillCountry = ["badulla", "ella", "nuwara eliya", "kandy", "matale", "bandarawela"].some(d => dist.includes(d));

    if (isSouthWestBeach) {
        if ([5, 6, 7, 8, 9].includes(month)) {
            return {
                season: "Low / Monsoon Season 🌧️",
                weather: "Heavy showers & rough seas. High probability of rain.",
                forecast: [
                    { day: "Today", temp: "28°C", icon: "⛈️", desc: "Thunderstorms" },
                    { day: "Tomorrow", temp: "27°C", icon: "🌧️", desc: "Heavy Rain" },
                    { day: "Wednesday", temp: "29°C", icon: "🌦️", desc: "Passing Showers" }
                ],
                tips: [
                    "Promote indoor wellness packages & traditional Ayurvedic Spa treatments.",
                    "Create 'Sri Lankan Culinary Masterclass' bundles to entertain indoor guests.",
                    "Offer discounts for long-term digital nomads looking for cozy rainy workations."
                ]
            };
        } else if ([12, 1, 2, 3, 4].includes(month)) {
            return {
                season: "Peak Season ☀️",
                weather: "Sunny, calm seas, and cool ocean breezes. Ideal beach weather.",
                forecast: [
                    { day: "Today", temp: "31°C", icon: "☀️", desc: "Clear Sunny" },
                    { day: "Tomorrow", temp: "32°C", icon: "☀️", desc: "Sunny" },
                    { day: "Wednesday", temp: "31°C", icon: "⛅", desc: "Partly Cloudy" }
                ],
                tips: [
                    "Market boat safaris, marine conservation activities, and turtle hatchery excursions.",
                    "Host outdoor beach cleanups for guests and offer dining points as rewards.",
                    "Keep premium room categories at full price due to high organic search volume."
                ]
            };
        } else {
            return {
                season: "Shoulder Season 🌿",
                weather: "Inter-monsoon showers. Mild weather with occasional evening rain.",
                forecast: [
                    { day: "Today", temp: "30°C", icon: "⛅", desc: "Partly Cloudy" },
                    { day: "Tomorrow", temp: "29°C", icon: "🌦️", desc: "Evening Showers" },
                    { day: "Wednesday", temp: "30°C", icon: "☀️", desc: "Sunny Intervals" }
                ],
                tips: [
                    "Introduce 'Eco-Heritage Tours' highlighting local colonial and ancient history.",
                    "Promote flexible rescheduling options to capture cautious travellers.",
                    "Use targeted local advertising for weekend getaway packages."
                ]
            };
        }
    }

    if (isEastCoast) {
        if ([5, 6, 7, 8, 9].includes(month)) {
            return {
                season: "Peak Season 🌊",
                weather: "Hot, dry, and perfect offshore winds. Excellent ocean visibility.",
                forecast: [
                    { day: "Today", temp: "33°C", icon: "☀️", desc: "Sunny & Warm" },
                    { day: "Tomorrow", temp: "34°C", icon: "☀️", desc: "Bright Sunny" },
                    { day: "Wednesday", temp: "33°C", icon: "🍃", desc: "Breezy & Dry" }
                ],
                tips: [
                    "Highlight ocean surfing, whale/dolphin watching, and coral reef conservation snorkels.",
                    "Organize local coral planting workshops for guests in collaboration with eco-divers.",
                    "Promote sunrise yoga packages on the beach."
                ]
            };
        } else if ([10, 11, 12, 1].includes(month)) {
            return {
                season: "Low / Monsoon Season 🌧️",
                weather: "Northeast monsoon active. Very high rainfall & winds.",
                forecast: [
                    { day: "Today", temp: "27°C", icon: "⛈️", desc: "Gale Winds & Rain" },
                    { day: "Tomorrow", temp: "26°C", icon: "🌧️", desc: "Heavy Rain" },
                    { day: "Wednesday", temp: "28°C", icon: "🌧️", desc: "Continuous Drizzle" }
                ],
                tips: [
                    "Shift marketing to birdwatching tours in inland wetlands which thrive in rain.",
                    "Offer special warm herbal beverage menus and cultural storytelling sessions.",
                    "Focus on off-season maintenance and staff hospitality training."
                ]
            };
        } else {
            return {
                season: "Shoulder Season 🌿",
                weather: "Transition phase. Dry mornings with mild evening winds.",
                forecast: [
                    { day: "Today", temp: "30°C", icon: "⛅", desc: "Mainly Clear" },
                    { day: "Tomorrow", temp: "30°C", icon: "🌤️", desc: "Scattered Clouds" },
                    { day: "Wednesday", temp: "31°C", icon: "🌦️", desc: "Brief Rain" }
                ],
                tips: [
                    "Advertise lagoon safaris and cultural temple walks in adjacent areas.",
                    "Introduce early-bird packages for the upcoming surf peak season.",
                    "Partner with local transport services to provide packaged transfers."
                ]
            };
        }
    }

    if (isHillCountry) {
        if ([12, 1, 2, 3, 4].includes(month)) {
            return {
                season: "Peak Season ☀️",
                weather: "Cool days, cold nights, mist in the mornings. Bright blue skies.",
                forecast: [
                    { day: "Today", temp: "22°C", icon: "☀️", desc: "Sunny & Mist" },
                    { day: "Tomorrow", temp: "21°C", icon: "☀️", desc: "Clear & Cool" },
                    { day: "Wednesday", temp: "23°C", icon: "⛅", desc: "Pleasant" }
                ],
                tips: [
                    "Promote sunrise hiking trails to Ella Rock or Adam's Peak with organic snack packs.",
                    "Highlight cozy evening fire-pit gatherings with warm local tea tasting.",
                    "Market forest canopy trekking and organic tea factory walkthroughs."
                ]
            };
        } else if ([10, 11].includes(month)) {
            return {
                season: "Low / Rainy Season 🌧️",
                weather: "Thick mist, foggy roads, and regular rain. High landslide probability.",
                forecast: [
                    { day: "Today", temp: "18°C", icon: "🌫️", desc: "Heavy Mist & Rain" },
                    { day: "Tomorrow", temp: "17°C", icon: "🌧️", desc: "Cold Rain" },
                    { day: "Wednesday", temp: "18°C", icon: "🌫️", desc: "Foggy" }
                ],
                tips: [
                    "Feature hot stone spa therapies, heated indoor yoga sessions, and library lounge access.",
                    "Introduce comfort menus featuring spicy Sri Lankan crab curry and traditional soups.",
                    "Promote mist photography walks for creative travelers."
                ]
            };
        } else {
            return {
                season: "Shoulder Season 🌿",
                weather: "Mild temperatures. Lush green landscapes. Occasional light rain.",
                forecast: [
                    { day: "Today", temp: "20°C", icon: "⛅", desc: "Partly Cloudy" },
                    { day: "Tomorrow", temp: "19°C", icon: "🌦️", desc: "Passing Showers" },
                    { day: "Wednesday", temp: "21°C", icon: "⛅", desc: "Green & Sunny" }
                ],
                tips: [
                    "Advertise waterfall hiking trails which are at full spectacular flow.",
                    "Organize forest tree-planting initiatives for guests and award certificate badges.",
                    "Promote weekday packages for remote workers searching for fresh mountain air."
                ]
            };
        }
    }

    return {
        season: "General Season ⛅",
        weather: "Warm tropical weather with seasonal clouds and high humidity.",
        forecast: [
            { day: "Today", temp: "30°C", icon: "⛅", desc: "Partly Cloudy" },
            { day: "Tomorrow", temp: "31°C", icon: "🌦️", desc: "Scattered Rain" },
            { day: "Wednesday", temp: "30°C", icon: "☀️", desc: "Mainly Sunny" }
        ],
        tips: [
            "Offer wellness retreats focusing on mindfulness and physical health.",
            "Conduct waste-free kitchen tours for sustainable hospitality guests.",
            "Use dynamic pricing rules to maximize revenue during weekends."
        ]
    };
}

// ── Interactive SVG Area Chart Component ──────────────────────────
function InteractiveAreaChart({ data, labelKey, valueKey, color = TEAL, unit = "" }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);

    const vals = data.map(d => d[valueKey]);
    const max = Math.max(...vals, 1);
    const min = 0;
    const range = max - min || 1;
    const W = 600, H = 160, padX = 40, padY = 20;
    const xStep = (W - padX * 2) / Math.max(data.length - 1, 1);

    const pts = data.map((d, i) => ({
        x: padX + i * xStep,
        y: padY + (1 - (d[valueKey] - min) / range) * H,
        data: d,
        index: i
    }));

    let path = "";
    if (pts.length > 0) {
        path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp1y = p0.y;
            const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
            const cp2y = p1.y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
    }

    const areaPath = pts.length > 0
        ? `${path} L ${pts[pts.length - 1].x} ${padY + H} L ${pts[0].x} ${padY + H} Z`
        : "";

    const handleMouseMove = (e) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * W;
        let nearestIdx = 0;
        let minDist = Infinity;
        pts.forEach((pt, idx) => {
            const dist = Math.abs(pt.x - mouseX);
            if (dist < minDist) {
                minDist = dist;
                nearestIdx = idx;
            }
        });
        setHoveredIdx(nearestIdx);
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 80
        });
    };

    const handleMouseLeave = () => {
        setHoveredIdx(null);
    };

    const activePt = hoveredIdx !== null ? pts[hoveredIdx] : null;

    return (
        <div style={{ position: "relative" }}>
            <div style={{ overflowX: "auto" }}>
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${W} ${H + 40}`}
                    style={{ width: "100%", height: "auto", minWidth: 320, display: "block" }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <defs>
                        <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Y Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(f => {
                        const y = padY + (1 - f) * H;
                        return (
                            <g key={f}>
                                <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="3 3" />
                                <text x={padX - 8} y={y + 3} textAnchor="end" fontSize={8.5} fill="#94a3b8" fontWeight={600}>
                                    {unit === "$" ? `$${Math.round(min + range * f).toLocaleString()}` : Math.round(min + range * f)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Shaded Area */}
                    {areaPath && (
                        <path d={areaPath} fill={`url(#gradient-${color.replace("#", "")})`} />
                    )}

                    {/* Smooth line */}
                    {path && (
                        <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    )}

                    {/* Interactive points */}
                    {pts.map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r={hoveredIdx === i ? 5.5 : 2}
                            fill={hoveredIdx === i ? color : "#fff"}
                            stroke={color}
                            strokeWidth={hoveredIdx === i ? 2.5 : 1}
                            style={{ transition: "r 0.08s ease" }}
                        />
                    ))}

                    {/* Active vertical line indicator */}
                    {activePt && (
                        <line
                            x1={activePt.x}
                            y1={padY}
                            x2={activePt.x}
                            y2={padY + H}
                            stroke={color}
                            strokeWidth={1}
                            strokeDasharray="2 2"
                        />
                    )}

                    {/* Labels */}
                    {pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 5)) === 0 || i === pts.length - 1).map((p, i) => (
                        <text
                            key={i}
                            x={p.x}
                            y={H + padY + 16}
                            textAnchor="middle"
                            fontSize={8}
                            fill="#64748b"
                            fontWeight={600}
                        >
                            {p.data[labelKey]?.slice(5)}
                        </text>
                    ))}
                </svg>
            </div>

            {/* Tooltip */}
            {activePt && (
                <div style={{
                    position: "absolute",
                    left: `${mousePos.x}px`,
                    top: `${mousePos.y}px`,
                    transform: "translateX(-50%)",
                    background: "#0f2030e8",
                    backdropFilter: "blur(4px)",
                    color: "#fff",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    pointerEvents: "none",
                    zIndex: 10,
                    fontSize: "0.75rem",
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <div style={{ opacity: 0.7, fontSize: "0.65rem", marginBottom: 2 }}>{activePt.data[labelKey]}</div>
                    <div style={{ fontWeight: 700, color: TEAL }}>
                        {unit === "$" ? `$${activePt.data[valueKey].toLocaleString()}` : `${activePt.data[valueKey]} Bookings`}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Interactive SVG Donut Chart Component ──────────────────────────
function InteractiveDonutChart({ data, title }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const total = data.reduce((s, d) => s + d.value, 0);
    const size = 150;
    const center = size / 2;
    const radius = 48;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;

    const slices = data.map((d, i) => {
        const percentage = total > 0 ? d.value / total : 0;
        const strokeDashoffset = circumference - (percentage * circumference);
        const strokeDasharray = `${circumference} ${circumference}`;
        const rotationAngle = accumulatedAngle;
        accumulatedAngle += percentage * 360;

        return {
            ...d,
            percentage,
            strokeDasharray,
            strokeDashoffset,
            rotationAngle,
            index: i
        };
    });

    const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                    {slices.map((slice, i) => (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={slice.color}
                            strokeWidth={hoveredIdx === i ? strokeWidth + 2.5 : strokeWidth}
                            strokeDasharray={slice.strokeDasharray}
                            strokeDashoffset={slice.strokeDashoffset}
                            transform={`rotate(${-90 + slice.rotationAngle} ${center} ${center})`}
                            style={{
                                cursor: "pointer",
                                transition: "stroke-width 0.15s ease",
                            }}
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        />
                    ))}
                </svg>
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none"
                }}>
                    <div style={{ fontSize: "0.62rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                        {activeSlice ? activeSlice.label : "Total"}
                    </div>
                    <div style={{ fontSize: "0.95rem", color: NAVY, fontWeight: 800, marginTop: 1 }}>
                        {activeSlice ? `${Math.round(activeSlice.percentage * 100)}%` : total}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY, marginBottom: 2 }}>{title}</div>
                {slices.map((slice, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.72rem",
                            padding: "3px 6px",
                            borderRadius: 6,
                            background: hoveredIdx === i ? "#f1f5f9" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.1s ease"
                        }}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: slice.color }} />
                            <span style={{ color: "#334155", fontWeight: hoveredIdx === i ? 600 : 400 }}>{slice.label}</span>
                        </div>
                        <span style={{ color: "#64748b", fontWeight: 600 }}>{slice.value} ({Math.round(slice.percentage * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Interactive Comparison Bar Chart Component ─────────────────────
function InteractiveComparisonBarChart({ data }) {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const [hoveredBarIdx, setHoveredBarIdx] = useState(null);

    return (
        <div style={{ display: "flex", gap: 32, justifyContent: "center", alignItems: "flex-end", height: 130, padding: "10px 0" }}>
            {data.map((item, idx) => {
                const heightPercentage = Math.round((item.value / maxVal) * 100);
                return (
                    <div 
                        key={idx} 
                        style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            width: 100, 
                            cursor: "pointer", 
                            opacity: hoveredBarIdx === null || hoveredBarIdx === idx ? 1 : 0.6,
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={() => setHoveredBarIdx(idx)}
                        onMouseLeave={() => setHoveredBarIdx(null)}
                    >
                        <div style={{ 
                            fontSize: "0.78rem", 
                            fontWeight: 800, 
                            color: item.color, 
                            marginBottom: 6,
                            transform: hoveredBarIdx === idx ? "scale(1.08)" : "scale(1)",
                            transition: "transform 0.15s ease"
                        }}>
                            ${item.value.toLocaleString()}
                        </div>
                        <div style={{
                            width: 32,
                            height: `${heightPercentage}%`,
                            minHeight: 12,
                            background: item.color,
                            borderRadius: "8px 8px 0 0",
                            transition: "height 0.4s ease",
                            boxShadow: hoveredBarIdx === idx ? `0 6px 16px ${item.color}55` : `0 4px 10px ${item.color}22`
                        }} />
                        <div style={{ fontSize: "0.68rem", color: NAVY, fontWeight: 700, marginTop: 8, textAlign: "center", whiteSpace: "nowrap" }}>
                            {item.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}




// ═══════════════════════════════════════════════════════════════
//  MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════
const TABS = ["profile", "analytics", "predictions", "management", "social", "rooms"];
const TAB_ICONS = { profile: "🏨", analytics: "📊", predictions: "🔮", management: "🛎", social: "📣", rooms: "🛏" };
const TAB_LABELS = { profile: "Profile", analytics: "Analytics", predictions: "Predictions", management: "Management", social: "Social Media", rooms: "Room Matrix" };

export default function HotelDashboard({ hotelUser, setPage, setHotelUser }) {
    const [tab, setTab] = useState("analytics");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [filterStatus, setFilterStatus] = useState("all");
    const [copiedIdx, setCopiedIdx] = useState(null);
    const [socialPlatform, setSocialPlatform] = useState("All");

    // Custom Marketing Generator state
    const [socialSubTab, setSocialSubTab] = useState("generator"); // "generator" or "calendar"
    const [promoType, setPromoType] = useState("Poster");
    const [promoGoal, setPromoGoal] = useState("Seasonal Discount");
    const [promoTone, setPromoTone] = useState("Elegant");
    const [promoStyle, setPromoStyle] = useState("Modern Coastal");
    const [promoDetails, setPromoDetails] = useState("");
    const [genLoading, setGenLoading] = useState(false);
    const [genResult, setGenResult] = useState(null);
    const [genError, setGenError] = useState(null);
    const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

    const loadingQuotes = [
        "🤖 Analyzing hotel type and district themes...",
        "✍️ Drafting an engaging, high-conversion caption...",
        "🎨 Generating visual marketing asset via AI models...",
        "✨ Finalizing the flyer layout & style templates...",
        "🌐 Packing response details..."
    ];

    useEffect(() => {
        let interval;
        if (genLoading) {
            interval = setInterval(() => {
                setActiveQuoteIdx(prev => (prev + 1) % 5);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [genLoading]);

    const generateMarketingAsset = async () => {
        setGenLoading(true);
        setGenError(null);
        setGenResult(null);

        const webhookUrl = process.env.REACT_APP_N8N_MARKETING_WEBHOOK_URL || "https://ceylonnature.app.n8n.cloud/webhook-test/marketing-generator";

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hotelName,
                    district,
                    hotelType,
                    promoType,
                    promoGoal,
                    promoTone,
                    promoStyle,
                    promoDetails
                })
            });

            if (!response.ok) {
                throw new Error(`Server returned status code ${response.status}`);
            }

            const data = await response.json();
            if (data.imageUrl && data.caption) {
                setGenResult({
                    imageUrl: data.imageUrl,
                    caption: data.caption
                });
            } else if (data.image && data.caption) {
                setGenResult({
                    imageUrl: data.image,
                    caption: data.caption
                });
            } else {
                // Fallback / Mock preview in case of unexpected format
                setGenResult({
                    imageUrl: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80",
                    caption: `✨ Experience pure luxury at ${hotelName} in ${district}!\n\nWe are excited to share our latest ${promoGoal} campaign! Tailored in a ${promoStyle} style, enjoy this special offer designed for you.\n\n📞 Message us to learn more or book your stay today! #SriLankaTourism #${district}Hotels`,
                    isMock: true
                });
            }
        } catch (err) {
            console.error("Marketing generation error:", err);
            setGenError("Failed to connect to the generator service. Using simulated preview for demonstration.");
            setGenResult({
                imageUrl: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80",
                caption: `✨ Experience pure luxury at ${hotelName} in ${district}!\n\nWe are excited to share our latest ${promoGoal} campaign! Tailored in a ${promoStyle} style, enjoy this special offer designed for you.\n\n📞 Message us to learn more or book your stay today! #SriLankaTourism #${district}Hotels`,
                isMock: true
            });
        } finally {
            setGenLoading(false);
        }
    };

    // Profile and Metrics state
    const [hotelProfile, setHotelProfile] = useState({ photoUrl: "", desc: "", packages: [], offers: [], amenities: [] });
    const [hotelMetrics, setHotelMetrics] = useState([]);

    // Profile form state
    const [profileForm, setProfileForm] = useState({ photoUrl: "", desc: "", newAmenity: "", newPkgName: "", newPkgPrice: "", newPkgDesc: "", newOfferName: "", newOfferDiscount: "" });
    const [manualData, setManualData] = useState({ date: new Date().toISOString().slice(0, 10), revenue: "", bookings: "" });

    // Creative Analytics states
    const [timeRange, setTimeRange] = useState("30d");
    const [activeChartTab, setActiveChartTab] = useState("revenue");
    const csvInputRef = useRef(null);

    // Simulation states
    const [priceAdjustment, setPriceAdjustment] = useState(0); // -20% to +30%
    const [occupancyBoost, setOccupancyBoost] = useState(0); // -10% to +20%

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
    };

    // ── Analytics data ──────────────────────────────────────────
    const daysCount = useMemo(() => {
        if (timeRange === "7d") return 7;
        if (timeRange === "ytd") return 90;
        return 30; // "30d"
    }, [timeRange]);

    const daily = useMemo(() => {
        let base = buildDailyData(bookings, 30);
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
        return hasData ? base : (hotelUser?.addedByAdmin ? sampleDailyData(30) : zeroDailyData(30));
    }, [bookings, hotelMetrics, hotelUser]);

    const filteredDaily = useMemo(() => {
        let base = buildDailyData(bookings, daysCount);
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
        return hasData ? base : (hotelUser?.addedByAdmin ? sampleDailyData(daysCount) : zeroDailyData(daysCount));
    }, [bookings, hotelMetrics, daysCount, hotelUser]);

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

    // Dynamic stats for local Analytics tab
    const activeTotalRevenue = filteredDaily.reduce((s, d) => s + d.revenue, 0);
    const activeTotalBookingsCount = filteredDaily.reduce((s, d) => s + d.bookings, 0);
    const activeAvgNightly = activeTotalBookingsCount > 0 ? Math.round(activeTotalRevenue / activeTotalBookingsCount) : 0;
    const activeOccupancy = Math.min(99, Math.round((activeTotalBookingsCount / (daysCount * Math.max(1, Number(hotelUser?.rooms) || 10))) * 100));

    // Eco calculations
    const milestonePoints = useMemo(() => {
        const completed = hotelProfile.sustainabilityMilestones || [];
        return completed.reduce((sum, id) => {
            const milestone = SUSTAINABILITY_MILESTONES.find(m => m.id === id);
            return sum + (milestone ? milestone.points : 0);
        }, 0);
    }, [hotelProfile.sustainabilityMilestones]);

    const bookingPoints = activeTotalBookingsCount * 5;
    const totalEcoPoints = milestonePoints + bookingPoints;

    const ecoTier = useMemo(() => {
        if (totalEcoPoints < 150) return { name: "Bronze Leaf Partner", icon: "🥉", next: 150, color: "#d97706" };
        if (totalEcoPoints < 350) return { name: "Silver Leaf Partner", icon: "🥈", next: 350, color: "#94a3b8" };
        if (totalEcoPoints < 600) return { name: "Gold Leaf Partner", icon: "🥇", next: 600, color: "#f59e0b" };
        return { name: "Platinum Leaf Partner", icon: "🏆", next: null, color: "#10b981" };
    }, [totalEcoPoints]);

    const toggleMilestone = async (id) => {
        const current = hotelProfile.sustainabilityMilestones || [];
        const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
        await saveProfileData({ sustainabilityMilestones: next });
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
            
            if (lines.length < 2) {
                alert("CSV file is empty or missing data rows.");
                return;
            }

            // Parse headers
            const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
            const dateIdx = headers.findIndex(h => h.includes("date"));
            const revenueIdx = headers.findIndex(h => h.includes("revenue") || h.includes("price") || h.includes("total"));
            const bookingsIdx = headers.findIndex(h => h.includes("booking") || h.includes("count") || h.includes("qty") || h.includes("rooms"));

            if (dateIdx === -1 || revenueIdx === -1 || bookingsIdx === -1) {
                alert("Invalid CSV format. Please ensure headers contain 'date', 'revenue', and 'bookings'.");
                return;
            }

            const parsedRecords = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(",").map(c => c.trim());
                if (cols.length < Math.max(dateIdx, revenueIdx, bookingsIdx) + 1) continue;

                const rawDate = cols[dateIdx];
                const rawRevenue = cols[revenueIdx];
                const rawBookings = cols[bookingsIdx];

                let formattedDate = rawDate;
                if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
                    const parsed = Date.parse(rawDate);
                    if (isNaN(parsed)) {
                        console.warn(`Skipping invalid date row: ${rawDate}`);
                        continue;
                    }
                    formattedDate = new Date(parsed).toISOString().slice(0, 10);
                }

                const revVal = Number(rawRevenue);
                const bookVal = Number(rawBookings);

                if (isNaN(revVal) || isNaN(bookVal)) {
                    console.warn(`Skipping invalid values on line ${i + 1}: revenue=${rawRevenue}, bookings=${rawBookings}`);
                    continue;
                }

                parsedRecords.push({
                    date: formattedDate,
                    revenue: revVal,
                    bookings: bookVal
                });
            }

            if (parsedRecords.length === 0) {
                alert("No valid data records found in CSV file.");
                return;
            }

            try {
                if (!hotelUser?.id) {
                    alert("User identity not found. Cannot save data.");
                    return;
                }
                await saveHotelMetricsBatch(hotelUser.id, parsedRecords);
                alert(`Successfully imported ${parsedRecords.length} records into your analytics!`);
                if (csvInputRef.current) csvInputRef.current.value = "";
            } catch (err) {
                console.error("Error saving CSV metrics:", err);
                alert("Failed to save records to the database.");
            }
        };

        reader.onerror = () => {
            alert("Error reading CSV file.");
        };

        reader.readAsText(file);
    };

    const weatherAdvice = useMemo(() => {
        return getDistrictAdvice(district);
    }, [district]);

    const demographicsData = useMemo(() => {
        return getDemographics(filteredDaily, activeTotalBookingsCount);
    }, [filteredDaily, activeTotalBookingsCount]);

    const channelsData = useMemo(() => {
        return getChannels(filteredDaily, activeTotalBookingsCount);
    }, [filteredDaily, activeTotalBookingsCount]);

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
    // eslint-disable-next-line no-unused-vars
    const peakDay = prediction.reduce((best, d) => d.revenue > best.revenue ? d : best, prediction[0] || { date: "—", revenue: 0 });
    const trend = prediction[29]?.revenue > prediction[0]?.revenue ? "upward 📈" : "downward 📉";

    // ── Simulation Forecast Calculation ──────────────────────────────────
    const simulatedPrediction = useMemo(() => {
        const pFactor = 1 + priceAdjustment / 100;
        const oFactor = 1 + occupancyBoost / 100;
        return prediction.map(d => ({
            ...d,
            revenue: Math.max(0, Math.round(d.revenue * pFactor * oFactor))
        }));
    }, [prediction, priceAdjustment, occupancyBoost]);

    const simulatedPredTotal = simulatedPrediction.reduce((s, d) => s + d.revenue, 0);
    const simulatedPeakDay = simulatedPrediction.reduce((best, d) => d.revenue > best.revenue ? d : best, simulatedPrediction[0] || { date: "—", revenue: 0 });

    // Room Type Occupancy Demand Probabilities (Creative logic)
    const roomCategoryDemands = useMemo(() => {
        const isMonsoon = weatherAdvice.season.toLowerCase().includes("monsoon") || weatherAdvice.season.toLowerCase().includes("low");
        const priceOffset = priceAdjustment * 0.8; 
        
        return [
            { type: "Deluxe Ocean Suite", baseDemand: isMonsoon ? 65 : 92, color: "#10b981" },
            { type: "Eco Canopy Cabin", baseDemand: isMonsoon ? 55 : 85, color: "#14b8a6" },
            { type: "Presidential Luxury Suite", baseDemand: isMonsoon ? 45 : 78, color: "#8b5cf6" },
            { type: "Standard Forest View", baseDemand: isMonsoon ? 75 : 88, color: "#f59e0b" }
        ].map(cat => {
            const simulatedDemand = Math.min(99, Math.max(10, Math.round(cat.baseDemand + occupancyBoost - priceOffset)));
            return {
                ...cat,
                demand: simulatedDemand
            };
        });
    }, [weatherAdvice, priceAdjustment, occupancyBoost]);

    const addSuggestedEcoPackage = async () => {
        const pkgName = "Weekday Eco Retreat";
        const pkgPrice = 120;
        const pkgDesc = "3-night sustainable escape including guided plantation hiking & composting class. Save 15%!";

        const exists = (hotelProfile.packages || []).some(p => p.name === pkgName);
        if (exists) {
            alert("The Suggested Weekday Eco Retreat package is already active on your profile!");
            return;
        }

        const nextPackages = [...(hotelProfile.packages || []), { name: pkgName, price: pkgPrice, desc: pkgDesc }];
        try {
            await saveProfileData({ packages: nextPackages });
            alert("Success! The Weekday Eco Retreat bundle package has been added and saved to your hotel profile.");
        } catch (err) {
            console.error("Error adding simulated package:", err);
            alert("Failed to save the new package.");
        }
    };

    // ── Seasonality & Future Demographics Calculations ─────────────────
    const predictedNationalities = useMemo(() => {
        const isLowSeason = weatherAdvice.season.toLowerCase().includes("low") || weatherAdvice.season.toLowerCase().includes("monsoon");
        const baseDist = isLowSeason 
            ? { "Germany": 15, "United Kingdom": 18, "Sri Lanka": 45, "France": 12, "Australia": 10 }
            : { "Germany": 32, "United Kingdom": 28, "Sri Lanka": 18, "France": 14, "Australia": 8 };

        const priceEffect = priceAdjustment > 10 ? 3 : 0;
        const slValue = Math.min(80, baseDist["Sri Lanka"] + priceEffect);
        const remainder = 100 - slValue;
        const totalInt = baseDist["Germany"] + baseDist["United Kingdom"] + baseDist["France"] + baseDist["Australia"];
        
        return [
            { label: "Germany", value: Math.round((baseDist["Germany"] / totalInt) * remainder), color: "#2ecc71" },
            { label: "United Kingdom", value: Math.round((baseDist["United Kingdom"] / totalInt) * remainder), color: "#3498db" },
            { label: "Sri Lanka (Local)", value: slValue, color: "#f1c40f" },
            { label: "France", value: Math.round((baseDist["France"] / totalInt) * remainder), color: "#e74c3c" },
            { label: "Australia", value: Math.round((baseDist["Australia"] / totalInt) * remainder), color: "#9b59b6" }
        ].sort((a, b) => b.value - a.value);
    }, [weatherAdvice, priceAdjustment]);

    const climateResilienceScore = useMemo(() => {
        const completedCount = hotelProfile.sustainabilityMilestones?.length || 0;
        return Math.min(100, 20 + completedCount * 20);
    }, [hotelProfile.sustainabilityMilestones]);

    const seasonalityProjections = useMemo(() => {
        const resilienceMultiplier = 1 + (climateResilienceScore * 0.002); 
        const peakRevenue = Math.round(simulatedPredTotal * 1.35);
        const offPeakRevenue = Math.round(simulatedPredTotal * 0.65 * resilienceMultiplier);

        return {
            peakRevenue,
            offPeakRevenue,
            peakGuests: Math.round((peakRevenue / 120)),
            offPeakGuests: Math.round((offPeakRevenue / 110))
        };
    }, [simulatedPredTotal, climateResilienceScore]);

    const revenueDrivers = useMemo(() => {
        const isLowSeason = weatherAdvice.season.toLowerCase().includes("low") || weatherAdvice.season.toLowerCase().includes("monsoon");
        const completedCount = hotelProfile.sustainabilityMilestones?.length || 0;
        
        const growth = [
            { icon: "🍃", text: `Sustainability Leaf Badge: Adds +${completedCount * 5}% organic search visibility` }
        ];
        if (priceAdjustment < 0) {
            growth.push({ icon: "🏷️", text: `Competitive Price Discount: Boosts off-peak conversion by +15%` });
        } else if (priceAdjustment > 10) {
            growth.push({ icon: "💎", text: `Premium Pricing Model: Yields +${priceAdjustment}% higher margins per suite` });
        }
        if (occupancyBoost > 0) {
            growth.push({ icon: "📈", text: `Active Promo Boost: Increases booking acquisition rate by +${occupancyBoost}%` });
        }

        const risks = [];
        if (isLowSeason) {
            risks.push({ icon: "🌧️", text: `Active Regional Monsoon: Rain and high winds reduce beach activity demand by -30%` });
        }
        if (priceAdjustment > 15) {
            risks.push({ icon: "💸", text: `High Price Threshold: May reduce general visitor conversion by -12%` });
        }
        if (completedCount < 2) {
            risks.push({ icon: "⚠️", text: `Low Eco-Credentials: Fewer than 2 green milestones limits eco-traveler interest by -10%` });
        }
        
        if (growth.length === 1) {
            growth.push({ icon: "🤝", text: `Direct Booking Channel: Saves commission fees on +15% of bookings` });
        }
        if (risks.length === 0) {
            risks.push({ icon: "📅", text: `Mid-Week Softness: Minor weekday booking vacancies` });
        }

        return { growth, risks };
    }, [weatherAdvice, priceAdjustment, occupancyBoost, hotelProfile.sustainabilityMilestones]);

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

    const [genCopied, setGenCopied] = useState(false);
    const copyCaption = () => {
        if (!genResult?.caption) return;
        navigator.clipboard.writeText(genResult.caption).then(() => {
            setGenCopied(true);
            setTimeout(() => setGenCopied(false), 2000);
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
        <div style={{ paddingTop: 88, minHeight: "100vh", background: `linear-gradient(160deg, ${LIGHT_BG} 0%, #fff 65%)` }}>
            <style>{`
                /* Premium primary buttons */
                .btn-premium-primary {
                    background-color: #011f4b;
                    color: #ffffff;
                    border: 1.5px solid #011f4b;
                    border-radius: 10px;
                    padding: 10px 22px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(1, 31, 75, 0.1);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    outline: none;
                }
                .btn-premium-primary:hover:not(:disabled) {
                    background-color: #92d2f9;
                    color: #011f4b;
                    border-color: #92d2f9;
                    transform: translateY(-1.5px);
                    box-shadow: 0 6px 16px rgba(146, 210, 249, 0.4);
                }
                .btn-premium-primary:active:not(:disabled) {
                    transform: translateY(0);
                }
                .btn-premium-primary:disabled {
                    background-color: #cbd5e1;
                    color: #94a3b8;
                    border-color: #cbd5e1;
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                /* Premium secondary outline buttons */
                .btn-premium-secondary {
                    background-color: #ffffff;
                    color: #011f4b;
                    border: 1.5px solid #cbd5e1;
                    border-radius: 10px;
                    padding: 10px 20px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    outline: none;
                }
                .btn-premium-secondary:hover:not(:disabled) {
                    background-color: #92d2f9;
                    color: #011f4b;
                    border-color: #92d2f9;
                    transform: translateY(-1.5px);
                    box-shadow: 0 6px 16px rgba(146, 210, 249, 0.3);
                }
                .btn-premium-secondary:active:not(:disabled) {
                    transform: translateY(0);
                }
                .btn-premium-secondary:disabled {
                    background-color: #ffffff;
                    color: #cbd5e1;
                    border-color: #cbd5e1;
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .btn-premium-danger {
                    background-color: #fee2e2;
                    color: #991b1b;
                    border: 1.5px solid #fee2e2;
                    border-radius: 8px;
                    padding: 6px 12px;
                    font-weight: 700;
                    font-size: 0.78rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-premium-danger:hover:not(:disabled) {
                    background-color: #fecaca;
                    color: #b91c1c;
                    border-color: #fecaca;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
                }
                .btn-premium-danger:active:not(:disabled) {
                    transform: translateY(0);
                }

                .btn-premium-sm {
                    padding: 8px 16px;
                    font-size: 0.78rem;
                    border-radius: 8px;
                }
            `}</style>

            {/* ─── Header ─────────────────────────────────────────── */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, #073575)`, color: "#fff", padding: "36px 48px 0" }}>
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
                        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 12, padding: "10px 22px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.85rem", transition: "all 0.25s", boxShadow: "0 4px 12px rgba(1, 31, 75, 0.15)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#92d2f9"; e.currentTarget.style.color = "#011f4b"; e.currentTarget.style.borderColor = "#92d2f9"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    >
                        🚪 Sign Out
                    </button>
                </div>

                {/* KPI cards */}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 0 }}>
                    {[
                        { label: "Total Revenue (30d)", value: `$${totalRevenue.toLocaleString()}`, icon: "💰", color: TEAL },
                        { label: "Total Bookings (30d)", value: totalBookingsCount, icon: "📋", color: "#92d2f9" },
                        { label: "Avg Nightly Rate", value: `$${avgNightly}`, icon: "🛏", color: "#a8daf9" },
                        { label: "Occupancy Rate", value: `${occupancy}%`, icon: "📈", color: "#27ae60" },
                    ].map(s => (
                        <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 22px", minWidth: 155, border: "1px solid rgba(255,255,255,0.08)", flex: "1 1 140px" }}>
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
                            fontFamily: "inherit", fontWeight: tab === t ? 700 : 500, fontSize: "0.88rem",
                            color: tab === t ? "#ffffff" : "#a8daf9",
                            borderBottom: tab === t ? `4px solid #92d2f9` : "4px solid transparent",
                            transition: "all 0.2s ease-in-out",
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
                                            className="btn-premium-primary"
                                            style={{ padding: "10px 20px" }}
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
                                            className="btn-premium-primary"
                                            style={{ alignSelf: "flex-start" }}
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
                                                    style={{ background: "transparent", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: 0, display: "flex", transition: "color 0.2s" }}
                                                    onMouseEnter={e => e.currentTarget.style.color = "#b91c1c"}
                                                    onMouseLeave={e => e.currentTarget.style.color = "#ef4444"}
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
                                            className="btn-premium-primary"
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
                                                    className="btn-premium-danger"
                                                    style={{ marginTop: 12, padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem" }}
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
                                            className="btn-premium-primary"
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
                                                    className="btn-premium-danger"
                                                    style={{ marginTop: 12, padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem" }}
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
                                            className="btn-premium-primary"
                                        >
                                            Add Offer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══════════ ANALYTICS TAB ══════════ */}
                        {tab === "analytics" && (
                            <div className="printable-content" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                                <style>{`
                                    @media print {
                                        body { background: #fff !important; color: #000 !important; }
                                        header, footer, nav, button, .no-print, .header-dashboard-nav {
                                            display: none !important;
                                        }
                                        .printable-content {
                                            position: absolute;
                                            left: 0;
                                            top: 0;
                                            width: 100% !important;
                                            padding: 0 !important;
                                            margin: 0 !important;
                                        }
                                        .card-print {
                                            border: 1px solid #e2ecf0 !important;
                                            box-shadow: none !important;
                                            background: #fff !important;
                                            page-break-inside: avoid;
                                        }
                                    }
                                `}</style>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                                    <div>
                                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: NAVY, marginBottom: 4 }}>Analytics Control Center</h2>
                                        <p style={{ color: "#6b8999", fontSize: "0.88rem" }}>Real-time metrics, sustainable performance, and local tourism insights</p>
                                    </div>
                                    <div className="no-print" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                        {/* Time Range Selector */}
                                        <div style={{ display: "flex", background: "#e2ecf0", padding: 3, borderRadius: 10 }}>
                                            {[
                                                { id: "7d", label: "7 Days" },
                                                { id: "30d", label: "30 Days" },
                                                { id: "ytd", label: "90 Days" },
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTimeRange(t.id)}
                                                    style={{
                                                        padding: "6px 14px",
                                                        border: "none",
                                                        background: timeRange === t.id ? "#011f4b" : "transparent",
                                                        color: timeRange === t.id ? "#fff" : "#6b8999",
                                                        fontWeight: 700,
                                                        fontSize: "0.78rem",
                                                        borderRadius: 8,
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease",
                                                        boxShadow: timeRange === t.id ? "0 2px 6px rgba(1, 31, 75, 0.15)" : "none"
                                                    }}
                                                    onMouseEnter={e => {
                                                        if (timeRange !== t.id) {
                                                            e.currentTarget.style.background = "#d0dfeb";
                                                            e.currentTarget.style.color = "#011f4b";
                                                        }
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (timeRange !== t.id) {
                                                            e.currentTarget.style.background = "transparent";
                                                            e.currentTarget.style.color = "#6b8999";
                                                        }
                                                    }}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => window.print()}
                                            className="btn-premium-secondary btn-premium-sm"
                                        >
                                            🖨️ Export Report
                                        </button>
                                    </div>
                                </div>

                                {/* Custom KPIs Row */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
                                    {[
                                        { label: `Revenue (${timeRange === "7d" ? "7d" : timeRange === "ytd" ? "90d" : "30d"})`, value: `$${activeTotalRevenue.toLocaleString()}`, change: `${timeRange === "7d" ? "Weekly total" : timeRange === "ytd" ? "90-day total" : "Monthly total"}`, icon: "💰", color: TEAL },
                                        { label: "Bookings Count", value: activeTotalBookingsCount, change: "Direct reservations", icon: "📅", color: BLUE },
                                        { label: "Avg Booking Revenue", value: `$${activeAvgNightly}`, change: "Per visitor group", icon: "🏨", color: "#8e44ad" },
                                        { label: "Est. Occupancy Rate", value: `${activeOccupancy}%`, change: `Over ${daysCount} days`, icon: "📈", color: "#27ae60" },
                                    ].map((kpi, idx) => (
                                        <div key={idx} className="card-print" style={card({ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" })}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div>
                                                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{kpi.label}</span>
                                                    <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: NAVY, marginTop: 4, marginBottom: 4 }}>{kpi.value}</h3>
                                                </div>
                                                <span style={{ fontSize: "1.6rem" }}>{kpi.icon}</span>
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                                                <span style={{ color: kpi.color, fontWeight: 700 }}>●</span> {kpi.change}
                                            </div>
                                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: kpi.color }} />
                                        </div>
                                    ))}
                                </div>

                                {/* Main Chart with Selector Toggle */}
                                <div className="card-print" style={card()}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                                        <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "1rem" }}>
                                            📈 {activeChartTab === "revenue" ? "Daily Revenue Trend" : "Daily Bookings Volume"}
                                        </h3>
                                        <div className="no-print" style={{ display: "flex", background: "#e2ecf0", padding: 3, borderRadius: 8 }}>
                                            <button
                                                onClick={() => setActiveChartTab("revenue")}
                                                style={{
                                                    padding: "5px 12px",
                                                    border: "none",
                                                    background: activeChartTab === "revenue" ? "#011f4b" : "transparent",
                                                    color: activeChartTab === "revenue" ? "#fff" : "#64748b",
                                                    fontWeight: 700,
                                                    fontSize: "0.75rem",
                                                    borderRadius: 6,
                                                    cursor: "pointer",
                                                    boxShadow: activeChartTab === "revenue" ? "0 2px 6px rgba(1,31,75,0.15)" : "none",
                                                    transition: "all 0.15s"
                                                }}
                                            >
                                                💰 Revenue
                                            </button>
                                            <button
                                                onClick={() => setActiveChartTab("bookings")}
                                                style={{
                                                    padding: "5px 12px",
                                                    border: "none",
                                                    background: activeChartTab === "bookings" ? "#011f4b" : "transparent",
                                                    color: activeChartTab === "bookings" ? "#fff" : "#64748b",
                                                    fontWeight: 700,
                                                    fontSize: "0.75rem",
                                                    borderRadius: 6,
                                                    cursor: "pointer",
                                                    boxShadow: activeChartTab === "bookings" ? "0 2px 6px rgba(1,31,75,0.15)" : "none",
                                                    transition: "all 0.15s"
                                                }}
                                            >
                                                📋 Bookings
                                            </button>
                                        </div>
                                    </div>
                                    {activeChartTab === "revenue" ? (
                                        <InteractiveAreaChart data={filteredDaily} labelKey="date" valueKey="revenue" color={TEAL} unit="$" />
                                    ) : (
                                        <InteractiveAreaChart data={filteredDaily} labelKey="date" valueKey="bookings" color={BLUE} unit="" />
                                    )}
                                </div>

                                {/* Row for Eco Impact Performance */}
                                <div className="card-print" style={card({ background: "linear-gradient(160deg, #f0fdf4 0%, #fff 60%)", border: "1px solid #bbf7d0" })}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: "1.4rem" }}>🌿</span>
                                                <h3 style={{ color: "#166534", fontWeight: 800, fontSize: "1.1rem" }}>Eco-Sustainability Impact</h3>
                                            </div>
                                            <p style={{ color: "#15803d", fontSize: "0.78rem", marginTop: 4 }}>
                                                Estimated ecological savings based on green certification & guest nights
                                            </p>
                                        </div>
                                        {/* Eco Tier Badge */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "6px 14px", borderRadius: 12, border: `1.5px solid ${ecoTier.color}` }}>
                                            <span style={{ fontSize: "1.2rem" }}>{ecoTier.icon}</span>
                                            <div>
                                                <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Hotel Partner Level</div>
                                                <div style={{ fontSize: "0.78rem", color: NAVY, fontWeight: 800 }}>{ecoTier.name}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Leaf Progress Bar */}
                                    <div style={{ marginTop: 20 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#15803d", fontWeight: 700, marginBottom: 6 }}>
                                            <span>Eco Score Points: {totalEcoPoints} pts</span>
                                            {ecoTier.next ? (
                                                <span>Next Milestone: {ecoTier.next} pts</span>
                                            ) : (
                                                <span>🏆 Top Certification Level Reached!</span>
                                            )}
                                        </div>
                                        <div style={{ height: 10, background: "#dcfce7", borderRadius: 5, overflow: "hidden", position: "relative" }}>
                                            <div style={{
                                                width: ecoTier.next ? `${Math.min(100, (totalEcoPoints / ecoTier.next) * 100)}%` : "100%",
                                                height: "100%",
                                                background: "linear-gradient(90deg, #10b981, #14b8a6)",
                                                borderRadius: 5,
                                                transition: "width 0.5s ease"
                                            }} />
                                        </div>
                                        <p style={{ fontSize: "0.75rem", color: "#166534", marginTop: 8, fontStyle: "italic" }}>
                                            {ecoTier.next 
                                                ? `✨ You are in the ${ecoTier.name} tier. Complete sustainable tasks or earn bookings to gather ${ecoTier.next - totalEcoPoints} more points for the next level!`
                                                : "🌟 Sensational work! Your hotel has reached the prestigious Platinum Leaf Certification level!"
                                            }
                                        </p>
                                    </div>

                                    {/* Eco Stats Grid */}
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginTop: 22 }}>
                                        {[
                                            { title: "CO₂ Emissions Saved", value: `${Math.round(activeTotalBookingsCount * 12.4)} kg`, desc: "Offset through solar/efficient grid", icon: "🌱", color: "#10b981", bg: "#ecfdf5" },
                                            { title: "Water Preserved", value: `${Math.round(activeTotalBookingsCount * 85)} L`, desc: "Low flow + harvesting", icon: "💧", color: "#06b6d4", bg: "#ecfeff" },
                                            { title: "Plastics Diverted", value: `${activeTotalBookingsCount * 3} pcs`, desc: "Single-use bottles avoided", icon: "🚫", color: "#d97706", bg: "#fffbeb" },
                                            { title: "Organic Meals Sourced", value: `${(activeTotalBookingsCount * 1.5).toFixed(1)} kg`, desc: "Sourced from farm on site", icon: "🍎", color: "#84cc16", bg: "#f7fee7" },
                                        ].map((stat, i) => (
                                            <div key={i} style={{ background: stat.bg, border: `1px solid ${stat.color}22`, borderRadius: 14, padding: 14 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span style={{ fontSize: "1.1rem" }}>{stat.icon}</span>
                                                    <span style={{ fontSize: "1.15rem", fontWeight: 800, color: stat.color }}>{stat.value}</span>
                                                </div>
                                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: NAVY, marginTop: 6 }}>{stat.title}</div>
                                                <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: 2 }}>{stat.desc}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Interactive Milestone Checklist */}
                                    <div style={{ marginTop: 24, borderTop: "1px dashed #bbf7d0", paddingTop: 18 }}>
                                        <h4 style={{ color: "#166534", fontWeight: 700, fontSize: "0.85rem", marginBottom: 12 }}>
                                            📝 Complete Sustainability Milestones (+Points)
                                        </h4>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                                            {SUSTAINABILITY_MILESTONES.map(milestone => {
                                                const isCompleted = (hotelProfile.sustainabilityMilestones || []).includes(milestone.id);
                                                return (
                                                    <div
                                                        key={milestone.id}
                                                        onClick={() => toggleMilestone(milestone.id)}
                                                        style={{
                                                            background: isCompleted ? "#fff" : "rgba(255,255,255,0.4)",
                                                            border: `1.5px solid ${isCompleted ? "#10b981" : "#e2ecf0"}`,
                                                            borderRadius: 10,
                                                            padding: "10px 14px",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 10,
                                                            transition: "all 0.18s ease"
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                                                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                                                    >
                                                        <div style={{
                                                            width: 16,
                                                            height: 16,
                                                            borderRadius: 4,
                                                            border: `2px solid ${isCompleted ? "#10b981" : "#cbd5e1"}`,
                                                            background: isCompleted ? "#10b981" : "transparent",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#fff",
                                                            fontSize: "0.6rem",
                                                            fontWeight: 800
                                                        }}>
                                                            {isCompleted && "✓"}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY }}>{milestone.title}</div>
                                                            <div style={{ fontSize: "0.65rem", color: "#64748b" }}>{milestone.desc}</div>
                                                        </div>
                                                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "2px 6px", borderRadius: 4 }}>
                                                            +{milestone.points}p
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Demographics & Booking Channels Container */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                                    {/* Left: Demographics Donut */}
                                    <div className="card-print" style={card()}>
                                        <InteractiveDonutChart data={demographicsData} title="🌐 Guest Demographics (Top)" />
                                    </div>

                                    {/* Right: Booking Referral Channels */}
                                    <div className="card-print" style={card()}>
                                        <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "0.85rem", marginBottom: 14 }}>
                                            🔗 Booking Acquisition Channels
                                        </h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            {channelsData.map((channel, i) => {
                                                const maxChannelVal = Math.max(...channelsData.map(c => c.value), 1);
                                                const barPct = Math.round((channel.value / maxChannelVal) * 100);
                                                return (
                                                    <div key={i}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: NAVY, marginBottom: 4 }}>
                                                            <span style={{ fontWeight: 600 }}>{channel.label}</span>
                                                            <span style={{ color: "#64748b" }}>{channel.value} booking(s)</span>
                                                        </div>
                                                        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                                            <div style={{
                                                                width: `${barPct}%`,
                                                                height: "100%",
                                                                background: channel.color,
                                                                borderRadius: 4,
                                                                transition: "width 0.5s ease"
                                                            }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Weather & Seasonal Advisor Row */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                                    {/* Left: Micro Weather Widget */}
                                    <div className="card-print" style={card({ background: "linear-gradient(135deg, #0f2030, #1e3a50)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" })}>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div>
                                                    <span style={{ fontSize: "0.75rem", letterSpacing: 1.5, textTransform: "uppercase", color: TEAL, fontWeight: 700 }}>
                                                        📍 Local District Forecast
                                                    </span>
                                                    <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginTop: 4 }}>{district} Climate</h3>
                                                </div>
                                                <span style={{ fontSize: "0.78rem", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 20 }}>
                                                    {weatherAdvice.season.split(" ")[0]}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 8, lineHeight: 1.4 }}>
                                                Current Pattern: <strong>{weatherAdvice.season}</strong>. {weatherAdvice.weather}
                                            </p>
                                        </div>

                                        {/* 3 Day forecast blocks */}
                                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, marginTop: 14 }}>
                                            {weatherAdvice.forecast.map((fc, i) => (
                                                <div key={i} style={{ textAlign: "center", flex: 1 }}>
                                                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{fc.day}</div>
                                                    <div style={{ fontSize: "1.6rem", margin: "4px 0" }}>{fc.icon}</div>
                                                    <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{fc.temp}</div>
                                                    <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{fc.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Advisor Tips Card */}
                                    <div className="card-print" style={card({ border: "1px solid #bfdbfe", background: "#f8fafc" })}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                            <span style={{ fontSize: "1.2rem" }}>💡</span>
                                            <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "0.95rem" }}>
                                                Sustainable Marketing Advice
                                            </h3>
                                        </div>
                                        <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                                            {weatherAdvice.tips.map((tip, idx) => (
                                                <li key={idx} style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.5 }}>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Manual Data Entry Form */}
                                <div className="card-print no-print" style={{ background: "#f8fbfd", padding: "20px 24px", borderRadius: 16, border: "1px solid #e2ecf0" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                                        <h3 style={{ color: NAVY, fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>➕ Add Past Data</h3>
                                        <div>
                                            <input 
                                                type="file" 
                                                ref={csvInputRef} 
                                                onChange={handleCsvUpload} 
                                                accept=".csv" 
                                                style={{ display: "none" }} 
                                            />
                                            <button
                                                onClick={() => csvInputRef.current && csvInputRef.current.click()}
                                                className="btn-premium-secondary btn-premium-sm"
                                            >
                                                📁 Import CSV Data
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "0.8rem", color: "#6b8999", marginBottom: 16 }}>Input historical revenue and bookings for a specific date to improve your analytics.</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                                        <input type="date" value={manualData.date} onChange={e => setManualData({ ...manualData, date: e.target.value })} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #e2ecf0" }} />
                                        <input type="number" placeholder="Total Revenue ($)" value={manualData.revenue} onChange={e => setManualData({ ...manualData, revenue: e.target.value })} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #e2ecf0", width: 160 }} />
                                        <input type="number" placeholder="Bookings Count" value={manualData.bookings} onChange={e => setManualData({ ...manualData, bookings: e.target.value })} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #e2ecf0", width: 140 }} />
                                        <button
                                            onClick={handleAddManualData}
                                            disabled={!manualData.revenue || !manualData.bookings}
                                            className="btn-premium-primary"
                                        >
                                            Save Entry
                                        </button>
                                    </div>
                                </div>

                                {/* Daily breakdown table - recent 7 days */}
                                <div className="card-print" style={card()}>
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
                                                {filteredDaily.slice(-7).reverse().map((d, i) => {
                                                    const avg = d.bookings > 0 ? Math.round(d.revenue / d.bookings) : 0;
                                                    const pct = Math.round((d.revenue / Math.max(...filteredDaily.map(x => x.revenue), 1)) * 100);
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
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                                    <div>
                                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: NAVY, marginBottom: 4 }}>Next Month Demand & Forecast</h2>
                                        <p style={{ color: "#6b8999", fontSize: "0.88rem" }}>AI-powered linear trend projections combined with real-time pricing simulations</p>
                                    </div>
                                </div>

                                {/* Simulation Sliders Control */}
                                <div style={{ background: "linear-gradient(160deg, #f3f8fb 0%, #fff 60%)", padding: "24px 28px", borderRadius: 18, border: "1.5px dashed #0a7fa533" }}>
                                    <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "0.95rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                        <span>🎛️ Interactive Revenue Simulation Engine</span>
                                    </h3>
                                    
                                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                                        {/* Slider 1: Price Adjustment */}
                                        <div style={{ flex: "1 1 240px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                                                <span>Price Adjustment (%)</span>
                                                <span style={{ color: priceAdjustment >= 0 ? TEAL : "#ef4444" }}>
                                                    {priceAdjustment >= 0 ? `+${priceAdjustment}%` : `${priceAdjustment}%`}
                                                </span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="-20" 
                                                max="30" 
                                                value={priceAdjustment} 
                                                onChange={e => setPriceAdjustment(Number(e.target.value))} 
                                                style={{ width: "100%", cursor: "pointer", accentColor: TEAL }} 
                                            />
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#94a3b8", marginTop: 4 }}>
                                                <span>-20% (Soft demand)</span>
                                                <span>0% (Base)</span>
                                                <span>+30% (Peak pricing)</span>
                                            </div>
                                        </div>

                                        {/* Slider 2: Occupancy Boost */}
                                        <div style={{ flex: "1 1 240px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                                                <span>Occupancy Adjustment (%)</span>
                                                <span style={{ color: occupancyBoost >= 0 ? BLUE : "#ef4444" }}>
                                                    {occupancyBoost >= 0 ? `+${occupancyBoost}%` : `${occupancyBoost}%`}
                                                </span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="-10" 
                                                max="20" 
                                                value={occupancyBoost} 
                                                onChange={e => setOccupancyBoost(Number(e.target.value))} 
                                                style={{ width: "100%", cursor: "pointer", accentColor: BLUE }} 
                                            />
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#94a3b8", marginTop: 4 }}>
                                                <span>-10% (Low season)</span>
                                                <span>0% (Base)</span>
                                                <span>+20% (Promo boost)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Simulated Forecast KPIs */}
                                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                    {[
                                        { 
                                            label: "Simulated Revenue", 
                                            value: `$${simulatedPredTotal.toLocaleString()}`, 
                                            sub: priceAdjustment !== 0 || occupancyBoost !== 0 
                                                ? `Diff: ${simulatedPredTotal - predTotal >= 0 ? "+" : ""}${(simulatedPredTotal - predTotal).toLocaleString()} (${Math.round(((simulatedPredTotal - predTotal) / Math.max(predTotal, 1)) * 100)}%)` 
                                                : "AI standard prediction",
                                            icon: "💰", 
                                            color: simulatedPredTotal - predTotal >= 0 ? TEAL : "#ef4444", 
                                            bg: simulatedPredTotal - predTotal >= 0 ? "#e6faf9" : "#fef2f2" 
                                        },
                                        { label: "Predicted Peak Day", value: simulatedPeakDay.date?.slice(5), sub: `Forecasted Peak: $${simulatedPeakDay.revenue?.toLocaleString()}`, icon: "🏆", color: "#f39c12", bg: "#fef9ec" },
                                        { label: "Average Daily Rate", value: `$${Math.round(simulatedPredTotal / 30)}`, sub: "Over next 30 days", icon: "🛌", color: "#8b5cf6", bg: "#f3eeff" },
                                        { label: "Overall Trend Direction", value: trend, sub: "Linear regression model", icon: "🔮", color: BLUE, bg: "#e0f2fe" },
                                    ].map((s, idx) => (
                                        <div key={idx} style={{ background: s.bg, borderRadius: 16, padding: "16px 20px", flex: "1 1 210px", border: `1.5px solid ${s.color}22`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                            <div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</span>
                                                    <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
                                                </div>
                                                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: NAVY }}>{s.value}</div>
                                            </div>
                                            <div style={{ fontSize: "0.72rem", color: s.color, fontWeight: 600, marginTop: 8 }}>{s.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Simulated Forecast chart */}
                                <div style={card()}>
                                    <h3 style={{ color: NAVY, fontWeight: 800, marginBottom: 16, fontSize: "1rem" }}>
                                        🔮 Simulated Next 30 Days Daily Revenue Forecast
                                    </h3>
                                    <InteractiveAreaChart data={simulatedPrediction} labelKey="date" valueKey="revenue" color="#9b59b6" unit="$" />
                                </div>

                                {/* Room category occupancies & Decisions Center */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                                    {/* Left: Occupancy Probability Forecast */}
                                    <div style={card()}>
                                        <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "0.95rem", marginBottom: 14 }}>
                                            📊 Predicted Occupancy Demand by Room Type
                                        </h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                            {roomCategoryDemands.map((cat, i) => (
                                                <div key={i}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: NAVY, marginBottom: 4 }}>
                                                        <span style={{ fontWeight: 700 }}>{cat.type}</span>
                                                        <span style={{ color: cat.demand > 80 ? "#10b981" : cat.demand > 50 ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>
                                                            {cat.demand}% {cat.demand > 80 ? "High" : cat.demand > 50 ? "Moderate" : "Low"}
                                                        </span>
                                                    </div>
                                                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                                        <div style={{
                                                            width: `${cat.demand}%`,
                                                            height: "100%",
                                                            background: cat.color,
                                                            borderRadius: 4,
                                                            transition: "width 0.4s ease"
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Decisions Center */}
                                    <div style={card({ border: "1px solid #e2ecf0", display: "flex", flexDirection: "column", justifyContent: "space-between" })}>
                                        <div>
                                            <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "0.95rem", marginBottom: 12 }}>
                                                💡 Smart Decisions Optimizer
                                            </h3>
                                            <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5, marginBottom: 16 }}>
                                                Based on predicted room occupancies and Sri Lanka seasonal parameters:
                                            </p>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {/* Decision 1: Low Occupancy Bundle creation */}
                                            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 12, border: "1px solid #e2ecf0" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY }}>🎁 Weekday Demand Booster</span>
                                                    <span style={{ fontSize: "0.65rem", background: "#ecfdf5", color: "#10b981", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Recommended</span>
                                                </div>
                                                <p style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.4, marginBottom: 8 }}>
                                                    Eco Cabin demand is soft. Bundle a 3-night stay with guided hiking tours to boost occupancy.
                                                </p>
                                                <button
                                                    onClick={addSuggestedEcoPackage}
                                                    className="btn-premium-primary btn-premium-sm"
                                                >
                                                    Add Suggested Eco-Package
                                                </button>
                                            </div>

                                            {/* Decision 2: Weather & Season Warning */}
                                            <div style={{ background: "#fefbeb", padding: 12, borderRadius: 12, border: "1px solid #fef3c7" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#b45309" }}>🌦️ Seasonal Risk Advisor</span>
                                                    <span style={{ fontSize: "0.65rem", background: "#fef3c7", color: "#b45309", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Climate-linked</span>
                                                </div>
                                                <p style={{ fontSize: "0.72rem", color: "#78350f", lineHeight: 1.4 }}>
                                                    District {district} is in its {weatherAdvice.season.toLowerCase()}. Forecasted rain may lower standard beach reservations. Shift focus to wellness.
                                                </p>
                                            </div>

                                            {/* Decision 3: Marketing Sync */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", padding: 12, borderRadius: 12, border: "1px solid #bbf7d0" }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#166534" }}>📣 Campaign Synchronizer</div>
                                                    <p style={{ fontSize: "0.7rem", color: "#15803d", lineHeight: 1.3, marginTop: 2 }}>
                                                        Align social media calendar with predicted peak demands.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setTab("social")}
                                                    className="btn-premium-secondary btn-premium-sm"
                                                >
                                                    Open Social Tab
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seasonality & Drivers Expanded Section */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                                    {/* Left: Forecasted Guest Nationalities */}
                                    <div style={card({ display: "flex", flexDirection: "column", justifyContent: "space-between" })}>
                                        <div>
                                            <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "0.95rem", marginBottom: 12 }}>
                                                🔮 Forecasted Guest Nationalities (Next 30 Days)
                                            </h3>
                                            <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5, marginBottom: 16 }}>
                                                Predicted country of origin based on upcoming season parameters and active simulated adjustments:
                                            </p>
                                        </div>
                                        
                                        <div style={{ marginTop: "auto", padding: "10px 0" }}>
                                            <InteractiveDonutChart data={predictedNationalities} title="Forecasted Share" />
                                        </div>
                                    </div>

                                    {/* Right: Season vs Off-Season & Resilience */}
                                    <div style={card({ display: "flex", flexDirection: "column", justifyContent: "space-between" })}>
                                        <div>
                                            <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "0.95rem", marginBottom: 12 }}>
                                                🏖️ Seasonality Comparison & Climate Resilience
                                            </h3>
                                            <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5, marginBottom: 16 }}>
                                                Simulated revenue levels across peak dry and monsoon low-seasons for your district:
                                            </p>
                                        </div>

                                        <div style={{ margin: "20px 0" }}>
                                            <InteractiveComparisonBarChart 
                                                data={[
                                                    { label: "☀️ Peak Season", value: seasonalityProjections.peakRevenue, color: TEAL },
                                                    { label: "🌧️ Off-Peak / Monsoon", value: seasonalityProjections.offPeakRevenue, color: "#f59e0b" }
                                                ]} 
                                            />
                                        </div>

                                        {/* Climate Resilience Meter */}
                                        <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", padding: "14px 16px", borderRadius: 12, border: "1px solid #bbf7d0" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#166534" }}>🌿 Monsoon Climate Resilience Index</span>
                                                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#166534" }}>{climateResilienceScore}%</span>
                                            </div>
                                            <p style={{ fontSize: "0.7rem", color: "#15803d", lineHeight: 1.4, margin: 0 }}>
                                                {climateResilienceScore > 75 
                                                    ? "Excellent resilience! Your green milestones preserve low-season bookings. Eco-travelers sustain your occupancy." 
                                                    : "Moderate resilience. Enable more green milestones (solar, organic food) to attract year-round premium eco-travelers."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue Growth & Risk Drivers */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                                    {/* Left: Growth Drivers */}
                                    <div style={card()}>
                                        <h3 style={{ color: "#10b981", fontWeight: 800, fontSize: "0.92rem", marginBottom: 12 }}>
                                            📈 Revenue Growth Drivers (Positive Factors)
                                        </h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            {revenueDrivers.growth.map((drv, i) => (
                                                <div key={i} style={{ display: "flex", gap: 10, background: "#ecfdf5", padding: "10px 14px", borderRadius: 10, border: "1px solid #d1fae5" }}>
                                                    <span style={{ fontSize: "1.1rem" }}>{drv.icon}</span>
                                                    <span style={{ fontSize: "0.75rem", color: "#065f46", fontWeight: 600, lineHeight: 1.4 }}>{drv.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Risk/Decline Drivers */}
                                    <div style={card()}>
                                        <h3 style={{ color: "#ef4444", fontWeight: 800, fontSize: "0.92rem", marginBottom: 12 }}>
                                            📉 Revenue Risk Drivers (Negative Factors)
                                        </h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            {revenueDrivers.risks.map((drv, i) => (
                                                <div key={i} style={{ display: "flex", gap: 10, background: "#fef2f2", padding: "10px 14px", borderRadius: 10, border: "1px solid #fee2e2" }}>
                                                    <span style={{ fontSize: "1.1rem" }}>{drv.icon}</span>
                                                    <span style={{ fontSize: "0.75rem", color: "#991b1b", fontWeight: 600, lineHeight: 1.4 }}>{drv.text}</span>
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

                                {/* Revenue summary */}
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
                                            AI-Powered Marketing Assistant
                                        </h2>
                                        <p style={{ color: "#6b8999", fontSize: "0.88rem" }}>
                                            Generate custom visual assets and captions, or use the automated campaign calendar.
                                        </p>
                                    </div>
                                </div>

                                {/* Sub-tabs selection */}
                                <div style={{ display: "flex", borderBottom: "1.5px solid #e2ecf0", gap: 20 }}>
                                    <button 
                                        onClick={() => setSocialSubTab("generator")}
                                        style={{
                                            padding: "10px 16px 14px",
                                            background: "transparent",
                                            border: "none",
                                            borderBottom: socialSubTab === "generator" ? "3px solid #011f4b" : "3px solid transparent",
                                            color: socialSubTab === "generator" ? "#011f4b" : "#6b8999",
                                            fontWeight: 700,
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                            transition: "all 0.18s ease"
                                        }}
                                    >
                                        🎨 Custom AI Poster & Flyer Generator
                                    </button>
                                    <button 
                                        onClick={() => setSocialSubTab("calendar")}
                                        style={{
                                            padding: "10px 16px 14px",
                                            background: "transparent",
                                            border: "none",
                                            borderBottom: socialSubTab === "calendar" ? "3px solid #011f4b" : "3px solid transparent",
                                            color: socialSubTab === "calendar" ? "#011f4b" : "#6b8999",
                                            fontWeight: 700,
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                            transition: "all 0.18s ease"
                                        }}
                                    >
                                        📅 30-Day Marketing Calendar
                                    </button>
                                </div>

                                {socialSubTab === "generator" ? (
                                    /* ══════════ AI CUSTOM GENERATOR ══════════ */
                                    <div className="generator-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                                        {/* Configuration Form */}
                                        <div style={{ ...card(), display: "flex", flexDirection: "column", gap: 16 }}>
                                            <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "1.1rem", marginBottom: 4 }}>Campaign Requirements</h3>
                                            <p style={{ color: "#6b8999", fontSize: "0.82rem", marginTop: -10 }}>Define the specifications for your AI-generated promotion poster or flyer.</p>
                                            
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                                <div>
                                                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY, display: "block", marginBottom: 6 }}>Promotion Type</label>
                                                    <select value={promoType} onChange={e => setPromoType(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.82rem", outline: "none", color: NAVY, background: "#fff" }}>
                                                        <option value="Poster">🎨 Poster</option>
                                                        <option value="Flyer">📄 Flyer</option>
                                                        <option value="Social Post">📱 Social Post</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY, display: "block", marginBottom: 6 }}>Campaign Goal</label>
                                                    <select value={promoGoal} onChange={e => setPromoGoal(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.82rem", outline: "none", color: NAVY, background: "#fff" }}>
                                                        <option value="Seasonal Discount">🏷️ Seasonal Discount</option>
                                                        <option value="New Feature/Villa">✨ New Feature / Villa</option>
                                                        <option value="Eco Experience">🌿 Eco Experience</option>
                                                        <option value="Special Package">🎁 Special Package</option>
                                                        <option value="Event Promotion">🎉 Event Promotion</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                                <div>
                                                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY, display: "block", marginBottom: 6 }}>Vibe & Visual Style</label>
                                                    <select value={promoStyle} onChange={e => setPromoStyle(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.82rem", outline: "none", color: NAVY, background: "#fff" }}>
                                                        <option value="Modern Coastal">🌊 Modern Coastal</option>
                                                        <option value="Jungle Eco">🌴 Jungle Eco</option>
                                                        <option value="Luxury Beach">💎 Luxury Beach</option>
                                                        <option value="Cultural Heritage">🛕 Cultural Heritage</option>
                                                        <option value="Minimalist">⚪ Minimalist</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY, display: "block", marginBottom: 6 }}>Tone of Voice</label>
                                                    <select value={promoTone} onChange={e => setPromoTone(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.82rem", outline: "none", color: NAVY, background: "#fff" }}>
                                                        <option value="Elegant">✨ Elegant</option>
                                                        <option value="Adventurous">🧗 Adventurous</option>
                                                        <option value="Friendly">😊 Friendly</option>
                                                        <option value="Relaxing">🧘 Relaxing</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY, display: "block", marginBottom: 6 }}>Custom Details & Requirements</label>
                                                <textarea 
                                                    value={promoDetails} 
                                                    onChange={e => setPromoDetails(e.target.value)} 
                                                    placeholder="e.g. Promote our brand new beachfront sunset dining area offering a 20% discount on lobster platters this Friday night. Write the caption in English and mention eco-friendly seafood."
                                                    style={{ width: "100%", height: 100, padding: "12px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.82rem", outline: "none", resize: "none", color: NAVY, fontFamily: "inherit" }}
                                                />
                                            </div>

                                            <button
                                                onClick={generateMarketingAsset}
                                                disabled={genLoading}
                                                className="btn-premium-primary"
                                                style={{ width: "100%", padding: "14px 20px", marginTop: 6 }}
                                            >
                                                {genLoading ? "⏳ Preparing Asset..." : "🎨 Generate Marketing Asset"}
                                            </button>
                                        </div>

                                        {/* Result Preview Panel */}
                                        <div style={{ ...card(), display: "flex", flexDirection: "column", gap: 16, minHeight: 400, justifyContent: genResult || genLoading ? "flex-start" : "center" }}>
                                            {genLoading && (
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: 24, textAlign: "center" }}>
                                                    <div style={{ width: 50, height: 50, borderRadius: "50%", border: `4px solid ${TEAL}22`, borderTopColor: TEAL, animation: "spin 1s linear infinite", marginBottom: 20 }} />
                                                    <h4 style={{ color: NAVY, fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>Designing Content via n8n...</h4>
                                                    <p style={{ color: "#0a7fa5", fontSize: "0.82rem", fontWeight: 600 }}>
                                                        {loadingQuotes[activeQuoteIdx]}
                                                    </p>
                                                </div>
                                            )}

                                            {!genLoading && !genResult && (
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
                                                    <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🖼️</div>
                                                    <h4 style={{ color: NAVY, fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>Ready to Generate</h4>
                                                    <p style={{ color: "#6b8999", fontSize: "0.82rem", maxWidth: 300, lineHeight: 1.5 }}>
                                                        Specify your marketing details on the left and trigger the AI workflow. Your flyer/poster design and captions will render here.
                                                    </p>
                                                </div>
                                            )}

                                            {!genLoading && genResult && (
                                                <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #f1f5f9", paddingBottom: 10 }}>
                                                        <h3 style={{ color: NAVY, fontWeight: 800, fontSize: "0.95rem" }}>🤖 Generated Result</h3>
                                                        <span style={{ fontSize: "0.72rem", background: genResult.isMock ? "#fff8e6" : "#ecfdf5", color: genResult.isMock ? "#b7791f" : "#059669", border: `1px solid ${genResult.isMock ? "#fef3c7" : "#a7f3d0"}`, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                                                            {genResult.isMock ? "Simulated Demo" : "Live Output"}
                                                        </span>
                                                    </div>

                                                    {genError && (
                                                        <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 10, padding: "8px 12px", fontSize: "0.74rem", color: "#b7791f", lineHeight: 1.4 }}>
                                                            ⚠️ {genError}
                                                        </div>
                                                    )}

                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                                                        {/* Visual Output */}
                                                        <div>
                                                            <label style={{ fontSize: "0.76rem", fontWeight: 700, color: NAVY, display: "block", marginBottom: 6 }}>Marketing Image (Poster/Flyer)</label>
                                                            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid #e2ecf0" }}>
                                                                <img src={genResult.imageUrl} alt="Generated Flyer" style={{ width: "100%", height: "auto", display: "block", maxHeight: 320, objectFit: "cover" }} />
                                                                <div style={{ position: "absolute", bottom: 12, right: 12 }}>
                                                                    <a 
                                                                        href={genResult.imageUrl} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        style={{ background: "rgba(10,24,38,0.85)", color: "#fff", textDecoration: "none", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(6px)", display: "inline-block" }}
                                                                    >
                                                                        👁️ View Image
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Caption Output */}
                                                        <div>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                                <label style={{ fontSize: "0.76rem", fontWeight: 700, color: NAVY }}>Social Media Caption</label>
                                                                <button
                                                                    onClick={copyCaption}
                                                                    className={genCopied ? "" : "btn-premium-secondary btn-premium-sm"}
                                                                    style={genCopied ? {
                                                                        background: "#d1fae5",
                                                                        color: "#065f46",
                                                                        border: "none", borderRadius: 6, padding: "6px 12px",
                                                                        cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.74rem"
                                                                    } : { padding: "4px 10px", borderRadius: 6, fontSize: "0.74rem" }}
                                                                >
                                                                    {genCopied ? "✅ Copied!" : "📋 Copy Caption"}
                                                                </button>
                                                            </div>
                                                            <div style={{ background: "#f8fafc", border: "1px solid #e2ecf0", borderRadius: 10, padding: "12px 14px", fontSize: "0.82rem", lineHeight: 1.6, color: "#334155", maxHeight: 150, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                                                {genResult.caption}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* ══════════ 30-DAY CONTENT CALENDAR ══════════ */
                                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
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
                                            <button
                                                onClick={downloadPlan}
                                                style={{ background: `linear-gradient(135deg,${BLUE},${TEAL})`, color: "#fff", border: "none", borderRadius: 12, padding: "10px 18px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.8rem", boxShadow: "0 4px 14px rgba(10,127,165,0.2)" }}
                                            >
                                                ⬇️ Download 30-Day Plan
                                            </button>
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
                                    </div>
                                )}

                                {/* Shared Hashtag bank */}
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

                        {/* ══════════ ROOM MATRIX TAB ══════════ */}
                        {tab === "rooms" && (
                            <RoomMatrix 
                                hotelUser={hotelUser}
                                hotelProfile={hotelProfile}
                                bookings={bookings}
                                saveProfileData={saveProfileData}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
//  ROOM MATRIX & LIVE STATUS COMPONENT (Tailwind Dark-Themed)
// ═══════════════════════════════════════════════════════════════

function RoomMatrix({ hotelUser, hotelProfile, bookings = [], saveProfileData }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Assign Mode state: holds the booking request to be assigned
    const [selectedBookingForAssign, setSelectedBookingForAssign] = useState(null);

    // Modal state for manually updating status or manual booking details
    const [modalStatus, setModalStatus] = useState("available");
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [checkinDate, setCheckinDate] = useState("");
    const [checkoutDate, setCheckoutDate] = useState("");
    const [specialNotes, setSpecialNotes] = useState("");

    const [activityLogs, setActivityLogs] = useState([
        { id: 1, time: new Date().toLocaleTimeString(), message: "Room Matrix Console active.", type: "system" }
    ]);

    const hotelName = hotelUser?.hotelName || "Your Hotel";
    const hotelId = hotelUser?.id || "";

    // Helper to log activities
    const addLog = (message, type = "info") => {
        const time = new Date().toLocaleTimeString();
        setActivityLogs(prev => [
            { id: Date.now(), time, message, type },
            ...prev.slice(0, 14)
        ]);
    };

    // Load rooms list from synced profile
    const currentRooms = useMemo(() => {
        return hotelProfile?.rooms || [];
    }, [hotelProfile]);

    // Unique room categories for filters
    const roomCategories = useMemo(() => {
        const categories = new Set(currentRooms.map(r => r.type));
        return ["All", ...Array.from(categories)];
    }, [currentRooms]);

    // Initialize hotel rooms in Firebase if not already set
    useEffect(() => {
        if (hotelId && hotelProfile && (!hotelProfile.rooms || hotelProfile.rooms.length === 0)) {
            const roomCount = Number(hotelUser?.rooms) || 12;
            const generatedRooms = [];
            const categories = [
                "Deluxe Ocean Suite",
                "Eco Canopy Cabin",
                "Presidential Luxury Suite",
                "Standard Forest View"
            ];
            for (let i = 0; i < roomCount; i++) {
                const floor = Math.floor(i / 4) + 1;
                const num = floor * 100 + (i % 4) + 1;
                const category = categories[i % categories.length];
                generatedRooms.push({
                    id: `room_${num}`,
                    number: `${num}`,
                    type: category,
                    status: "available",
                    guestDetails: null
                });
            }
            saveProfileData({ rooms: generatedRooms });
            addLog(`Initialized ${roomCount} room units for ${hotelName}`, "system");
        }
    }, [hotelId, hotelProfile, hotelUser, saveProfileData, hotelName]);

    // Extract booking requests that belong to this hotel and are not yet assigned a physical room number
    const unassignedBookings = useMemo(() => {
        return bookings.filter(b => {
            if (b.status === "cancelled" || b.status === "completed") return false;
            
            // Check if this booking ID is present in any room's guest details
            const isAssignedInRoom = currentRooms.some(r => r.guestDetails?.bookingId === b.id);
            if (isAssignedInRoom) return false;

            // Check if the booking document already has a room number
            if (b.roomNumber) return false;

            return true;
        });
    }, [bookings, currentRooms]);

    // Metrics for display
    const totalRoomsCount = currentRooms.length;
    const bookedRoomsCount = currentRooms.filter(r => r.status === "booked").length;
    const cleaningCount = currentRooms.filter(r => r.status === "cleaning").length;
    const maintenanceCount = currentRooms.filter(r => r.status === "maintenance").length;
    const availableCount = currentRooms.filter(r => r.status === "available").length;
    const occupancyRate = totalRoomsCount > 0 ? Math.round((bookedRoomsCount / totalRoomsCount) * 100) : 0;

    // Apply search and select filters
    const filteredRooms = useMemo(() => {
        return currentRooms.filter(r => {
            const matchesSearch = r.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 r.type.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType === "All" || r.type === selectedType;
            const matchesStatus = selectedStatus === "All" || r.status === selectedStatus;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [currentRooms, searchQuery, selectedType, selectedStatus]);

    // Toggle target booking for assignment
    const handleSelectBookingForAssign = (booking) => {
        if (selectedBookingForAssign?.id === booking.id) {
            setSelectedBookingForAssign(null);
            addLog("Assignment cancelled.", "system");
        } else {
            setSelectedBookingForAssign(booking);
            addLog(`Assign Mode: Choose a ${booking.room} unit for guest ${booking.name}`, "system");
        }
    };

    // Auto-assign first available room of matching type
    const handleAutoAssign = async (booking) => {
        const matchingAvailableRoom = currentRooms.find(
            r => r.type === booking.room && r.status === "available"
        );
        if (!matchingAvailableRoom) {
            alert(`No available physical room units matching type "${booking.room}" found.`);
            return;
        }
        await assignBookingToRoom(matchingAvailableRoom, booking);
    };

    // Assign a booking request to a room
    const assignBookingToRoom = async (room, booking) => {
        const updatedRooms = currentRooms.map(r => {
            if (r.id === room.id) {
                return {
                    ...r,
                    status: "booked",
                    guestDetails: {
                        bookingId: booking.id,
                        name: booking.name,
                        email: booking.email || "n/a",
                        phone: booking.phone || "n/a",
                        checkin: booking.checkin,
                        checkout: booking.checkout,
                        guests: booking.guests || 1,
                        special: booking.special || ""
                    }
                };
            }
            return r;
        });

        // Save updated rooms state to hotel profile
        await saveProfileData({ rooms: updatedRooms });

        // Save assigned room number on the booking object
        try {
            await assignBookingRoom(booking.id, room.number);
        } catch (e) {
            console.error("Failed to sync room assignment to database booking:", e);
        }

        addLog(`Room ${room.number} assigned to guest ${booking.name}`, "booked");
        setSelectedBookingForAssign(null);
    };

    // Open detailed console modal for room management
    const openRoomModal = (room) => {
        setSelectedRoom(room);
        setModalStatus(room.status);
        if (room.status === "booked" && room.guestDetails) {
            setGuestName(room.guestDetails.name || "");
            setGuestEmail(room.guestDetails.email || "");
            setGuestPhone(room.guestDetails.phone || "");
            setCheckinDate(room.guestDetails.checkin || "");
            setCheckoutDate(room.guestDetails.checkout || "");
            setSpecialNotes(room.guestDetails.special || "");
        } else {
            setGuestName("");
            setGuestEmail("");
            setGuestPhone("");
            const today = new Date().toISOString().slice(0, 10);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setCheckinDate(today);
            setCheckoutDate(tomorrow.toISOString().slice(0, 10));
            setSpecialNotes("");
        }
        setIsModalOpen(true);
    };

    // Release guest and checkout of a room
    const handleReleaseRoom = async (room) => {
        if (!window.confirm(`Check out guest and release Room ${room.number}?`)) return;

        if (room.guestDetails?.bookingId) {
            try {
                // Clear assignment and set status
                await assignBookingRoom(room.guestDetails.bookingId, null);
                await updateBookingStatus(room.guestDetails.bookingId, "confirmed");
            } catch (e) {
                console.error("Failed to update booking status on database checkout:", e);
            }
        }

        const updatedRooms = currentRooms.map(r => {
            if (r.id === room.id) {
                return {
                    ...r,
                    status: "cleaning", // set status to cleaning
                    guestDetails: null
                };
            }
            return r;
        });

        await saveProfileData({ rooms: updatedRooms });
        addLog(`Released Room ${room.number} and set status to CLEANING`, "cleaning");
        setIsModalOpen(false);
    };

    // Save manual room edits/booking from modal
    const saveRoomChanges = async () => {
        if (!selectedRoom) return;

        if (modalStatus === "booked" && !guestName.trim()) {
            alert("Guest name is required for manual bookings.");
            return;
        }

        let guest = null;
        if (modalStatus === "booked") {
            guest = {
                name: guestName,
                email: guestEmail || "manual@booking.com",
                phone: guestPhone || "n/a",
                checkin: checkinDate,
                checkout: checkoutDate,
                special: specialNotes
            };
        }

        const updatedRooms = currentRooms.map(r => {
            if (r.id === selectedRoom.id) {
                return {
                    ...r,
                    status: modalStatus,
                    guestDetails: guest
                };
            }
            return r;
        });

        await saveProfileData({ rooms: updatedRooms });
        addLog(`Room ${selectedRoom.number} status updated to ${modalStatus.toUpperCase()}`, modalStatus);
        setIsModalOpen(false);
    };

    return (
        <div className="bg-[#011f4b] text-slate-100 rounded-3xl p-6 md:p-8 border border-[#a8daf9]/25 shadow-2xl mt-4 font-sans antialiased">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#a8daf9]/20 pb-6 mb-6">
                <div>
                    <span className="text-[#92d2f9] text-xs font-bold uppercase tracking-widest">Hotel Room Control Panel</span>
                    <h2 className="text-2xl font-bold text-white mt-1">
                        🛎️ {hotelName} Room Matrix
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Monitor and manage live physical room states, housekeepings, and assign incoming customer requests.
                    </p>
                </div>

                {/* Real-time Status Sync */}
                <div className="flex items-center gap-3 bg-[#011f4b]/50 px-4 py-3 rounded-2xl border border-[#a8daf9]/30">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Live Database Connected
                    </span>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* Occupancy card */}
                <div className="bg-[#011f4b]/40 border border-[#a8daf9]/20 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Occupancy Rate</span>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-[#92d2f9]">{occupancyRate}%</span>
                        <span className="text-[10px] text-slate-550">of {totalRoomsCount} rooms</span>
                    </div>
                    {/* Tiny Progress bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-[#92d2f9] h-full rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                    </div>
                </div>

                {/* Available rooms */}
                <div className="bg-[#011f4b]/40 border border-[#a8daf9]/20 rounded-2xl p-4 flex flex-col justify-between text-left">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-2">{availableCount}</div>
                    <span className="text-[10px] text-slate-550 mt-1">Ready for check-in</span>
                </div>

                {/* Booked rooms */}
                <div className="bg-[#011f4b]/40 border border-[#a8daf9]/20 rounded-2xl p-4 flex flex-col justify-between text-left">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Booked</span>
                        <span className="h-2 w-2 rounded-full bg-[#a8daf9]"></span>
                    </div>
                    <div className="text-3xl font-extrabold text-[#a8daf9] mt-2">{bookedRoomsCount}</div>
                    <span className="text-[10px] text-slate-550 mt-1">Occupied</span>
                </div>

                {/* Cleaning rooms */}
                <div className="bg-[#011f4b]/40 border border-[#a8daf9]/20 rounded-2xl p-4 flex flex-col justify-between text-left">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cleaning</span>
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    </div>
                    <div className="text-3xl font-extrabold text-amber-300 mt-2">{cleaningCount}</div>
                    <span className="text-[10px] text-slate-555 mt-1">Housekeeping active</span>
                </div>

                {/* Maintenance rooms */}
                <div className="bg-[#011f4b]/40 border border-[#a8daf9]/20 rounded-2xl p-4 flex flex-col justify-between text-left">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Maintenance</span>
                        <span className="h-2 w-2 rounded-full bg-[#a8daf9]/80"></span>
                    </div>
                    <div className="text-3xl font-extrabold text-[#a8daf9]/80 mt-2">{maintenanceCount}</div>
                    <span className="text-[10px] text-slate-555 mt-1">Under routine repair</span>
                </div>
            </div>

            {/* Main Interactive Grid & Sidebar Panels */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                
                {/* SIDEBAR LEFT: Guest Booking Requests (1 column) */}
                <div className="bg-[#011f4b]/30 border border-[#a8daf9]/20 rounded-2xl p-4 flex flex-col h-[500px] xl:h-auto overflow-hidden">
                    <div className="border-b border-[#a8daf9]/20 pb-3 mb-3">
                        <span className="text-[#92d2f9] text-[10px] font-bold uppercase tracking-wider">Incoming Booking Requests</span>
                        <h4 className="text-sm font-bold text-white mt-1">Unassigned Guests ({unassignedBookings.length})</h4>
                    </div>

                    {unassignedBookings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                            <span className="text-3xl mb-2">🎉</span>
                            <p className="text-xs font-semibold text-slate-400">All bookings assigned</p>
                            <p className="text-[10px] text-[#a8daf9]/60 mt-1">No pending unassigned customer requests right now.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {unassignedBookings.map(b => {
                                const isSelected = selectedBookingForAssign?.id === b.id;
                                return (
                                    <div
                                        key={b.id}
                                        className={`p-3.5 rounded-xl border transition-all duration-200 text-left ${
                                            isSelected
                                                ? 'bg-[#92d2f9]/15 border-[#92d2f9] shadow-md shadow-[#92d2f9]/15'
                                                : 'bg-[#011f4b]/40 border-[#a8daf9]/15 hover:border-[#92d2f9]/55 hover:bg-[#011f4b]/50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start gap-1">
                                            <span className="font-bold text-xs text-white truncate max-w-[130px]">{b.name}</span>
                                            <span className="text-[8px] bg-[#011f4b] border border-[#a8daf9]/20 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                                                {b.guests} Pax
                                            </span>
                                        </div>
                                        
                                        <div className="text-[10px] font-bold text-[#92d2f9] mt-1.5">
                                            🏢 {b.room}
                                        </div>

                                        <div className="text-[9px] text-slate-400 mt-1 flex justify-between">
                                            <span>📅 In: {b.checkin}</span>
                                            <span>Out: {b.checkout}</span>
                                        </div>

                                        {b.special && (
                                            <div className="text-[9px] text-amber-300 italic bg-amber-500/5 border border-amber-500/15 rounded p-1.5 mt-2 truncate">
                                                📝 "{b.special}"
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-3 border-t border-[#a8daf9]/15 pt-2.5">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectBookingForAssign(b)}
                                                className={`flex-1 text-[10px] font-extrabold uppercase py-1.5 px-2 rounded-lg transition-all border cursor-pointer outline-none ${
                                                    isSelected
                                                        ? 'bg-[#7daaf8] text-[#011f4b] hover:bg-[#005b96] hover:text-white border-[#7daaf8]'
                                                        : 'bg-[#005b96] text-white hover:bg-[#7daaf8] hover:text-[#011f4b] border-[#005b96]'
                                                }`}
                                            >
                                                {isSelected ? 'Cancel' : 'Assign'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAutoAssign(b)}
                                                className="bg-[#011f4b]/55 hover:bg-[#92d2f9]/15 text-[#a8daf9] hover:text-white text-[10px] font-extrabold uppercase py-1.5 px-2 rounded-lg transition-all border border-[#a8daf9]/30 cursor-pointer outline-none"
                                            >
                                                ⚡ Auto
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* MAIN GRID PANEL: Physical Room Matrix Grid (2 columns) */}
                <div className="xl:col-span-2 space-y-4">
                    
                    {/* Toolbar Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 bg-[#011f4b]/50 p-3 rounded-2xl border border-[#a8daf9]/30">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
                            <input
                                type="text"
                                placeholder="Search room # or type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#011f4b] border border-[#a8daf9]/30 rounded-xl pl-8 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#92d2f9] transition-colors"
                            />
                        </div>

                        {/* Room Type select */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap pl-1">Type:</span>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="bg-[#011f4b] border border-[#a8daf9]/30 rounded-xl px-2.5 py-2 text-[10px] text-slate-300 font-semibold focus:outline-none focus:border-[#92d2f9] cursor-pointer"
                            >
                                {roomCategories.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Select */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap pl-1">Status:</span>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-[#011f4b] border border-[#a8daf9]/30 rounded-xl px-2.5 py-2 text-[10px] text-slate-350 font-semibold focus:outline-none focus:border-[#92d2f9] cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                                <option value="cleaning">Cleaning</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Assign Mode Banner */}
                    {selectedBookingForAssign && (
                        <div className="bg-gradient-to-r from-[#011f4b] to-[#92d2f9]/60 border border-[#a8daf9]/35 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                            <div>
                                <span className="text-[10px] bg-[#92d2f9] text-[#011f4b] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Assigning Room Mode
                                </span>
                                <h4 className="text-sm font-bold text-white mt-1">
                                    Select room for: {selectedBookingForAssign.name}
                                </h4>
                                <p className="text-[10px] text-slate-300">
                                    Requirement: <strong className="text-[#92d2f9]">{selectedBookingForAssign.room}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedBookingForAssign(null)}
                                className="text-xs text-slate-400 hover:text-white font-semibold bg-[#011f4b] border border-[#a8daf9]/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer outline-none"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Rooms Matrix Grid */}
                    {filteredRooms.length === 0 ? (
                        <div className="bg-slate-900/20 border border-dashed border-[#a8daf9]/30 rounded-2xl py-12 text-center text-slate-500">
                            <div className="text-3xl mb-2">🛏️</div>
                            <p className="text-sm font-semibold">No rooms found</p>
                            <p className="text-xs text-slate-600 mt-1">Try resetting search filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredRooms.map(room => {
                                const isMatchingType = selectedBookingForAssign && room.type === selectedBookingForAssign.room;
                                const isAssignable = isMatchingType && room.status === "available";

                                return (
                                    <div
                                        key={room.id}
                                        onClick={() => {
                                            if (isAssignable) {
                                                assignBookingToRoom(room, selectedBookingForAssign);
                                            } else {
                                                openRoomModal(room);
                                            }
                                        }}
                                        className={`relative p-5 rounded-2xl border transition-all duration-300 text-left ${
                                            isAssignable
                                                ? 'ring-2 ring-[#92d2f9] bg-[#011f4b] border-[#92d2f9] cursor-pointer shadow-lg shadow-[#92d2f9]/20 hover:scale-[1.03]'
                                                : selectedBookingForAssign
                                                    ? 'bg-slate-955/20 border-[#a8daf9]/10 opacity-40 cursor-not-allowed'
                                                    : 'bg-[#011f4b]/60 border-[#a8daf9]/20 hover:border-[#92d2f9]/50 hover:bg-[#011f4b]/80 cursor-pointer hover:-translate-y-1 hover:shadow-lg'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="max-w-[120px]">
                                                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block truncate" title={room.type}>
                                                    {room.type}
                                                </span>
                                                <h4 className="text-2xl font-bold text-white mt-1">Room {room.number}</h4>
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                                                room.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                room.status === 'booked' ? 'bg-[#a8daf9]/20 text-[#a8daf9] border border-[#a8daf9]/30 shadow-lg shadow-[#a8daf9]/5' :
                                                room.status === 'cleaning' ? 'bg-yellow-500/20 text-yellow-350 border border-yellow-500/30' :
                                                'bg-[#a8daf9]/10 text-slate-350 border border-[#a8daf9]/20'
                                            }`}>
                                                {room.status}
                                            </span>
                                        </div>

                                        {room.status === 'booked' && room.guestDetails ? (
                                            <div className="border-t border-[#a8daf9]/15 pt-3 mt-3">
                                                <div className="text-xs text-[#a8daf9] flex items-center gap-1.5 mb-1.5">
                                                    <span className="text-[10px]">👤</span>
                                                    <span className="font-bold truncate max-w-[140px]">{room.guestDetails.name}</span>
                                                </div>
                                                <div className="text-[9px] text-[#92d2f9]/80 flex justify-between font-medium">
                                                    <span>In: {room.guestDetails.checkin?.slice(5)}</span>
                                                    <span>Out: {room.guestDetails.checkout?.slice(5)}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-t border-[#a8daf9]/10 pt-3 mt-3 text-[10px] text-slate-500 italic">
                                                {room.status === 'cleaning' ? '🧹 Housekeeping active' :
                                                 room.status === 'maintenance' ? '🔧 Under routine repair' :
                                                 '✅ Ready for check-in'}
                                            </div>
                                        )}

                                        {/* Glow pulse when assignable */}
                                        {isAssignable && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#92d2f9] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#92d2f9]"></span>
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* SIDEBAR RIGHT: Live Operation Log (1 column) */}
                <div className="bg-[#011f4b]/30 border border-[#a8daf9]/20 rounded-2xl p-4 flex flex-col h-[500px] xl:h-auto overflow-hidden">
                    <div className="border-b border-[#a8daf9]/20 pb-3 mb-3">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Hotel Activity Feed</span>
                        <h4 className="text-sm font-bold text-white mt-1">Real-time Operations Log</h4>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 font-mono text-[11px] leading-relaxed text-left">
                        {activityLogs.map(log => {
                            let bulletColor = 'bg-slate-555';
                            if (log.type === 'available') bulletColor = 'bg-emerald-500';
                            else if (log.type === 'booked') bulletColor = 'bg-[#a8daf9]';
                            else if (log.type === 'cleaning') bulletColor = 'bg-amber-500';
                            else if (log.type === 'maintenance') bulletColor = 'bg-[#a8daf9]/70';
                            else if (log.type === 'system') bulletColor = 'bg-[#92d2f9]';

                            return (
                                <div key={log.id} className="flex gap-2 items-start bg-[#011f4b]/40 p-2 rounded-lg border border-[#a8daf9]/15">
                                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${bulletColor}`}></span>
                                    <div>
                                        <span className="text-slate-500 mr-1">[{log.time}]</span>
                                        <span className="text-slate-300">{log.message}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border-t border-[#a8daf9]/20 pt-3 mt-3 text-center">
                        <p className="text-[10px] text-slate-550">Operation console sync is active</p>
                    </div>
                </div>
            </div>

            {/* Room Detail Status Control Modal */}
            {isModalOpen && selectedRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-left">
                    <div className="bg-[#011f4b] border border-[#a8daf9]/35 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="bg-[#011f4b]/50 px-6 py-4 flex justify-between items-center border-b border-[#a8daf9]/25">
                            <div>
                                <h3 className="text-xl font-bold text-white">Room {selectedRoom.number} Control Console</h3>
                                <p className="text-xs text-[#a8daf9] mt-0.5">{selectedRoom.type}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors text-2xl font-bold focus:outline-none"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex-1 space-y-5">
                            {/* Status picker */}
                            <div>
                                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2.5">Set Room Status</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'available', label: 'Available', color: 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10' },
                                        { id: 'booked', label: 'Booked', color: 'border-rose-500 text-rose-400 hover:bg-rose-500/10' },
                                        { id: 'cleaning', label: 'Cleaning', color: 'border-amber-500 text-amber-300 hover:bg-amber-500/10' },
                                        { id: 'maintenance', label: 'Maintenance', color: 'border-[#a8daf9] text-[#a8daf9] hover:bg-[#a8daf9]/10' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setModalStatus(item.id)}
                                            className={`py-2 px-1.5 rounded-xl text-xs font-bold text-center border transition-all duration-200 focus:outline-none cursor-pointer ${
                                                modalStatus === item.id
                                                    ? item.id === 'available' ? 'bg-emerald-600 text-white border-emerald-600' :
                                                      item.id === 'booked' ? 'bg-[#011f4b] text-white border-[#92d2f9]' :
                                                      item.id === 'cleaning' ? 'bg-yellow-500 text-[#011f4b] border-yellow-500' :
                                                      'bg-[#011f4b] text-white border-[#a8daf9]'
                                                    : `bg-[#011f4b] border-[#a8daf9]/30 ${item.color}`
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Guest Details Form */}
                            {modalStatus === 'booked' && (
                                <div className="bg-[#011f4b]/50 rounded-2xl p-4 border border-[#a8daf9]/25 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-200 border-b border-[#a8daf9]/25 pb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                        <span>👤</span> Guest Booking Particulars
                                    </h4>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Guest Name</label>
                                            <input
                                                type="text"
                                                value={guestName}
                                                onChange={e => setGuestName(e.target.value)}
                                                placeholder="Guest's full name"
                                                className="w-full mt-1 bg-[#011f4b] border border-[#a8daf9]/35 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#92d2f9]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Guest Email</label>
                                                <input
                                                    type="email"
                                                    value={guestEmail}
                                                    onChange={e => setGuestEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="w-full mt-1 bg-[#011f4b] border border-[#a8daf9]/35 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#92d2f9]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Guest Phone</label>
                                                <input
                                                    type="text"
                                                    value={guestPhone}
                                                    onChange={e => setGuestPhone(e.target.value)}
                                                    placeholder="Contact number"
                                                    className="w-full mt-1 bg-[#011f4b] border border-[#a8daf9]/35 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#92d2f9]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Check-in Date</label>
                                                <input
                                                    type="date"
                                                    value={checkinDate}
                                                    onChange={e => setCheckinDate(e.target.value)}
                                                    className="w-full mt-1 bg-[#011f4b] border border-[#a8daf9]/35 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#92d2f9] cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Check-out Date</label>
                                                <input
                                                    type="date"
                                                    value={checkoutDate}
                                                    onChange={e => setCheckoutDate(e.target.value)}
                                                    className="w-full mt-1 bg-[#011f4b] border border-[#a8daf9]/35 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#92d2f9] cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Special Requests / Requirements</label>
                                            <textarea
                                                value={specialNotes}
                                                onChange={e => setSpecialNotes(e.target.value)}
                                                placeholder="e.g. Extra bed, non-smoking, allergies"
                                                rows={2}
                                                className="w-full mt-1 bg-[#011f4b] border border-[#a8daf9]/35 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#92d2f9] resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-[#011f4b]/50 px-6 py-4 border-t border-[#a8daf9]/25 flex justify-between items-center">
                            <div>
                                {selectedRoom.status === 'booked' && (
                                    <button
                                        type="button"
                                        onClick={() => handleReleaseRoom(selectedRoom)}
                                        className="bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-450 text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer outline-none"
                                    >
                                        🧹 Release / Check Out
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-450 hover:text-white transition-colors bg-[#011f4b] border border-[#a8daf9]/30 hover:bg-[#92d2f9]/20 hover:text-white focus:outline-none cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveRoomChanges}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#005b96] hover:bg-[#7daaf8] text-white hover:text-[#011f4b] border border-[#a8daf9]/30 hover:border-[#7daaf8] shadow-lg shadow-[#7daaf8]/10 transition-all duration-250 cursor-pointer outline-none focus:outline-none"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
