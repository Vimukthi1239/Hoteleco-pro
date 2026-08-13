import React from 'react';

export const FacebookIcon = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

export const InstagramIcon = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
);

export const TikTokIcon = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.91 1.63V7.23a4.85 4.85 0 0 1-1-.54z"/>
    </svg>
);

export const YoutubeIcon = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

export const LinkedinIcon = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
);

export const SOCIAL_LINKS = [
    {
        name: "Facebook",
        url: "https://www.facebook.com/share/1HEMYa5S7r/",
        icon: FacebookIcon,
        color: "#1877F2",
        bg: "rgba(24, 119, 242, 0.12)",
        glow: "rgba(24, 119, 242, 0.4)",
        gradient: "linear-gradient(135deg, #1877F2, #0056b3)"
    },
    {
        name: "Instagram",
        url: "https://www.instagram.com/ceylon_nature?igsh=eG8zdG5scmlpMXh6&igsi=eG8zdG5scmlpMXh6",
        icon: InstagramIcon,
        color: "#E4405F",
        bg: "rgba(228, 64, 95, 0.12)",
        glow: "rgba(228, 64, 95, 0.4)",
        gradient: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)"
    },
    {
        name: "TikTok",
        url: "https://www.tiktok.com/@ceylon.nature05?_r=1&_t=ZS-98qzZvVcUFR",
        icon: TikTokIcon,
        color: "#00F2FE",
        bg: "rgba(0, 242, 254, 0.12)",
        glow: "rgba(0, 242, 254, 0.4)",
        gradient: "linear-gradient(135deg, #00f2fe, #4facfe, #ff0050)"
    },

    {
        name: "YouTube",
        url: "https://youtube.com",
        icon: YoutubeIcon,
        color: "#FF0000",
        bg: "rgba(255, 0, 0, 0.12)",
        glow: "rgba(255, 0, 0, 0.4)",
        gradient: "linear-gradient(135deg, #FF0000, #c40000)"
    },
    {
        name: "LinkedIn",
        url: "https://linkedin.com",
        icon: LinkedinIcon,
        color: "#0A66C2",
        bg: "rgba(10, 102, 194, 0.12)",
        glow: "rgba(10, 102, 194, 0.4)",
        gradient: "linear-gradient(135deg, #0A66C2, #004182)"
    }
];

export default function SocialIconsGroup({ layout = "row", size = 20, showLabels = false }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: layout === "column" ? "column" : "row",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap"
        }}>
            {SOCIAL_LINKS.map((social) => {
                const IconComponent = social.icon;
                return (
                    <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: showLabels ? "10px 18px" : "10px",
                            borderRadius: "14px",
                            background: social.bg,
                            border: `1px solid ${social.color}33`,
                            color: social.color,
                            textDecoration: "none",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            backdropFilter: "blur(8px)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
                            e.currentTarget.style.boxShadow = `0 8px 20px ${social.glow}`;
                            e.currentTarget.style.borderColor = social.color;
                            e.currentTarget.style.background = social.gradient;
                            e.currentTarget.style.color = "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.borderColor = `${social.color}33`;
                            e.currentTarget.style.background = social.bg;
                            e.currentTarget.style.color = social.color;
                        }}
                    >
                        <IconComponent size={size} color="currentColor" />
                        {showLabels && (
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.3px" }}>
                                {social.name}
                            </span>
                        )}
                    </a>
                );
            })}
        </div>
    );
}
