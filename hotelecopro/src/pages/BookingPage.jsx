import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Input from "../components/Input";
import FormSelect from "../components/Select";
import { saveBooking, listenHotelRegistrations, listenAllHotelProfiles, updateHotelProfile } from "../data/firebase";
import RoomSelector from "../components/RoomSelector";

function BookingPage() {
    const { t } = useTranslation();
    const [selHotel, setSelHotel] = useState(null);
    const [liveHotels, setLiveHotels] = useState([]);
    const [regs, setRegs] = useState([]);
    const [profiles, setProfiles] = useState({});
    const [dataLoading, setDataLoading] = useState(true);

    const [form, setForm] = useState({ name: "", email: "", phone: "", checkin: "", checkout: "", guests: 1, room: "", roomNumber: "", nationality: "", special: "" });
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let loadedRegs = false;
        let loadedProfiles = false;
        const unsubProfiles = listenAllHotelProfiles((data) => {
            setProfiles(data || {});
            loadedProfiles = true;
            if (loadedRegs) setDataLoading(false);
        });
        const unsubRegs = listenHotelRegistrations((data) => {
            setRegs(data || []);
            loadedRegs = true;
            if (loadedProfiles) setDataLoading(false);
        });
        return () => { unsubProfiles(); unsubRegs(); };
    }, []);

    useEffect(() => {
        const approved = regs.filter(r => r.status === "approved" || r.status === "pending");
        const mapped = approved.map(r => {
            const prof = profiles[r.id] || {};
            const lowestPrice = prof.packages?.length > 0
                ? Math.min(...prof.packages.map(p => Number(p.price)))
                : 150;
            return {
                id: r.id,
                name: r.hotelName || "Unnamed Hotel",
                type: r.type || "Hotel",
                district: r.district || "Sri Lanka",
                price: lowestPrice,
                adminEmail: r.email || "admin@hoteleco.com",
                img: prof.photoUrl || "https://images.unsplash.com/photo-1542314831-c6a4d14d8379?auto=format&fit=crop&w=800&q=80",
                roomsCount: Number(r.rooms) || 12
            };
        });
        setLiveHotels(mapped);

        if (mapped.length > 0) {
            setSelHotel(prev => {
                if (prev) {
                    const stillExists = mapped.find(h => h.id === prev.id);
                    return stillExists || mapped[0];
                }
                return mapped[0];
            });
        } else {
            setSelHotel(null);
        }
    }, [regs, profiles]);

    useEffect(() => {
        setForm(prev => ({ ...prev, room: "", roomNumber: "" }));
    }, [selHotel]);

    useEffect(() => {
        if (selHotel && profiles[selHotel.id]) {
            const prof = profiles[selHotel.id];
            if (!prof.rooms || prof.rooms.length === 0) {
                const roomCount = selHotel.roomsCount || 12;
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
                updateHotelProfile(selHotel.id, { rooms: generatedRooms });
            }
        }
    }, [selHotel, profiles]);

    const nights = form.checkin && form.checkout
        ? Math.max(0, Math.round((new Date(form.checkout) - new Date(form.checkin)) / 86400000))
        : 0;

    const nationalities = ["Indian", "Chinese", "Japanese", "Russian", "German", "French", "British", "American", "Australian", "Korean", "Other"];

    const handleConfirm = async () => {
        if (!form.name || !form.email || !form.checkin || !form.checkout || !form.roomNumber) {
            setError(form.roomNumber ? t("booking.validationError") : "Please select a room to complete your booking.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const bookingId = await saveBooking({ ...form, hotel: selHotel.name, hotelId: selHotel.id, district: selHotel.district, nights, totalPrice: selHotel.price * nights, roomRate: selHotel.price });

            // Update physical room status in Firebase Realtime Database
            const currentRooms = profiles[selHotel.id]?.rooms || [];
            const updatedRooms = currentRooms.map(r => {
                if (r.number === form.roomNumber) {
                    return {
                        ...r,
                        status: "booked",
                        guestDetails: {
                            bookingId,
                            name: form.name,
                            email: form.email,
                            phone: form.phone || "n/a",
                            checkin: form.checkin,
                            checkout: form.checkout,
                            guests: form.guests,
                            special: form.special || ""
                        }
                    };
                }
                return r;
            });
            await updateHotelProfile(selHotel.id, { rooms: updatedRooms });

            // n8n Webhook eka call kirima
            const webhookUrl = "https://ceylonnature01.app.n8n.cloud/webhook/bookingemail";
            const emailPayload = {
                customerName: form.name,
                customerEmail: form.email,
                hotelName: selHotel.name,
                checkin: form.checkin,
                checkout: form.checkout,
                guests: form.guests,
                totalPrice: selHotel.price * nights,
                adminEmail: selHotel.adminEmail // Update this if needed
            };

            // Ena error eka nisa app eka crash wena eka nawaththanna try-catch ekak athulata webhook eka damuwa
            try {
                await fetch(webhookUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(emailPayload)
                });
            } catch (webhookError) {
                console.error("Failed to trigger webhook", webhookError);
                // Even if the email fails, we still consider the booking successful
            }

            setDone(true);
        } catch (err) {
            setError(t("booking.saveError"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (done) return (
        <div style={{ paddingTop: 88, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f0f8fc,#fff)" }}>
            <div style={{ textAlign: "center", maxWidth: 520, padding: "40px 20px" }}>
                <div style={{ fontSize: "5rem", marginBottom: 20 }}>🎉</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.5rem", color: "#0f2030", marginBottom: 14 }}>{t("booking.confirmedTitle")}</h1>
                <p style={{ color: "#6b8999", fontSize: "1rem", marginBottom: 8 }}>{t("booking.thankYou", { name: form.name })}</p>
                <p style={{ color: "#6b8999", marginBottom: 28 }}>{t("booking.confirmedMsg", { nights, hotel: selHotel.name, email: form.email })}</p>
                <div style={{ background: "#f0f8fc", border: "1px solid #e2ecf0", borderRadius: 16, padding: 22, textAlign: "left", marginBottom: 28 }}>
                    {[["Hotel", selHotel.name], [t("booking.checkin"), form.checkin], [t("booking.checkout"), form.checkout], [t("booking.room"), form.room], [t("booking.guests"), form.guests], [t("booking.total"), `$${selHotel.price * nights}`]].map(([l, v], idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2ecf0", fontSize: "0.9rem" }}>
                            <span style={{ color: "#6b8999" }}>{l}</span><strong style={{ color: "#0f2030" }}>{v}</strong>
                        </div>
                    ))}
                </div>
                <div style={{ background: "#e6f9f1", borderRadius: 10, padding: "10px 18px", marginBottom: 20, color: "#1a7a4a", fontSize: "0.85rem", fontWeight: 600 }}>
                    ✅ {t("booking.savedFirebase")}
                </div>
                <button onClick={() => { setDone(false); setForm({ name: "", email: "", phone: "", checkin: "", checkout: "", guests: 1, room: "", roomNumber: "", nationality: "", special: "" }); }} style={{ background: "#0a7fa5", color: "#fff", border: "none", borderRadius: 10, padding: "13px 30px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>{t("booking.newBooking")}</button>
            </div>
        </div>
    );

    if (dataLoading) {
        return (
            <div style={{ paddingTop: 88, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafcfd" }}>
                <div style={{ textAlign: "center", color: "#6b8999" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔄</div>
                    <p style={{ fontSize: "1.1rem" }}>{t("hotels.loading") || "Loading hotels..."}</p>
                </div>
            </div>
        );
    }

    if (!selHotel || liveHotels.length === 0) {
        return (
            <div style={{ paddingTop: 88, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafcfd" }}>
                <div style={{ textAlign: "center", color: "#6b8999" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏨</div>
                    <p style={{ fontSize: "1.1rem" }}>{t("booking.noHotelsAvailable") || "No hotels are currently available for booking."}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh", background: "#fafcfd" }}>
            <div style={{ padding: "48px 48px 32px", background: "linear-gradient(135deg,#f0f8fc,#fff)", borderBottom: "1px solid #e2ecf0" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 8 }}>{t("booking.badge")}</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.5rem", color: "#0f2030" }}>{t("booking.title")}</h1>
                <p style={{ color: "#6b8999", marginTop: 8, fontSize: "0.95rem" }}>{t("booking.sub")}</p>
            </div>
            <div style={{ padding: "40px 48px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 36 }}>
                <div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "#0f2030", marginBottom: 18 }}>{t("booking.selectHotel")}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 36 }}>
                        {liveHotels.map(h => (
                            <div key={h.id} onClick={() => setSelHotel(h)}
                                style={{ background: selHotel.id === h.id ? "#e6f4f9" : "#fff", border: `2px solid ${selHotel.id === h.id ? "#0a7fa5" : "#e2ecf0"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 12, alignItems: "center", transition: "all 0.2s" }}>
                                <img src={h.img} alt={h.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f2030" }}>{h.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#6b8999" }}>{h.district} · ${h.price}{t("hotels.night")}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "#0f2030", marginBottom: 18 }}>{t("booking.guestDetails")}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <Input label={t("booking.fullName")} type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t("booking.fullNamePlaceholder")} />
                        <FormSelect label={t("booking.nationality")} value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))} options={[t("booking.selectNationality") || "Select nationality", ...nationalities]} />
                        <Input label={t("booking.emailAddress")} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
                        <Input label={t("booking.phoneNumber")} type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
                        <Input label={t("booking.checkinDate")} type="date" value={form.checkin} onChange={e => setForm(p => ({ ...p, checkin: e.target.value }))} />
                        <Input label={t("booking.checkoutDate")} type="date" value={form.checkout} onChange={e => setForm(p => ({ ...p, checkout: e.target.value }))} />
                        <Input label={t("booking.numGuests")} type="number" value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))} />
                        <Input label={t("booking.roomType") || "Selected Room"} type="text" value={form.roomNumber ? `${form.room} (No. ${form.roomNumber})` : "Please select a room below..."} disabled={true} readOnly={true} />
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", display: "block", marginBottom: 6 }}>{t("booking.specialRequests")}</label>
                        <textarea value={form.special} onChange={e => setForm(p => ({ ...p, special: e.target.value }))} rows={3} placeholder={t("booking.specialPlaceholder")} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                    </div>

                    <RoomSelector
                        rooms={profiles[selHotel.id]?.rooms || []}
                        selectedRoomNumber={form.roomNumber}
                        onSelectRoom={(room) => {
                            setForm(prev => ({ ...prev, room: room.type, roomNumber: room.number }));
                        }}
                        hotelName={selHotel.name}
                    />

                    {error && (
                        <div style={{ marginTop: 14, background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 10, padding: "10px 16px", color: "#c0392b", fontSize: "0.88rem" }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button onClick={handleConfirm} disabled={loading}
                        style={{ marginTop: 24, background: loading ? "#aaa" : "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", padding: "15px 44px", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "1rem", boxShadow: "0 6px 20px rgba(10,127,165,0.3)", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
                        {loading ? t("booking.saving") : t("booking.confirmBtn")}
                    </button>
                </div>

                {/* Summary */}
                <div style={{ position: "sticky", top: 90 }}>
                    <div style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(10,127,165,0.08)" }}>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", color: "#0f2030", marginBottom: 18 }}>{t("booking.summaryTitle")}</h3>
                        <img src={selHotel.img} alt={selHotel.name} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginBottom: 18 }} />
                        <div style={{ fontWeight: 700, color: "#0f2030", fontSize: "1.05rem", marginBottom: 4 }}>{selHotel.name}</div>
                        <div style={{ fontSize: "0.82rem", color: "#6b8999", marginBottom: 18 }}>📍 {selHotel.district} · {selHotel.type}</div>
                        <div style={{ borderTop: "1px solid #e2ecf0", paddingTop: 18 }}>
                            {[
                                [t("booking.room"), form.room],
                                [t("booking.checkin"), form.checkin || "—"],
                                [t("booking.checkout"), form.checkout || "—"],
                                [t("booking.nights"), nights || "—"],
                                [t("booking.guests"), form.guests],
                                [t("booking.rate"), `$${selHotel.price}${t("hotels.night")}`]
                            ].map(([l, v]) => (
                                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 11, fontSize: "0.88rem" }}>
                                    <span style={{ color: "#6b8999" }}>{l}</span><span style={{ fontWeight: 600, color: "#0f2030" }}>{v}</span>
                                </div>
                            ))}
                            <div style={{ borderTop: "2px solid #e2ecf0", paddingTop: 14, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.2rem" }}>
                                <span>{t("booking.total")}</span><span style={{ color: "#0a7fa5" }}>${nights ? selHotel.price * nights : 0}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: 14, background: "#f0f8fc", border: "1px solid #c8e6f0", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", fontSize: "0.82rem", color: "#0a7fa5" }}>
                        <span>🔥</span>
                        <span>{t("booking.firebaseNote")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingPage;
