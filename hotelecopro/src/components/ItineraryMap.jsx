import { useEffect, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../constants";
import "mapbox-gl/dist/mapbox-gl.css";

export default function ItineraryMap({ itinerary }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    // Extract all activities with coordinates from the itinerary
    const points = useMemo(() => {
        const pts = [];
        if (itinerary && Array.isArray(itinerary)) {
            itinerary.forEach((dayData) => {
                const dayNum = dayData.day;
                if (dayData.activities && Array.isArray(dayData.activities)) {
                    dayData.activities.forEach((act, idx) => {
                        if (act.coordinates && typeof act.coordinates.lat === 'number' && typeof act.coordinates.lng === 'number') {
                            pts.push({
                                ...act,
                                day: dayNum,
                                seq: idx + 1,
                                id: `day-${dayNum}-act-${idx}`
                            });
                        }
                    });
                }
            });
        }
        return pts;
    }, [itinerary]);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [80.7718, 7.8731], // Center of Sri Lanka
            zoom: 7
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");
        mapRef.current = map;

        return () => {
            map.remove();
        };
    }, []);

    // Update markers and route when itinerary points change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const drawRouteAndMarkers = () => {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            // Remove route layer and source if they exist
            if (map.getLayer("route-line")) map.removeLayer("route-line");
            if (map.getSource("route-source")) map.removeSource("route-source");

            if (points.length === 0) return;

            // Calculate bounds to fit all points
            const bounds = new mapboxgl.LngLatBounds();

            points.forEach((p) => {
                const coords = [p.coordinates.lng, p.coordinates.lat];
                bounds.extend(coords);

                // Create custom HTML element for marker
                const el = document.createElement("div");
                el.className = "custom-mapbox-marker";
                el.style.display = "flex";
                el.style.flexDirection = "column";
                el.style.alignItems = "center";
                el.style.cursor = "pointer";

                // Bubble element
                const bubble = document.createElement("div");
                bubble.className = "flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white transition-all hover:scale-110";
                bubble.style.width = "28px";
                bubble.style.height = "28px";
                bubble.style.borderRadius = "50%";
                bubble.style.background = p.day % 2 === 0 ? "linear-gradient(135deg,#17c4b8,#0a7fa5)" : "linear-gradient(135deg,#0a1825,#17c4b8)";
                bubble.style.display = "flex";
                bubble.style.alignItems = "center";
                bubble.style.justifyContent = "center";
                bubble.innerText = `D${p.day}`;
                el.appendChild(bubble);

                // Pin tail element
                const tail = document.createElement("div");
                tail.style.width = "0";
                tail.style.height = "0";
                tail.style.borderLeft = "5px solid transparent";
                tail.style.borderRight = "5px solid transparent";
                tail.style.borderTop = "6px solid #17c4b8";
                tail.style.marginTop = "-1px";
                el.appendChild(tail);

                // Create Popup
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                    <div style="font-family: 'Outfit', sans-serif; padding: 4px; max-width: 180px;">
                        <div style="font-size: 10px; font-weight: bold; color: #17c4b8; text-transform: uppercase; margin-bottom: 2px;">
                            Day ${p.day} · ${p.time}
                        </div>
                        <div style="font-size: 13px; font-weight: bold; color: #0f2030; margin-bottom: 2px;">
                            ${p.place}
                        </div>
                        <div style="font-size: 11px; color: #6b8999; line-height: 1.3;">
                            ${p.description}
                        </div>
                    </div>
                `);

                // Create Marker
                const marker = new mapboxgl.Marker(el)
                    .setLngLat(coords)
                    .setPopup(popup)
                    .addTo(map);

                markersRef.current.push(marker);
            });

            // Fit Bounds
            map.fitBounds(bounds, {
                padding: 50,
                maxZoom: 14,
                duration: 1000
            });

            // Draw Route Line
            if (points.length > 1) {
                map.addSource("route-source", {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: points.map(p => [p.coordinates.lng, p.coordinates.lat])
                        }
                    }
                });

                map.addLayer({
                    id: "route-line",
                    type: "line",
                    source: "route-source",
                    layout: {
                        "line-join": "round",
                        "line-cap": "round"
                    },
                    paint: {
                        "line-color": "#0a7fa5",
                        "line-width": 4,
                        "line-opacity": 0.8,
                        "line-dasharray": [1, 2]
                    }
                });
            }
        };

        if (map.isStyleLoaded()) {
            drawRouteAndMarkers();
        } else {
            map.once("style.load", drawRouteAndMarkers);
        }
    }, [itinerary, points]);

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <div ref={mapContainerRef} style={{ width: "100%", height: "100%", borderRadius: 16 }} />
        </div>
    );
}
