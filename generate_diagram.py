import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_diagram():
    # Set up styling and figure size (16:10 aspect ratio, premium dark theme)
    fig, ax = plt.subplots(figsize=(16, 10.5), dpi=300)
    fig.patch.set_facecolor('#0B0F19')  # Midnight dark background
    ax.set_facecolor('#0B0F19')

    # Configure axes limits
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Draw grid or accent lines for futuristic/modern vibe (subtle)
    for x in range(10, 100, 10):
        ax.axvline(x, color='#1E293B', linewidth=0.5, alpha=0.3, zorder=0)
    for y in range(10, 100, 10):
        ax.axhline(y, color='#1E293B', linewidth=0.5, alpha=0.3, zorder=0)

    # Helper function to draw rounded boxes
    def draw_card(x, y, w, h, title, subtitle, items, border_color, accent_color):
        # Card background (rounded rectangle)
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=1.5",
            facecolor='#1E293B',
            edgecolor=border_color,
            linewidth=2.0,
            alpha=0.95,
            zorder=2
        )
        ax.add_patch(rect)

        # Title bar background line
        ax.plot([x - 1, x + w + 1], [y + h - 1.5, y + h - 1.5], color=accent_color, linewidth=1.5, zorder=3)

        # Title text
        ax.text(
            x + w/2, y + h + 0.5, title,
            color='#FFFFFF', fontsize=12, fontweight='bold',
            ha='center', va='bottom', zorder=4
        )

        # Subtitle text
        ax.text(
            x + w/2, y + h - 1.0, subtitle,
            color=accent_color, fontsize=8, fontstyle='italic',
            ha='center', va='top', zorder=4
        )

        # Content items - Rendered as beautiful list items with pills
        dy = (h - 3.2) / len(items)
        for i, item in enumerate(items):
            item_y = y + h - 3.2 - (i * dy) - dy/2

            # Check if it is a separator line
            if item.strip().startswith("---") or item.strip().startswith("___"):
                ax.plot([x + 1, x + w - 1], [item_y, item_y], color='#475569', linewidth=1.0, zorder=3)
                continue

            # Identify indentation/sub-lists
            is_indented = item.strip().startswith("-") or item.strip().startswith("•") or item.startswith("  ")
            clean_item = item.strip().lstrip("- ").lstrip("• ")

            # Draw a subtle background pill for the item (accent color with 7% opacity)
            pill_x = x + 1.2 if is_indented else x + 0.8
            pill_w = w - 2.0 if is_indented else w - 1.6
            pill = patches.FancyBboxPatch(
                (pill_x, item_y - dy*0.36), pill_w, dy*0.72,
                boxstyle="round,pad=0.1",
                facecolor=accent_color,
                edgecolor='none',
                alpha=0.07,
                zorder=3
            )
            ax.add_patch(pill)

            # Draw bullet dot
            if is_indented:
                # Nested list gets a small hollow circle ring
                dot = patches.Circle(
                    (x + 2.0, item_y), radius=0.09,
                    facecolor='none',
                    edgecolor=accent_color,
                    linewidth=1.2,
                    zorder=4
                )
                text_x = x + 2.5
                font_sz = 7.8
                text_color = '#CBD5E1'  # Slightly lighter gray for sub-items
            else:
                # Main list gets a solid colored circle dot
                dot = patches.Circle(
                    (x + 1.5, item_y), radius=0.14,
                    facecolor=accent_color,
                    edgecolor='none',
                    zorder=4
                )
                text_x = x + 2.1
                font_sz = 8.2
                text_color = '#F8FAFC'  # Brighter white for main items

            ax.add_patch(dot)

            # Draw item label text
            ax.text(
                text_x, item_y, clean_item,
                color=text_color, fontsize=font_sz,
                ha='left', va='center', zorder=4
            )

    # Helper function to draw colored flow arrows
    def draw_flow_arrow(x1, y1, x2, y2, label, latency, protocol, color, connection_style="arc3,rad=0.1", label_pos=0.5, label_offset=(0, 2)):
        # Draw arrow patch
        arrow = patches.FancyArrowPatch(
            (x1, y1), (x2, y2),
            connectionstyle=connection_style,
            arrowstyle="->,head_width=3,head_length=5",
            color=color,
            linewidth=1.8,
            linestyle="-",
            zorder=5,
            mutation_scale=15
        )
        ax.add_patch(arrow)

        # Calculate midpoints for text placement
        mx = x1 + (x2 - x1) * label_pos + label_offset[0]
        my = y1 + (y2 - y1) * label_pos + label_offset[1]

        # Draw a small background box for text legibility with matching colored border outline
        text_bbox = dict(
            boxstyle='round,pad=0.25',
            facecolor='#0B0F19',
            edgecolor=color,
            linewidth=1.2,
            alpha=0.9,
            zorder=6
        )

        # Label text
        full_label = f"{label}\n({protocol} | {latency})" if protocol else f"{label}\n({latency})"
        ax.text(
            mx, my, full_label,
            color='#FFFFFF', fontsize=7.5, fontweight='semibold',
            ha='center', va='center',
            bbox=text_bbox, zorder=7
        )

    # --- Draw Header ---
    ax.text(
        50, 96, "Hoteleco-Pro Hybrid Platform Architecture",
        color='#FFFFFF', fontsize=18, fontweight='bold',
        ha='center', va='center', zorder=10
    )
    ax.text(
        50, 93, "Data Flow & Performance Map (Throughput & Latency Analysis Across Platform Layers)",
        color='#38BDF8', fontsize=10.5, fontweight='normal',
        ha='center', va='center', zorder=10
    )

    # --- Draw Layers & Cards ---
    
    # Layer 1: Client/Presentation Layer (y ~ 65 - 85)
    draw_card(
        x=8, y=70, w=22, h=14,
        title="React 19 Web Frontend",
        subtitle="Presentation & Client UI Layer",
        items=[
            "Single Page Application (SPA)",
            "PickATrip Travel Planner Wizard",
            "Mapbox GL / Leaflet Interactive Maps",
            "Multi-language (i18n, 8 Languages)",
            "EcoBot Floating Chatbot Interface"
        ],
        border_color='#38BDF8', accent_color='#38BDF8'
    )

    # Layer 2: Integration & Orchestration Layer (y ~ 38 - 58)
    draw_card(
        x=8, y=36, w=22, h=16,
        title="FastAPI Python Backend",
        subtitle="Computational & Recommendations Engine",
        items=[
            "Scikit-learn BallTree (Haversine K-NN)",
            "Travel Routing & Transportation Costs",
            "Real-time Firestore Listener Thread",
            "Amadeus Flights API Client / Simulator",
            "Thread-Safe Read/Write Data Locks"
        ],
        border_color='#059669', accent_color='#34D399'
    )

    draw_card(
        x=50, y=36, w=22, h=16,
        title="n8n.io Automation Engine",
        subtitle="Orchestration & Webhook Workflows",
        items=[
            "Webhook Gateway for EcoBot Chat messages",
            "Booking Payment Integration Webhook",
            "Automated SMTP Email Notification Workflows",
            "Third-Party LLM API Intermediary",
            "Marketing Asset & Social post Generator"
        ],
        border_color='#EA580C', accent_color='#FB923C'
    )

    # Layer 3: Cloud & Storage Services (y ~ 70 - 84 right side, and y ~ 6 - 22 bottom)
    draw_card(
        x=50, y=70, w=22, h=14,
        title="Firebase Cloud Database",
        subtitle="BaaS & Real-time Cloud Storage",
        items=[
            "Firestore 'destinations' collection",
            "Real-time DB bookings, hotelProfiles, reviews",
            "JSON-structured rules & authentication",
            "Sub-second sync with active clients",
            "Listener thread endpoint for local cache update"
        ],
        border_color='#F59E0B', accent_color='#FBBF24'
    )

    # Memory Cache & Local Storage
    draw_card(
        x=8, y=6, w=22, h=14,
        title="In-Memory Cache (RAM)",
        subtitle="State & Index Cache (Thread-Safe)",
        items=[
            "Thread-Locked Pandas DataFrames",
            "Pre-built BallTree K-NN index (Sites)",
            "Pre-built BallTree K-NN index (Hotels)",
            "Query execution: Near 0ms overhead",
            "Rebuild execution: ~10ms - 25ms background task"
        ],
        border_color='#6366F1', accent_color='#818CF8'
    )

    draw_card(
        x=38, y=6, w=16, h=14,
        title="Local Filesystem",
        subtitle="Persistent Local CSV storage",
        items=[
            "Destination Site.csv",
            "Hotels .csv",
            "airports.csv",
            "Read on startup",
            "Write on manual additions"
        ],
        border_color='#64748B', accent_color='#94A3B8'
    )

    # Layer 4: External Services (y ~ 20 - 62 rightmost)
    draw_card(
        x=84, y=22, w=12, h=40,
        title="External APIs",
        subtitle="Cloud & Third-Party APIs",
        items=[
            "Amadeus Global",
            "Flight Search API",
            "  - Live request",
            "  - Flight Simulator",
            "--------------------",
            "OpenAI / LLM API",
            "  - GPT-4o / Claude",
            "  - Text-to-JSON",
            "--------------------",
            "SMTP Email Server",
            "  - NodeMailer / SMTP",
            "  - Confirmations"
        ],
        border_color='#EC4899', accent_color='#F472B6'
    )

    # --- Draw Flows (Arrows and Performance Metadata) ---

    # Flow 1: Frontend <---> Firebase Real-Time DB (Sync)
    draw_flow_arrow(
        x1=30, y1=78, x2=50, y2=78,
        label="Real-time DB Sync\n(Bookings, Profiles)",
        latency="~50 - 150ms",
        protocol="WebSocket / SSE",
        color='#F59E0B',
        connection_style="arc3,rad=0.08"
    )

    # Flow 2: Frontend ---> FastAPI (Recommendations / Cost / Flight search)
    draw_flow_arrow(
        x1=15, y1=70, x2=15, y2=52,
        label="ML K-NN / Travel Cost Queries",
        latency="~10 - 40ms",
        protocol="HTTPS REST GET/POST",
        color='#10B981',
        connection_style="arc3,rad=-0.05",
        label_pos=0.5,
        label_offset=(-1.0, 0)
    )

    # Flow 3: Frontend ---> n8n (EcoBot / Payment webhooks)
    draw_flow_arrow(
        x1=26, y1=70, x2=54, y2=52,
        label="EcoBot Chat / Payment webhooks",
        latency="~800 - 2500ms",
        protocol="HTTPS POST Webhook",
        color='#EF4444',
        connection_style="arc3,rad=0.05",
        label_pos=0.6,
        label_offset=(2, 2)
    )

    # Flow 4: FastAPI <---> Memory Cache (Fast Read/Write K-NN Search)
    draw_flow_arrow(
        x1=15, y1=36, x2=15, y2=20,
        label="K-NN BallTree query",
        latency="< 5ms",
        protocol="Direct RAM Read",
        color='#10B981',
        connection_style="arc3,rad=-0.05",
        label_pos=0.5,
        label_offset=(-0.5, 0)
    )

    # Flow 5: FastAPI ---> Local CSV Storage (Manual Additions write)
    draw_flow_arrow(
        x1=26, y1=36, x2=43, y2=20,
        label="CSV Writeback / Add hotel/site",
        latency="~5 - 15ms",
        protocol="Pandas CSV Write",
        color='#10B981',
        connection_style="arc3,rad=0.05",
        label_pos=0.45,
        label_offset=(1.5, -0.5)
    )

    # Flow 6: FastAPI ---> Memory Cache (Async background thread rebuild)
    draw_flow_arrow(
        x1=19, y1=20, x2=19, y2=36,
        label="Async BallTree Index Rebuild",
        latency="~10 - 25ms",
        protocol="Daemon Thread Task",
        color='#10B981',
        connection_style="arc3,rad=-0.05",
        label_pos=0.5,
        label_offset=(0.5, 0)
    )

    # Flow 7: Firestore ---> FastAPI (Real-time listener cloud synchronization)
    draw_flow_arrow(
        x1=52, y1=70, x2=28, y2=52,
        label="Firestore real-time sync listener",
        latency="~200 - 500ms",
        protocol="gRPC Stream",
        color='#38BDF8',
        connection_style="arc3,rad=0.05",
        label_pos=0.45,
        label_offset=(-2, -1)
    )

    # Flow 8: n8n ---> OpenAI LLM (AI Chatbot completion)
    draw_flow_arrow(
        x1=72, y1=46, x2=84, y2=46,
        label="Chat completions",
        latency="~800 - 2000ms",
        protocol="HTTPS API",
        color='#EF4444',
        connection_style="arc3,rad=0.05"
    )

    # Flow 9: n8n ---> SMTP Server (Email notifications)
    draw_flow_arrow(
        x1=72, y1=41, x2=84, y2=31,
        label="Send Booking Mail",
        latency="~500 - 1500ms",
        protocol="SMTP TLS/SSL",
        color='#EF4444',
        connection_style="arc3,rad=-0.05",
        label_pos=0.5,
        label_offset=(2, -2)
    )

    # Flow 10: FastAPI ---> Amadeus API (Flights querying)
    draw_flow_arrow(
        x1=30, y1=44, x2=84, y2=55,
        label="Flight Search\n(or Mock Simulator)",
        latency="~500 - 1200ms (Sim: ~2ms)",
        protocol="HTTPS REST",
        color='#F59E0B',
        connection_style="arc3,rad=-0.12",
        label_pos=0.4,
        label_offset=(-2, 3)
    )

    # --- Draw Legend (Bottom Right, y ~ 6 - 15) ---
    legend_rect = patches.FancyBboxPatch(
        (58, 6), width=34, height=14,
        boxstyle="round,pad=0.8",
        facecolor='#1E293B',
        edgecolor='#64748B',
        linewidth=1.0,
        zorder=2
    )
    ax.add_patch(legend_rect)
    ax.text(59, 18.5, "Performance & Latency Tier Legend", color='#FFFFFF', fontsize=9.5, fontweight='bold', zorder=4)

    # Latency Tiers (Green, Blue/Yellow, Red)
    y_leg = 15.5
    dy_leg = 2.5
    
    # Tier 1 (Fast path)
    ax.plot([60, 64], [y_leg, y_leg], color='#10B981', linewidth=3, zorder=4)
    ax.text(66, y_leg, "Ultra-Fast Path (< 50ms): In-memory queries & local calculations", color='#10B981', fontsize=8, fontweight='semibold', va='center', zorder=4)
    
    # Tier 2 (Medium / DB path)
    y_leg -= dy_leg
    ax.plot([60, 64], [y_leg, y_leg], color='#F59E0B', linewidth=3, zorder=4)
    ax.text(66, y_leg, "Medium Latency (50 - 500ms): Cloud Database read/write & synchronization", color='#F59E0B', fontsize=8, fontweight='semibold', va='center', zorder=4)

    # Tier 3 (External API / Chatbots)
    y_leg -= dy_leg
    ax.plot([60, 64], [y_leg, y_leg], color='#EF4444', linewidth=3, zorder=4)
    ax.text(66, y_leg, "High Latency (> 500ms): External APIs, LLMs, SMTP email delivery", color='#EF4444', fontsize=8, fontweight='semibold', va='center', zorder=4)

    # Layer Colors
    y_leg -= dy_leg
    ax.plot([60, 64], [y_leg, y_leg], color='#38BDF8', linewidth=3, zorder=4)
    ax.text(66, y_leg, "Client-to-Cloud Sync: Real-time Firebase data synchronization stream", color='#38BDF8', fontsize=8, fontweight='semibold', va='center', zorder=4)

    # Adjust layout and save files
    plt.subplots_adjust(left=0.01, right=0.99, top=0.95, bottom=0.05)
    
    os.makedirs("figures", exist_ok=True)
    pdf_path = "figures/architecture_diagram.pdf"
    png_path = "figures/architecture_diagram.png"
    
    plt.savefig(pdf_path, format="pdf", facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.savefig(png_path, format="png", facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.close()
    
    print(f"[OK] Diagram successfully generated and saved to:")
    print(f"   - PDF: {pdf_path}")
    print(f"   - PNG: {png_path}")

if __name__ == "__main__":
    draw_diagram()
