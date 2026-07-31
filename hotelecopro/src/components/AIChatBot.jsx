import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Send, Sparkles, X } from "lucide-react";

const TEAL = "#17c4b8";
const NAVY = "#0a1825";

export default function AIChatBot({ setPage }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [pulse, setPulse] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setPulse(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 200);
            if (messages.length === 0) {
                setMessages([{
                    from: "bot",
                    text: t("chatbot.greeting"),
                    suggestions: ["🏨 Find Hotels", "🌴 Top Destinations", "📅 How to Book", "💰 Prices"],
                }]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const sendMessage = (text) => {
        const userText = (text || input).trim();
        if (!userText) return;
        setInput("");

        const chipMap = {
            "🏨 Find Hotels": "hotels",
            "🌴 Top Destinations": "destinations",
            "🌴 Destinations": "destinations",
            "📅 How to Book": "booking",
            "📅 Book a Room": "booking",
            "📅 Best Time to Book": "booking",
            "🗺️ Open Map": "map",
            "📞 Contact Us": "contact",
            "👥 Meet the Team": "team",
            "🔮 Our Vision": "vision",
        };

        setMessages(prev => [...prev, { from: "user", text: userText }]);
        setTyping(true);

        const n8nWebhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL;

        if (!n8nWebhookUrl) {
            setTimeout(() => {
                setMessages(prev => [...prev, { from: "bot", text: "Webhook URL is not configured. Please set REACT_APP_N8N_WEBHOOK_URL in your .env file." }]);
                setTyping(false);
            }, 500);
            return;
        }

        const sessionId = localStorage.getItem('chatSessionId') || `session-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chatSessionId', sessionId);

        fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: sessionId,
                chatInput: userText,
                page: window.location.pathname
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const botReply = data.response || data.output || data.text || "I received your message but I don't have a configured response format.";
                const suggestions = data.suggestions || null;
                const navPage = chipMap[userText] || data.navigate;

                if (navPage === "team" || navPage === "vision") {
                    document.getElementById("site-footer")?.scrollIntoView({ behavior: "smooth" });
                } else if (navPage) {
                    setPage(navPage);
                }
                setMessages(prev => [...prev, { from: "bot", text: botReply, suggestions }]);
            })
            .catch(error => {
                console.error("n8n Webhook Error:", error);
                setMessages(prev => [...prev, { from: "bot", text: "Sorry, I am having trouble connecting to the server. Please try again later." }]);
            })
            .finally(() => {
                setTyping(false);
            });
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating trigger button */}
            <button
                onClick={() => setOpen(p => !p)}
                style={{
                    position: "fixed", bottom: 28, right: 28, zIndex: 999,
                    width: 60, height: 60, borderRadius: "50%",
                    background: open ? "#0a1825" : "linear-gradient(135deg,#0a7fa5,#17c4b8)",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(10,127,165,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s", transform: open ? "rotate(0deg)" : "scale(1)",
                    color: "#ffffff"
                }}
                title="Open AI Chat"
            >
                {open ? <X size={26} /> : <Bot size={28} />}
                {!open && pulse && (
                    <span style={{
                        position: "absolute", top: 4, right: 4,
                        width: 12, height: 12, borderRadius: "50%",
                        background: "#ff4757", border: "2px solid #fff",
                        animation: "pulse 1.5s infinite",
                    }} />
                )}
            </button>

            <style>{`
                @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:0.7} }
                @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
            `}</style>

            {/* Chat window */}
            {open && (
                <div style={{
                    position: "fixed", bottom: 100, right: 28, zIndex: 998,
                    width: 380, maxHeight: 560,
                    background: "#fff", borderRadius: 20,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(10,127,165,0.15)",
                    display: "flex", flexDirection: "column",
                    border: "1px solid rgba(10,127,165,0.12)",
                    animation: "fadeIn 0.25s ease",
                    fontFamily: "'Outfit', sans-serif",
                }}>
                    {/* Header */}
                    <div style={{
                        background: `linear-gradient(135deg, ${NAVY}, #1a3a50)`,
                        borderRadius: "20px 20px 0 0", padding: "16px 20px",
                        display: "flex", alignItems: "center", gap: 12,
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            background: `linear-gradient(135deg, #0a7fa5, ${TEAL})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#ffffff"
                        }}>
                            <Bot size={22} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 6 }}>
                                EcoBot <Sparkles size={14} color={TEAL} />
                            </div>
                            <div style={{ fontSize: "0.72rem", color: TEAL, display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: TEAL, display: "inline-block", animation: "blink 1.8s infinite" }} />
                                {t("chatbot.status")}
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "user" ? "flex-end" : "flex-start", animation: "fadeIn 0.2s ease" }}>
                                <div style={{
                                    maxWidth: "82%", padding: "10px 14px",
                                    borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                    background: msg.from === "user" ? "linear-gradient(135deg,#0a7fa5,#17c4b8)" : "#f0f8fc",
                                    color: msg.from === "user" ? "#fff" : "#1e3a4a",
                                    fontSize: "0.87rem", lineHeight: 1.6,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                }}>
                                    {msg.text}
                                </div>
                                {msg.from === "bot" && msg.suggestions && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, justifyContent: "flex-start" }}>
                                        {msg.suggestions.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => sendMessage(s)}
                                                style={{
                                                    background: "#fff", border: "1.5px solid #c8e6f0",
                                                    color: "#0a7fa5", borderRadius: 20, padding: "4px 11px",
                                                    cursor: "pointer", fontFamily: "inherit",
                                                    fontSize: "0.76rem", fontWeight: 600,
                                                    transition: "all 0.18s",
                                                }}
                                                onMouseEnter={e => { e.target.style.background = "#0a7fa5"; e.target.style.color = "#fff"; }}
                                                onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.color = "#0a7fa5"; }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {typing && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "#f0f8fc", borderRadius: "16px 16px 16px 4px", width: "fit-content" }}>
                                {[0, 0.2, 0.4].map(d => (
                                    <span key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#0a7fa5", display: "inline-block", animation: `blink 1.2s ${d}s infinite` }} />
                                ))}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input area */}
                    <div style={{ padding: "12px 14px", borderTop: "1px solid #f0f4f7", display: "flex", gap: 8 }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={t("chatbot.placeholder")}
                            style={{
                                flex: 1, padding: "10px 14px",
                                border: "1.5px solid #e2ecf0", borderRadius: 12,
                                fontSize: "0.87rem", color: "#1e3a4a",
                                outline: "none", fontFamily: "inherit",
                                background: "#fafcfd",
                            }}
                            onFocus={e => e.target.style.borderColor = "#0a7fa5"}
                            onBlur={e => e.target.style.borderColor = "#e2ecf0"}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim()}
                            style={{
                                background: input.trim() ? "linear-gradient(135deg,#0a7fa5,#17c4b8)" : "#e2ecf0",
                                border: "none", borderRadius: 12, padding: "10px 16px",
                                cursor: input.trim() ? "pointer" : "not-allowed",
                                color: input.trim() ? "#fff" : "#aaa",
                                fontFamily: "inherit", fontWeight: 700, fontSize: "0.9rem",
                                transition: "all 0.2s",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

