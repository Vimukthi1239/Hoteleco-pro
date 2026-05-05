import { useState, useEffect } from "react";
import {
    listenBookings,
    listenHotelRegistrations,
    listenContactMessages,
    deleteBooking,
    updateHotelRegistrationStatus,
    deleteHotelRegistration,
    markMessageRead,
    deleteContactMessage,
} from "../data/firebase";

const TABS = ["bookings", "registrations", "messages"];

// ── Helpers ───────────────────────────────────────────────────
const statusConfig = {
    pending: { bg: "#fef3c7", color: "#b7791f" },
    approved: { bg: "#d1fae5", color: "#065f46" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
    confirmed: { bg: "#dbeafe", color: "#1e40af" },
    cancelled: { bg: "#f3f4f6", color: "#6b7280" },
};
const badge = (text) => {
    const cfg = statusConfig[text] || statusConfig.pending;
    return (
        <span style={{ background: cfg.bg, color: cfg.color, fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {text}
        </span>
    );
};

const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", borderBottom: "2px solid #e2ecf0", background: "#fafcfd" };
const tdStyle = { padding: "13px 16px", fontSize: "0.88rem", color: "#1e3a4a", borderBottom: "1px solid #f0f4f7", verticalAlign: "middle" };

const ActionBtn = ({ label, color, bg, hoverBg, onClick, disabled }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? hoverBg : bg,
                color,
                border: `1px solid ${color}33`,
                borderRadius: 7,
                padding: "4px 11px",
                cursor: disabled ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                fontSize: "0.75rem",
                transition: "all 0.18s",
                opacity: disabled ? 0.5 : 1,
            }}
        >
            {label}
        </button>
    );
};

