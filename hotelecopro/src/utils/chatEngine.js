// ─────────────────────────────────────────────
//  HotelEco Pro · Chat NLP Intent Engine
// ─────────────────────────────────────────────

import { INTENTS } from "../data/chatKnowledge";

// Conversation context — remembers last topic
let lastIntent = null;
let responseIndex = {};

/** Normalize and tokenize input */
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s']/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

/** Get next response from an intent's responses array (rotates to avoid repetition) */
function pickResponse(intentKey) {
    const responses = INTENTS[intentKey]?.responses;
    if (!responses || responses.length === 0) return null;
    if (!responseIndex[intentKey]) responseIndex[intentKey] = 0;
    const res = responses[responseIndex[intentKey] % responses.length];
    responseIndex[intentKey] = (responseIndex[intentKey] + 1) % responses.length;
    return res;
}

/** Score how well the input matches a list of patterns */
function scoreIntent(tokens, patterns) {
    let score = 0;
    const inputStr = tokens.join(" ");

    for (const pattern of patterns) {
        // Exact phrase match (higher weight)
        if (inputStr.includes(pattern)) {
            score += pattern.split(" ").length * 3;
            continue;
        }
        // Token-level match
        const patternTokens = pattern.split(" ");
        for (const pt of patternTokens) {
            if (tokens.includes(pt)) score += 1;
        }
    }
    return score;
}

/** Map intents to page names for navigation suggestions */
const NAVIGATE_MAP = {
    booking: "booking",
    destinations: "destinations",
    hotels: "hotels",
    map: "map",
    contact: "contact",
    team: "team",
    vision: "vision",
    hotelPortal: "hotelSignin",
};

/** Suggestion chips shown after each response */
const SUGGESTIONS_MAP = {
    greeting: ["🏨 Find Hotels", "🌴 Top Destinations", "📅 How to Book", "❓ Help"],
    hotels: ["🌴 Explore Destinations", "💰 Hotel Prices", "🗺️ Open Map", "📅 Book a Room"],
    destinations: ["🏨 Find Hotels", "📅 Book a Room", "🌿 Eco Hotels", "🗺️ Open Map"],
    booking: ["🏨 Find Hotels", "💰 Check Prices", "📞 Contact Us", "🌴 Destinations"],
    pricing: ["📅 How to Book", "🏨 All Hotels", "🌿 Eco Hotels", "📞 Contact Us"],
    eco: ["🏨 Eco Hotels", "🦁 Yala Safari", "🌿 Destinations", "📅 Book a Room"],
    amenities: ["🏨 Find Hotels", "💰 Prices", "📅 Book a Room", "📞 Contact Us"],
    contact: ["📅 Book a Room", "🏨 Find Hotels", "🌴 Destinations", "❓ Help"],
    map: ["🏨 Find Hotels", "🌴 Destinations", "📅 Book a Room", "📞 Contact Us"],
    kandy: ["🏨 Hotels in Galle", "🌴 More Destinations", "📅 Book a Room", "🗺️ Open Map"],
    galle: ["🏨 Hotels in Kandy", "🌴 More Destinations", "📅 Book a Room", "💰 Prices"],
    ella: ["🏔️ Kandy Info", "🌿 Eco Hotels", "🌴 Destinations", "📅 Book a Room"],
    yala: ["🐘 Wildlife Hotels", "🌿 Eco Hotels", "📅 Book a Room", "🗺️ Open Map"],
    weather: ["🌴 Top Destinations", "📅 Best Time to Book", "🏨 Find Hotels", "🌿 Eco Info"],
    visa: ["📞 Contact Us", "🌴 Destinations", "📅 Book a Room", "❓ Help"],
    team: ["🔮 Our Vision", "📞 Contact Us", "🏨 Find Hotels", "🌴 Destinations"],
    vision: ["👥 Meet the Team", "📞 Contact Us", "🏨 Find Hotels", "🌴 Destinations"],
    hotelPortal: ["📞 Contact Us", "🏨 Find Hotels", "🌴 Destinations", "❓ Help"],
    help: ["🏨 Find Hotels", "🌴 Destinations", "📅 How to Book", "💰 Prices"],
    about: ["🔮 Features", "👥 Team", "🌴 Destinations", "📅 Book a Room"],
    farewell: ["🏨 Find Hotels", "🌴 Destinations", "📅 Book a Room", "📞 Contact Us"],
    thanks: ["🏨 Find Hotels", "🌴 Destinations", "📅 How to Book", "❓ More Help"],
    features: ["🏨 Hotels", "🌴 Destinations", "📅 Book a Room", "🗺️ Open Map"],
};

const DEFAULT_SUGGESTIONS = ["🏨 Find Hotels", "🌴 Destinations", "📅 Book a Room", "❓ Help"];

/**
 * Main intent resolution function.
 * @param {string} input - Raw user message
 * @returns {{ text: string, suggestions: string[], navigate?: string }}
 */
export function resolveIntent(input) {
    if (!input || !input.trim()) {
        return {
            text: "Please type a message! I'm here to help with hotels, destinations, bookings and more. 😊",
            suggestions: DEFAULT_SUGGESTIONS,
        };
    }

    const tokens = tokenize(input);
    const inputStr = tokens.join(" ");

    let bestIntent = null;
    let bestScore = 0;

    // Score every intent except 'default'
    for (const [key, value] of Object.entries(INTENTS)) {
        if (key === "default") continue;
        if (!value.patterns) continue;
        const score = scoreIntent(tokens, value.patterns);
        if (score > bestScore) {
            bestScore = score;
            bestIntent = key;
        }
    }

    // Context-aware follow-ups (if score is low but there's a last intent)
    if (bestScore === 0 && lastIntent) {
        // e.g. "yes" or "more" after hotels
        const followUps = ["yes", "more", "tell me more", "more info", "details", "ok", "sure"];
        if (followUps.some((f) => inputStr.includes(f))) {
            bestIntent = lastIntent;
            bestScore = 1;
        }
    }

    const intentKey = bestScore > 0 ? bestIntent : "default";
    lastIntent = intentKey !== "default" ? intentKey : lastIntent;

    const text = pickResponse(intentKey) || pickResponse("default");
    const suggestions = SUGGESTIONS_MAP[intentKey] || DEFAULT_SUGGESTIONS;
    const navigate = NAVIGATE_MAP[intentKey] || null;

    return { text, suggestions, navigate };
}

/** Reset conversation context (called on chat open) */
export function resetContext() {
    lastIntent = null;
    responseIndex = {};
}
