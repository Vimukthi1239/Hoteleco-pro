import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AIChatBot from "./components/AIChatBot";
import HomePage from "./pages/HomePage";
import DestinationsPage from "./pages/DestinationsPage";
import HotelsPage from "./pages/HotelsPage";
import MapPage from "./pages/MapPage";
import BookingPage from "./pages/BookingPage";
import ContactPage from "./pages/ContactPage";
import HotelSigninPage from "./pages/HotelSigninPage";
import AdminDashboard from "./pages/AdminDashboard";
import HotelDashboard from "./pages/HotelDashboard";
import ItineraryPage from "./pages/ItineraryPage";
import TripPlannerWizard from "./pages/TripPlannerWizard";
import CustomerAuthPage from "./pages/CustomerAuthPage";
import { onAuthChange, getHotelProfile, getCustomerProfile } from "./data/firebase";
import "./mobile.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("en");
  const [hotelUser, setHotelUser] = useState(null); // { uid, email, hotelName, district, type, id }
  const [customerUser, setCustomerUser] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);
  const [selectedRoutePoints, setSelectedRoutePoints] = useState([]);

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (user) {
        // Retrieve customer database profile first
        const customer = await getCustomerProfile(user.uid);
        if (customer) {
          setCustomerUser(customer);
          setHotelUser(null);
        } else {
          // Fallback check for hotel admin account
          const hotel = await getHotelProfile(user.email);
          if (hotel) {
            setHotelUser(hotel);
            setCustomerUser(null);
          }
        }
      } else {
        setHotelUser(null);
        setCustomerUser(null);
      }
    });
    return () => unsub();
  }, []);

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage lang={lang} setPage={setPage} />;
      case "destinations": return <DestinationsPage setPage={setPage} setMapTarget={setMapTarget} selectedRoutePoints={selectedRoutePoints} setSelectedRoutePoints={setSelectedRoutePoints} />;
      case "hotels": return <HotelsPage setPage={setPage} setMapTarget={setMapTarget} />;
      case "map": return <MapPage mapTarget={mapTarget} setMapTarget={setMapTarget} selectedRoutePoints={selectedRoutePoints} setSelectedRoutePoints={setSelectedRoutePoints} />;
      case "itinerary": return <ItineraryPage />;
      case "itineraryWizard": 
        if (!customerUser) {
          return <CustomerAuthPage setPage={setPage} setCustomerUser={setCustomerUser} redirectOnSuccess="itineraryWizard" />;
        }
        return <TripPlannerWizard setPage={setPage} customerUser={customerUser} />;
      case "booking": return <BookingPage />;
      case "contact": return <ContactPage />;
      case "hotelSignin": return <HotelSigninPage setPage={setPage} setHotelUser={setHotelUser} />;
      case "customerAuth": return <CustomerAuthPage setPage={setPage} setCustomerUser={setCustomerUser} />;
      case "admin": return <AdminDashboard />;
      case "hotelDashboard": return <HotelDashboard hotelUser={hotelUser} setPage={setPage} setHotelUser={setHotelUser} />;
      default: return <HomePage lang={lang} setPage={setPage} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #17c4b8; border-radius: 10px; }
        img { max-width: 100%; }
        button, input, select, textarea { font-family: 'Outfit', sans-serif; }
      `}</style>
      <Navbar page={page} setPage={setPage} lang={lang} setLang={setLang} hotelUser={hotelUser} customerUser={customerUser} setCustomerUser={setCustomerUser} />
      {renderPage()}
      <Footer setPage={setPage} />
      <AIChatBot setPage={setPage} />
    </div>
  );
}
