import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listenDestinations, listenHotelRegistrations, listenAllHotelProfiles } from "../data/firebase";
import { IMG_AERIAL, MAPBOX_TOKEN } from "../constants";
import Pill from "../components/Pill";
import { DESTINATIONS } from "../data/destinations";

const getHeading = (p1, p2) => {
    if (!p1 || !p2) return 0;
    const lat1 = p1[0] * Math.PI / 180;
    const lat2 = p2[0] * Math.PI / 180;
    const dLng = (p2[1] - p1[1]) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
};

function SimulationUpdater({ center, isSimulating }) {
    const map = useMap();
    useEffect(() => {
        if (isSimulating && center) {
            map.setView(center, map.getZoom() < 14 ? 14 : map.getZoom());
        }
    }, [center, isSimulating, map]);
    return null;
}

const createCarIcon = (heading) => {
    return L.divIcon({
        className: 'custom-car-icon',
        html: `
            <div style="
                transform: rotate(${heading}deg);
                transition: transform 0.1s linear;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #10b981;
                border: 2px solid #fff;
                border-radius: 50%;
                width: 38px;
                height: 38px;
                font-size: 1.3rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
                🚗
            </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
    });
};

// Component to dynamically update map center/zoom when navigating standard locations
function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
}

// Component to adjust map bounds to show the entire route
function RouteBoundsUpdater({ routeCoords }) {
    const map = useMap();
    useEffect(() => {
        if (routeCoords && routeCoords.length > 0) {
            map.fitBounds(routeCoords, { padding: [50, 50] });
        }
    }, [routeCoords, map]);
    return null;
}

// Default coordinates for districts in Sri Lanka
const districtCoordinates = {
    "Colombo": { lat: 6.9271, lng: 79.8612 },
    "Kandy": { lat: 7.2906, lng: 80.6337 },
    "Galle": { lat: 6.0328, lng: 80.2168 },
    "Matara": { lat: 5.9549, lng: 80.5470 },
    "Hambantota": { lat: 6.1248, lng: 81.1185 },
    "Anuradhapura": { lat: 8.3114, lng: 80.4037 },
    "Matale": { lat: 7.4675, lng: 80.6234 },
    "Jaffna": { lat: 9.6615, lng: 80.0255 },
    "Trincomalee": { lat: 8.5811, lng: 81.2330 },
    "Nuwara Eliya": { lat: 6.9497, lng: 80.7829 },
    "Sri Lanka": { lat: 7.8731, lng: 80.7718 }
};

// Formatter functions for routing
const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds, t) => {
    const mins = Math.round(seconds / 60);
    const minLabel = t ? (t("map.mins") || "mins") : "mins";
    const hrLabel = t ? (t("map.hours") || "hr") : "hr";
    if (mins < 60) return `${mins} ${minLabel}`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs} ${hrLabel} ${remainingMins} ${minLabel}`;
};

const getManeuverIcon = (type, modifier) => {
    const key = (type + " " + (modifier || "")).toLowerCase();
    if (key.includes("left")) return "↩️";
    if (key.includes("right")) return "↪️";
    if (key.includes("straight")) return "⬆️";
    if (key.includes("depart") || key.includes("arrive")) return "📍";
    if (key.includes("roundabout")) return "🔄";
    return "🚗";
};

// Custom icons
const createIcon = (item, isSelected) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
            <div style="
                cursor: pointer;
                transition: transform 0.2s;
                transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
                display: flex;
                flex-direction: column;
                align-items: center;
            ">
                <div style="
                    background: ${item.isHotel ? "#0a7fa5" : "#17c4b8"};
                    color: #fff;
                    border: 2px solid #fff;
                    border-radius: 50% 50% 50% 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    transform: rotate(-45deg);
                ">
                    <span style="transform: rotate(45deg);">${item.isHotel ? "🏨" : "📍"}</span>
                </div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -35]
    });
};

const createStartIcon = (label) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
            ">
                <div style="
                    background: #10b981;
                    color: #fff;
                    border: 2px solid #fff;
                    border-radius: 50% 50% 50% 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    transform: rotate(-45deg);
                ">
                    <span style="transform: rotate(45deg); font-weight: bold; font-size: 0.75rem;">A</span>
                </div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -35]
    });
};

const createCurrentLocationIcon = () => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
            <div style="
                position: relative;
                width: 20px;
                height: 20px;
                background: #0284c7;
                border: 3px solid #fff;
                border-radius: 50%;
                box-shadow: 0 0 12px rgba(2,132,199,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: rgba(2,132,199,0.3);
                    animation: pulse-ring 1.5s infinite ease-in-out;
                "></div>
            </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
};