// ── Main Component ────────────────────────────────────────────
function AdminDashboard() {
    const [tab, setTab] = useState("bookings");
    const [bookings, setBookings] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        setLoading(true);
        const unsub1 = listenBookings((data) => { setBookings(data); setLoading(false); });
        const unsub2 = listenHotelRegistrations((data) => setRegistrations(data));
        const unsub3 = listenContactMessages((data) => setMessages(data));
        return () => { unsub1(); unsub2(); unsub3(); };
    }, []);

    const fmt = (iso) => iso ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

    const withLoading = async (key, fn) => {
        setActionLoading(p => ({ ...p, [key]: true }));
        try { await fn(); } catch (e) { console.error(e); }
        finally { setActionLoading(p => ({ ...p, [key]: false })); }
    };

    const unreadCount = messages.filter(m => !m.isRead).length;

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh", background: "#f5f8fb" }}>

            {/* ── Header ── */}
            <div style={{ padding: "40px 48px 28px", background: "linear-gradient(135deg,#0f2030,#1a3a50)", color: "#fff" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 8 }}>🔥 Live Data</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.4rem", marginBottom: 8 }}>Admin Dashboard</h1>
                <p style={{ opacity: 0.7, fontSize: "0.93rem" }}>Real-time data from Firebase Realtime Database</p>

                {/* Stats */}
                <div style={{ display: "flex", gap: 20, marginTop: 28 }}>
                    {[
                        { label: "Total Bookings", count: bookings.length, icon: "📋", color: "#17c4b8" },
                        { label: "Hotel Registrations", count: registrations.length, icon: "🏨", color: "#f39c12" },
                        { label: "Pending Registrations", count: registrations.filter(r => r.status === "pending").length, icon: "⏳", color: "#e74c3c" },
                        { label: "Contact Messages", count: messages.length, icon: "📬", color: "#9b59b6" },
                    ].map(s => (
                        <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 24px", minWidth: 160, border: "1px solid rgba(255,255,255,0.1)" }}>
                            <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{s.icon}</div>
                            <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.count}</div>
                            <div style={{ fontSize: "0.78rem", opacity: 0.7, marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e2ecf0", background: "#fff", padding: "0 48px" }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: "16px 28px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontWeight: tab === t ? 700 : 400, fontSize: "0.9rem", color: tab === t ? "#0a7fa5" : "#6b8999", borderBottom: tab === t ? "3px solid #0a7fa5" : "3px solid transparent", marginBottom: -2, textTransform: "capitalize", transition: "all 0.2s" }}>
                        {t === "bookings"
                            ? `📋 Bookings (${bookings.length})`
                            : t === "registrations"
                                ? `🏨 Registrations (${registrations.length})`
                                : `📬 Messages (${messages.length})${unreadCount > 0 ? ` · ${unreadCount} new` : ""}`}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            <div style={{ padding: "32px 48px" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#6b8999" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔄</div>
                        <p>Loading live data from Firebase…</p>
                    </div>
                ) : (
                    <>
                        {/* ─── Bookings Tab ─── */}
                        {tab === "bookings" && (
                            bookings.length === 0
                                ? <EmptyState icon="📋" text="No bookings yet. Submit one via the Booking page." />
                                : (
                                    <TableWrapper>
                                        <thead>
                                            <tr>
                                                {["Guest", "Hotel", "Room", "Check-in", "Check-out", "Nights", "Total", "Status", "Submitted", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(b => (
                                                <tr key={b.id}
                                                    onMouseEnter={e => e.currentTarget.style.background = "#f0f7fb"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                    <td style={tdStyle}>
                                                        <div style={{ fontWeight: 700 }}>{b.name}</div>
                                                        <div style={{ color: "#6b8999", fontSize: "0.78rem" }}>{b.email}</div>
                                                        <div style={{ color: "#6b8999", fontSize: "0.78rem" }}>{b.phone}</div>
                                                    </td>
                                                    <td style={tdStyle}><div style={{ fontWeight: 600 }}>{b.hotel}</div><div style={{ color: "#6b8999", fontSize: "0.78rem" }}>{b.district}</div></td>
                                                    <td style={tdStyle}>{b.room}</td>
                                                    <td style={tdStyle}>{b.checkin}</td>
                                                    <td style={tdStyle}>{b.checkout}</td>
                                                    <td style={tdStyle}>{badge(`${b.nights} nights`)}</td>
                                                    <td style={{ ...tdStyle, fontWeight: 700, color: "#0a7fa5" }}>${b.totalPrice}</td>
                                                    <td style={tdStyle}>{badge(b.status || "confirmed")}</td>
                                                    <td style={{ ...tdStyle, color: "#6b8999", fontSize: "0.78rem" }}>{fmt(b.createdAt)}</td>
                                                    <td style={tdStyle}>
                                                        <ActionBtn
                                                            label="🗑 Delete"
                                                            color="#991b1b"
                                                            bg="#fee2e2"
                                                            hoverBg="#fca5a5"
                                                            disabled={!!actionLoading[`del-booking-${b.id}`]}
                                                            onClick={() => {
                                                                if (window.confirm(`Delete booking for ${b.name}?`))
                                                                    withLoading(`del-booking-${b.id}`, () => deleteBooking(b.id));
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </TableWrapper>
                                )
                        )}

                        {/* ─── Registrations Tab ─── */}
                        {tab === "registrations" && (
                            registrations.length === 0
                                ? <EmptyState icon="🏨" text="No hotel registrations yet. Submit one via the Hotel Sign In page." />
                                : (
                                    <TableWrapper>
                                        <thead>
                                            <tr>
                                                {["Hotel Name", "Email", "Contact", "District", "Type", "Status", "Submitted", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registrations.map(r => (
                                                <tr key={r.id}
                                                    onMouseEnter={e => e.currentTarget.style.background = "#f0f7fb"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                    <td style={{ ...tdStyle, fontWeight: 700 }}>{r.hotelName}</td>
                                                    <td style={tdStyle}>{r.email}</td>
                                                    <td style={tdStyle}>{r.contact || "—"}</td>
                                                    <td style={tdStyle}>{r.district || "—"}</td>
                                                    <td style={tdStyle}>{r.type || "—"}</td>
                                                    <td style={tdStyle}>{badge(r.status || "pending")}</td>
                                                    <td style={{ ...tdStyle, color: "#6b8999", fontSize: "0.78rem" }}>{fmt(r.createdAt)}</td>
                                                    <td style={tdStyle}>
                                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                            {r.status !== "approved" && (
                                                                <ActionBtn
                                                                    label="✅ Approve"
                                                                    color="#065f46"
                                                                    bg="#d1fae5"
                                                                    hoverBg="#6ee7b7"
                                                                    disabled={!!actionLoading[`approve-${r.id}`]}
                                                                    onClick={() => withLoading(`approve-${r.id}`, () => updateHotelRegistrationStatus(r.id, "approved"))}
                                                                />
                                                            )}
                                                            {r.status !== "rejected" && (
                                                                <ActionBtn
                                                                    label="❌ Reject"
                                                                    color="#991b1b"
                                                                    bg="#fee2e2"
                                                                    hoverBg="#fca5a5"
                                                                    disabled={!!actionLoading[`reject-${r.id}`]}
                                                                    onClick={() => withLoading(`reject-${r.id}`, () => updateHotelRegistrationStatus(r.id, "rejected"))}
                                                                />
                                                            )}
                                                            <ActionBtn
                                                                label="🗑"
                                                                color="#6b7280"
                                                                bg="#f3f4f6"
                                                                hoverBg="#d1d5db"
                                                                disabled={!!actionLoading[`del-reg-${r.id}`]}
                                                                onClick={() => {
                                                                    if (window.confirm(`Delete registration for ${r.hotelName}?`))
                                                                        withLoading(`del-reg-${r.id}`, () => deleteHotelRegistration(r.id));
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </TableWrapper>
                                )
                        )}

                        {/* ─── Messages Tab ─── */}
                        {tab === "messages" && (
                            messages.length === 0
                                ? <EmptyState icon="📬" text="No messages yet. Send one via the Contact page." />
                                : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                        {messages.map(m => (
                                            <div key={m.id} style={{ background: m.isRead ? "#fff" : "#f0f8ff", border: `1px solid ${m.isRead ? "#e2ecf0" : "#bfdbfe"}`, borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 10px rgba(10,127,165,0.05)", transition: "all 0.2s" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: "#0f2030", marginRight: 10 }}>{m.name}</span>
                                                        <span style={{ color: "#6b8999", fontSize: "0.82rem" }}>{m.email}</span>
                                                        {!m.isRead && <span style={{ marginLeft: 8, background: "#3b82f6", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>NEW</span>}
                                                    </div>
                                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                        {badge(m.type || "General Inquiry")}
                                                        <span style={{ color: "#aaa", fontSize: "0.75rem" }}>{fmt(m.createdAt)}</span>
                                                        {!m.isRead && (
                                                            <ActionBtn
                                                                label="Mark Read"
                                                                color="#1e40af"
                                                                bg="#dbeafe"
                                                                hoverBg="#93c5fd"
                                                                disabled={!!actionLoading[`read-${m.id}`]}
                                                                onClick={() => withLoading(`read-${m.id}`, () => markMessageRead(m.id))}
                                                            />
                                                        )}
                                                        <ActionBtn
                                                            label="🗑"
                                                            color="#6b7280"
                                                            bg="#f3f4f6"
                                                            hoverBg="#d1d5db"
                                                            disabled={!!actionLoading[`del-msg-${m.id}`]}
                                                            onClick={() => {
                                                                if (window.confirm("Delete this message?"))
                                                                    withLoading(`del-msg-${m.id}`, () => deleteContactMessage(m.id));
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 600, color: "#1e3a4a", marginBottom: 6, fontSize: "0.92rem" }}>{m.subject || "(no subject)"}</div>
                                                <div style={{ color: "#6b8999", fontSize: "0.88rem", lineHeight: 1.6 }}>{m.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                )
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function TableWrapper({ children }) {
    return (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e2ecf0", overflow: "hidden", boxShadow: "0 2px 16px rgba(10,127,165,0.06)", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                {children}
            </table>
        </div>
    );
}

function EmptyState({ icon, text }) {
    return (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6b8999" }}>
            <div style={{ fontSize: "3rem", marginBottom: 14 }}>{icon}</div>
            <p style={{ fontSize: "0.95rem" }}>{text}</p>
        </div>
    );
}

export default AdminDashboard;
