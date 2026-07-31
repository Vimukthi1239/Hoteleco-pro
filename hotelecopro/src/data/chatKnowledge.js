// ─────────────────────────────────────────────
//  HotelEco Pro · AI Agent Knowledge Base
// ─────────────────────────────────────────────

export const INTENTS = {
    greeting: {
        patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "greetings", "what's up", "sup"],
        responses: [
            "Hello! 👋 Welcome to HotelEco Pro! I'm your AI travel assistant. I can help you find hotels, explore destinations, make bookings, and answer any questions about Sri Lanka. What can I do for you today?",
            "Hi there! 😊 I'm EcoBot, your HotelEco Pro assistant. Ready to help you discover amazing Sri Lanka hotels and destinations! How can I assist?",
            "Welcome to HotelEco Pro! 🌴 I'm here to help you plan the perfect Sri Lanka getaway. Ask me about hotels, destinations, bookings, or anything else!",
        ],
    },

    farewell: {
        patterns: ["bye", "goodbye", "see you", "see ya", "later", "farewell", "take care", "thanks bye", "thank you bye"],
        responses: [
            "Goodbye! 🌟 Thank you for choosing HotelEco Pro. Have a wonderful trip to Sri Lanka! Safe travels! ✈️",
            "Take care! 😊 We hope to see you again soon at HotelEco Pro. Enjoy beautiful Sri Lanka! 🌴",
            "Farewell! It was a pleasure assisting you. Wishing you a fantastic Sri Lanka adventure! 🌊",
        ],
    },

    thanks: {
        patterns: ["thank", "thanks", "thank you", "thx", "cheers", "appreciate", "helpful", "great help"],
        responses: [
            "You're very welcome! 😊 Is there anything else I can help you with?",
            "Happy to help! 🌟 Feel free to ask me anything else about HotelEco Pro or Sri Lanka.",
            "Anytime! That's what I'm here for. 🤖 Any other questions?",
        ],
    },

    about: {
        patterns: ["what is hotelecopro", "what is this", "about", "tell me about", "who are you", "what do you do", "hotelecopro", "hotel eco pro", "platform"],
        responses: [
            "HotelEco Pro is Sri Lanka's premier AI-powered tourism platform! 🌟 We connect travellers with the best eco-friendly and luxury hotels across the island. Features include:\n\n🤖 AI chatbot support (that's me!)\n📊 Real-time analytics\n🗺️ Smart map integration\n🔮 ML demand forecasting\n📱 Auto social media marketing\n⭐ Multilingual reviews\n\nAll in one intelligent platform for both guests and hotel managers!",
        ],
    },

    features: {
        patterns: ["feature", "what can you do", "capabilities", "services", "offer", "what does it have", "options"],
        responses: [
            "HotelEco Pro offers a full suite of features:\n\n🔍 **Smart Hotel Search** — Filter by location, type, price & dates\n🗺️ **Interactive Map** — Find hotels & attractions near you\n📅 **Easy Booking** — Seamless room reservation system\n🌍 **12 Destinations** — Colombo, Kandy, Galle, Ella & more\n✈️ **Trip Planning** — Curated itineraries for every traveller\n🤖 **AI Assistant** — 24/7 support (hi, that's me!)\n🏨 **Hotel Portal** — Tools for hotel managers\n\nWhat would you like to explore?",
        ],
    },

    hotels: {
        patterns: ["hotel", "hotels", "accommodation", "stay", "lodge", "resort", "villa", "property", "place to stay", "where to sleep"],
        responses: [
            "We have 8 handpicked hotels across Sri Lanka! 🏨 Here are some highlights:\n\n🌿 **The Theva Residency** — Kandy | Boutique Hotel | $120/night\n🏛️ **Galle Fort Hotel** — Galle | Heritage Hotel | $180/night\n🦁 **Amanwella** — Hambantota | 5-Star Resort | $450/night\n🐘 **Elephant Corridor** — Matale | Wildlife Resort | $380/night\n🌾 **Vil Uyana** — Matale | Eco Resort | $320/night\n\nWould you like to search hotels by location, type, or price? Or use our **Hotels** page to explore all listings!",
            "Here are some of our top-rated properties! ⭐\n\n• **Galle Fort Hotel** (4.9 ★) — A colonial gem in the historic fort\n• **Amanwella** (4.9 ★) — Ultra-luxury Aman resort, Hambantota\n• **Ulagalla Walawwa** (4.8 ★) — Ancient manor, 58 acres, Anuradhapura\n• **Vil Uyana** (4.8 ★) — Award-winning eco resort near Sigiriya\n\nUse the search bar on the **Home** page to filter by district and type!",
        ],
    },

    destinations: {
        patterns: ["destination", "destinations", "visit", "place", "places", "location", "where to go", "travel", "explore", "sightseeing", "attractions", "spots"],
        responses: [
            "Sri Lanka has 12 incredible destinations on HotelEco Pro! 🌴\n\n🏙️ **Colombo** — Vibrant capital (best: Dec–Mar)\n⛩️ **Kandy** — Cultural heart, Temple of Tooth (best: Dec–Apr)\n🪨 **Sigiriya** — UNESCO rock fortress (best: Feb–Apr)\n🏔️ **Ella** — Misty mountains, Nine Arch Bridge (best: Dec–Mar)\n🏰 **Galle** — Dutch colonial fort city (best: Feb)\n🦁 **Yala** — Wildlife national park, leopards! (best: Jun–Oct)\n🐳 **Mirissa** — Whale watching beach (best: Dec–Mar)\n\nWould you like details on any specific destination?",
            "Looking for the perfect Sri Lanka spot? 🌟 Here are my top picks:\n\n🌊 **For beaches** → Mirissa, Hikkaduwa, Bentota, Trincomalee\n🏛️ **For culture** → Kandy, Galle, Jaffna, Anuradhapura\n🌿 **For nature** → Ella, Nuwara Eliya, Sigiriya, Yala\n🏙️ **For city life** → Colombo\n\nVisit our **Destinations** page to see all 12 locations with photos!",
        ],
    },

    booking: {
        patterns: ["book", "booking", "reserve", "reservation", "how to book", "make a booking", "check in", "check out", "checkin", "checkout", "availability"],
        responses: [
            "Booking with HotelEco Pro is simple! 📅\n\n1️⃣ Go to the **Home** page\n2️⃣ Use the search bar — choose destination, hotel type, check-in & check-out dates, and number of guests\n3️⃣ Click 🔍 **Search** to see matching hotels\n4️⃣ Click any hotel to view its full profile\n5️⃣ Click **Book Now** on the hotel profile\n\nYou can also visit the **Booking** page directly from the navigation menu. Need help choosing the right hotel? Just ask me!",
            "Ready to book? 🎉 Here's how:\n\n✅ Select your **destination** (e.g., Kandy, Galle)\n✅ Choose **hotel type** (boutique, heritage, eco, 5-star)\n✅ Pick your **dates** and **number of guests**\n✅ Hit **Search** and browse results\n✅ View hotel profile → **Book Now**\n\nOr head straight to the **Booking** tab in the menu!",
        ],
    },

    pricing: {
        patterns: ["price", "pricing", "cost", "how much", "rate", "rates", "cheap", "expensive", "budget", "affordable", "luxury", "per night"],
        responses: [
            "Our hotels offer a range of prices to suit every budget! 💰\n\n💚 **Budget-friendly:** Club Villa — from $150/night\n💛 **Mid-range:** The Theva Residency, Kandy — $120/night\n🟠 **Premium:** Galle Fort Hotel — $180/night | Saman Villas — $200/night\n🔴 **Ultra-luxury:** Amanwella, Aman Resort — $450/night\n\nAll prices are per night. Rates may vary by season. Check the **Hotels** page for real-time availability and offers!",
        ],
    },

    eco: {
        patterns: ["eco", "green", "sustainable", "environment", "nature", "wildlife", "carbon", "sustainability", "environment-friendly", "eco-friendly"],
        responses: [
            "🌿 Sustainability is at the heart of HotelEco Pro! All our partner hotels are screened for eco standards:\n\n♻️ **Eco-certified properties** like Vil Uyana Eco Resort\n🌊 **Marine conservation** — turtle-friendly beach hotels\n🐘 **Wildlife corridors** — The Elephant Corridor protects natural habitats\n🌾 **Farm-to-table** restaurants using local produce\n☀️ **Solar & renewable** energy initiatives\n\nWe're proud to promote responsible tourism across Sri Lanka! 🌱",
        ],
    },

    amenities: {
        patterns: ["amenity", "amenities", "facilities", "pool", "spa", "gym", "wifi", "restaurant", "parking", "breakfast", "bar"],
        responses: [
            "Our hotels come with premium amenities! 🏊‍♂️ Here's what you can expect:\n\n🏊 **Swimming pools** — Most properties\n🍽️ **On-site restaurants** — All hotels\n📶 **High-speed WiFi** — All hotels\n🧘 **Spa & wellness** — Amanwella, Saman Villas\n🏋️ **Gym** — Amanwella, Ulagalla Walawwa\n🐘 **Safari / Wildlife** — Elephant Corridor, Yala\n🦅 **Birdwatching** — Vil Uyana Eco Resort\n🏄 **Water sports** — Club Villa, Bentota\n\nEach hotel listing shows its specific amenities. Visit **Hotels** to explore!",
        ],
    },

    map: {
        patterns: ["map", "location", "where", "navigate", "directions", "nearby", "explore map", "gps", "find on map"],
        responses: [
            "Our interactive **Map** page shows all hotels and destinations across Sri Lanka! 🗺️\n\nYou can:\n📍 See hotel pins across the island\n🔍 Click pins to view hotel details\n🌐 Switch between map styles\n📏 Explore distances between destinations\n\nHead to the **Map** tab in the navigation to explore the full interactive map!",
        ],
    },

    contact: {
        patterns: ["contact", "support", "help desk", "email", "phone", "reach", "get in touch", "customer service", "talk to someone", "human", "agent"],
        responses: [
            "Need to get in touch? We're here to help! 📞\n\n🏫 **SLTC Research University**, Ingiriya Road, Meepe, Sri Lanka\n📧 **Email:** hoteleco@sltc.ac.lk\n📱 **Phone:** +94 77 123 4567\n🕒 **Hours:** Mon–Fri, 9:00 AM – 5:00 PM IST\n\nYou can also use the **Contact** page to send us a message directly. Our team typically responds within 24 hours!",
        ],
    },

    hotelPortal: {
        patterns: ["hotel sign in", "hotel login", "hotel portal", "hotel manager", "manage hotel", "register hotel", "list hotel", "hotel account", "hotel owner", "partner"],
        responses: [
            "Are you a hotel owner? 🏨 Join HotelEco Pro's hotel partner program!\n\nBenefits include:\n📊 Access to the analytics dashboard\n📱 Automated social media marketing\n🔮 Demand forecasting ML models\n⭐ Review management system\n🤖 AI-powered customer support\n\nClick **Hotel Sign In** in the navigation to log in to your hotel portal, or contact us at hoteleco@sltc.ac.lk to register your property!",
        ],
    },

    help: {
        patterns: ["help", "guide", "how to use", "instructions", "tutorial", "getting started", "what can i ask", "what can you answer"],
        responses: [
            "I'm EcoBot, your AI guide for HotelEco Pro! 🤖 Here's what I can help with:\n\n🏨 **Hotels** — Find hotels by location, type, price\n🌴 **Destinations** — Explore Sri Lanka's best spots\n📅 **Booking** — How to make a reservation\n💰 **Pricing** — Compare hotel rates and budgets\n🌿 **Eco Info** — Our sustainability commitment\n🛎️ **Amenities** — What each hotel offers\n🗺️ **Map** — Navigate to the map feature\n📞 **Contact** — Reach our support team\n\nJust type your question and I'll do my best to help!",
        ],
    },

    kandy: {
        patterns: ["kandy", "temple", "tooth relic", "hill station", "cultural"],
        responses: [
            "Kandy is Sri Lanka's cultural capital! ⛩️\n\n🏛️ **Temple of the Tooth Relic** — Sacred Buddhist site\n🌿 **Peradeniya Botanical Gardens** — Stunning tropical garden\n🌊 **Kandy Lake** — Scenic lakeside walks\n🎭 **Kandyan Dance** — Traditional cultural performances\n\n🏨 **Our Kandy Hotel:**\n🌿 **The Theva Residency** — Boutique hotel, $120/night, 4.7★\nPanoramic hills views, pool, fine dining & airport transfers!\n\nBest time to visit: December – April 🌤️",
        ],
    },

    galle: {
        patterns: ["galle", "fort", "dutch", "southern coast", "colonial"],
        responses: [
            "Galle is a stunning Dutch colonial gem! 🏰\n\nHighlights:\n🏛️ **Galle Fort** — UNESCO World Heritage Site\n🌊 **Ocean views** — Dramatic coastal scenery\n🛍️ **Boutique shops & galleries** — Inside the fort walls\n🐢 **Sea turtle hatcheries** — Nearby Hikkaduwa\n\n🏨 **Our Galle Hotels:**\n🏛️ **Galle Fort Hotel** — $180/night, 4.9★ (Heritage gem inside the fort!)\n🌅 **Saman Villas** — $200/night, 4.6★ (Cliffside ocean views)\n🌿 **Club Villa** — $150/night, 4.5★ (Colonial villa, Bentota)\n\nBest time: February ☀️",
        ],
    },

    ella: {
        patterns: ["ella", "nine arch", "tea estate", "mountain", "hiking", "train ride"],
        responses: [
            "Ella is breathtaking! 🏔️\n\n🌿 **Tea plantations** stretching as far as the eye can see\n🌉 **Nine Arch Bridge** — Instagram-worthy colonial viaduct\n🥾 **Little Adam's Peak** — Easy hike with stunning views\n🚂 **Train journey from Kandy** — One of the world's most scenic rail routes!\n\nBest time to visit: December – March ❄️→☀️\n\nWould you like hotel recommendations near Ella? Ask me 'hotels near Ella'!",
        ],
    },

    yala: {
        patterns: ["yala", "leopard", "safari", "wildlife", "national park", "elephant", "jungle"],
        responses: [
            "Yala is a wildlife lover's paradise! 🦁\n\n🐆 **Sri Lankan Leopards** — Highest density wild population in the world\n🐘 **Asian elephants** roaming freely\n🦚 **Rare birds** — Over 200 species\n🐊 **Crocodiles, sloth bears, deer** and more\n\n🏨 **Nearby Wildlife Hotels:**\n🐘 **The Elephant Corridor** — $380/night (private elephant corridor!)\n🌿 **Vil Uyana Eco Resort** — $320/night (wetland wildlife resort)\n\nBest time for safaris: June – October (dry season) 🌞",
        ],
    },

    visa: {
        patterns: ["visa", "entry", "passport", "immigration", "enter sri lanka", "travel documents"],
        responses: [
            "For visiting Sri Lanka, most nationalities need an Electronic Travel Authorization (ETA)! 📋\n\n✅ **Apply online** at eta.gov.lk — takes just a few minutes\n✅ **Cost:** ~$35 USD for most nationalities\n✅ **Duration:** 30-day stay (extendable)\n✅ **Multiple-entry** ETA available\n\n💡 Apply at least 48 hours before departure. For country-specific visa requirements, check with the Sri Lanka High Commission in your country or visit eta.gov.lk.",
        ],
    },

    weather: {
        patterns: ["weather", "climate", "best time", "season", "when to visit", "monsoon", "rain", "temperature"],
        responses: [
            "Sri Lanka's climate varies by region and season! 🌤️\n\n☀️ **West & South Coast** (Dec – Mar) — Perfect beach weather\n⛅ **Hill Country / Ella** (Dec – Mar) — Cool & clear\n🌊 **East Coast** (May – Oct) — Best for Trincomalee, Arugam Bay\n🦁 **Yala / Safari** (Jun – Oct) — Dry season, best wildlife sightings\n\n🌧️ **Monsoons:**\n• South-West monsoon: May–Sep (affects west/south)\n• North-East monsoon: Nov–Feb (affects north/east)\n\nSri Lanka is great to visit year-round — the weather is always good somewhere! 🌴",
        ],
    },

    team: {
        patterns: ["team", "who made", "developers", "founders", "creators", "about team", "staff", "who built"],
        responses: [
            "HotelEco Pro was created by a talented team at SLTC Research University! 👩‍💻👨‍💻\n\nWe're a passionate group of students and researchers combining AI, web development, and hospitality management to build the future of Sri Lanka tourism.\n\nMeet the Fantastic 4 team members and supervisors in the site footer at the bottom of the page! 👥",
        ],
    },

    vision: {
        patterns: ["vision", "mission", "goal", "objective", "future", "roadmap", "plan"],
        responses: [
            "Our vision at HotelEco Pro is bold! 🔮\n\n🌏 **Global reach** — Connecting Sri Lanka to travellers worldwide\n🤖 **AI-first tourism** — Smart recommendations for every traveller\n🌿 **Eco-leadership** — Promoting sustainable, responsible travel\n📊 **Data-driven hotels** — Empowering hotels with real-time intelligence\n🌸 **Cultural preservation** — Showcasing Sri Lanka's rich heritage\n\nRead our full Vision & Mission statement in the footer at the bottom of the page! 🌟",
        ],
    },

    default: {
        responses: [
            "Hmm, I'm not quite sure about that one! 🤔 But I can help with:\n\n🏨 Hotels & Accommodations\n🌴 Destinations in Sri Lanka\n📅 Making a Booking\n💰 Pricing & Budgets\n🌿 Eco & Sustainability\n📞 Contact & Support\n\nTry asking something like **'Show me hotels in Galle'** or **'How do I book a room?'**",
            "I didn't quite catch that! 😊 I'm best at answering questions about:\n• Hotels & resorts in Sri Lanka\n• Travel destinations\n• Bookings and pricing\n• Amenities and features\n\nWhat would you like to know?",
        ],
    },
};

export const QUICK_ACTIONS = [
    { label: "🏨 Find Hotels", message: "Show me the best hotels" },
    { label: "🌴 Top Destinations", message: "What are the top destinations in Sri Lanka?" },
    { label: "📅 How to Book", message: "How do I make a booking?" },
    { label: "💰 Check Pricing", message: "What are the hotel prices?" },
    { label: "🌿 Eco Hotels", message: "Tell me about eco-friendly hotels" },
    { label: "📞 Contact Us", message: "How can I contact support?" },
    { label: "🗺️ Explore Map", message: "How do I use the map?" },
    { label: "🏨 Hotel Portal", message: "I am a hotel owner, how do I sign in?" },
];

export const BOT_NAME = "EcoBot";
export const BOT_AVATAR = "🌿";