function MapPage({ mapTarget, setMapTarget, selectedRoutePoints, setSelectedRoutePoints }) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState(null);
    const [view, setView] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Data States
    const [liveDestinations, setLiveDestinations] = useState([]);
    const [liveHotels, setLiveHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const [viewState, setViewState] = useState({
        center: [7.8731, 80.7718],
        zoom: 6.5
    });

    // Directions States
    const [directionsActive, setDirectionsActive] = useState(false);
    const [startPoint, setStartPoint] = useState("current");
    const [userCoords, setUserCoords] = useState(null);
    const [targetLoc, setTargetLoc] = useState(null);
    const [routeCoords, setRouteCoords] = useState([]);
    const [routeSteps, setRouteSteps] = useState([]);
    const [routeSummary, setRouteSummary] = useState(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeError, setRouteError] = useState("");

    // Multi-Destination Routing & Simulation States
    const [routeMode, setRouteMode] = useState(selectedRoutePoints && selectedRoutePoints.length > 0 ? "multi" : "single");
    const [isSimulating, setIsSimulating] = useState(false);
    const [simCoordIndex, setSimCoordIndex] = useState(0);
    const [simSpeed, setSimSpeed] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [stepCoordIndices, setStepCoordIndices] = useState([]);
    const [lastSpokenStep, setLastSpokenStep] = useState(-1);
    const [navType, setNavType] = useState("simulate"); // "simulate" or "realtime"
    const [realCoords, setRealCoords] = useState(null);

    useEffect(() => {
        let loadedDest = false;
        let loadedRegs = false;
        let loadedProfs = false;

        let regs = [];
        let profs = {};

        const checkLoading = () => {
            if (loadedDest && loadedRegs && loadedProfs) {
                setLoading(false);
            }
        };

        const unsubDest = listenDestinations((data) => {
            const mappedDestinations = (data || []).map(d => {
                const districtCoords = districtCoordinates[d.district] || districtCoordinates["Sri Lanka"];
                const lat = (d.lat && !isNaN(parseFloat(d.lat))) ? parseFloat(d.lat) : districtCoords.lat;
                const lng = (d.lng && !isNaN(parseFloat(d.lng))) ? parseFloat(d.lng) : districtCoords.lng;
                return {
                    ...d,
                    lat,
                    lng,
                    isHotel: false
                };
            });
            setLiveDestinations(mappedDestinations);
            loadedDest = true;
            checkLoading();
        });

        const unsubProfs = listenAllHotelProfiles((data) => {
            profs = data || {};
            loadedProfs = true;
            updateHotels(regs, profs);
            checkLoading();
        });

        const unsubRegs = listenHotelRegistrations((data) => {
            regs = data || [];
            loadedRegs = true;
            updateHotels(regs, profs);
            checkLoading();
        });

        return () => {
            unsubDest();
            unsubRegs();
            unsubProfs();
        };
    }, []);

    const updateHotels = (regs, profiles) => {
        const approved = regs.filter(r => r.status === "approved" || r.status === "pending");
        const mapped = approved.map(r => {
            const prof = profiles[r.id] || {};
            const lowestPrice = prof.packages?.length > 0
                ? Math.min(...prof.packages.map(p => Number(p.price)))
                : 150;

            const districtCoords = districtCoordinates[r.district] || districtCoordinates["Sri Lanka"];
            const lat = (r.lat && !isNaN(parseFloat(r.lat))) ? parseFloat(r.lat) : districtCoords.lat;
            const lng = (r.lng && !isNaN(parseFloat(r.lng))) ? parseFloat(r.lng) : districtCoords.lng;

            return {
                ...r,
                id: r.id,
                name: r.hotelName || "Unnamed Hotel",
                type: r.type || "Hotel",
                district: r.district || "Sri Lanka",
                price: lowestPrice,
                rating: prof.rating || 4.5,
                img: prof.photoUrl || "https://images.unsplash.com/photo-1542314831-c6a4d14d8379?auto=format&fit=crop&w=800&q=80",
                desc: prof.desc || "A beautiful stay offering comfortable accommodation and exceptional service.",
                lat,
                lng,
                isHotel: true
            };
        });
        setLiveHotels(mapped);
    };

    // Set map target when redirecting from other profiles
    useEffect(() => {
        if (mapTarget) {
            setTargetLoc(mapTarget);
            setDirectionsActive(true);
            setStartPoint("current");
        }
    }, [mapTarget]);

    // Handle Geolocation logic
    useEffect(() => {
        if (directionsActive && startPoint === "current") {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        setUserCoords([lat, lng]);
                    },
                    (error) => {
                        console.error("Error getting geolocation:", error);
                        setUserCoords([6.9271, 79.8612]); // Default Colombo
                        alert("Could not retrieve your location. Defaulting start location to Colombo. You can choose other start points from the sidebar.");
                    },
                    { enableHighAccuracy: true }
                );
            } else {
                setUserCoords([6.9271, 79.8612]);
                alert("Geolocation is not supported by your browser. Defaulting start location to Colombo.");
            }
        }
    }, [directionsActive, startPoint]);

    const allLocations = [...liveDestinations, ...DESTINATIONS, ...liveHotels];
    const baseDisplayData = view === "all" ? [...liveDestinations, ...liveHotels] :
        view === "destinations" ? liveDestinations : liveHotels;
    const displayData = baseDisplayData.filter(item => {
        const matchesSearch = searchQuery.trim() === "" ||
            (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.district && item.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (!item.isHotel && item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.isHotel && item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    // Multi-Destination Management Handlers
    const addRoutePoint = (ptName) => {
        const found = allLocations.find(l => l.name === ptName);
        if (found && !(selectedRoutePoints || []).some(p => p.name === found.name)) {
            setSelectedRoutePoints([...(selectedRoutePoints || []), {
                name: found.name,
                lat: parseFloat(found.lat),
                lng: parseFloat(found.lng),
                isHotel: !!found.isHotel,
                img: found.img,
                district: found.district,
                rating: found.rating
            }]);
        }
    };

    const removeRoutePoint = (index) => {
        const updated = [...(selectedRoutePoints || [])];
        updated.splice(index, 1);
        setSelectedRoutePoints(updated);
    };

    const moveRoutePoint = (index, direction) => {
        const updated = [...(selectedRoutePoints || [])];
        const targetIndex = index + direction;
        if (targetIndex >= 0 && targetIndex < updated.length) {
            const temp = updated[index];
            updated[index] = updated[targetIndex];
            updated[targetIndex] = temp;
            setSelectedRoutePoints(updated);
        }
    };

    // Get coordinates for start point
    let startLat = null;
    let startLng = null;
    let startLabel = t("map.currentLocation") || "My Location";

    if (startPoint === "current") {
        if (userCoords) {
            const [uLat, uLng] = userCoords;
            // Check if user is testing from outside Sri Lanka
            if (uLat < 5.5 || uLat > 10.0 || uLng < 79.5 || uLng > 82.5) {
                startLat = 6.9271;
                startLng = 79.8612;
                startLabel = "Colombo (Mock Location)";
            } else {
                startLat = uLat;
                startLng = uLng;
            }
        }
    } else {
        const found = allLocations.find(l => l.name === startPoint);
        if (found) {
            startLat = found.lat;
            startLng = found.lng;
            startLabel = found.name;
        }
    }

    // Fetch directions from Mapbox / OSRM (Supports Multi-Destination sequentially)
    useEffect(() => {
        if (!directionsActive || !startLat || !startLng) {
            return;
        }
        if (routeMode === "single" && !targetLoc) {
            return;
        }
        if (routeMode === "multi" && (!selectedRoutePoints || selectedRoutePoints.length === 0)) {
            return;
        }

        const fetchRoute = async () => {
            setRouteLoading(true);
            setRouteError("");

            let coordsQuery = "";
            if (routeMode === "multi") {
                const pts = [`${startLng},${startLat}`];
                selectedRoutePoints.forEach(pt => {
                    pts.push(`${pt.lng},${pt.lat}`);
                });
                coordsQuery = pts.join(";");
            } else {
                coordsQuery = `${startLng},${startLat};${targetLoc.lng},${targetLoc.lat}`;
            }

            try {
                let data = null;
                // Try Mapbox first
                if (MAPBOX_TOKEN) {
                    try {
                        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsQuery}?geometries=geojson&steps=true&access_token=${MAPBOX_TOKEN}`;
                        const res = await fetch(url);
                        if (res.ok) {
                            data = await res.json();
                        } else {
                            console.warn("Mapbox directions API failed, trying OSRM fallback");
                        }
                    } catch (e) {
                        console.warn("Mapbox fetch error, falling back to OSRM", e);
                    }
                }

                // Fallback to OSRM
                if (!data) {
                    const url = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson&steps=true`;
                    const res = await fetch(url);
                    if (!res.ok) {
                        throw new Error("Failed to retrieve directions from routing service.");
                    }
                    data = await res.json();
                }

                if (data && data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
                    setRouteCoords(coords);

                    const consolidatedSteps = route.legs.flatMap((leg, legIdx) => 
                        leg.steps.map(s => ({
                            instruction: s.maneuver.instruction,
                            distance: s.distance,
                            duration: s.duration,
                            type: s.maneuver.type,
                            modifier: s.maneuver.modifier,
                            location: s.maneuver.location,
                            legIndex: legIdx
                        }))
                    );
                    setRouteSteps(consolidatedSteps);

                    setRouteSummary({
                        distance: route.distance,
                        duration: route.duration
                    });

                    // Map step maneuvers to closest coordinate index for simulator updates
                    const mappedIndices = consolidatedSteps.map(step => {
                        if (!step.location) return 0;
                        const [stepLng, stepLat] = step.location;
                        let minDistance = Infinity;
                        let closestIdx = 0;
                        for (let i = 0; i < coords.length; i++) {
                            const latDiff = coords[i][0] - stepLat;
                            const lngDiff = coords[i][1] - stepLng;
                            const dist = latDiff * latDiff + lngDiff * lngDiff;
                            if (dist < minDistance) {
                                minDistance = dist;
                                closestIdx = i;
                            }
                        }
                        return closestIdx;
                    });
                    setStepCoordIndices(mappedIndices);
                    setSimCoordIndex(0); // Reset simulation index
                } else {
                    throw new Error("No route found between selected points.");
                }
            } catch (err) {
                console.error("Routing error:", err);
                setRouteError(err.message);
            } finally {
                setRouteLoading(false);
            }
        };

        fetchRoute();
    }, [directionsActive, startLat, startLng, targetLoc, routeMode, selectedRoutePoints]);

    // Live Navigation Simulation tick loop
    useEffect(() => {
        if (!isSimulating || navType !== "simulate" || routeCoords.length === 0) return;
        
        const tick = () => {
            setSimCoordIndex(prev => {
                const nextIndex = prev + Math.max(1, Math.round(simSpeed / 2));
                if (nextIndex >= routeCoords.length - 1) {
                    setIsSimulating(false);
                    setLastSpokenStep(-1);
                    alert("Simulation completed! You have arrived at your final destination.");
                    return routeCoords.length - 1;
                }
                return nextIndex;
            });
        };

        const interval = setInterval(tick, 100);
        return () => clearInterval(interval);
    }, [isSimulating, navType, routeCoords, simSpeed]);

    // Live Geolocation Tracking Watcher (Runs only in "realtime" mode)
    useEffect(() => {
        if (!isSimulating || navType !== "realtime" || routeCoords.length === 0) return;

        const options = {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        };

        const success = (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setRealCoords([lat, lng]);

            // Snap user to the closest point along the calculated route coords
            let minDistance = Infinity;
            let closestIndex = 0;
            for (let i = 0; i < routeCoords.length; i++) {
                const latDiff = routeCoords[i][0] - lat;
                const lngDiff = routeCoords[i][1] - lng;
                const dist = latDiff * latDiff + lngDiff * lngDiff;
                if (dist < minDistance) {
                    minDistance = dist;
                    closestIndex = i;
                }
            }
            
            // Check if user has reached the end of the route
            if (closestIndex >= routeCoords.length - 1) {
                setIsSimulating(false);
                setLastSpokenStep(-1);
                alert("You have arrived at your final destination!");
            }
            
            setSimCoordIndex(closestIndex);
        };

        const error = (err) => {
            console.error("Realtime GPS Tracking Error:", err);
        };

        const watchId = navigator.geolocation.watchPosition(success, error, options);
        return () => navigator.geolocation.clearWatch(watchId);
    }, [isSimulating, navType, routeCoords]);

    const activeStepIndex = (() => {
        let active = 0;
        for (let i = 0; i < stepCoordIndices.length; i++) {
            if (simCoordIndex >= stepCoordIndices[i]) {
                active = i;
            }
        }
        return active;
    })();

    const currentStep = routeSteps[activeStepIndex];

    // Live Voice Navigation Speech synthesis
    useEffect(() => {
        if (isSimulating && currentStep && activeStepIndex !== lastSpokenStep && !isMuted) {
            const textToSpeak = currentStep.instruction.replace(/<[^>]*>/g, "");
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                window.speechSynthesis.speak(utterance);
            }
            setLastSpokenStep(activeStepIndex);
        }
    }, [activeStepIndex, isSimulating, isMuted, currentStep, lastSpokenStep]);

    const clearDirections = () => {
        setDirectionsActive(false);
        setIsSimulating(false);
        setSimCoordIndex(0);
        setLastSpokenStep(-1);
        setRouteCoords([]);
        setRouteSteps([]);
        setRouteSummary(null);
        setRouteError("");
        if (setMapTarget) setMapTarget(null);
        setViewState({
            center: [7.8731, 80.7718],
            zoom: 6.5
        });
    };

    const carHeading = (() => {
        if (!routeCoords || routeCoords.length === 0) return 0;
        const nextIndex = Math.min(simCoordIndex + 1, routeCoords.length - 1);
        if (simCoordIndex === nextIndex) {
            const prevIndex = Math.max(0, simCoordIndex - 1);
            return getHeading(routeCoords[prevIndex], routeCoords[simCoordIndex]);
        }
        return getHeading(routeCoords[simCoordIndex], routeCoords[nextIndex]);
    })();

    // Use Mapbox Raster Tiles through Leaflet
    const tileUrl = MAPBOX_TOKEN 
        ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    return (
        <div style={{ paddingTop: 88, minHeight: "100vh", background: "#f0f8fc" }}>
            {/* Styles to fix leaflet default CSS overrides for our custom popup */}
            <style>
                {`
                    .leaflet-popup-content-wrapper { padding: 0; border-radius: 12px; overflow: hidden; }
                    .leaflet-popup-content { margin: 0; width: 220px !important; line-height: 1.2; }
                    .custom-leaflet-icon { background: transparent; border: none; }
                    .leaflet-container { background: #e8f4f8; }
                    @keyframes pulse-ring {
                        0% { transform: scale(0.6); opacity: 1; }
                        100% { transform: scale(1.4); opacity: 0; }
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @media (max-width: 768px) {
                        .map-page-header {
                            padding: 20px 16px 14px !important;
                        }
                        .map-main-grid {
                            grid-template-columns: 1fr !important;
                            height: auto !important;
                            min-height: 600px !important;
                            margin: 0 16px 24px !important;
                            border-radius: 16px !important;
                        }
                        .map-sidebar-container {
                            max-height: 320px !important;
                        }
                        .map-leaflet-wrapper {
                            height: 380px !important;
                        }
                    }
                `}
            </style>
            
            <div className="map-page-header" style={{ padding: "32px 48px 20px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#17c4b8", marginBottom: 8 }}>{t("map.badge") || "Explore Locations"}</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,6vw,2.4rem)", color: "#0f2030", marginBottom: 8 }}>{t("map.title") || "Sri Lanka Map"}</h1>
                <p style={{ fontSize: "0.95rem", color: "#6b8999", marginBottom: 16 }}>{t("map.sub") || "Discover beautiful destinations and eco-friendly hotels."}</p>
                <div className="horizontal-scroll-pills" style={{ display: "flex", gap: 10 }}>
                    <Pill active={view === "all" && !directionsActive} onClick={() => { setView("all"); if(directionsActive) clearDirections(); }}>{t("map.allLocations")}</Pill>
                    <Pill active={view === "destinations" && !directionsActive} onClick={() => { setView("destinations"); if(directionsActive) clearDirections(); }}>{t("map.destinationsOptGroup") || "Destinations"}</Pill>
                    <Pill active={view === "hotels" && !directionsActive} onClick={() => { setView("hotels"); if(directionsActive) clearDirections(); }}>{t("map.hotelsOptGroup") || "Hotels"}</Pill>
                </div>
            </div>

            <div className="map-main-grid" style={{ 
                display: "grid", 
                gridTemplateColumns: isSimulating ? "1fr" : "340px 1fr", 
                gap: 0, 
                height: "calc(100vh - 240px)", 
                margin: "0 48px 48px", 
                borderRadius: 20, 
                overflow: "hidden", 
                border: "1px solid #e2ecf0", 
                boxShadow: "0 8px 40px rgba(10,127,165,0.1)" 
            }}>
                {/* Sidebar */}
                {!isSimulating && (
                    !directionsActive ? (
                        <div className="map-sidebar-container" style={{ background: "#fff", borderRight: "1px solid #e2ecf0", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                            {/* Mode Switcher Tabs */}
                            <div style={{ display: "flex", borderBottom: "1px solid #e2ecf0", background: "#f8fbfd" }}>
                                <button 
                                    onClick={() => { setRouteMode("single"); clearDirections(); }} 
                                    style={{
                                        flex: 1,
                                        padding: "14px",
                                        border: "none",
                                        background: routeMode === "single" ? "#fff" : "transparent",
                                        borderBottom: routeMode === "single" ? "3px solid #0a7fa5" : "3px solid transparent",
                                        color: routeMode === "single" ? "#0a7fa5" : "#6b8999",
                                        fontWeight: routeMode === "single" ? 700 : 400,
                                        fontSize: "0.82rem",
                                        cursor: "pointer",
                                        fontFamily: "inherit"
                                    }}
                                >
                                    Single Destination
                                </button>
                                <button 
                                    onClick={() => { setRouteMode("multi"); clearDirections(); }} 
                                    style={{
                                        flex: 1,
                                        padding: "14px",
                                        border: "none",
                                        background: routeMode === "multi" ? "#fff" : "transparent",
                                        borderBottom: routeMode === "multi" ? "3px solid #7b2ff7" : "3px solid transparent",
                                        color: routeMode === "multi" ? "#7b2ff7" : "#6b8999",
                                        fontWeight: routeMode === "multi" ? 700 : 400,
                                        fontSize: "0.82rem",
                                        cursor: "pointer",
                                        fontFamily: "inherit"
                                    }}
                                >
                                    Multi-Route ({(selectedRoutePoints || []).length})
                                </button>
                            </div>

                            {routeMode === "single" ? (
                                <>
                                    {/* Sidebar Search Bar */}
                                    <div style={{ padding: "14px 18px", borderBottom: "1px solid #e2ecf0", background: "#f8fbfd" }}>
                                        <div style={{
                                            background: "#fff",
                                            borderRadius: 10,
                                            border: "1px solid #d3e4ed",
                                            padding: "2px 10px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                                            transition: "all 0.25s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = "#17c4b8"}
                                        onMouseLeave={e => {
                                            if (document.activeElement !== e.currentTarget.querySelector("input")) {
                                                e.currentTarget.style.borderColor = "#d3e4ed";
                                            }
                                        }}
                                        >
                                            <span style={{ fontSize: "0.95rem", color: "#6b8999", userSelect: "none" }}>🔍</span>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                placeholder={t("map.searchPlaceholder") || "Search locations..."}
                                                style={{
                                                    flex: 1,
                                                    border: "none",
                                                    background: "transparent",
                                                    fontSize: "0.85rem",
                                                    color: "#0f2030",
                                                    outline: "none",
                                                    padding: "8px 0",
                                                    fontFamily: "inherit"
                                                }}
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    style={{
                                                        background: "rgba(10, 32, 48, 0.05)",
                                                        border: "none",
                                                        borderRadius: "50%",
                                                        width: 18,
                                                        height: 18,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: "pointer",
                                                        color: "#6b8999",
                                                        fontSize: "0.6rem",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ padding: "12px 20px", borderBottom: "1px solid #e2ecf0", fontWeight: 700, fontSize: "0.85rem", color: "#6b8999", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
                                        <span>
                                            {view === "all" ? `📍 ${displayData.length} ${t("map.allLocations")}` :
                                                view === "destinations" ? `📍 ${displayData.length} ${t("map.destinationsOptGroup")}` :
                                                    `🏨 ${displayData.length} ${t("map.hotelsOptGroup")}`}
                                        </span>
                                        {loading && <span style={{ fontSize: "0.8rem", color: "#17c4b8" }}>{t("signin.waiting") || "Loading..."}</span>}
                                    </div>
                                    <div style={{ flex: 1, overflowY: "auto" }}>
                                        {displayData.map(item => (
                                        <div key={item.id || item.name}
                                            onClick={() => {
                                                setSelected(item);
                                                setViewState({
                                                    center: [item.lat, item.lng],
                                                    zoom: 12
                                                });
                                            }}
                                            style={{ padding: "14px 20px", borderBottom: "1px solid #f5f8fa", cursor: "pointer", background: selected?.name === item.name ? "#e6f4f9" : "transparent", transition: "background 0.2s", display: "flex", gap: 12, alignItems: "flex-start" }}>
                                            <img src={item.img} alt={item.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} onError={e => e.target.src = IMG_AERIAL} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f2030", marginBottom: 2 }}>{item.name}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#6b8999" }}>{item.district} · {item.rating}★</div>
                                                {!item.isHotel && <div style={{ fontSize: "0.72rem", color: "#17c4b8", marginTop: 2 }}>📍 {t("map.destinationsOptGroup")}</div>}
                                                {item.isHotel && <div style={{ fontSize: "0.72rem", color: "#0a7fa5", marginTop: 2 }}>🏨 ${item.price} {t("profile.night") || "/ night"} · {item.type}</div>}
                                            </div>
                                        </div>
                                        ))}
                                        {!loading && displayData.length === 0 && (
                                            <div style={{ padding: "40px 20px", textAlign: "center", color: "#6b8999", fontSize: "0.9rem" }}>
                                                {t("map.noLocations")}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Multi-Route Planner View */
                                <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                                    <div style={{ padding: "18px", borderBottom: "1px solid #e2ecf0", background: "#fafcfd", display: "flex", flexDirection: "column", gap: 12 }}>
                                        {/* Start Location */}
                                        <div>
                                            <label style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{t("map.startLocation") || "Start Location"}</label>
                                            <select 
                                                value={startPoint} 
                                                onChange={(e) => setStartPoint(e.target.value)} 
                                                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #e2ecf0", fontSize: "0.85rem", color: "#0f2030", outline: "none", background: "#fff", fontFamily: "inherit" }}
                                            >
                                                <option value="current">📍 {t("map.currentLocation") || "My Location"}</option>
                                                <optgroup label="Destinations">
                                                    {liveDestinations.map(d => (
                                                        <option key={d.name} value={d.name}>{d.name}</option>
                                                    ))}
                                                    {DESTINATIONS.map(d => (
                                                        <option key={d.name} value={d.name}>{d.name}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Hotels">
                                                    {liveHotels.map(h => (
                                                        <option key={h.name} value={h.name}>{h.name}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                            {startPoint === "current" && userCoords && (userCoords[0] < 5.5 || userCoords[0] > 10.0 || userCoords[1] < 79.5 || userCoords[1] > 82.5) && (
                                                <div style={{ fontSize: "0.72rem", color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", padding: "6px 10px", borderRadius: 8, marginTop: 6 }}>
                                                    ⚠️ Your location is outside Sri Lanka. Colombo is used as a mock starting point for routing.
                                                </div>
                                            )}
                                        </div>

                                        {/* Add Stop Dropdown */}
                                        <div>
                                            <label style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Add Stop</label>
                                            <select 
                                                value="" 
                                                onChange={(e) => {
                                                    if (e.target.value) addRoutePoint(e.target.value);
                                                    e.target.value = "";
                                                }} 
                                                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #e2ecf0", fontSize: "0.85rem", color: "#6b8999", outline: "none", background: "#fff", fontFamily: "inherit" }}
                                            >
                                                <option value="">-- Choose location --</option>
                                                <optgroup label="Destinations">
                                                    {liveDestinations.map(d => (
                                                        <option key={d.name} value={d.name}>{d.name}</option>
                                                    ))}
                                                    {DESTINATIONS.map(d => (
                                                        <option key={d.name} value={d.name}>{d.name}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Hotels">
                                                    {liveHotels.map(h => (
                                                        <option key={h.name} value={h.name}>{h.name}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Stops list */}
                                    <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                                        <div style={{ fontSize: "0.75rem", color: "#6b8999", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Route Stops ({(selectedRoutePoints || []).length})</div>
                                        {(!selectedRoutePoints || selectedRoutePoints.length === 0) ? (
                                            <div style={{ padding: "30px 10px", textAlign: "center", color: "#6b8999", fontSize: "0.85rem", border: "2px dashed #e2ecf0", borderRadius: 12 }}>
                                                Select stops from destinations page or choose stops above to build your tour route.
                                            </div>
                                        ) : (
                                            selectedRoutePoints.map((pt, index) => (
                                                <div key={index} style={{ background: "#fff", border: "1px solid #e2ecf0", borderRadius: 12, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
                                                    <div style={{ background: "#7b2ff7", color: "#fff", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                                                        {index + 1}
                                                    </div>
                                                    <div style={{ flex: 1, overflow: "hidden" }}>
                                                        <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#0f2030", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{pt.name}</div>
                                                        <div style={{ fontSize: "0.7rem", color: "#6b8999" }}>{pt.district}</div>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 4 }}>
                                                        <button onClick={() => moveRoutePoint(index, -1)} disabled={index === 0} style={{ background: "none", border: "none", cursor: index === 0 ? "not-allowed" : "pointer", fontSize: "0.8rem", padding: "4px", opacity: index === 0 ? 0.3 : 1 }}>🔼</button>
                                                        <button onClick={() => moveRoutePoint(index, 1)} disabled={index === selectedRoutePoints.length - 1} style={{ background: "none", border: "none", cursor: index === selectedRoutePoints.length - 1 ? "not-allowed" : "pointer", fontSize: "0.8rem", padding: "4px", opacity: index === selectedRoutePoints.length - 1 ? 0.3 : 1 }}>🔽</button>
                                                        <button onClick={() => removeRoutePoint(index)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", padding: "4px" }}>❌</button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Generate button */}
                                    {selectedRoutePoints && selectedRoutePoints.length > 0 && (
                                        <div style={{ padding: "14px 18px", borderTop: "1px solid #e2ecf0", background: "#f8fbfd" }}>
                                            <button 
                                                onClick={() => setDirectionsActive(true)}
                                                style={{
                                                    width: "100%",
                                                    background: "linear-gradient(135deg, #7b2ff7 0%, #0a7fa5 100%)",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: 10,
                                                    padding: "12px",
                                                    fontWeight: 700,
                                                    fontSize: "0.9rem",
                                                    cursor: "pointer",
                                                    boxShadow: "0 4px 15px rgba(123,47,247,0.25)"
                                                }}
                                            >
                                                Generate Route 🗺️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Directions Panel */
                        <div style={{ background: "#fff", overflowY: "auto", borderRight: "1px solid #e2ecf0", display: "flex", flexDirection: "column" }}>
                            <div style={{ padding: "20px", borderBottom: "1px solid #e2ecf0", display: "flex", flexDirection: "column", gap: 12 }}>
                                <button onClick={clearDirections} style={{ background: "none", border: "none", color: "#6b8999", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", padding: 0, width: "fit-content" }}>
                                    {t("destinations.back") || "← Back to Locations"}
                                </button>
                                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "#0f2030", margin: 0 }}>{t("map.routeDirections")}</h2>
                            </div>

                            {/* Route Locations Summary */}
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2ecf0", display: "flex", flexDirection: "column", gap: 8, background: "#fafcfd" }}>
                                {routeMode === "single" ? (
                                    <>
                                        <div>
                                            <label style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 4 }}>{t("map.startLocation")}</label>
                                            <select 
                                                value={startPoint} 
                                                onChange={(e) => setStartPoint(e.target.value)} 
                                                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #e2ecf0", fontSize: "0.85rem", color: "#0f2030", outline: "none", background: "#fff", fontFamily: "inherit" }}
                                            >
                                                <option value="current">📍 {t("map.currentLocation")}</option>
                                                <optgroup label="Destinations">
                                                    {liveDestinations.map(d => (
                                                        <option key={d.name} value={d.name}>{d.name}</option>
                                                    ))}
                                                    {DESTINATIONS.map(d => (
                                                        <option key={d.name} value={d.name}>{d.name}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Hotels">
                                                    {liveHotels.map(h => (
                                                        <option key={h.name} value={h.name}>{h.name}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                            {startPoint === "current" && userCoords && (userCoords[0] < 5.5 || userCoords[0] > 10.0 || userCoords[1] < 79.5 || userCoords[1] > 82.5) && (
                                                <div style={{ fontSize: "0.72rem", color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", padding: "6px 10px", borderRadius: 8, marginTop: 4 }}>
                                                    ⚠️ Your location is outside Sri Lanka. Colombo is used as a mock starting point for routing.
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 4 }}>{t("map.endLocation")}</label>
                                            <select 
                                                value={targetLoc ? targetLoc.name : ""} 
                                                onChange={(e) => {
                                                    const found = allLocations.find(l => l.name === e.target.value);
                                                    if (found) setTargetLoc(found);
                                                }} 
                                                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #e2ecf0", fontSize: "0.85rem", color: "#0f2030", outline: "none", background: "#fff", fontFamily: "inherit" }}
                                            >
                                                {allLocations.map(l => (
                                                    <option key={l.name} value={l.name}>{l.name} {l.isHotel ? "🏨" : "📍"}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label style={{ fontSize: "0.72rem", color: "#6b8999", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Tour Route Sequence</label>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <span style={{ color: "#10b981" }}>🟢</span>
                                                <span style={{ fontWeight: 600 }}>{startLabel}</span>
                                            </div>
                                            {selectedRoutePoints.map((pt, idx) => (
                                                <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", paddingLeft: 4, borderLeft: "2px solid #e2ecf0", marginLeft: 7 }}>
                                                    <span style={{ color: "#7b2ff7", fontSize: "0.85rem" }}>↓</span>
                                                    <span style={{ color: "#0f2030" }}>{pt.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {routeLoading && (
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "#6b8999" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: 10, animation: "spin 1s infinite linear" }}>🔄</div>
                                    <p style={{ fontSize: "0.9rem" }}>{t("map.calculatingRoute")}</p>
                                </div>
                            )}

                            {routeError && !routeLoading && (
                                <div style={{ padding: "30px 20px", textAlign: "center", color: "#ef4444", fontSize: "0.9rem" }}>
                                    ⚠️ {t("map.noRouteFound") || "Could not load route"}: {routeError}
                                </div>
                            )}

                            {!routeLoading && !routeError && routeSummary && (
                                <div style={{ flex: 1, overflowY: "auto" }}>
                                    <div style={{ padding: "16px 20px", background: "#e6f4f9", margin: "16px 20px", borderRadius: 12, display: "flex", gap: 16 }}>
                                        <div>
                                            <div style={{ fontSize: "0.68rem", color: "#0a7fa5", fontWeight: 700, letterSpacing: 0.5 }}>{t("map.distanceLabel")}</div>
                                            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f2030" }}>{formatDistance(routeSummary.distance)}</div>
                                        </div>
                                        <div style={{ width: 1, background: "rgba(10,127,165,0.2)" }} />
                                        <div>
                                            <div style={{ fontSize: "0.68rem", color: "#0a7fa5", fontWeight: 700, letterSpacing: 0.5 }}>{t("map.estTimeLabel")}</div>
                                            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f2030" }}>{formatDuration(routeSummary.duration, t)}</div>
                                        </div>
                                    </div>

                                    {/* Simulation Trigger Button */}
                                    <div style={{ padding: "0 20px 16px" }}>
                                        <button 
                                            onClick={() => {
                                                setSimCoordIndex(0);
                                                setIsSimulating(true);
                                            }}
                                            style={{
                                                width: "100%",
                                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 10,
                                                padding: "12px",
                                                fontWeight: 700,
                                                fontSize: "0.9rem",
                                                cursor: "pointer",
                                                boxShadow: "0 4px 15px rgba(16,185,129,0.3)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 8
                                            }}
                                        >
                                            <span>Start Live Navigation 🚀</span>
                                        </button>
                                    </div>

                                    <div style={{ padding: "0 20px 20px" }}>
                                        <h3 style={{ fontSize: "0.82rem", color: "#6b8999", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>{t("map.stepDirections")}</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {routeSteps.map((step, idx) => (
                                                <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0", borderBottom: idx < routeSteps.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                                                    <span style={{ fontSize: "1.2rem", flexShrink: 0, marginTop: 1 }}>{getManeuverIcon(step.type, step.modifier)}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: "0.85rem", color: "#0f2030", lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: step.instruction }} />
                                                        <div style={{ fontSize: "0.75rem", color: "#6b8999", marginTop: 2 }}>{formatDistance(step.distance)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}

                {/* Map Panel */}
                <div style={{ position: "relative", background: "#e8f4f8", overflow: "hidden", zIndex: 0 }}>
                    {isSimulating && currentStep && (
                        <>
                            {/* Top HUD: Turn-by-Turn Guidance */}
                            <div style={{
                                position: "absolute",
                                top: 20,
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 1000,
                                width: "90%",
                                maxWidth: 600,
                                background: "rgba(15, 32, 48, 0.92)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: 20,
                                padding: "16px 24px",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                gap: 18,
                                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.45)"
                            }}>
                                <div style={{
                                    background: "rgba(23, 196, 184, 0.2)",
                                    border: "1.5px solid #17c4b8",
                                    borderRadius: "50%",
                                    width: 52,
                                    height: 52,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.8rem",
                                    flexShrink: 0
                                }}>
                                    {getManeuverIcon(currentStep.type, currentStep.modifier)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div 
                                        style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3 }} 
                                        dangerouslySetInnerHTML={{ __html: currentStep.instruction }}
                                    />
                                    <div style={{ fontSize: "0.82rem", color: "#a4b3c6", marginTop: 4, display: "flex", gap: 12 }}>
                                        <span>Next turn in {formatDistance(currentStep.distance)}</span>
                                        {selectedRoutePoints.length > 0 && (
                                            <span style={{ color: "#17c4b8", fontWeight: 600 }}>
                                                Stop {currentStep.legIndex + 1 || 1} of {selectedRoutePoints.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button 
                                        onClick={() => setIsMuted(!isMuted)} 
                                        style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", padding: 6 }}
                                        title={isMuted ? "Unmute Voice Guidance" : "Mute Voice Guidance"}
                                    >
                                        {isMuted ? "🔇" : "🔊"}
                                    </button>
                                </div>
                            </div>

                            {/* Bottom HUD: Driving HUD stats & Simulation Speeds */}
                            <div style={{
                                position: "absolute",
                                bottom: 20,
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 1000,
                                width: "90%",
                                maxWidth: 650,
                                background: "rgba(255, 255, 255, 0.98)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(10, 32, 48, 0.08)",
                                borderRadius: 20,
                                padding: "18px 24px",
                                boxShadow: "0 12px 40px rgba(10, 32, 48, 0.25)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ fontSize: "1.4rem", color: "#10b981", fontWeight: 800 }}>
                                                {formatDuration(((routeSummary?.duration || 0) * (1 - simCoordIndex / routeCoords.length)), t)}
                                            </span>
                                            <span style={{ fontSize: "0.85rem", color: "#6b8999" }}>remaining</span>
                                        </div>
                                        <div style={{ fontSize: "0.82rem", color: "#6b8999", marginTop: 2 }}>
                                            {formatDistance((routeSummary?.distance || 0) * (1 - simCoordIndex / routeCoords.length))} · Arriving at next stop
                                        </div>
                                    </div>

                                    {/* Navigation Mode Selector */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b8999", textTransform: "uppercase", marginRight: 4 }}>Mode:</span>
                                        <button 
                                            onClick={() => setNavType("simulate")}
                                            style={{
                                                background: navType === "simulate" ? "linear-gradient(135deg, #0a7fa5, #17c4b8)" : "#f1f5f9",
                                                color: navType === "simulate" ? "#fff" : "#4b5563",
                                                border: "none",
                                                borderRadius: 8,
                                                padding: "6px 12px",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                transition: "all 0.15s"
                                            }}
                                        >
                                            🖥️ Simulate
                                        </button>
                                        <button 
                                            onClick={() => setNavType("realtime")}
                                            style={{
                                                background: navType === "realtime" ? "linear-gradient(135deg, #7b2ff7, #0a7fa5)" : "#f1f5f9",
                                                color: navType === "realtime" ? "#fff" : "#4b5563",
                                                border: "none",
                                                borderRadius: 8,
                                                padding: "6px 12px",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                transition: "all 0.15s"
                                            }}
                                        >
                                            📱 Real GPS
                                        </button>
                                    </div>

                                    {/* Speed Multipliers */}
                                    {navType === "simulate" && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b8999", textTransform: "uppercase", marginRight: 4 }}>Sim Speed:</span>
                                            {[1, 5, 10, 25, 50].map(speed => (
                                                <button 
                                                    key={speed}
                                                    onClick={() => setSimSpeed(speed)}
                                                    style={{
                                                        background: simSpeed === speed ? "linear-gradient(135deg, #0a7fa5, #17c4b8)" : "#f1f5f9",
                                                        color: simSpeed === speed ? "#fff" : "#4b5563",
                                                        border: "none",
                                                        borderRadius: 8,
                                                        padding: "6px 12px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                        transition: "all 0.15s"
                                                    }}
                                                >
                                                    {speed}x
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => {
                                            setIsSimulating(false);
                                            setSimCoordIndex(0);
                                        }}
                                        style={{
                                            background: "#ef4444",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 10,
                                            padding: "8px 18px",
                                            fontSize: "0.82rem",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
                                        }}
                                    >
                                        Exit Nav
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ width: "100%", height: 6, background: "#e2ecf0", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                                    <div style={{
                                        height: "100%",
                                        background: "linear-gradient(90deg, #10b981, #17c4b8)",
                                        width: `${(simCoordIndex / routeCoords.length) * 100}%`,
                                        transition: "width 0.1s linear"
                                    }} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="map-leaflet-wrapper" style={{ width: '100%', height: '100%' }}>
                        <MapContainer 
                            center={viewState.center} 
                            zoom={viewState.zoom} 
                            style={{ width: '100%', height: '100%' }}
                            zoomControl={true}
                        >
                        <MapUpdater center={viewState.center} zoom={viewState.zoom} />
                        {directionsActive && routeCoords.length > 0 && <RouteBoundsUpdater routeCoords={routeCoords} />}
                        
                        <TileLayer
                            url={tileUrl}
                            attribution={MAPBOX_TOKEN ? '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>' : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
                        />

                        {/* Render Markers */}
                        {displayData.map((item, i) => (
                            <Marker
                                key={i}
                                position={[item.lat, item.lng]}
                                icon={createIcon(item, selected?.name === item.name)}
                                eventHandlers={{
                                    click: () => {
                                        setSelected(item);
                                        setViewState({
                                            center: [item.lat, item.lng],
                                            zoom: 12
                                        });
                                    },
                                }}
                            >
                                {/* Popup for this marker */}
                                {selected && selected.name === item.name && (
                                    <Popup closeButton={false}>
                                        <div style={{ width: 220 }}>
                                            <img src={selected.img} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: "12px 12px 0 0", display: "block" }} onError={e => e.target.src = IMG_AERIAL} />
                                            <div style={{ padding: 12 }}>
                                                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "#0f2030", fontSize: "1.05rem", marginBottom: 2 }}>{selected.name}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#6b8999", marginBottom: 6 }}>{selected.district} · {selected.rating}★</div>
                                                {selected.isHotel && <div style={{ fontWeight: 700, color: "#0a7fa5", fontSize: "0.85rem" }}>${selected.price} {t("profile.night") || "/ night"}</div>}
                                                {!selected.isHotel && <div style={{ fontWeight: 600, color: "#17c4b8", fontSize: "0.8rem" }}>{selected.best || "Anytime"}</div>}
                                                {routeMode === "multi" ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addRoutePoint(selected.name);
                                                        }}
                                                        style={{
                                                            marginTop: 8,
                                                            background: "linear-gradient(135deg, #7b2ff7, #17c4b8)",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 8,
                                                            padding: "7px 12px",
                                                            fontSize: "0.78rem",
                                                            fontWeight: 700,
                                                            cursor: "pointer",
                                                            width: "100%",
                                                            boxShadow: "0 2px 6px rgba(123,47,247,0.18)"
                                                        }}
                                                    >
                                                        ➕ Add to Route
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTargetLoc(selected);
                                                            setDirectionsActive(true);
                                                            setStartPoint("current");
                                                        }}
                                                        style={{
                                                            marginTop: 8,
                                                            background: "linear-gradient(135deg, #0a7fa5, #17c4b8)",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 8,
                                                            padding: "7px 12px",
                                                            fontSize: "0.78rem",
                                                            fontWeight: 700,
                                                            cursor: "pointer",
                                                            width: "100%",
                                                            boxShadow: "0 2px 6px rgba(10,127,165,0.18)"
                                                        }}
                                                    >
                                                        🚗 {t("map.getDirections")}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Popup>
                                )}
                            </Marker>
                        ))}

                        {/* Directions Layer */}
                        {directionsActive && (
                            <>
                                {/* Start Point Marker */}
                                {startPoint === "current" && userCoords && (
                                    <Marker position={userCoords} icon={createCurrentLocationIcon()}>
                                        <Popup>
                                            <div style={{ padding: 6, fontWeight: 700 }}>{t("map.youAreHere")}</div>
                                        </Popup>
                                    </Marker>
                                )}
                                {startPoint !== "current" && startLat && startLng && (
                                    <Marker position={[startLat, startLng]} icon={createStartIcon(startLabel)}>
                                        <Popup>
                                            <div style={{ padding: 6, fontWeight: 700 }}>{t("map.startLabel", { label: startLabel })}</div>
                                        </Popup>
                                    </Marker>
                                )}

                                {/* Route Polyline */}
                                {routeCoords.length > 0 && (
                                    <Polyline 
                                        positions={routeCoords} 
                                        color="#0a7fa5" 
                                        weight={6} 
                                        opacity={0.8}
                                        lineJoin="round"
                                    />
                                )}
                            </>
                        )}

                        {/* Simulation Car Marker */}
                        {isSimulating && routeCoords[simCoordIndex] && (
                            <>
                                <SimulationUpdater center={routeCoords[simCoordIndex]} isSimulating={isSimulating} />
                                <Marker position={routeCoords[simCoordIndex]} icon={createCarIcon(carHeading)}>
                                    <Popup closeButton={false}>
                                        <div style={{ padding: 6, fontWeight: 700 }}>Driving along Tour Route 🚗</div>
                                    </Popup>
                                </Marker>
                                {navType === "realtime" && realCoords && (
                                    <CircleMarker 
                                        center={realCoords} 
                                        radius={6} 
                                        fillColor="#3b82f6" 
                                        color="#ffffff" 
                                        weight={2} 
                                        fillOpacity={0.8}
                                    >
                                        <Popup>
                                            <div style={{ padding: 4, fontSize: "0.75rem" }}>Raw GPS Position (Unsnapped)</div>
                                        </Popup>
                                    </CircleMarker>
                                )}
                            </>
                        )}
                    </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MapPage;

