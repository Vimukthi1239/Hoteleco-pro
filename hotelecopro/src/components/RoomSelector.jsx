import { useState, useMemo } from "react";

// Icons for different room types
const ROOM_TYPE_ICONS = {
  "Deluxe Ocean Suite": "🌊",
  "Eco Canopy Cabin": "🌲",
  "Presidential Luxury Suite": "👑",
  "Standard Forest View": "🌿",
  "default": "🛏️"
};

// Colors associated with each room status
const STATUS_STYLES = {
  available: {
    bg: "bg-emerald-50/70 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800/40",
    text: "text-emerald-700 dark:text-emerald-400",
    glow: "hover:shadow-emerald-100 dark:hover:shadow-emerald-950/30",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-300",
    icon: "🌿",
    label: "Available"
  },
  booked: {
    bg: "bg-slate-100/70 opacity-60 cursor-not-allowed",
    border: "border-slate-200 dark:border-slate-800/40",
    text: "text-slate-550 dark:text-slate-400",
    glow: "",
    badge: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: "🔒",
    label: "Occupied"
  },
  cleaning: {
    bg: "bg-amber-50/70 opacity-60 cursor-not-allowed",
    border: "border-amber-200 dark:border-amber-800/40",
    text: "text-amber-700 dark:text-amber-400",
    glow: "",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300",
    icon: "🧹",
    label: "Cleaning"
  },
  maintenance: {
    bg: "bg-rose-50/70 opacity-60 cursor-not-allowed",
    border: "border-rose-200 dark:border-rose-800/40",
    text: "text-rose-700 dark:text-rose-400",
    glow: "",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/35 dark:text-rose-300",
    icon: "🔧",
    label: "Under Repair"
  }
};

// Eco-features descriptions for blueprint display
const ECO_FEATURES = {
  "Deluxe Ocean Suite": [
    "☀️ 100% Solar-powered climate control & lighting",
    "🌊 Triple-glazed insulated glass with ocean sea-breeze vents",
    "🚿 Low-flow smart shower with solar greywater pre-heating",
    "♻️ Zero single-use plastic bamboo toiletries"
  ],
  "Eco Canopy Cabin": [
    "🌲 Organic bamboo frame & sustainable teak construction",
    "🍃 Passive convection airflow design (requires no AC)",
    "🍂 In-cabin guest composting and recycling chutes",
    "💡 Piezoelectric kinetic floorboards generating basic LED path-lighting"
  ],
  "Presidential Luxury Suite": [
    "🔋 Tesla Powerwall backup with integrated solar roof tiles",
    "💧 Closed-loop rainwater harvesting & carbon filtration unit",
    "🌿 Biodiverse living wall indoor air purification system",
    "📱 Smart energy-management occupancy sensors"
  ],
  "Standard Forest View": [
    "🌳 Double-paned forest view nature observation window",
    "💡 Ultra-high efficiency A+++ LED fixtures",
    "🧴 Local organic biodegradable soaps & shampoos",
    "🧺 Organic fair-trade linen sheets washed via eco-hydro system"
  ],
  "default": [
    "💡 Energy saving smart card power cut-off switch",
    "🚿 Eco-efficient low-flow toilet & water fixtures",
    "♻️ In-room recycling bin"
  ]
};

