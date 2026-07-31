import os
import xml.etree.ElementTree as ET

def generate_architecture_drawio():
    # --- Style Presets with Vibrant Gradients, Shadows & Border Accents ---
    STYLE_REACT = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#0B1329;strokeColor=#38BDF8;strokeWidth=2.5;fontColor=#FFFFFF;fontSize=11.5;fontStyle=1;shadow=1;"
    STYLE_FASTAPI = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#064E3B;strokeColor=#34D399;strokeWidth=2.5;fontColor=#FFFFFF;fontSize=11.5;fontStyle=1;shadow=1;"
    STYLE_N8N = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#7C2D12;strokeColor=#FB923C;strokeWidth=2.5;fontColor=#FFFFFF;fontSize=11.5;fontStyle=1;shadow=1;"
    STYLE_FIREBASE = "shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=15;whiteSpace=wrap;html=1;fillColor=#1E293B;gradientColor=#1E1B4B;strokeColor=#F59E0B;strokeWidth=2.5;fontColor=#FFFFFF;fontSize=11.5;fontStyle=1;shadow=1;"
    
    STYLE_CACHE = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#1E1B4B;strokeColor=#818CF8;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    STYLE_FS = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#334155;strokeColor=#94A3B8;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    
    STYLE_EXTERNAL_BOX = "rounded=1;whiteSpace=wrap;html=1;fillColor=#080E1A;strokeColor=#EC4899;strokeWidth=2;dashed=1;align=center;verticalAlign=top;fontColor=#F472B6;fontStyle=1;fontSize=12;spacingTop=10;shadow=0;"
    STYLE_EXTERNAL_NODE = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#701A75;strokeColor=#F472B6;strokeWidth=1.5;fontColor=#FFFFFF;fontSize=10.5;shadow=1;"

    # --- Edge / Arrow Styles (Color-Coded Latency Paths) ---
    EDGE_FAST = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#10B981;strokeWidth=2;fontColor=#10B981;fontSize=9.5;"
    EDGE_MEDIUM = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#F59E0B;strokeWidth=2;fontColor=#F59E0B;fontSize=9.5;"
    EDGE_SLOW = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#EF4444;strokeWidth=2;fontColor=#EF4444;fontSize=9.5;"
    EDGE_SYNC = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#38BDF8;strokeWidth=2;fontColor=#38BDF8;fontSize=9.5;"

    # Create XML Structure
    mxfile = ET.Element("mxfile", host="Electron", modified="2026-07-19T00:00:00.000Z", agent="5.0", version="20.0.0", type="device")
    diagram = ET.SubElement(mxfile, "diagram", id="diagram_1", name="Hoteleco-Pro Platform Architecture")
    mxGraphModel = ET.SubElement(diagram, "mxGraphModel", dx="1200", dy="1200", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="1100", pageHeight="850", math="0", shadow="0")
    root = ET.SubElement(mxGraphModel, "root")
    
    # Base cells
    ET.SubElement(root, "mxCell", id="0")
    ET.SubElement(root, "mxCell", id="1", parent="0")

    # --- Draw External Services Bounding Box First ---
    ext_group = ET.SubElement(root, "mxCell", id="g_external", value="EXTERNAL SERVICES LAYER", style=STYLE_EXTERNAL_BOX, vertex="1", parent="1")
    ET.SubElement(ext_group, "mxGeometry", x="820", y="180", width="200", height="300", **{"as": "geometry"})

    # --- Vertices catalog: (id, label, style, x, y, w, h) ---
    # We embed bullet points directly inside the HTML labels
    vertices = [
        # React 19 Frontend
        ("react_frontend", 
         "<b>React 19 Frontend Web Client</b><br/><hr/>"
         "• Single Page Application (SPA)<br/>"
         "• PickATrip Travel Wizard<br/>"
         "• Mapbox GL / Leaflet Maps<br/>"
         "• Multi-language i18n support<br/>"
         "• Floating EcoBot Chat UI", 
         STYLE_REACT, 80, 80, 240, 120),

        # Firebase DB
        ("firebase_db", 
         "<b>Firebase Cloud Database</b><br/><hr/>"
         "• Firestore destinations collection<br/>"
         "• Realtime DB bookings & metrics<br/>"
         "• Secure JSON Database rules<br/>"
         "• Sub-second client sync stream", 
         STYLE_FIREBASE, 460, 80, 240, 120),

        # FastAPI Backend
        ("fastapi_backend", 
         "<b>FastAPI Python Backend</b><br/><hr/>"
         "• Scikit-learn BallTree (Haversine)<br/>"
         "• Travel Routing & Cost Calculator<br/>"
         "• Real-time Firestore Sync listener<br/>"
         "• Amadeus Flights API Simulator<br/>"
         "• Thread-safe RLock mechanism", 
         STYLE_FASTAPI, 80, 300, 240, 130),

        # n8n Automation Engine
        ("n8n_engine", 
         "<b>n8n.io Automation Engine</b><br/><hr/>"
         "• Webhook gateway for chat messages<br/>"
         "• Stripe payment success webhook<br/>"
         "• Automated SMTP Email templates<br/>"
         "• OpenAI LLM Node Integrations", 
         STYLE_N8N, 460, 300, 240, 130),

        # In-Memory Cache
        ("mem_cache", 
         "<b>In-Memory Cache (RAM)</b><br/><hr/>"
         "• Thread-locked Pandas DataFrames<br/>"
         "• Pre-built destinations BallTree<br/>"
         "• Pre-built hotels BallTree<br/>"
         "• Query latency: &lt; 5ms", 
         STYLE_CACHE, 80, 510, 240, 110),

        # Local Filesystem
        ("local_fs", 
         "<b>Local Filesystem</b><br/><hr/>"
         "• Destination Site.csv<br/>"
         "• Hotels .csv / airports.csv<br/>"
         "• CSV persistence writeback", 
         STYLE_FS, 400, 510, 200, 110),

        # Subcomponents in External Box (x offsets are relative to parent or absolute grid)
        ("ext_amadeus", "Amadeus Flights API\n(Live Flight Quotes)", STYLE_EXTERNAL_NODE, 840, 230, 160, 50),
        ("ext_llm", "OpenAI / Anthropic API\n(LLM Chat Completions)", STYLE_EXTERNAL_NODE, 840, 310, 160, 50),
        ("ext_smtp", "SMTP Mail Server\n(NodeMailer / SMTP)", STYLE_EXTERNAL_NODE, 840, 390, 160, 50)
    ]

    # Add vertices to root
    for v_id, label, style, x, y, w, h in vertices:
        # Convert HTML labels
        html_val = label.replace("\n", "<br/>")
        cell = ET.SubElement(root, "mxCell", id=v_id, value=html_val, style=style, vertex="1", parent="1")
        ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(w), height=str(h), **{"as": "geometry"})

    # --- Edges with labels and custom styles ---
    edges = [
        # Frontend <---> Firebase
        ("e_fe_rtdb", "Real-time DB Sync\n(WebSocket | ~50-150ms)", "react_frontend", "firebase_db", EDGE_MEDIUM),
        
        # Frontend ---> FastAPI
        ("e_fe_api", "ML Proximity & Costs\n(HTTPS REST | ~10-40ms)", "react_frontend", "fastapi_backend", EDGE_FAST),
        
        # Frontend ---> n8n Webhook
        ("e_fe_n8n", "EcoBot Chat & Payments\n(HTTPS POST | ~800-2500ms)", "react_frontend", "n8n_engine", EDGE_SLOW),
        
        # FastAPI <---> Memory Cache
        ("e_api_cache", "K-NN BallTree Query\n(RAM Read | &lt;5ms)", "fastapi_backend", "mem_cache", EDGE_FAST),
        ("e_cache_rebuild", "Async Index Rebuild\n(Daemon Thread | ~10-25ms)", "mem_cache", "fastapi_backend", EDGE_FAST),
        
        # FastAPI ---> Local Filesystem
        ("e_api_fs", "CSV Writeback\n(Pandas Write | ~5-15ms)", "fastapi_backend", "local_fs", EDGE_FAST),
        
        # Firebase ---> FastAPI Sync listener
        ("e_firebase_api", "Firestore Real-time Sync\n(gRPC Stream | ~200-500ms)", "firebase_db", "fastapi_backend", EDGE_SYNC),

        # n8n ---> LLM
        ("e_n8n_llm", "Chat Dialogs\n(HTTPS API | ~800-2000ms)", "n8n_engine", "ext_llm", EDGE_SLOW),

        # n8n ---> SMTP
        ("e_n8n_smtp", "Send Booking Mail\n(SMTP TLS | ~500-1500ms)", "n8n_engine", "ext_smtp", EDGE_SLOW),

        # FastAPI ---> Amadeus
        ("e_api_amadeus", "Flight Search Queries\n(HTTPS REST | ~500-1200ms)", "fastapi_backend", "ext_amadeus", EDGE_MEDIUM)
    ]

    # Add edges to root
    for e_id, label, source, target, edge_style in edges:
        cell = ET.SubElement(root, "mxCell", id=e_id, value=label, style=edge_style, edge="1", parent="1", source=source, target=target)
        ET.SubElement(cell, "mxGeometry", relative="1", **{"as": "geometry"})

    # Ensure figures directory exists and save
    os.makedirs("figures", exist_ok=True)
    drawio_path = "figures/hotelecopro_architecture.drawio"
    
    # Generate pretty XML
    tree = ET.ElementTree(mxfile)
    ET.indent(tree, space="  ", level=0)
    tree.write(drawio_path, encoding="utf-8", xml_declaration=True)
    print(f"[OK] Premium Colorful Architecture Draw.io XML successfully saved to: {drawio_path}")

