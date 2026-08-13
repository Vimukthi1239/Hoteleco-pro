import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { saveBooking, listenDestinations } from "../data/firebase";
import { DESTINATIONS } from "../data/destinations";
import Input from "../components/Input";
import { API_BASE_URL } from "../config";

// Vehicle specifications
const VEHICLE_TYPES = [
  { id: "tuk-tuk", name: "Tuk-Tuk (Traditional)", rate: 0.30, icon: "🛺", capacity: "2 Pax" },
  { id: "sedan", name: "Sedan (Comfortable Car)", rate: 0.60, icon: "🚗", capacity: "3-4 Pax" },
  { id: "suv", name: "SUV (Spacious Offroad)", rate: 1.00, icon: "🚙", capacity: "4 Pax" },
  { id: "luxury-van", name: "Luxury Van (Family Travel)", rate: 1.50, icon: "🚐", capacity: "6-8 Pax" },
];

const COUNTRY_DATA = [
  { name: "Sri Lanka", dial: "+94", flag: "🇱🇰", code: "LK" },
  { name: "India", dial: "+91", flag: "🇮🇳", code: "IN" },
  { name: "China", dial: "+86", flag: "🇨🇳", code: "CN" },
  { name: "United Kingdom", dial: "+44", flag: "🇬🇧", code: "GB" },
  { name: "United States", dial: "+1", flag: "🇺🇸", code: "US" },
  { name: "Germany", dial: "+49", flag: "🇩🇪", code: "DE" },
  { name: "Russia", dial: "+7", flag: "🇷🇺", code: "RU" },
  { name: "France", dial: "+33", flag: "🇫🇷", code: "FR" },
  { name: "Australia", dial: "+61", flag: "🇦🇺", code: "AU" },
  { name: "Japan", dial: "+81", flag: "🇯🇵", code: "JP" },
  { name: "Maldives", dial: "+960", flag: "🇲🇻", code: "MV" },
  { name: "Singapore", dial: "+65", flag: "🇸🇬", code: "SG" },
  { name: "Canada", dial: "+1", flag: "🇨🇦", code: "CA" },
  { name: "United Arab Emirates", dial: "+971", flag: "🇦🇪", code: "AE" },
  { name: "Saudi Arabia", dial: "+966", flag: "🇸🇦", code: "SA" },
  { name: "Qatar", dial: "+974", flag: "🇶🇦", code: "QA" },
  { name: "Malaysia", dial: "+60", flag: "🇲🇾", code: "MY" },
  { name: "Thailand", dial: "+66", flag: "🇹🇭", code: "TH" },
  { name: "Indonesia", dial: "+62", flag: "🇮🇩", code: "ID" },
  { name: "Italy", dial: "+39", flag: "🇮🇹", code: "IT" },
  { name: "Spain", dial: "+34", flag: "🇪🇸", code: "ES" },
  { name: "Netherlands", dial: "+31", flag: "🇳🇱", code: "NL" },
  { name: "Switzerland", dial: "+41", flag: "🇨🇭", code: "CH" },
  { name: "Sweden", dial: "+46", flag: "🇸🇪", code: "SE" },
  { name: "Norway", dial: "+47", flag: "🇳🇴", code: "NO" },
  { name: "New Zealand", dial: "+64", flag: "🇳🇿", code: "NZ" },
  { name: "South Africa", dial: "+27", flag: "🇿🇦", code: "ZA" },
  { name: "Brazil", dial: "+55", flag: "🇧🇷", code: "BR" },
  { name: "Pakistan", dial: "+92", flag: "🇵🇰", code: "PK" },
  { name: "Bangladesh", dial: "+880", flag: "🇧🇩", code: "BD" },
  { name: "Nepal", dial: "+977", flag: "🇳🇵", code: "NP" }
].sort((a, b) => a.name.localeCompare(b.name));

// Helper functions for dynamic hotels (pure functions)
const getHotelPrice = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const min = 60;
  const max = 280;
  return min + Math.abs(hash % (max - min));
};

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1542314831-c6a4d14d8379?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80"
];

const getHotelImage = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return HOTEL_IMAGES[Math.abs(hash % HOTEL_IMAGES.length)];
};