// Beautiful SVGs representing blueprints for each room type
function BlueprintSVG({ type }) {
  if (type === "Deluxe Ocean Suite") {
    return (
      <svg viewBox="0 0 240 180" className="w-full h-full bg-[#0a192f] border border-sky-900/50 rounded-xl">
        {/* Graph paper grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(146, 210, 249, 0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Walls */}
        <rect x="20" y="20" width="200" height="140" fill="none" stroke="#00b4d8" strokeWidth="2" strokeDasharray="3 1" />
        <line x1="160" y1="20" x2="160" y2="160" stroke="#00b4d8" strokeWidth="2" />
        <line x1="20" y1="120" x2="110" y2="120" stroke="#00b4d8" strokeWidth="1.5" />
        
        {/* Balcony (Ocean View) */}
        <rect x="20" y="5" width="130" height="15" fill="rgba(0, 180, 216, 0.15)" stroke="#00b4d8" strokeWidth="1" />
        <text x="85" y="15" fill="#90e0ef" fontSize="7" fontWeight="bold" textAnchor="middle">🌊 OCEAN BALCONY</text>
        
        {/* Bed */}
        <rect x="45" y="45" width="60" height="55" fill="none" stroke="#90e0ef" strokeWidth="1.5" rx="3" />
        <rect x="52" y="48" width="20" height="12" fill="none" stroke="#90e0ef" strokeWidth="1" rx="1" />
        <rect x="78" y="48" width="20" height="12" fill="none" stroke="#90e0ef" strokeWidth="1" rx="1" />
        <line x1="45" y1="68" x2="105" y2="68" stroke="#90e0ef" strokeWidth="1" />
        <text x="75" y="85" fill="#90e0ef" fontSize="8" textAnchor="middle" opacity="0.8">KING BED</text>
        
        {/* Bathroom */}
        <text x="190" y="90" fill="#90e0ef" fontSize="8" textAnchor="middle" opacity="0.8">BATH</text>
        <rect x="170" y="35" width="40" height="20" fill="none" stroke="#00b4d8" strokeWidth="1" rx="8" />
        <circle cx="190" cy="135" r="8" fill="none" stroke="#00b4d8" strokeWidth="1" />
        
        {/* Wardrobe / Entry */}
        <rect x="120" y="130" width="30" height="20" fill="none" stroke="#00b4d8" strokeWidth="1" />
        <text x="135" y="142" fill="#52b788" fontSize="6" textAnchor="middle">ENT</text>
        
        {/* Solar AC Badge */}
        <rect x="25" y="145" width="45" height="10" fill="rgba(82, 183, 136, 0.1)" stroke="#52b788" strokeWidth="0.5" rx="2" />
        <text x="47" y="152" fill="#52b788" fontSize="5.5" fontWeight="bold" textAnchor="middle">⚡ SOLAR A/C</text>
      </svg>
    );
  }
  
  if (type === "Eco Canopy Cabin") {
    return (
      <svg viewBox="0 0 240 180" className="w-full h-full bg-[#0d2218] border border-emerald-950/50 rounded-xl">
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Circular natural footprint walls */}
        <circle cx="120" cy="90" r="70" fill="none" stroke="#52b788" strokeWidth="2.5" strokeDasharray="4 2" />
        
        {/* Wood Deck */}
        <path d="M 60 50 A 70 70 0 0 1 180 50 Z" fill="rgba(82, 183, 136, 0.15)" stroke="#52b788" strokeWidth="1" />
        <text x="120" y="32" fill="#a3e635" fontSize="7.5" fontWeight="bold" textAnchor="middle">🌲 CANOPY DECK</text>
        
        {/* Bamboo Queen Bed */}
        <rect x="90" y="75" width="60" height="50" fill="none" stroke="#a3e635" strokeWidth="1.5" rx="2" />
        <rect x="96" y="78" width="20" height="10" fill="none" stroke="#a3e635" strokeWidth="1" rx="1" />
        <rect x="124" y="78" width="20" height="10" fill="none" stroke="#a3e635" strokeWidth="1" rx="1" />
        <text x="120" y="112" fill="#a3e635" fontSize="8" textAnchor="middle" opacity="0.8">BAMBOO BED</text>
        
        {/* Compost Bin */}
        <rect x="62" y="115" width="14" height="14" fill="rgba(163, 230, 53, 0.1)" stroke="#52b788" strokeWidth="1" rx="1" />
        <text x="69" y="124" fill="#a3e635" fontSize="5.5" fontWeight="bold" textAnchor="middle">♻️</text>
        
        {/* Nature Bath */}
        <circle cx="168" cy="118" r="10" fill="none" stroke="#52b788" strokeWidth="1" />
        <text x="168" y="132" fill="#52b788" fontSize="6.5" textAnchor="middle">SHOWER</text>
        
        {/* Passive Draft arrows */}
        <path d="M 120 155 L 120 135" stroke="#52b788" strokeWidth="0.8" markerEnd="url(#arrow)" />
        <path d="M 120 40 L 120 20" stroke="#52b788" strokeWidth="0.8" />
        <text x="120" y="150" fill="#52b788" fontSize="5" textAnchor="middle">NATURAL DRAFT</text>
      </svg>
    );
  }
  
  if (type === "Presidential Luxury Suite") {
    return (
      <svg viewBox="0 0 240 180" className="w-full h-full bg-[#1e1b4b] border border-indigo-950/50 rounded-xl">
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Outer Walls - Large Layout */}
        <rect x="15" y="15" width="210" height="150" fill="none" stroke="#818cf8" strokeWidth="2.5" />
        {/* Room Dividers */}
        <line x1="120" y1="15" x2="120" y2="165" stroke="#818cf8" strokeWidth="2" />
        <line x1="15" y1="100" x2="120" y2="100" stroke="#818cf8" strokeWidth="1.5" />
        
        {/* Master Bedroom (Left Top) */}
        <rect x="35" y="30" width="50" height="45" fill="none" stroke="#c084fc" strokeWidth="1.5" rx="3" />
        <rect x="41" y="33" width="16" height="10" fill="none" stroke="#c084fc" strokeWidth="1" rx="1" />
        <rect x="63" y="33" width="16" height="10" fill="none" stroke="#c084fc" strokeWidth="1" rx="1" />
        <text x="60" y="62" fill="#c084fc" fontSize="7.5" textAnchor="middle">MASTER KING</text>
        
        {/* Guest Bedroom (Left Bottom) */}
        <rect x="35" y="115" width="45" height="38" fill="none" stroke="#818cf8" strokeWidth="1.2" rx="2" />
        <text x="57" y="138" fill="#818cf8" fontSize="7" textAnchor="middle">QUEEN BED</text>
        
        {/* Lounge / Living area (Right) */}
        <text x="170" y="35" fill="#818cf8" fontSize="8" fontWeight="bold" textAnchor="middle">🛋️ LIVING LOUNGE</text>
        <path d="M 140 60 Q 140 85 170 85 T 200 60" fill="none" stroke="#818cf8" strokeWidth="1.5" />
        <circle cx="170" cy="60" r="10" fill="none" stroke="#818cf8" strokeWidth="1" />
        
        {/* Dining Table */}
        <rect x="150" y="110" width="40" height="24" fill="none" stroke="#818cf8" strokeWidth="1" rx="4" />
        <circle cx="170" cy="122" r="3" fill="#818cf8" />
        <text x="170" y="145" fill="#818cf8" fontSize="6.5" textAnchor="middle">DINING</text>
        
        {/* Jacuzzi Deck (Outside Bottom Right) */}
        <rect x="200" y="125" width="20" height="35" fill="rgba(192, 132, 252, 0.12)" stroke="#c084fc" strokeWidth="1" />
        <circle cx="210" cy="142" r="7" fill="none" stroke="#c084fc" strokeWidth="1.2" />
        <text x="210" y="122" fill="#c084fc" fontSize="5" textAnchor="middle">JACUZZI</text>
        
        {/* Powerwall badge */}
        <rect x="92" y="148" width="25" height="12" fill="rgba(82, 183, 136, 0.1)" stroke="#52b788" strokeWidth="0.5" rx="1.5" />
        <text x="104" y="156" fill="#52b788" fontSize="5" fontWeight="bold" textAnchor="middle">🔋 PWR</text>
      </svg>
    );
  }

  // Fallback - Standard Forest View
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full bg-[#07161e] border border-emerald-950/50 rounded-xl">
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {/* Wall boundary */}
      <rect x="25" y="25" width="190" height="130" fill="none" stroke="#34d399" strokeWidth="2" />
      <line x1="150" y1="25" x2="150" y2="155" stroke="#34d399" strokeWidth="1.5" />
      
      {/* Forest Window (Top Wall) */}
      <rect x="60" y="21" width="60" height="8" fill="rgba(52, 211, 153, 0.25)" stroke="#34d399" strokeWidth="1" />
      <text x="90" y="17" fill="#34d399" fontSize="6.5" fontWeight="bold" textAnchor="middle">🌳 FOREST WINDOW</text>
      
      {/* Double Bed */}
      <rect x="55" y="55" width="55" height="50" fill="none" stroke="#a7f3d0" strokeWidth="1.5" rx="2" />
      <rect x="61" y="58" width="18" height="10" fill="none" stroke="#a7f3d0" strokeWidth="1" rx="1" />
      <rect x="86" y="58" width="18" height="10" fill="none" stroke="#a7f3d0" strokeWidth="1" rx="1" />
      <text x="82" y="90" fill="#a7f3d0" fontSize="7.5" textAnchor="middle" opacity="0.8">DOUBLE BED</text>
      
      {/* Desk and Lamp */}
      <rect x="30" y="125" width="25" height="15" fill="none" stroke="#34d399" strokeWidth="1" />
      <circle cx="42" cy="132" r="2" fill="#34d399" />
      
      {/* Shower Room */}
      <rect x="165" y="45" width="35" height="35" fill="none" stroke="#34d399" strokeWidth="1" />
      <text x="182" y="65" fill="#34d399" fontSize="7" textAnchor="middle">BATH</text>
      
      {/* Eco LED badge */}
      <rect x="165" y="125" width="35" height="12" fill="rgba(52, 211, 153, 0.1)" stroke="#34d399" strokeWidth="0.5" rx="1.5" />
      <text x="182" y="133" fill="#34d399" fontSize="5" fontWeight="bold" textAnchor="middle">💡 ECO-LED</text>
    </svg>
  );
}

