import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { listenDestinations, saveAgencyRegistration, getAgencyProfile, saveAgencyPackage, deleteAgencyPackage, listenAgencyPackages, saveContactMessage } from "../data/firebase";
import ItineraryMap from "../components/ItineraryMap";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";


const sriLankaDistricts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
    "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
    "Matale", "Mathara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

export default function ItineraryPage() {
    const { t } = useTranslation();
    const [days, setDays] = useState(3);
    const [budget, setBudget] = useState("Mid-range");
    const [interests, setInterests] = useState([]);
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [districtSearch, setDistrictSearch] = useState("");

    // Tab switcher state
    const [activeTab, setActiveTab] = useState("planner"); // "planner" | "agency"

    // Agency Portal state
    const [agencyUser, setAgencyUser] = useState(null);
    const [agencyMode, setAgencyMode] = useState("login"); // "login" | "register"
    const [agencyForm, setFormState] = useState({ name: "", email: "", password: "", phone: "", website: "" });
    const [agencyError, setAgencyError] = useState("");
    const [agencyLoading, setAgencyLoading] = useState(false);

    // Tour Packages state
    const [allPackages, setAllPackages] = useState([]);

    // New Package creator form state
    const [newPackage, setNewPackage] = useState({
        title: "",
        price: "",
        duration: "3",
        budget: "Mid-range",
        season: "All Year",
        districts: [],
        description: "",
        imgUrl: ""
    });
    const [pkgSearchDistrict, setPkgSearchDistrict] = useState("");
    const [pkgSuccess, setPkgSuccess] = useState("");

    // Inquiry Modal state
    const [inquiringPackage, setInquiringPackage] = useState(null);
    const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", message: "" });
    const [inquirySuccess, setInquirySuccess] = useState(false);
    const [inquiryLoading, setInquiryLoading] = useState(false);

    // Preset Tour Cover Images
    const presetTourImages = [
        { title: "🏄 Beach & Surf", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80" },
        { title: "🐘 Wildlife Safari", url: "https://images.unsplash.com/photo-1581852013749-bf9393f282ef?auto=format&fit=crop&w=500&q=80" },
        { title: "⛰️ Tea Garden", url: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=500&q=80" },
        { title: "🏛️ Culture Tour", url: "https://images.unsplash.com/photo-1588598130782-690a2965a3c1?auto=format&fit=crop&w=500&q=80" },
        { title: "🧗 Hike & Climb", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80" }
    ];

    // Load saved agency user
    useEffect(() => {
        const saved = localStorage.getItem("hotelEcoPro_agencyUser");
        if (saved) {
            try {
                setAgencyUser(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved agency user", e);
            }
        }
    }, []);

    // Listen to Tour Packages
    useEffect(() => {
        const unsub = listenAgencyPackages((data) => {
            setAllPackages(data || []);
        });
        return () => unsub();
    }, []);

    const handleAgencyLogin = async (e) => {
        e.preventDefault();
        setAgencyError("");
        setAgencyLoading(true);
        try {
            const profile = await getAgencyProfile(agencyForm.email);
            if (profile) {
                if (profile.password === agencyForm.password) {
                    setAgencyUser(profile);
                    localStorage.setItem("hotelEcoPro_agencyUser", JSON.stringify(profile));
                } else {
                    setAgencyError("Incorrect password. Please try again.");
                }
            } else {
                setAgencyError("No registered agency found with this email. Please register first.");
            }
        } catch (err) {
            setAgencyError(err.message || "Failed to log in.");
        } finally {
            setAgencyLoading(false);
        }
    };

    const handleAgencyRegister = async (e) => {
        e.preventDefault();
        setAgencyError("");
        if (!agencyForm.name || !agencyForm.email || !agencyForm.phone || !agencyForm.password) {
            setAgencyError("All fields are required.");
            return;
        }
        setAgencyLoading(true);
        try {
            const existing = await getAgencyProfile(agencyForm.email);
            if (existing) {
                setAgencyError("An agency with this email is already registered.");
                setAgencyLoading(false);
                return;
            }
            const profile = {
                name: agencyForm.name,
                email: agencyForm.email,
                password: agencyForm.password,
                phone: agencyForm.phone,
                website: agencyForm.website || ""
            };
            const id = await saveAgencyRegistration(profile);
            const savedProfile = { id, ...profile };
            setAgencyUser(savedProfile);
            localStorage.setItem("hotelEcoPro_agencyUser", JSON.stringify(savedProfile));
        } catch (err) {
            setAgencyError(err.message || "Failed to register.");
        } finally {
            setAgencyLoading(false);
        }
    };

    const handleAgencyLogout = () => {
        setAgencyUser(null);
        localStorage.removeItem("hotelEcoPro_agencyUser");
        setFormState({ name: "", email: "", password: "", phone: "", website: "" });
    };

    const handleCreatePackage = async (e) => {
        e.preventDefault();
        setAgencyError("");
        setPkgSuccess("");
        if (!newPackage.title || !newPackage.price || !newPackage.description) {
            setAgencyError("Please fill in the Package Title, Price, and Description.");
            return;
        }
        if (newPackage.districts.length === 0) {
            setAgencyError("Please select at least one district for the package.");
            return;
        }
        try {
            const pkgData = {
                title: newPackage.title,
                price: newPackage.price,
                duration: Number(newPackage.duration),
                budget: newPackage.budget,
                season: newPackage.season,
                districts: newPackage.districts,
                description: newPackage.description,
                imgUrl: newPackage.imgUrl || "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=500&q=80",
                agencyId: agencyUser.id,
                agencyName: agencyUser.name,
                agencyEmail: agencyUser.email,
                agencyPhone: agencyUser.phone
            };
            await saveAgencyPackage(pkgData);
            setPkgSuccess("Tour package added successfully!");
            setNewPackage({
                title: "",
                price: "",
                duration: "3",
                budget: "Mid-range",
                season: "All Year",
                districts: [],
                description: "",
                imgUrl: ""
            });
        } catch (err) {
            setAgencyError(err.message || "Failed to add package.");
        }
    };

    const handleDeletePackage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tour package?")) return;
        try {
            await deleteAgencyPackage(id);
        } catch (err) {
            alert("Failed to delete package: " + err.message);
        }
    };

    const handlePkgDistrictToggle = (district) => {
        if (newPackage.districts.includes(district)) {
            setNewPackage({ ...newPackage, districts: newPackage.districts.filter(d => d !== district) });
        } else {
            setNewPackage({ ...newPackage, districts: [...newPackage.districts, district] });
        }
    };

    const handleSendInquiry = async (e) => {
        e.preventDefault();
        if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) {
            alert("Please fill in all fields.");
            return;
        }
        setInquiryLoading(true);
        try {
            await saveContactMessage({
                name: inquiryForm.name,
                email: inquiryForm.email,
                subject: `Tour Package Inquiry: ${inquiringPackage.title}`,
                message: `Agency: ${inquiringPackage.agencyName} (${inquiringPackage.agencyEmail})\nCustomer Message: ${inquiryForm.message}`,
                type: "Agency Inquiry"
            });
            setInquirySuccess(true);
            setTimeout(() => {
                setInquirySuccess(false);
                setInquiringPackage(null);
                setInquiryForm({ name: "", email: "", message: "" });
            }, 2000);
        } catch (err) {
            alert("Failed to send inquiry: " + err.message);
        } finally {
            setInquiryLoading(false);
        }
    };

    const recommendedPackages = allPackages.filter(pkg => {
        if (pkg.duration > Number(days)) return false;
        if (pkg.budget !== budget) return false;
        if (selectedDistricts.length > 0) {
            const hasMatch = pkg.districts.some(d => selectedDistricts.includes(d));
            if (!hasMatch) return false;
        }
        return true;
    });

    const displayPackages = recommendedPackages.length > 0
        ? recommendedPackages
        : allPackages.slice(0, 3);

    const handleDistrictToggle = (district) => {
        if (selectedDistricts.includes(district)) {
            setSelectedDistricts(selectedDistricts.filter(d => d !== district));
        } else {
            setSelectedDistricts([...selectedDistricts, district]);
        }
    };

    const handleSelectAllDistricts = () => {
        setSelectedDistricts(sriLankaDistricts);
    };

    const handleClearAllDistricts = () => {
        setSelectedDistricts([]);
    };

    // Webhook configuration
    const defaultWebhook = process.env.REACT_APP_N8N_WEBHOOK_URL || "https://ceylonnature01.app.n8n.cloud/webhook/chatmodel";
    const [webhookUrl, setWebhookUrl] = useState(defaultWebhook);
    const [showConfig, setShowConfig] = useState(false);

    // App state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [itineraryData, setItineraryData] = useState(null);
    const [loadingQuote, setLoadingQuote] = useState("");
    const [destinationsList, setDestinationsList] = useState([]);
    const [downloading, setDownloading] = useState(false);

    // Listen to Firebase destinations data
    useEffect(() => {
        const unsub = listenDestinations((data) => {
            setDestinationsList(data || []);
        });
        return () => unsub();
    }, []);

    // Rotate loading quotes
    useEffect(() => {
        if (!loading) return;
        const quotesTranslated = [
            t("itinerary.quote1") || "🌴 Sifting through Sri Lanka's finest eco-friendly destinations...",
            t("itinerary.quote2") || "📍 Mapping coordinates and planning the shortest route...",
            t("itinerary.quote3") || "🏛️ Embedding cultural heritage sites and ancient ruins...",
            t("itinerary.quote4") || "🌊 Locating golden sandy beaches and relaxation spots...",
            t("itinerary.quote5") || "🧗 Finding adrenaline-filled adventure trails..."
        ];
        setLoadingQuote(quotesTranslated[0]);
        let idx = 1;
        const interval = setInterval(() => {
            setLoadingQuote(quotesTranslated[idx % quotesTranslated.length]);
            idx++;
        }, 3000);
        return () => clearInterval(interval);
    }, [loading, t]);

    const handleInterestChange = (interest) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else {
            setInterests([...interests, interest]);
        }
    };

    const generateItinerary = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setItineraryData(null);

        if (interests.length === 0) {
            setError("Please select at least one Travel Style/Interest.");
            setLoading(false);
            return;
        }

        try {
            const filteredDestinations = selectedDistricts.length > 0
                ? destinationsList.filter(d => selectedDistricts.includes(d.district))
                : destinationsList;

            const payload = {
                days: Number(days),
                budget,
                interests,
                districts: selectedDistricts,
                destinations: filteredDestinations.length > 0 ? filteredDestinations : null
            };

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Failed to generate itinerary. HTTP status: ${response.status}`);
            }

            const data = await response.json();

            // Clean up the JSON if wrapped inside a key, e.g. data.response or direct structure
            const result = data.itineraryData || data.response || data;

            if (result && result.itinerary && Array.isArray(result.itinerary)) {
                setItineraryData(result);
            } else {
                // If it came back as a direct JSON string inside a key
                const innerJson = typeof result === "string" ? JSON.parse(result) : result;
                if (innerJson && innerJson.itinerary) {
                    setItineraryData(innerJson);
                } else {
                    throw new Error("Invalid itinerary JSON structure received from webhook.");
                }
            }
        } catch (err) {
            console.error("Itinerary generation error:", err);
            setError(err.message || "Something went wrong while connecting to the AI generator.");
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        const element = document.getElementById("itinerary-pdf-content");
        if (!element) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff"
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 210; // A4 size width in mm
            const pageHeight = 297; // A4 size height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save(`${(itineraryData?.trip_title || "My_Trip").replace(/\s+/g, "_")}_Itinerary.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Could not generate PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="pt-24 min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

                {/* Header Banner */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-10 h-72 flex items-center">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
                    <div className="relative z-10 px-8 md:px-12 max-w-2xl text-white">
                        <span className="text-xs uppercase tracking-widest text-teal-400 font-bold px-3 py-1 bg-teal-500/10 rounded-full backdrop-blur-md border border-teal-500/20">
                            🤖 {t("itinerary.badge") || "AI Travel Companion"}
                        </span>
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mt-4 mb-2">
                            {t("itinerary.title")}
                        </h1>
                        <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed">
                            {t("itinerary.sub")}
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-4 border-b border-slate-200 mb-8 pb-1">
                    <button
                        onClick={() => setActiveTab("planner")}
                        className={`pb-4 text-sm md:text-base font-bold transition-all relative outline-none flex items-center gap-2 ${activeTab === "planner" ? "text-teal-600 font-extrabold" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        🌴 {t("itinerary.navPlanner")}
                        {activeTab === "planner" && (
                            <span className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("agency")}
                        className={`pb-4 text-sm md:text-base font-bold transition-all relative outline-none flex items-center gap-2 ${activeTab === "agency" ? "text-teal-600 font-extrabold" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        🏢 {t("itinerary.navPortal")}
                        {activeTab === "agency" && (
                            <span className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full" />
                        )}
                    </button>
                </div>

                {activeTab === "planner" ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">

                            {/* Left Column: Input Form */}
                            <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                                    🧭 {t("itinerary.customize")}
                                </h2>

                                <form onSubmit={generateItinerary} className="space-y-6">

                                    {/* Days Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            📅 {t("itinerary.daysLabel")}
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="14"
                                            value={days}
                                            onChange={e => setDays(e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                            required
                                        />
                                        <span className="text-xs text-slate-400 mt-1 block">{t("itinerary.daysHint")}</span>
                                    </div>

                                    {/* Budget Select */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            💰 {t("itinerary.budgetLabel")}
                                        </label>
                                        <select
                                            value={budget}
                                            onChange={e => setBudget(e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                        >
                                            <option value="Budget">{t("itinerary.budgetBudget")}</option>
                                            <option value="Mid-range">{t("itinerary.budgetMid")}</option>
                                            <option value="Luxury">{t("itinerary.budgetLuxury")}</option>
                                        </select>
                                    </div>

                                    {/* District Multi-Select */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                📍 {t("itinerary.districtsLabel")}
                                            </label>
                                            {selectedDistricts.length > 0 && (
                                                <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold border border-teal-100 animate-fade-in">
                                                    {t("itinerary.selectedCount", { count: selectedDistricts.length }) || `${selectedDistricts.length} selected`}
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick actions */}
                                        <div className="flex gap-2 mb-3">
                                            <button
                                                type="button"
                                                onClick={handleSelectAllDistricts}
                                                className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold px-2 py-1 rounded-lg transition-all"
                                            >
                                                {t("itinerary.selectAll")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleClearAllDistricts}
                                                className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold px-2 py-1 rounded-lg transition-all"
                                            >
                                                {t("itinerary.clearAll")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const popular = ["Colombo", "Kandy", "Galle", "Nuwara Eliya"];
                                                    setSelectedDistricts(popular);
                                                }}
                                                className="text-[10px] bg-teal-50 hover:bg-teal-100 border border-teal-200/50 text-teal-700 font-semibold px-2 py-1 rounded-lg transition-all ml-auto"
                                            >
                                                ⭐ {t("itinerary.popular")}
                                            </button>
                                        </div>

                                        {/* Search Box */}
                                        <div className="relative mb-3">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                                                🔍
                                            </span>
                                            <input
                                                type="text"
                                                placeholder={t("itinerary.searchDistricts")}
                                                value={districtSearch}
                                                onChange={e => setDistrictSearch(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all text-slate-800"
                                            />
                                        </div>

                                        {/* District Pills Grid (Scrollable) */}
                                        <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 max-h-48 overflow-y-auto grid grid-cols-2 gap-2 shadow-inner">
                                            {sriLankaDistricts
                                                .filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()))
                                                .map((district) => {
                                                    const isSelected = selectedDistricts.includes(district);
                                                    const count = destinationsList.filter(dest => dest.district === district).length;
                                                    return (
                                                        <button
                                                            key={district}
                                                            type="button"
                                                            onClick={() => handleDistrictToggle(district)}
                                                            className={`flex items-center justify-between p-2 border rounded-lg text-left transition-all text-xs font-medium cursor-pointer ${isSelected
                                                                    ? "border-teal-500 bg-teal-50 text-teal-800 font-bold shadow-sm"
                                                                    : "border-slate-100 bg-white hover:bg-slate-50 text-slate-600"
                                                                }`}
                                                        >
                                                            <span className="truncate">{district}</span>
                                                            {count > 0 && (
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isSelected ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"
                                                                    }`}>
                                                                    {count}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                            {t("itinerary.districtsHint")}
                                        </span>
                                    </div>

                                    {/* Interests Checkboxes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            🏄 {t("itinerary.styleLabel")}
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {["Nature", "Culture", "Adventure", "Relaxation"].map((style) => (
                                                <label
                                                    key={style}
                                                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer select-none transition-all ${interests.includes(style)
                                                            ? "border-teal-500 bg-teal-50/40 text-teal-700 font-semibold shadow-sm"
                                                            : "border-slate-100 hover:bg-slate-50 text-slate-600"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={interests.includes(style)}
                                                        onChange={() => handleInterestChange(style)}
                                                        className="hidden"
                                                    />
                                                    <span className="text-xs tracking-wide">{t(`itinerary.style${style}`)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Config toggle */}
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => setShowConfig(!showConfig)}
                                            className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-all outline-none"
                                        >
                                            ⚙️ {showConfig ? t("itinerary.webhookHide") : t("itinerary.webhookShow")}
                                        </button>
                                        {showConfig && (
                                            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                                <label className="block text-[10px] uppercase font-bold text-slate-500">n8n Webhook URL</label>
                                                <input
                                                    type="text"
                                                    value={webhookUrl}
                                                    onChange={e => setWebhookUrl(e.target.value)}
                                                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono text-slate-600"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Generate Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 px-6 rounded-xl font-bold text-white tracking-wide transition-all shadow-lg hover:shadow-teal-500/20 disabled:cursor-not-allowed"
                                        style={{
                                            background: "linear-gradient(135deg, #0a7fa5, #17c4b8)",
                                        }}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                {t("itinerary.generatingState")}
                                            </span>
                                        ) : (
                                            "✨ " + t("itinerary.generateBtn")
                                        )}
                                    </button>
                                </form>

                                {/* Error Alert */}
                                {error && (
                                    <div className="mt-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                                        <span>⚠️</span>
                                        <div>
                                            <span className="font-bold">Generation Error: </span>
                                            {error}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Loading or Display Itinerary */}
                            <div className="lg:col-span-2 min-h-[500px]">

                                {/* Loading State */}
                                {loading && (
                                    <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-xl p-8 text-center animate-pulse">
                                        <div className="w-24 h-24 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mb-6">
                                            <span className="text-4xl animate-bounce">🐘</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{t("itinerary.loadingTitle") || "Designing Your Journey"}</h3>
                                        <p className="text-sm text-teal-600 font-medium max-w-md animate-fade-in-out">
                                            {loadingQuote}
                                        </p>
                                    </div>
                                )}

                                {/* Welcome State (No itinerary loaded yet) */}
                                {!loading && !itineraryData && (
                                    <div className="h-full min-h-[450px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-xl p-8 text-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-4xl mb-4">
                                            🗺️
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{t("itinerary.titlePlaceholder")}</h3>
                                        <p className="text-sm text-slate-400 max-w-sm">
                                            {t("itinerary.descPlaceholder")}
                                        </p>
                                    </div>
                                )}

                                {/* Display Generated Itinerary */}
                                {!loading && itineraryData && (
                                    <div className="space-y-6">

                                        {/* Action Buttons */}
                                        <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">{itineraryData.trip_title}</h3>
                                                <p className="text-xs text-slate-400">{t("itinerary.daysTotal", { count: itineraryData.total_days })}</p>
                                            </div>
                                            <button
                                                onClick={downloadPDF}
                                                disabled={downloading}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                            >
                                                {downloading ? t("itinerary.downloadingState") : "📥 " + t("itinerary.downloadBtn")}
                                            </button>
                                        </div>

                                        {/* PDF Capture Zone containing Timeline & Map */}
                                        <div id="itinerary-pdf-content" className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">

                                            <div className="border-b pb-6 mb-8">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
                                                            {itineraryData.trip_title}
                                                        </h1>
                                                        <p className="text-sm text-teal-600 font-semibold mt-1">
                                                            {days} {t("itinerary.days")} · {budget} {t("itinerary.budgetLabel")} · {t("itinerary.styleLabel")}: {interests.join(", ")}
                                                            {selectedDistricts.length > 0 && ` · Districts: ${selectedDistricts.join(", ")}`}
                                                        </p>
                                                    </div>
                                                    <div className="hidden md:block text-right">
                                                        <span className="font-serif font-black text-lg text-slate-800 block">Ceylon Nature</span>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{t("itinerary.navPlanner")}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Map Component Container */}
                                            <div className="h-[320px] rounded-2xl overflow-hidden border border-slate-200 mb-10 shadow-inner">
                                                <ItineraryMap itinerary={itineraryData.itinerary} />
                                            </div>

                                            {/* Day-by-Day Timeline */}
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                                    📅 {t("itinerary.planDetails")}
                                                </h2>

                                                <div className="relative border-l-2 border-slate-100 ml-4 space-y-12">
                                                    {itineraryData.itinerary.map((dayData, dayIdx) => (
                                                        <div key={dayIdx} className="relative pl-8">

                                                            {/* Day marker node */}
                                                            <span className="absolute -left-5 top-0 flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold text-white shadow-md"
                                                                style={{ background: "linear-gradient(135deg, #0a7fa5, #17c4b8)" }}>
                                                                {t("itinerary.dayMarker", { day: dayData.day })}
                                                            </span>

                                                            {/* Day header */}
                                                            <div className="mb-6">
                                                                <h3 className="text-md font-bold text-slate-800 uppercase tracking-wider">
                                                                    {t("itinerary.dayMarker", { day: dayData.day })}
                                                                </h3>
                                                                <p className="text-sm text-teal-600 font-semibold">{dayData.theme}</p>
                                                            </div>

                                                            {/* Activities */}
                                                            <div className="space-y-4">
                                                                {dayData.activities.map((act, actIdx) => (
                                                                    <div key={actIdx} className="bg-slate-50/50 hover:bg-slate-50 transition-all rounded-xl p-4 border border-slate-100 flex gap-4 items-start">
                                                                        <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold text-[10px] tracking-wider uppercase flex-shrink-0">
                                                                            {act.time}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold text-slate-800 text-sm">{act.place}</h4>
                                                                            <p className="text-xs text-slate-500 leading-relaxed mt-1">{act.description}</p>
                                                                            {act.coordinates && (
                                                                                <span className="text-[10px] text-teal-600 font-medium mt-2 inline-flex items-center gap-1 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                                                                                    📍 Lat: {act.coordinates.lat.toFixed(4)}, Lng: {act.coordinates.lng.toFixed(4)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* PDF Footer Notice */}
                                            <div className="border-t border-dashed mt-12 pt-6 text-center">
                                                <p className="text-[10px] text-slate-400">
                                                    {t("itinerary.footerNotice") || "This itinerary was generated using AI recommendations and localized Ceylon Nature destination databases. Thank you for choosing eco-friendly travel!"}
                                                </p>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recommended Tour Packages Section */}
                        <div className="mt-16 border-t pt-12 animate-fade-in">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                        🎁 {recommendedPackages.length > 0 ? (t("itinerary.matchedPackagesTitle") || "Matched Local Tour Packages") : (t("itinerary.featuredPackagesTitle") || "Featured Local Tour Packages")}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {recommendedPackages.length > 0
                                            ? (t("itinerary.matchedPackagesDesc") || "Curated tour plans from registered eco agencies matching your travel choices.")
                                            : (t("itinerary.featuredPackagesDesc") || "Discover top-rated experiences and package deals offered by local travel experts.")}
                                    </p>
                                </div>
                                {recommendedPackages.length > 0 && (
                                    <span className="bg-teal-50 border border-teal-100 text-teal-700 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm self-start">
                                        ⭐ {t("itinerary.matchesFound", { count: recommendedPackages.length }) || `${recommendedPackages.length} Matches Found`}
                                    </span>
                                )}
                            </div>

                            {displayPackages.length === 0 ? (
                                <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-2xl">
                                    <span className="text-3xl mb-2 block">🎒</span>
                                    <p className="text-sm text-slate-400">{t("itinerary.noPackages") || "No agency packages listed yet. Visit the Operator Portal to add one!"}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {displayPackages.map((pkg) => (
                                        <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
                                            {/* Cover image & Price */}
                                            <div>
                                                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                                                    <img
                                                        src={pkg.imgUrl}
                                                        alt={pkg.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                    />
                                                    <div className="absolute top-4 right-4 bg-slate-900/90 text-white px-3 py-1 rounded-xl text-xs font-bold tracking-wide shadow-md">
                                                        {pkg.price}
                                                    </div>

                                                    {/* Season badge */}
                                                    <div className="absolute top-4 left-4">
                                                        {pkg.season === "Peak Season" && (
                                                            <span className="bg-amber-400 text-amber-950 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md tracking-wider flex items-center gap-1">
                                                                🌟 Peak Season Offer
                                                            </span>
                                                        )}
                                                        {pkg.season === "Off-Season" && (
                                                            <span className="bg-teal-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md tracking-wider flex items-center gap-1">
                                                                🏷️ Off-Season Special
                                                            </span>
                                                        )}
                                                        {pkg.season === "All Year" && (
                                                            <span className="bg-slate-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md tracking-wider flex items-center gap-1">
                                                                📅 Year-Round
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 flex-grow">
                                                    {/* Agency Name */}
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-teal-600">
                                                        🏢 {pkg.agencyName}
                                                    </span>
                                                    <h3 className="font-bold text-slate-800 text-md mt-1 mb-2 leading-snug">
                                                        {pkg.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                                                        {pkg.description}
                                                    </p>

                                                    {/* Meta Specs */}
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                                            ⏱️ {pkg.duration} Days
                                                        </span>
                                                        <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                                            💰 {pkg.budget}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Districts list & Inquiry Button */}
                                            <div className="p-5 border-t">
                                                <div className="mb-4">
                                                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5">{t("itinerary.coveredDistricts") || "Covered Districts:"}</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {pkg.districts.map(d => (
                                                            <span key={d} className="bg-teal-50 border border-teal-100 text-teal-700 text-[9px] font-medium px-2 py-0.5 rounded-full">
                                                                {d}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setInquiringPackage(pkg);
                                                        setInquiryForm({
                                                            name: "",
                                                            email: "",
                                                            message: `Hi ${pkg.agencyName},\n\nI am interested in your "${pkg.title}" package listed on Ceylon Nature. I will be traveling for ${days} days with a ${budget} preference. Please share more details and availability!`
                                                        });
                                                    }}
                                                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                                >
                                                    ✉️ {t("itinerary.inquireBtn") || "Inquire Tour Package"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // Agency Portal Layout
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 animate-fade-in">
                        {!agencyUser ? (
                            // Logged-out Form
                            <div className="max-w-md mx-auto py-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-400 flex items-center justify-center text-3xl text-white mx-auto shadow-md mb-4">
                                        🏢
                                    </div>
                                    <h2 className="font-serif text-2xl font-bold text-slate-800">
                                        {agencyMode === "login" ? "Agency Sign In" : "Register Agency"}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Manage tour packages and reach eco-travelers on Ceylon Nature.
                                    </p>
                                </div>

                                {/* Sub-tab Toggle */}
                                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                                    <button
                                        type="button"
                                        onClick={() => { setAgencyMode("login"); setAgencyError(""); }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${agencyMode === "login" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            }`}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setAgencyMode("register"); setAgencyError(""); }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${agencyMode === "register" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            }`}
                                    >
                                        Register
                                    </button>
                                </div>

                                <form onSubmit={agencyMode === "login" ? handleAgencyLogin : handleAgencyRegister} className="space-y-4">
                                    {agencyMode === "register" && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agency Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={agencyForm.name}
                                                onChange={e => setFormState({ ...agencyForm, name: e.target.value })}
                                                placeholder="e.g. Ceylon Eco Expeditions"
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={agencyForm.email}
                                            onChange={e => setFormState({ ...agencyForm, email: e.target.value })}
                                            placeholder="agency@email.com"
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={agencyForm.password}
                                            onChange={e => setFormState({ ...agencyForm, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                        />
                                    </div>
                                    {agencyMode === "register" && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Phone</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={agencyForm.phone}
                                                    onChange={e => setFormState({ ...agencyForm, phone: e.target.value })}
                                                    placeholder="+94 77 123 4567"
                                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website URL (Optional)</label>
                                                <input
                                                    type="url"
                                                    value={agencyForm.website}
                                                    onChange={e => setFormState({ ...agencyForm, website: e.target.value })}
                                                    placeholder="https://www.ceylonecotravel.com"
                                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {agencyError && (
                                        <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded-xl font-medium">
                                            ⚠️ {agencyError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={agencyLoading}
                                        style={{ background: "linear-gradient(135deg, #0a7fa5, #17c4b8)" }}
                                        className="w-full py-3.5 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-teal-500/20 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                    >
                                        {agencyLoading ? "Processing..." : agencyMode === "login" ? "Sign In" : "Register Agency"}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            // Logged-in Agency Dashboard
                            <div className="space-y-10">
                                {/* Dashboard Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-teal-600">
                                            OFFICIAL PARTNER DASHBOARD
                                        </span>
                                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 mt-1">
                                            {agencyUser.name}
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Email: {agencyUser.email} · Phone: {agencyUser.phone} {agencyUser.website && ` · Web: ${agencyUser.website}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleAgencyLogout}
                                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
                                    >
                                        Logout Partner
                                    </button>
                                </div>

                                {/* Dashboard Workspace */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

                                    {/* Form Col (1/3) */}
                                    <div className="lg:col-span-1 bg-slate-50 border border-slate-200/50 rounded-3xl p-6 md:p-8">
                                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3">
                                            ➕ Add Tour Package
                                        </h3>

                                        <form onSubmit={handleCreatePackage} className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Package Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newPackage.title}
                                                    onChange={e => setNewPackage({ ...newPackage, title: e.target.value })}
                                                    placeholder="e.g. 5-Day Ella Adventure Tour"
                                                    className="w-full px-4 py-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price Label</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={newPackage.price}
                                                        onChange={e => setNewPackage({ ...newPackage, price: e.target.value })}
                                                        placeholder="e.g. $290"
                                                        className="w-full px-4 py-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Days)</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="30"
                                                        required
                                                        value={newPackage.duration}
                                                        onChange={e => setNewPackage({ ...newPackage, duration: e.target.value })}
                                                        className="w-full px-4 py-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Budget Type</label>
                                                    <select
                                                        value={newPackage.budget}
                                                        onChange={e => setNewPackage({ ...newPackage, budget: e.target.value })}
                                                        className="w-full px-4 py-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                                    >
                                                        <option value="Budget">Budget</option>
                                                        <option value="Mid-range">Mid-range</option>
                                                        <option value="Luxury">Luxury</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Season Type</label>
                                                    <select
                                                        value={newPackage.season}
                                                        onChange={e => setNewPackage({ ...newPackage, season: e.target.value })}
                                                        className="w-full px-4 py-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                                    >
                                                        <option value="All Year">All Year</option>
                                                        <option value="Peak Season">Peak Season</option>
                                                        <option value="Off-Season">Off-Season</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Covered Districts selection */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                                    Covered Districts ({newPackage.districts.length} selected)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Search districts to add..."
                                                    value={pkgSearchDistrict}
                                                    onChange={e => setPkgSearchDistrict(e.target.value)}
                                                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 mb-2"
                                                />
                                                <div className="border border-slate-200 rounded-lg p-2 bg-white max-h-36 overflow-y-auto flex flex-wrap gap-1 shadow-inner">
                                                    {sriLankaDistricts
                                                        .filter(d => d.toLowerCase().includes(pkgSearchDistrict.toLowerCase()))
                                                        .map(dist => {
                                                            const active = newPackage.districts.includes(dist);
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={dist}
                                                                    onClick={() => handlePkgDistrictToggle(dist)}
                                                                    className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all ${active
                                                                            ? "bg-teal-500 border-teal-500 text-white font-bold"
                                                                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                                                        }`}
                                                                >
                                                                    {dist}
                                                                </button>
                                                            )
                                                        })}
                                                </div>
                                            </div>

                                            {/* Preset Cover Image Selector */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cover Image URL</label>
                                                <input
                                                    type="url"
                                                    value={newPackage.imgUrl}
                                                    onChange={e => setNewPackage({ ...newPackage, imgUrl: e.target.value })}
                                                    placeholder="https://unsplash.com/..."
                                                    className="w-full px-4 py-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800 mb-2"
                                                />
                                                <span className="text-[10px] text-slate-400 block mb-1">Or select a theme image:</span>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {presetTourImages.map((theme, idx) => (
                                                        <button
                                                            type="button"
                                                            key={idx}
                                                            onClick={() => setNewPackage({ ...newPackage, imgUrl: theme.url })}
                                                            className={`text-[9px] p-2 border rounded-lg hover:border-teal-400 font-medium truncate text-center ${newPackage.imgUrl === theme.url ? "bg-teal-50 border-teal-500 text-teal-700 font-bold" : "bg-white border-slate-200 text-slate-500"
                                                                }`}
                                                        >
                                                            {theme.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Package Description</label>
                                                <textarea
                                                    required
                                                    rows="3"
                                                    value={newPackage.description}
                                                    onChange={e => setNewPackage({ ...newPackage, description: e.target.value })}
                                                    placeholder="Describe what makes this package special, inclusions, accommodation details..."
                                                    className="w-full px-4 py-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800 leading-relaxed"
                                                />
                                            </div>

                                            {agencyError && (
                                                <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded-xl font-medium">
                                                    ⚠️ {agencyError}
                                                </div>
                                            )}

                                            {pkgSuccess && (
                                                <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-xs rounded-xl font-medium animate-fade-in">
                                                    ✅ {pkgSuccess}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                style={{ background: "linear-gradient(135deg, #0a7fa5, #17c4b8)" }}
                                                className="w-full py-3.5 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-teal-500/20"
                                            >
                                                ✨ Publish Tour Package
                                            </button>
                                        </form>
                                    </div>

                                    {/* Packages List Col (2/3) */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                                            📋 Active Packages ({allPackages.filter(p => p.agencyId === agencyUser.id).length})
                                        </h3>

                                        {allPackages.filter(p => p.agencyId === agencyUser.id).length === 0 ? (
                                            <div className="text-center py-20 bg-slate-50/50 border border-dashed rounded-3xl">
                                                <span className="text-4xl block mb-3">🎒</span>
                                                <h4 className="text-md font-bold text-slate-700">No tour packages listed yet</h4>
                                                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                                                    Add your first customized tour package on the left to start recommending it to planning travellers.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {allPackages
                                                    .filter(p => p.agencyId === agencyUser.id)
                                                    .map(pkg => (
                                                        <div key={pkg.id} className="bg-white border border-slate-100 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow">
                                                            <div>
                                                                <div className="relative h-36 bg-slate-100">
                                                                    <img src={pkg.imgUrl} alt={pkg.title} className="w-full h-full object-cover" />
                                                                    <div className="absolute top-3 right-3 bg-slate-900/90 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm">
                                                                        {pkg.price}
                                                                    </div>
                                                                    <div className="absolute top-3 left-3">
                                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm text-white ${pkg.season === "Peak Season" ? "bg-amber-500" : pkg.season === "Off-Season" ? "bg-teal-500" : "bg-slate-700"
                                                                            }`}>
                                                                            {pkg.season}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="p-4">
                                                                    <h4 className="font-bold text-slate-800 text-sm mb-1 leading-snug">{pkg.title}</h4>
                                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{pkg.description}</p>

                                                                    <div className="flex gap-2 mb-3">
                                                                        <span className="bg-slate-50 text-slate-600 text-[9px] font-semibold px-2 py-0.5 rounded border border-slate-100">
                                                                            ⏱️ {pkg.duration} Days
                                                                        </span>
                                                                        <span className="bg-slate-50 text-slate-600 text-[9px] font-semibold px-2 py-0.5 rounded border border-slate-100">
                                                                            💰 {pkg.budget}
                                                                        </span>
                                                                    </div>

                                                                    <div className="border-t pt-3">
                                                                        <span className="text-[9px] font-bold text-slate-400 block mb-1">Districts:</span>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {pkg.districts.map(d => (
                                                                                <span key={d} className="bg-teal-50 text-teal-700 text-[9px] px-2 py-0.5 rounded-full font-medium">
                                                                                    {d}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 border-t bg-slate-50 flex justify-end">
                                                                <button
                                                                    onClick={() => handleDeletePackage(pkg.id)}
                                                                    className="px-3 py-1.5 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-rose-100"
                                                                >
                                                                    🗑️ Delete Package
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Inquiry Modal */}
            {inquiringPackage && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setInquiringPackage(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold p-1 outline-none"
                        >
                            ✕
                        </button>

                        <span className="text-[10px] uppercase font-bold text-teal-600 block mb-1">
                            {t("itinerary.inquireBtn") ? t("itinerary.inquireBtn").toUpperCase() : "INQUIRE TOUR PACKAGE"}
                        </span>
                        <h3 className="font-serif text-xl md:text-2xl font-bold text-slate-800 mb-2 leading-tight">
                            {inquiringPackage.title}
                        </h3>
                        <p className="text-xs text-slate-400 mb-6 font-semibold">
                            {t("itinerary.inquireTo") || "To:"} <span className="font-bold text-slate-600">{inquiringPackage.agencyName}</span> ({inquiringPackage.agencyEmail})
                        </p>

                        {inquirySuccess ? (
                            <div className="py-8 text-center space-y-3">
                                <span className="text-4xl block">🚀</span>
                                <h4 className="text-md font-bold text-teal-600">{t("itinerary.inquirySuccess") || "Inquiry Sent Successfully!"}</h4>
                                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                                    {t("itinerary.inquirySuccessDesc", { agencyName: inquiringPackage.agencyName }) || `Your inquiry message has been submitted to ${inquiringPackage.agencyName}. The operator will get back to you shortly.`}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendInquiry} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t("itinerary.inquireName") || "Your Name"}</label>
                                    <input
                                        type="text"
                                        required
                                        value={inquiryForm.name}
                                        onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                                        placeholder={t("itinerary.inquireNamePlaceholder") || "Full name"}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t("itinerary.inquireEmail") || "Your Email"}</label>
                                    <input
                                        type="email"
                                        required
                                        value={inquiryForm.email}
                                        onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                                        placeholder={t("itinerary.inquireEmailPlaceholder") || "email@example.com"}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t("itinerary.inquireMessage") || "Inquiry Message"}</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={inquiryForm.message}
                                        onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                                        className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all font-medium text-slate-800 leading-relaxed"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={inquiryLoading}
                                    style={{ background: "linear-gradient(135deg, #0a7fa5, #17c4b8)" }}
                                    className="w-full py-3 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-teal-500/20 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    {inquiryLoading ? (t("itinerary.sending") || "Sending...") : "✉️ " + (t("itinerary.sendInquiry") || "Send Inquiry")}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
