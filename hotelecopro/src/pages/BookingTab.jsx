import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Input from "../components/Input";
import { saveBooking, listenHotelProfile, updateHotelProfile } from "../data/firebase";
import RoomSelector from "../components/RoomSelector";

function BookingTab({ hotel }) {
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", checkin: "", checkout: "", guests: 1, room: "", roomNumber: "", special: "" });
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (hotel?.id) {
            const unsub = listenHotelProfile(hotel.id, (data) => {
                setProfile(data || {});
            });
            return unsub;
        }
    }, [hotel?.id]);

    useEffect(() => {
        if (hotel && profile && (!profile.rooms || profile.rooms.length === 0)) {
            const roomCount = Number(hotel.rooms) || 12;
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
            updateHotelProfile(hotel.id, { ...profile, rooms: generatedRooms });
        }
    }, [hotel, profile]);

    const nights = form.checkin && form.checkout
        ? Math.max(0, Math.round((new Date(form.checkout) - new Date(form.checkin)) / 86400000))
        : 0;

    if (done) return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", color: "#0f2030", marginBottom: 12 }}>{t("bookingtab.confirmedTitle")}</h2>
            <p style={{ color: "#6b8999", fontSize: "1rem" }}>{t("bookingtab.confirmedMsg", { hotel: hotel.name, email: form.email })}</p>
            <button onClick={() => { setDone(false); setForm({ name: "", email: "", phone: "", checkin: "", checkout: "", guests: 1, room: "", roomNumber: "", special: "" }); }} style={{ marginTop: 24, background: "#0a7fa5", color: "#fff", border: "none", borderRadius: 10, padding: "11px 26px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>{t("bookingtab.newBooking")}</button>
        </div>
    );

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 36, maxWidth: 900 }}>
            <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: "#0f2030", marginBottom: 24 }}>{t("bookingtab.title")}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Input label={t("bookingtab.fullName")} type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t("bookingtab.fullNamePlaceholder")} />
                    <Input label={t("bookingtab.email")} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
                    <Input label={t("bookingtab.phone")} type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
                    <Input label={t("bookingtab.roomType") || "Selected Room"} type="text" value={form.roomNumber ? `${form.room} (No. ${form.roomNumber})` : "Please select a room below..."} disabled={true} readOnly={true} />
                    <Input label={t("bookingtab.checkin")} type="date" value={form.checkin} onChange={e => setForm(p => ({ ...p, checkin: e.target.value }))} />
                    <Input label={t("bookingtab.checkout")} type="date" value={form.checkout} onChange={e => setForm(p => ({ ...p, checkout: e.target.value }))} />
                    <Input label={t("bookingtab.guests")} type="number" value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))} />
                </div>
                <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", display: "block", marginBottom: 6 }}>{t("bookingtab.specialRequests")}</label>
                    <textarea value={form.special} onChange={e => setForm(p => ({ ...p, special: e.target.value }))} rows={3} placeholder={t("bookingtab.specialPlaceholder")} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2ecf0", borderRadius: 10, fontSize: "0.9rem", color: "#1e3a4a", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                </div>

                <RoomSelector
                    rooms={profile?.rooms || []}
                    selectedRoomNumber={form.roomNumber}
                    onSelectRoom={(room) => {
                        setForm(prev => ({ ...prev, room: room.type, roomNumber: room.number }));
                    }}
                    hotelName={hotel.name}
                />

                <button onClick={async () => {
                    if (!form.name || !form.email || !form.checkin || !form.checkout || !form.roomNumber) {
                        alert("Please fill in all required fields and select a physical room from the layout.");
                        return;
                    }
                    try {
                        const bookingId = await saveBooking({
                            ...form,
                            hotelId: hotel.id,
                            hotel: hotel.name,
                            district: hotel.district,
                            totalPrice: nights ? hotel.price * nights : 0,
                            roomRate: hotel.price,
                            nights
                        });

                        // Update physical room status in Firebase Realtime Database
                        const currentRooms = profile?.rooms || [];
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
                        await updateHotelProfile(hotel.id, { rooms: updatedRooms });

                        setDone(true);
                    } catch (err) {
                        console.error("Failed to save booking", err);
                        alert(t("booking.saveError") || "An error occurred while saving the booking.");
                    }
                }} style={{ marginTop: 20, background: "linear-gradient(135deg,#0a7fa5,#17c4b8)", color: "#fff", border: "none", padding: "14px 36px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "1rem", boxShadow: "0 6px 20px rgba(10,127,165,0.3)", fontFamily: "inherit" }}>
                    {t("bookingtab.confirmBtn")}
                </button>
            </div>
            <div style={{ background: "#f0f8fc", borderRadius: 16, padding: 24, height: "fit-content", border: "1px solid #e2ecf0" }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", color: "#0f2030", marginBottom: 16 }}>{t("bookingtab.summaryTitle")}</h3>
                <img src={hotel.img} alt={hotel.name} style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 10, marginBottom: 16 }} />
                <div style={{ fontWeight: 700, color: "#0f2030", marginBottom: 4 }}>{hotel.name}</div>
                <div style={{ fontSize: "0.82rem", color: "#6b8999", marginBottom: 16 }}>📍 {hotel.district}</div>
                <div style={{ borderTop: "1px solid #e2ecf0", paddingTop: 14 }}>
                    {[
                        [t("bookingtab.room"), form.roomNumber ? `${form.room} (No. ${form.roomNumber})` : "—"],
                        [t("bookingtab.nights"), nights || "—"],
                        [t("bookingtab.guests"), form.guests],
                        [t("bookingtab.perNight"), `$${hotel.price}`]
                    ].map(([l, v]) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: "0.88rem" }}>
                            <span style={{ color: "#6b8999" }}>{l}</span>
                            <span style={{ fontWeight: 600, color: "#0f2030" }}>{v}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: "1px solid #e2ecf0", paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem" }}>
                        <span>{t("bookingtab.total")}</span>
                        <span style={{ color: "#0a7fa5" }}>${nights ? hotel.price * nights : 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingTab;