export default function RoomSelector({ rooms = [], selectedRoomNumber, onSelectRoom, hotelName }) {
  const [activeFloor, setActiveFloor] = useState("All");

  // Group rooms by floors based on their room number (e.g. 1xx is floor 1, 2xx is floor 2)
  const roomsByFloor = useMemo(() => {
    const groups = {};
    rooms.forEach(room => {
      const num = parseInt(room.number);
      const floorNum = isNaN(num) ? "G" : Math.floor(num / 100);
      const floorLabel = floorNum === "G" ? "Ground Floor" : `Floor ${floorNum}`;
      if (!groups[floorLabel]) groups[floorLabel] = [];
      groups[floorLabel].push(room);
    });
    return groups;
  }, [rooms]);

  const floors = useMemo(() => {
    return ["All", ...Object.keys(roomsByFloor).sort()];
  }, [roomsByFloor]);

  // Retrieve details for the currently selected room
  const selectedRoomObj = useMemo(() => {
    return rooms.find(r => r.number === selectedRoomNumber);
  }, [rooms, selectedRoomNumber]);

  const selectedFeatures = useMemo(() => {
    if (!selectedRoomObj) return [];
    return ECO_FEATURES[selectedRoomObj.type] || ECO_FEATURES.default;
  }, [selectedRoomObj]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl w-full font-sans antialiased text-left mt-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <span className="text-[#0a7fa5] text-xs font-bold uppercase tracking-widest block mb-1">
          Live Interactive Room Selector
        </span>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Select Your Room at {hotelName}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Pick your preferred physical room from the live floor matrix. Statuses update instantly.
        </p>
      </div>

      {/* Legend & Floor Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Status indicator legend */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 block"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400 block"></span>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 block"></span>
            <span>Cleaning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 block"></span>
            <span>Repair / Maintenance</span>
          </div>
        </div>

        {/* Floor quick-filters */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          {floors.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFloor(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer outline-none ${
                activeFloor === f
                  ? "bg-white dark:bg-slate-700 text-[#0a7fa5] shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {f === "All" ? "All Floors" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Main room selection layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Room Grid (Left, 7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {rooms.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-12 text-center text-slate-500">
              <span className="text-3xl block mb-2">🏨</span>
              <p className="text-sm font-semibold">Initializing hotel room configurations...</p>
              <p className="text-xs text-slate-450 mt-1">Please wait while the room layout is prepared.</p>
            </div>
          ) : (
            Object.keys(roomsByFloor)
              .sort()
              .filter(floor => activeFloor === "All" || activeFloor === floor)
              .map(floor => (
                <div key={floor} className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center justify-between">
                    <span>🏢 {floor}</span>
                    <span className="text-[10px] lowercase font-normal">
                      {roomsByFloor[floor].length} units
                    </span>
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {roomsByFloor[floor].map(room => {
                      const style = STATUS_STYLES[room.status] || STATUS_STYLES.available;
                      const isSelected = selectedRoomNumber === room.number;
                      const isAvailable = room.status === "available";

                      return (
                        <div
                          key={room.id}
                          onClick={() => isAvailable && onSelectRoom(room)}
                          className={`relative p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between h-24 ${
                            isAvailable ? "cursor-pointer hover:scale-[1.03]" : "cursor-not-allowed"
                          } ${
                            isSelected
                              ? "bg-sky-50/40 border-[#0a7fa5] ring-2 ring-[#0a7fa5]/25 shadow-lg shadow-[#0a7fa5]/10"
                              : `${style.bg} ${style.border} ${style.glow}`
                          }`}
                        >
                          {/* Room Number & Selected Badge */}
                          <div className="flex justify-between items-start">
                            <span className={`text-base font-extrabold tracking-tight ${isSelected ? "text-[#0a7fa5]" : "text-slate-800 dark:text-slate-200"}`}>
                              No. {room.number}
                            </span>
                            {isSelected && (
                              <span className="text-xs bg-[#0a7fa5] text-white p-0.5 rounded-full flex items-center justify-center h-4 w-4 shadow-sm font-bold">
                                ✓
                              </span>
                            )}
                          </div>

                          {/* Room Type Mini Icon */}
                          <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-1 truncate" title={room.type}>
                            <span className="text-xs">{ROOM_TYPE_ICONS[room.type] || ROOM_TYPE_ICONS.default}</span>
                            <span className="truncate">{room.type}</span>
                          </div>

                          {/* Status Badge */}
                          <div className="mt-2.5 flex justify-end">
                            <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide ${style.badge}`}>
                              {style.icon} {style.label}
                            </span>
                          </div>

                          {/* Live pulse for available room */}
                          {isAvailable && (
                            <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Blueprint Panel (Right, 5 columns) */}
        <div className="lg:col-span-5 h-full">
          {selectedRoomObj ? (
            <div className="border border-slate-200 dark:border-slate-850 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col h-full animate-fadeIn">
              <span className="text-[#0a7fa5] text-[10px] font-bold uppercase tracking-wider block mb-1">
                Room Layout & Blueprint
              </span>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>{ROOM_TYPE_ICONS[selectedRoomObj.type] || ROOM_TYPE_ICONS.default}</span>
                <span>Room {selectedRoomObj.number} Details</span>
              </h4>
              <p className="text-[11px] font-semibold text-[#0a7fa5] mt-0.5">
                Category: {selectedRoomObj.type}
              </p>

              {/* Blueprint Drawing */}
              <div className="w-full aspect-[4/3] max-h-48 mt-4 mb-4 flex items-center justify-center shadow-inner overflow-hidden rounded-xl bg-slate-950">
                <BlueprintSVG type={selectedRoomObj.type} />
              </div>

              {/* Eco Features list */}
              <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-4 flex-1">
                <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  🌿 Sustainability Features
                </h5>
                <ul className="space-y-2">
                  {selectedFeatures.map((feat, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selection Confirmation Notice */}
              <div className="mt-5 bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-xl p-3 flex gap-2.5 items-center">
                <span className="text-lg">🎉</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-sky-800 dark:text-sky-300">
                    Room reserved & locked!
                  </div>
                  <div className="text-[10px] text-sky-650 dark:text-sky-400 mt-0.5">
                    Room {selectedRoomObj.number} will be assigned to your booking.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px] h-full bg-slate-50/20">
              <div className="text-4xl mb-3">👈</div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Room Selected</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                Please click on an available (green) room card to preview its floor plan and select it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