def print_mermaid_code():
    mermaid = """```mermaid
flowchart TD
    %% Styling definitions (Modern Theme)
    classDef frontend fill:#1E293B,stroke:#38BDF8,stroke-width:2.5px,color:#FFF;
    classDef fastapi fill:#1E293B,stroke:#34D399,stroke-width:2.5px,color:#FFF;
    classDef n8n fill:#1E293B,stroke:#FB923C,stroke-width:2.5px,color:#FFF;
    classDef firebase fill:#1E293B,stroke:#FBBF24,stroke-width:2.5px,color:#FFF;
    classDef storage fill:#1E293B,stroke:#818CF8,stroke-width:2px,color:#FFF;
    classDef filesystem fill:#1E293B,stroke:#94A3B8,stroke-width:2px,color:#FFF;
    classDef external fill:#1E293B,stroke:#EC4899,stroke-width:2px,color:#FFF;

    %% Nodes Definitions
    react_frontend[<b>React 19 Frontend Web Client</b><br/>• PickATrip travel wizard<br/>• Mapbox GL / Leaflet map<br/>• i18n language support<br/>• EcoBot floating chat UI]:::frontend
    
    firebase_db[(<b>Firebase Cloud Database</b><br/>• Firestore destinations collection<br/>• Realtime DB bookings & metrics<br/>• Database rules & auth)]:::firebase
    
    fastapi_backend[<b>FastAPI Python Backend</b><br/>• Scikit-learn Haversine BallTree<br/>• Dynamic routing cost calculator<br/>• Real-time Firestore sync listener<br/>• Thread-safe RLock mechanism]:::fastapi
    
    n8n_engine[<b>n8n.io Automation Engine</b><br/>• Chat Webhook gateway<br/>• Payment webhook integration<br/>• Automated SMTP mail sending<br/>• OpenAI LLM Node workflows]:::n8n
    
    mem_cache[<b>In-Memory Cache (RAM)</b><br/>• Thread-locked DataFrames<br/>• Pre-built K-NN BallTrees<br/>• Direct RAM read: &lt;5ms]:::storage
    
    local_fs[<b>Local Filesystem</b><br/>• Destination Site.csv<br/>• Hotels .csv / airports.csv<br/>• CSV persistence writeback]:::filesystem

    subgraph External_Services ["EXTERNAL SERVICES LAYER"]
        ext_amadeus[Amadeus Flights API]:::external
        ext_llm[OpenAI / LLM API]:::external
        ext_smtp[SMTP Mail Server]:::external
    end

    %% Data Flow Connections with color-coded paths
    react_frontend <-->|Real-time DB Sync<br/>WebSocket | ~50-150ms| firebase_db
    react_frontend --->|ML Recommendations<br/>HTTPS REST | ~10-40ms| fastapi_backend
    react_frontend --->|Chatbot & Payments<br/>HTTPS POST | ~800-2500ms| n8n_engine
    
    fastapi_backend <-->|K-NN Query & Rebuild<br/>Direct RAM | &lt;5ms| mem_cache
    fastapi_backend --->|CSV Writeback<br/>Pandas File I/O | ~5-15ms| local_fs
    firebase_db --->|Firestore Real-time Sync<br/>gRPC Stream | ~200-500ms| fastapi_backend
    
    n8n_engine --->|Chat Dialogs<br/>HTTPS REST | ~800-2000ms| ext_llm
    n8n_engine --->|Send Booking Mail<br/>SMTP TLS | ~500-1500ms| ext_smtp
    fastapi_backend --->|Flight Offers Search<br/>HTTPS REST | ~500-1200ms| ext_amadeus

    %% Link styles
    linkStyle 0 stroke:#FBBF24,stroke-width:2px;   %% Amber DB Sync
    linkStyle 1 stroke:#34D399,stroke-width:2px;   %% Emerald REST
    linkStyle 2 stroke:#EF4444,stroke-width:2px;   %% Red slow webhook
    linkStyle 3 stroke:#34D399,stroke-width:2px;   %% Emerald cache
    linkStyle 4 stroke:#34D399,stroke-width:2px;   %% Emerald filesystem
    linkStyle 5 stroke:#38BDF8,stroke-width:2px;   %% Cyan sync
    linkStyle 6 stroke:#EF4444,stroke-width:2px;   %% Red LLM
    linkStyle 7 stroke:#EF4444,stroke-width:2px;   %% Red SMTP
    linkStyle 8 stroke:#FBBF24,stroke-width:2px;   %% Amber Amadeus
```"""
    print("\n--- ARCHITECTURE MERMAID CODE BLOCK ---")
    print(mermaid)
    print("---------------------------------------\n")

if __name__ == "__main__":
    generate_architecture_drawio()
    print_mermaid_code()