export default function TripPlannerWizard({ setPage, customerUser }) {
  useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Step 1: Origin & Dates
  const [originCountry, setOriginCountry] = useState("United States");
  const [originCity, setOriginCity] = useState("New York");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("12:00");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("18:00");
  const [numGuests, setNumGuests] = useState(1);

  // Passenger Details
  const [passengerName, setPassengerName] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerDOB, setPassengerDOB] = useState("");
  const [passengerGender, setPassengerGender] = useState("Male");
  const [passengerPassportNum, setPassengerPassportNum] = useState("");
  const [passengerPassportExpiry, setPassengerPassportExpiry] = useState("");

  // Step 2: Custom Itinerary & Stays
  const [liveDestinations, setLiveDestinations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [recommendedHotels, setRecommendedHotels] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [hotelFilterDest, setHotelFilterDest] = useState("all");
  const [fetchingHotels, setFetchingHotels] = useState(false);

  // Step 1 Extra: airports & prefix states
  const [cityOptions, setCityOptions] = useState([]);
  const [fetchingCities, setFetchingCities] = useState(false);

  // Pre-populate passenger info from customerUser
  useEffect(() => {
    if (customerUser) {
      if (customerUser.fullName) setPassengerName(customerUser.fullName);
      if (customerUser.email) setPassengerEmail(customerUser.email);
      if (customerUser.phone) setPassengerPhone(customerUser.phone);
      if (customerUser.nationality) {
        const match = COUNTRY_DATA.find(c => c.name.toLowerCase() === customerUser.nationality.toLowerCase());
        if (match) {
          setOriginCountry(match.name);
        } else {
          setOriginCountry(customerUser.nationality);
        }
      }
    }
  }, [customerUser]);

  // 1. Fetch cities from /api/airports when country changes
  useEffect(() => {
    const selectedCountryObj = COUNTRY_DATA.find(c => c.name === originCountry);
    if (!selectedCountryObj) return;

    setFetchingCities(true);
    setCityOptions([]);

    fetch(`${API_BASE_URL}/api/airports?country=${selectedCountryObj.code}`)
      .then(res => {
        if (!res.ok) throw new Error("API Offline");
        return res.json();
      })
      .then(data => {
        setCityOptions(data.airports || []);
        setFetchingCities(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch cities from API:", err);
        setCityOptions([]);
        setFetchingCities(false);
      });
  }, [originCountry]);

  // 2. Listen to live destinations from Firebase
  useEffect(() => {
    const unsub = listenDestinations((data) => {
      setLiveDestinations(data || []);
    });
    return () => unsub();
  }, []);

  // Combined destinations list deduplicated
  const allDestinations = [];
  const seenDests = new Set();
  [...liveDestinations, ...DESTINATIONS].forEach(d => {
    if (d && d.name && !seenDests.has(d.name.toLowerCase())) {
      seenDests.add(d.name.toLowerCase());
      allDestinations.push(d);
    }
  });

  // 3. Fetch hotels near selected destinations in parallel
  useEffect(() => {
    if (selectedDestinations.length === 0) {
      setRecommendedHotels([]);
      setSelectedHotels([]);
      return;
    }
    
    setFetchingHotels(true);
    
    const fetchPromises = selectedDestinations.map(dest => 
      fetch(`${API_BASE_URL}/recommend/hotels?site_name=${encodeURIComponent(dest.name)}&top_k=4`)
        .then(res => {
          if (!res.ok) throw new Error("API Offline");
          return res.json();
        })
        .then(data => (data.recommended_hotels || []).map(h => ({ ...h, dest_name: dest.name })))
        .catch(() => {
          // Dynamic mock fallback
          return [
            { hotel_name: `${dest.name} Eco Lodge`, distance_km: 1.2, dest_name: dest.name },
            { hotel_name: `Cinnamon ${dest.name} Resort`, distance_km: 3.5, dest_name: dest.name },
            { hotel_name: `Grand ${dest.name} Villa`, distance_km: 0.8, dest_name: dest.name },
            { hotel_name: `${dest.name} Heritage Hotel`, distance_km: 2.1, dest_name: dest.name }
          ];
        })
    );
    
    Promise.all(fetchPromises)
      .then(results => {
        const merged = [];
        const seen = new Set();
        
        results.flat().forEach(h => {
          if (!seen.has(h.hotel_name)) {
            seen.add(h.hotel_name);
            merged.push({
              name: h.hotel_name,
              destination: h.dest_name || selectedDestinations[0]?.name,
              distance: h.distance_km,
              price: getHotelPrice(h.hotel_name),
              image: getHotelImage(h.hotel_name),
              rating: 4.0 + (h.hotel_name.length % 10) / 10
            });
          }
        });
        
        setRecommendedHotels(merged);
        setSelectedHotels(prev => prev.filter(sh => seen.has(sh.name)));
        setFetchingHotels(false);
      });
  }, [selectedDestinations]);

  // Step 3: Transport & Flights
  const [selectedVehicle, setSelectedVehicle] = useState("sedan");
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [fetchingFlights, setFetchingFlights] = useState(false);

  // Step 4: Checkout
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Derived Values
  const nights = arrivalDate && departureDate
    ? Math.max(1, Math.round((new Date(departureDate) - new Date(arrivalDate)) / 86400000))
    : 0;

  const vehicleInfo = VEHICLE_TYPES.find(v => v.id === selectedVehicle) || VEHICLE_TYPES[1];

  const hotelRateSum = selectedHotels.reduce((sum, h) => sum + h.price, 0);
  const hotelTotal = hotelRateSum * nights * numGuests;
  const driverCost = 20 * nights; // $20 Flat Driver cost per night
  
  const routeDistance = selectedDestinations.length > 0 ? 150 + selectedDestinations.length * 80 : 350;
  const distanceCost = Math.round(routeDistance * vehicleInfo.rate);
  const transportTotal = distanceCost + driverCost;
  const isLuxuryStay = selectedHotels.some(h => h.price > 180);
  const flightRate = selectedFlight ? selectedFlight.price : (isLuxuryStay ? 2800 : 950);
  const flightTotal = flightRate * numGuests;
  const platformFee = 49.00;
  const totalBill = flightTotal + hotelTotal + transportTotal + platformFee;

  // Search Flights simulation (can fetch FastAPI endpoint if available)
  useEffect(() => {
    if (step === 3 && originCity) {
      setFetchingFlights(true);
      setError("");
      
      // Attempt live fetch with fallback
      fetch(`${API_BASE_URL}/api/flights/search?origin=${encodeURIComponent(originCity)}&departure_date=${arrivalDate}&return_date=${departureDate}`)
        .then(res => {
          if (!res.ok) throw new Error("API Offline");
          return res.json();
        })
        .then(data => {
          setFlights(data.flights);
          if (data.flights.length > 0) setSelectedFlight(data.flights[0]);
          setFetchingFlights(false);
        })
        .catch(() => {
          // Fallback to high-quality mock data matching the budget tier
          setTimeout(() => {
            const isLuxury = selectedHotels.some(h => h.price > 180);
            const basePrice = isLuxury ? 2800 : 950;
            const mockFlights = [
              { id: "fl-1", carrier: "Qatar Airways", number: "QR-664", price: Math.round(basePrice * 0.95), class: isLuxury ? "Business" : "Economy", stops: 1, duration: "16h 20m" },
              { id: "fl-2", carrier: "SriLankan Airlines", number: "UL-504", price: Math.round(basePrice), class: isLuxury ? "Business" : "Economy", stops: 0, duration: "12h 05m" },
              { id: "fl-3", carrier: "Emirates", number: "EK-348", price: Math.round(basePrice * 1.05), class: isLuxury ? "Business" : "Economy", stops: 1, duration: "15h 45m" }
            ];
            setFlights(mockFlights);
            setSelectedFlight(mockFlights[0]);
            setFetchingFlights(false);
          }, 1200);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, originCity, selectedHotels]);

  const handleNext = () => {
    if (step === 1) {
      if (
        !passengerName ||
        !passengerEmail ||
        !passengerPhone ||
        !passengerDOB ||
        !passengerGender ||
        !passengerPassportNum ||
        !passengerPassportExpiry ||
        !originCountry ||
        !originCity ||
        !arrivalDate ||
        !departureDate
      ) {
        setError("Please fill out all passenger and flight fields in Step 1.");
        return;
      }
      if (nights <= 0) {
        setError("Departure date must be after arrival date.");
        return;
      }
    }
    if (step === 2) {
      if (selectedDestinations.length === 0) {
        setError("Please select at least one destination you want to explore.");
        return;
      }
      if (selectedHotels.length === 0) {
        setError("Please select at least one hotel/stay near your destinations.");
        return;
      }
    }
    setError("");
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(prev => prev - 1);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      setError("Please complete all payment fields.");
      return;
    }
    
    setLoading(true);
    setError("");

    // Simulate Stripe payment processing
    try {
      // Build dynamic day-by-day itinerary based on Selected Destinations
      const itinerary = selectedDestinations.map((dest, index) => ({
        day: index + 1,
        title: `Explore ${dest.name}`,
        description: dest.desc || `Explore ${dest.name} and enjoy local Sri Lankan culture and sightseeing. Private driver assigned for transfers.`,
        location: dest.name
      }));

      // Append default arrival and departure days
      itinerary.unshift({
        day: 0,
        title: "Arrival at Colombo BIA",
        description: `Airport pickup and private transport to your hotel by ${vehicleInfo.name}.`,
        location: "Colombo BIA"
      });
      itinerary.push({
        day: selectedDestinations.length + 1,
        title: "Departure flight from CMB",
        description: "Private transfer back to Bandaranaike International Airport for your departure flight.",
        location: "Colombo BIA"
      });

      const payload = {
        customerDetails: { 
          fullName: passengerName, 
          email: passengerEmail, 
          phone: passengerPhone, 
          nationality: originCountry,
          dob: passengerDOB,
          gender: passengerGender,
          passportNumber: passengerPassportNum,
          passportExpiry: passengerPassportExpiry
        },
        travelDates: { arrivalDate, arrivalTime, departureDate, departureTime, nights },
        preferences: { originCity, originCountry, destination: selectedDestinations.map(d => d.name).join(", "), hotelName: selectedHotels.map(h => h.name).join(", "), numGuests },
        flightDetails: {
          carrier: selectedFlight?.carrier || "Qatar Airways",
          flightNumber: selectedFlight?.number || "QR-664",
          class: selectedFlight?.class || "Economy",
          ticketPrice: flightRate,
          passengers: numGuests,
          flightTotal,
          bookingReference: "CMB-" + Math.random().toString(36).substring(3, 9).toUpperCase(),
          status: "pending_issuance"
        },
        hotelDetails: {
          hotelName: selectedHotels.map(h => h.name).join(", ") || "Pending Selection",
          roomType: `Eco Villa & Resort Stays (${selectedHotels.length} Stays)`,
          roomRate: hotelRateSum,
          nights,
          hotelTotal
        },
        transportDetails: {
          vehicleType: vehicleInfo.name,
          ratePerKm: vehicleInfo.rate,
          driverDailyFee: 20,
          totalDistanceKm: routeDistance,
          driverCost,
          distanceCost,
          transportTotal,
          driverName: "Sampath Gunawardena",
          driverPhone: "+94779876543",
          whatsappLink: `https://wa.me/94779876543?text=Hello%20Sampath,%20this%20is%20my%20booking%20itinerary%20for%20Sri%20Lanka.`,
          assigned: true
        },
        billing: { flightCost: flightTotal, hotelCost: hotelTotal, transportCost: transportTotal, platformFee, totalPrice: totalBill, currency: "USD" },
        payment: {
          paymentMethod: "Stripe Card",
          stripePaymentIntentId: "pi_" + Math.random().toString(36).substring(2, 17),
          paymentStatus: "paid",
          amountPaid: totalBill,
          paidAt: new Date().toISOString()
        },
        itinerary,
        hotel: selectedHotels.map(h => h.name).join(", ") || "Pending Selection",
        totalPrice: totalBill,
        roomRate: hotelRateSum,
        guests: numGuests,
        name: passengerName,
        email: passengerEmail,
        phone: passengerPhone,
        checkin: arrivalDate,
        checkout: departureDate
      };

      // 1. Save Booking directly to Firebase Realtime Database
      const key = await saveBooking(payload);
      setBookingId(key);

      // 2. Trigger n8n Webhook Post-Payment Automation
      const n8nWebhookUrl = "https://ceylonnature.app.n8n.cloud/webhook-test/travelplanner-payment-success";
      try {
        await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: key, ...payload })
        });
      } catch (e) {
        console.warn("n8n webhook notification offline, booking saved locally:", e);
      }

      setSuccess(true);
    } catch (err) {
      setError("Payment processing failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.successWrapper}>
        <div style={styles.successCard}>
          <div style={{ fontSize: "5rem", marginBottom: 20 }}>🛫</div>
          <h1 style={styles.headingPlayfair}>Trip Successfully Booked!</h1>
          <p style={styles.textMuted}>Your international ticket is being generated, and driver details have been assigned.</p>
          
          <div style={styles.receiptBox}>
            <div style={styles.receiptRow}>
              <span>Booking Reference:</span>
              <strong>{bookingId || "SL-928E10"}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Flights:</span>
              <strong>{selectedFlight?.carrier} ({selectedFlight?.number})</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Driver Contact (WhatsApp):</span>
              <a href="https://wa.me/94779876543" target="_blank" rel="noreferrer" style={{ color: "#17c4b8", textDecoration: "none", fontWeight: 700 }}>
                💬 Chat with Sampath
              </a>
            </div>
            <div style={styles.receiptRow}>
              <span>Total Paid:</span>
              <strong style={{ color: "#17c4b8" }}>${totalBill.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ background: "#e6f9f1", color: "#1a7a4a", borderRadius: 10, padding: 12, marginBottom: 24, fontSize: "0.85rem", fontWeight: 600 }}>
            ✅ Confirmation PDF Voucher package will arrive in your email shortly.
          </div>

          <button onClick={() => setPage("home")} style={styles.btnPrimary}>
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Dynamic Styling Injection */}
      <style>{`
        .wizard-step-active { background: linear-gradient(135deg, #17c4b8, #0a7fa5) !important; color: #fff !important; transform: scale(1.1); box-shadow: 0 4px 15px rgba(23,196,184,0.4); }
        .selection-card:hover { transform: translateY(-4px); border-color: #17c4b8 !important; box-shadow: 0 8px 24px rgba(23,196,184,0.15); }
        .selection-card-active { border-color: #17c4b8 !important; background: rgba(23,196,184,0.08) !important; box-shadow: 0 8px 24px rgba(23,196,184,0.2) !important; }
        .destination-card { transition: all 0.25s ease; cursor: pointer; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; position: relative; }
        .destination-card:hover { transform: translateY(-3px); border-color: #17c4b8 !important; box-shadow: 0 8px 20px rgba(23,196,184,0.15); }
        .destination-card-active { border-color: #17c4b8 !important; background: rgba(23,196,184,0.08) !important; box-shadow: 0 8px 20px rgba(23,196,184,0.25) !important; }
        .hotel-card { transition: all 0.25s ease; cursor: pointer; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
        .hotel-card:hover { transform: translateY(-3px); border-color: #17c4b8 !important; box-shadow: 0 8px 20px rgba(23,196,184,0.15); }
        .hotel-card-active { border-color: #17c4b8 !important; background: rgba(23,196,184,0.08) !important; box-shadow: 0 8px 20px rgba(23,196,184,0.25) !important; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 992px) {
          .wizard-grid-container {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 768px) {
          .wizard-hero-section {
            padding: 24px 16px !important;
          }
          .wizard-steps-indicator {
            padding: 12px 16px !important;
            overflow-x: auto !important;
            justify-content: flex-start !important;
            -webkit-overflow-scrolling: touch;
          }
          .wizard-form-panel {
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }
          .wizard-form-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="wizard-hero-section" style={styles.heroSection}>
        <span style={styles.badge}>ALL-IN-ONE SYSTEM</span>
        <h1 style={styles.mainTitle}>Foreign Travel Planner Wizard</h1>
        <p style={styles.subtitle}>Specify your origin, travel vibe, transport preferences, and instantly checkout the whole vacation bundle.</p>
      </div>

      {/* Steps Progress Indicator */}
      <div className="wizard-steps-indicator horizontal-scroll-pills" style={styles.stepsIndicator}>
        {[
          { num: 1, label: "Passenger & Flight" },
          { num: 2, label: "Travel Vibe" },
          { num: 3, label: "Transport & Flight" },
          { num: 4, label: "Review & Checkout" }
        ].map((s) => (
          <div key={s.num} style={styles.stepIndicatorItem}>
            <div className={step === s.num ? "wizard-step-active" : ""} style={styles.stepNumCircle}>
              {s.num}
            </div>
            <span style={{ ...styles.stepText, color: step === s.num ? "#fff" : "rgba(255,255,255,0.6)" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main Grid: Form Left, Invoice Sticky Right */}
      <div className="wizard-grid-container" style={styles.gridContainer}>
        {/* Step Content Card */}
        <div className="wizard-form-panel" style={styles.formPanel}>
          {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

          {step === 1 && (() => {
            const selectedCountryObj = COUNTRY_DATA.find(c => c.name === originCountry);
            return (
              <div>
                <h2 style={styles.stepHeading}>1. Passenger Details & Flight Ticket Booking</h2>
                <p style={styles.stepSub}>Provide passenger and passport information along with flight dates to reserve your ticket.</p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 28 }}>
                  {/* Column 1: Passenger Personal Info */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h3 style={styles.sectionSublabel}>Passenger Personal Info</h3>
                    
                    <Input label="Full Name" type="text" value={passengerName} onChange={e => setPassengerName(e.target.value)} placeholder="John Doe" />
                    
                    <div style={styles.formRow}>
                      <Input label="Email Address" type="email" value={passengerEmail} onChange={e => setPassengerEmail(e.target.value)} placeholder="john@example.com" />
                      <div>
                        <label style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: "#6b8999",
                          display: "block",
                          marginBottom: 6,
                        }}>
                          Phone Number
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{
                            padding: "12px 10px",
                            border: "1.5px solid #e2ecf0",
                            borderRadius: 10,
                            fontSize: "0.85rem",
                            color: "#0a7fa5",
                            background: "#e6f4f9",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "75px",
                            height: "46px",
                          }}>
                            {selectedCountryObj?.flag} {selectedCountryObj?.dial}
                          </div>
                          <div style={{ flex: 1 }}>
                            <input
                              type="tel"
                              value={passengerPhone}
                              onChange={e => setPassengerPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="771234567"
                              style={{
                                width: "100%",
                                padding: "12px 14px",
                                border: "1.5px solid #e2ecf0",
                                borderRadius: 10,
                                fontSize: "0.9rem",
                                color: "#1e3a4a",
                                background: "#fafcfd",
                                outline: "none",
                                fontFamily: "'Outfit', sans-serif",
                                height: "46px",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <Input label="Date of Birth" type="date" value={passengerDOB} onChange={e => setPassengerDOB(e.target.value)} />
                      <div>
                        <label style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: "#6b8999",
                          display: "block",
                          marginBottom: 6,
                          transition: "color 0.18s",
                        }}>
                          Gender
                        </label>
                        <select
                          value={passengerGender}
                          onChange={e => setPassengerGender(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            border: "1.5px solid #e2ecf0",
                            borderRadius: 10,
                            fontSize: "0.9rem",
                            color: "#1e3a4a",
                            background: "#fafcfd",
                            outline: "none",
                            fontFamily: "'Outfit', sans-serif",
                            cursor: "pointer",
                            height: "47px",
                          }}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Passport & Travel Details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h3 style={styles.sectionSublabel}>Passport & Flight Info</h3>
                    
                    <div style={styles.formRow}>
                      <Input label="Passport Number" type="text" value={passengerPassportNum} onChange={e => setPassengerPassportNum(e.target.value)} placeholder="A1234567" />
                      <Input label="Passport Expiry Date" type="date" value={passengerPassportExpiry} onChange={e => setPassengerPassportExpiry(e.target.value)} />
                    </div>

                    <div style={styles.formRow}>
                      <div>
                        <label style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: "#6b8999",
                          display: "block",
                          marginBottom: 6,
                          transition: "color 0.18s",
                        }}>
                          Country of Residence
                        </label>
                        <select
                          value={originCountry}
                          onChange={e => setOriginCountry(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            border: "1.5px solid #e2ecf0",
                            borderRadius: 10,
                            fontSize: "0.9rem",
                            color: "#1e3a4a",
                            background: "#fafcfd",
                            outline: "none",
                            fontFamily: "'Outfit', sans-serif",
                            cursor: "pointer",
                            height: "47px",
                          }}
                        >
                          <option value="" disabled>Select Country</option>
                          {COUNTRY_DATA.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {fetchingCities ? (
                        <div>
                          <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b8999", display: "block", marginBottom: 6 }}>
                            Departure Airport/City
                          </label>
                          <div style={{ display: "flex", alignItems: "center", height: "46px", color: "#6b8999", fontSize: "0.85rem" }}>
                            🔄 Loading airports...
                          </div>
                        </div>
                      ) : cityOptions.length > 0 ? (
                        <div>
                          <label style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            color: "#6b8999",
                            display: "block",
                            marginBottom: 6,
                          }}>
                            Departure Airport/City
                          </label>
                          <select
                            value={originCity}
                            onChange={e => setOriginCity(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 14px",
                              border: "1.5px solid #e2ecf0",
                              borderRadius: 10,
                              fontSize: "0.9rem",
                              color: "#1e3a4a",
                              background: "#fafcfd",
                              outline: "none",
                              fontFamily: "'Outfit', sans-serif",
                              cursor: "pointer",
                              height: "47px",
                            }}
                          >
                            <option value="" disabled>Select Airport/City</option>
                            {cityOptions.map(opt => (
                              <option key={opt.label} value={opt.city}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <Input 
                          label="Departure Airport/City" 
                          type="text" 
                          value={originCity} 
                          onChange={e => setOriginCity(e.target.value)} 
                          placeholder="New York" 
                        />
                      )}
                    </div>

                    <div style={styles.formRow}>
                      <Input label="Arrival Date (Colombo BIA)" type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} />
                      <Input label="Arrival Time" type="time" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} />
                    </div>

                    <div style={styles.formRow}>
                      <Input label="Departure Date (from CMB)" type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
                      <Input label="Departure Time" type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)} />
                    </div>

                    <div style={{ maxWidth: "50%" }}>
                      <Input label="Number of Passengers" type="number" min="1" max="10" value={numGuests} onChange={e => setNumGuests(Math.max(1, parseInt(e.target.value) || 1))} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {step === 2 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                <div>
                  <h2 style={styles.stepHeading}>2. Plan Your Custom Itinerary & Stays</h2>
                  <p style={styles.stepSub}>Select multiple destinations you wish to explore and choose your preferred stays near each site.</p>
                </div>
                {/* Live Counter Badges */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(23,196,184,0.15)", color: "#17c4b8", border: "1px solid rgba(23,196,184,0.3)", borderRadius: 20, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 700 }}>
                    📍 {selectedDestinations.length} Destination{selectedDestinations.length === 1 ? "" : "s"} Chosen
                  </span>
                  <span style={{ background: "rgba(10,127,165,0.15)", color: "#0a7fa5", border: "1px solid rgba(10,127,165,0.3)", borderRadius: 20, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 700 }}>
                    🏨 {selectedHotels.length} Hotel{selectedHotels.length === 1 ? "" : "s"} Selected (${hotelRateSum}/night)
                  </span>
                </div>
              </div>

              {/* Step 2.1: Destination Multi-Select */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h4 style={{ ...styles.sectionSublabel, margin: 0 }}>Step 2.1: Where do you want to explore? (Multi-Select)</h4>
                <span style={{ fontSize: "0.75rem", color: "#6b8999", fontWeight: 600 }}>Click cards to select/deselect</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 36 }}>
                {allDestinations.map(d => {
                  const isSelected = selectedDestinations.some(item => item.name.toLowerCase() === d.name.toLowerCase());
                  return (
                    <div
                      key={d.name}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDestinations(prev => prev.filter(item => item.name.toLowerCase() !== d.name.toLowerCase()));
                        } else {
                          setSelectedDestinations(prev => [...prev, d]);
                        }
                      }}
                      className={`destination-card ${isSelected ? "destination-card-active" : ""}`}
                      style={{ height: "180px" }}
                    >
                      <div style={{ height: "110px", position: "relative" }}>
                        <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=400&q=80"} />
                        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(10,32,48,0.85)", borderRadius: 6, padding: "2px 6px", fontSize: "0.75rem", fontWeight: 700, color: "#17c4b8" }}>
                          {d.rating} ★
                        </div>
                      </div>
                      <div style={{ padding: 10 }}>
                        <strong style={{ color: "#fff", fontSize: "0.9rem", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.name}</strong>
                        <span style={{ color: "#6b8999", fontSize: "0.72rem" }}>📍 {d.district}</span>
                      </div>
                      {isSelected && (
                        <div style={{ position: "absolute", top: 8, left: 8, background: "linear-gradient(135deg, #17c4b8, #0a7fa5)", color: "#fff", borderRadius: "20px", padding: "3px 8px", fontSize: "0.72rem", fontWeight: 800, boxShadow: "0 2px 8px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 4 }}>
                          ✓ Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step 2.2: Hotel Multi-Select */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <div>
                  <h4 style={{ ...styles.sectionSublabel, margin: 0 }}>Step 2.2: Select Your Stays Nearby (Multi-Select Stays)</h4>
                  <p style={{ color: "#6b8999", fontSize: "0.78rem", margin: "2px 0 0" }}>Choose one or multiple hotels across your chosen Sri Lanka destinations.</p>
                </div>

                {/* Filter Pills by Destination */}
                {selectedDestinations.length > 1 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setHotelFilterDest("all")}
                      style={{
                        padding: "5px 12px", borderRadius: 16, border: `1px solid ${hotelFilterDest === "all" ? "#17c4b8" : "rgba(255,255,255,0.1)"}`,
                        background: hotelFilterDest === "all" ? "#17c4b8" : "rgba(255,255,255,0.03)",
                        color: hotelFilterDest === "all" ? "#fff" : "#6b8999",
                        fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      All Locations ({recommendedHotels.length})
                    </button>
                    {selectedDestinations.map(d => (
                      <button
                        key={d.name}
                        onClick={() => setHotelFilterDest(d.name)}
                        style={{
                          padding: "5px 12px", borderRadius: 16, border: `1px solid ${hotelFilterDest === d.name ? "#17c4b8" : "rgba(255,255,255,0.1)"}`,
                          background: hotelFilterDest === d.name ? "#17c4b8" : "rgba(255,255,255,0.03)",
                          color: hotelFilterDest === d.name ? "#fff" : "#6b8999",
                          fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        📍 {d.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedDestinations.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16 }}>
                  <span style={{ fontSize: "2rem" }}>🏨</span>
                  <p style={{ color: "#6b8999", marginTop: 12, fontSize: "0.9rem" }}>Select one or more destinations above to fetch nearest hotels in real-time.</p>
                </div>
              ) : fetchingHotels ? (
                <div style={styles.loadingSpinnerContainer}>
                  <div style={styles.spinner}></div>
                  <p style={{ color: "#6b8999", marginTop: 12 }}>Finding matching hotel recommendations near selected locations...</p>
                </div>
              ) : recommendedHotels.length > 0 ? (
                (() => {
                  const filteredHotels = hotelFilterDest === "all" 
                    ? recommendedHotels 
                    : recommendedHotels.filter(h => h.destination?.toLowerCase() === hotelFilterDest.toLowerCase());

                  return (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                      {filteredHotels.map(h => {
                        const isSelected = selectedHotels.some(sh => sh.name === h.name);
                        return (
                          <div
                            key={h.name}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedHotels(prev => prev.filter(sh => sh.name !== h.name));
                              } else {
                                setSelectedHotels(prev => [...prev, h]);
                              }
                            }}
                            className={`hotel-card ${isSelected ? "hotel-card-active" : ""}`}
                          >
                            <div style={{ height: 130, position: "relative" }}>
                              <img src={h.image} alt={h.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(23,196,184,0.9)", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: "0.7rem", fontWeight: 700 }}>
                                {h.rating.toFixed(1)} ★
                              </div>
                              <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(10,32,48,0.85)", borderRadius: 6, padding: "4px 8px", fontSize: "0.78rem", fontWeight: 700, color: "#17c4b8" }}>
                                {h.distance.toFixed(1)} km away
                              </div>
                              {h.destination && (
                                <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(10,32,48,0.85)", borderRadius: 6, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8" }}>
                                  📍 {h.destination}
                                </div>
                              )}
                              {isSelected && (
                                <div style={{ position: "absolute", top: 8, left: 8, background: "linear-gradient(135deg, #17c4b8, #0a7fa5)", color: "#fff", borderRadius: 20, padding: "3px 8px", fontSize: "0.72rem", fontWeight: 800, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                                  ✓ Stay Selected
                                </div>
                              )}
                            </div>
                            <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
                              <div>
                                <strong style={{ color: "#fff", fontSize: "0.95rem", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{h.name}</strong>
                                <span style={{ color: "#6b8999", fontSize: "0.75rem" }}>Eco-Certified Luxury Accommodation</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                                <span style={{ fontSize: "0.78rem", color: "#6b8999" }}>Price / Night</span>
                                <strong style={{ color: "#17c4b8", fontSize: "1.1rem" }}>${h.price}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div style={{ padding: "40px 20px", textAlign: "center", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16 }}>
                  <p style={{ color: "#6b8999" }}>No hotels found near the selected areas. Try selecting different locations.</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={styles.stepHeading}>3. Select Transport Option & Live Flight Ticket</h2>
              <p style={styles.stepSub}>Private transport covers your airport pickup and all transfers across selected sites.</p>

              <h4 style={styles.sectionSublabel}>Select Private Vehicle & Driver</h4>
              <div style={styles.cardGrid}>
                {VEHICLE_TYPES.map(v => (
                  <div key={v.id} onClick={() => setSelectedVehicle(v.id)}
                       className={`selection-card ${selectedVehicle === v.id ? "selection-card-active" : ""}`}
                       style={styles.selectionCard}>
                    <div style={{ fontSize: "2rem" }}>{v.icon}</div>
                    <strong style={{ color: "#fff", fontSize: "1rem" }}>{v.name}</strong>
                    <span style={{ color: "#17c4b8", fontSize: "0.85rem", fontWeight: 700 }}>${v.rate}/KM + Driver Included</span>
                    <span style={{ color: "#6b8999", fontSize: "0.8rem" }}>Capacity: {v.capacity}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ ...styles.sectionSublabel, marginTop: 32 }}>Select Available Flights from {originCity}</h4>
              {fetchingFlights ? (
                <div style={styles.loadingSpinnerContainer}>
                  <div style={styles.spinner}></div>
                  <p style={{ color: "#6b8999", marginTop: 12 }}>Contacting Amadeus Flights API...</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {flights.map(fl => (
                    <div key={fl.id} onClick={() => setSelectedFlight(fl)}
                         style={{
                           ...styles.flightItem,
                           borderColor: selectedFlight?.id === fl.id ? "#17c4b8" : "rgba(255,255,255,0.08)",
                           background: selectedFlight?.id === fl.id ? "rgba(23,196,184,0.08)" : "rgba(255,255,255,0.02)"
                         }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: "1.5rem" }}>✈️</span>
                        <div>
                          <strong style={{ color: "#fff" }}>{fl.carrier} ({fl.number})</strong>
                          <div style={{ fontSize: "0.78rem", color: "#6b8999" }}>
                            {fl.class} Class · {fl.stops === 0 ? "Direct" : `${fl.stops} Stop`} · {fl.duration}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ color: "#17c4b8", fontSize: "1.2rem" }}>${fl.price}</strong>
                        <div style={{ fontSize: "0.75rem", color: "#6b8999" }}>Per Pax</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={styles.stepHeading}>4. Secure Payment via Stripe Gateway</h2>
              <p style={styles.stepSub}>Your checkout session is securely processed. Complete your billing details below.</p>

              <form onSubmit={handlePaymentSubmit} style={{ marginTop: 20 }}>
                <div style={styles.formRow}>
                  <Input label="Name on Credit Card" type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Jane Doe" required />
                </div>
                <div style={styles.formRow}>
                  <Input label="Card Number" type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" required />
                </div>
                <div style={styles.formRow}>
                  <Input label="Expiration Date (MM/YY)" type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="12/28" required />
                  <Input label="Secure Code (CVC)" type="text" value={cardCvc} onChange={e => setCardCvc(e.target.value)} placeholder="123" required />
                </div>

                <div style={styles.stripeMockBadge}>
                  <span>🔒 SSL Encrypted & Secure Stripe Checkout</span>
                </div>

                <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, width: "100%", marginTop: 24 }}>
                  {loading ? "Processing Secure Stripe Payment..." : `Pay $${totalBill.toFixed(2)} & Book Vacation Package`}
                </button>
              </form>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div style={styles.navButtonsContainer}>
              {step > 1 && (
                <button onClick={handleBack} style={styles.btnSecondary}>
                  Back
                </button>
              )}
              <button onClick={handleNext} style={{ ...styles.btnPrimary, marginLeft: "auto" }}>
                Next Step
              </button>
            </div>
          )}
        </div>

        {/* Invoice Summary Card */}
        <div style={styles.invoicePanel}>
          <h3 style={styles.invoiceTitle}>Live Vacation Breakdown</h3>
          <p style={styles.invoiceSub}>Updated in real-time as you customize your trip.</p>

          <div style={styles.invoiceBreakdownList}>
            <div style={styles.invoiceItem}>
              <div>
                <strong style={styles.invoiceItemLabel}>✈️ Flight Ticket ({numGuests} Pax)</strong>
                <div style={styles.invoiceDetailText}>
                  {selectedFlight ? `${selectedFlight.carrier} - ${selectedFlight.class}` : "Simulated Flight Ticket"}
                </div>
              </div>
              <span style={styles.invoiceItemCost}>${flightTotal.toFixed(2)}</span>
            </div>

            <div style={styles.invoiceItem}>
              <div>
                <strong style={styles.invoiceItemLabel}>🏨 Eco Hotel Stays ({selectedHotels.length} Stays · {nights || 0} Nights)</strong>
                <div style={styles.invoiceDetailText}>
                  {selectedHotels.length > 0 
                    ? selectedHotels.map(h => `${h.name} ($${h.price}/nt)`).join(", ")
                    : "Select stays from Step 2"}
                </div>
              </div>
              <span style={styles.invoiceItemCost}>${hotelTotal.toFixed(2)}</span>
            </div>

            <div style={styles.invoiceItem}>
              <div>
                <strong style={styles.invoiceItemLabel}>🚗 Island Transport ({routeDistance} KM)</strong>
                <div style={styles.invoiceDetailText}>
                  {vehicleInfo.name} + Driver & Transits
                </div>
              </div>
              <span style={styles.invoiceItemCost}>${transportTotal.toFixed(2)}</span>
            </div>

            <div style={styles.invoiceItem}>
              <div>
                <strong style={styles.invoiceItemLabel}>⚙️ Platform & Admin Fee</strong>
                <div style={styles.invoiceDetailText}>
                  Single consolidated itinerary coordination
                </div>
              </div>
              <span style={styles.invoiceItemCost}>${platformFee.toFixed(2)}</span>
            </div>
          </div>

          <div style={styles.invoiceTotalContainer}>
            <span>Grand Total:</span>
            <span style={styles.totalPriceText}>${totalBill.toFixed(2)}</span>
          </div>

          <div style={styles.invoiceBannerHighlight}>
            <span style={{ fontSize: "1.2rem" }}>🌴</span>
            <span>Complete booking includes Flights, Hotels, and Driver assigned for the entire duration!</span>
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
    background: "linear-gradient(180deg, #0b1a29 0%, #03080e 100%)",
    color: "#fff",
    fontFamily: "'Outfit', sans-serif",
  },
  heroSection: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    textAlign: "center",
    marginBottom: 40,
  },
  badge: {
    display: "inline-block",
    background: "rgba(23,196,184,0.15)",
    color: "#17c4b8",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "1.5px",
    marginBottom: 12,
  },
  mainTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.8rem",
    color: "#fff",
    marginBottom: 12,
    background: "linear-gradient(135deg, #fff 40%, #17c4b8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#a4b3c6",
    fontSize: "1.05rem",
    maxWidth: 680,
    margin: "0 auto",
    lineHeight: 1.5,
  },
  stepsIndicator: {
    maxWidth: 800,
    margin: "0 auto 48px auto",
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
    padding: "0 24px",
  },
  stepIndicatorItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 2,
    flex: 1,
  },
  stepNumCircle: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#1e2b3a",
    border: "2px solid rgba(255,255,255,0.08)",
    color: "#a4b3c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.95rem",
    marginBottom: 8,
    transition: "all 0.3s",
  },
  stepText: {
    fontSize: "0.75rem",
    fontWeight: 500,
    textAlign: "center",
  },
  gridContainer: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: 32,
    alignItems: "start",
  },
  formPanel: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 24,
    padding: 36,
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  },
  stepHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.6rem",
    color: "#fff",
    marginBottom: 8,
  },
  stepSub: {
    color: "#6b8999",
    fontSize: "0.9rem",
    marginBottom: 28,
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  sectionSublabel: {
    color: "#a4b3c6",
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: 14,
    fontWeight: 700,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  selectionCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 20,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    transition: "all 0.25s ease",
  },
  cardText: {
    color: "#6b8999",
    fontSize: "0.75rem",
    lineHeight: 1.4,
  },
  flightItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderRadius: 16,
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  loadingSpinnerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 0",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(23,196,184,0.1)",
    borderTopColor: "#17c4b8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  stripeMockBadge: {
    background: "rgba(23,196,184,0.1)",
    color: "#17c4b8",
    padding: 12,
    borderRadius: 10,
    textAlign: "center",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginTop: 20,
  },
  navButtonsContainer: {
    display: "flex",
    marginTop: 32,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 24,
  },
  btnPrimary: {
    background: "linear-gradient(135deg,#0a7fa5,#17c4b8)",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.95rem",
    transition: "all 0.2s",
    boxShadow: "0 6px 20px rgba(23,196,184,0.3)",
    fontFamily: "inherit",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "14px 28px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  invoicePanel: {
    background: "rgba(255, 255, 255, 0.02)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    position: "sticky",
    top: 100,
  },
  invoiceTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.4rem",
    color: "#fff",
    marginBottom: 4,
  },
  invoiceSub: {
    color: "#6b8999",
    fontSize: "0.82rem",
    marginBottom: 20,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: 14,
  },
  invoiceBreakdownList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginBottom: 20,
  },
  invoiceItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    fontSize: "0.85rem",
  },
  invoiceItemLabel: {
    color: "#fff",
    display: "block",
  },
  invoiceDetailText: {
    color: "#6b8999",
    fontSize: "0.78rem",
    marginTop: 2,
  },
  invoiceItemCost: {
    fontWeight: 700,
    color: "#a4b3c6",
  },
  invoiceTotalContainer: {
    borderTop: "2px solid rgba(255,255,255,0.08)",
    paddingTop: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 800,
    fontSize: "1.25rem",
    marginBottom: 24,
  },
  totalPriceText: {
    color: "#17c4b8",
  },
  invoiceBannerHighlight: {
    background: "rgba(23,196,184,0.08)",
    border: "1px solid rgba(23,196,184,0.15)",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    gap: 10,
    alignItems: "center",
    fontSize: "0.78rem",
    color: "#17c4b8",
    lineHeight: 1.4,
  },
  successWrapper: {
    paddingTop: 120,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#03080e",
  },
  successCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 24,
    padding: 40,
    maxWidth: 540,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  headingPlayfair: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.2rem",
    color: "#fff",
    marginBottom: 12,
  },
  textMuted: {
    color: "#6b8999",
    fontSize: "0.95rem",
    marginBottom: 24,
  },
  receiptBox: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 20,
    textAlign: "left",
    marginBottom: 24,
  },
  receiptRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: "0.88rem",
  },
  errorAlert: {
    background: "rgba(231,76,60,0.1)",
    border: "1px solid rgba(231,76,60,0.3)",
    borderRadius: 10,
    padding: 12,
    color: "#e74c3c",
    fontSize: "0.85rem",
    marginBottom: 16,
  }
};
