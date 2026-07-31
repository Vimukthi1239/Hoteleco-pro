import os
import xml.etree.ElementTree as ET

def generate_architecture_flowchart_drawio():
    # --- Style Presets with Vibrant Gradients, Shadows & Border Accents ---
    STYLE_CAPSULE = "rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=#0F172A;gradientColor=#064E3B;strokeColor=#10B981;strokeWidth=2.5;fontColor=#FFFFFF;fontStyle=1;fontSize=12;shadow=1;"
    STYLE_CLIENT = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#0B1329;strokeColor=#38BDF8;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    STYLE_FASTAPI = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#064E3B;strokeColor=#34D399;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    STYLE_DECISION = "rhombus;whiteSpace=wrap;html=1;fillColor=#1E293B;gradientColor=#78350F;strokeColor=#F59E0B;strokeWidth=2;fontColor=#FFFFFF;fontSize=10.5;shadow=1;"
    STYLE_DATABASE = "shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=15;whiteSpace=wrap;html=1;fillColor=#1E293B;gradientColor=#1E1B4B;strokeColor=#818CF8;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    STYLE_N8N = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#7C2D12;strokeColor=#FB923C;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    STYLE_EXTERNAL = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#1E293B;gradientColor=#701A75;strokeColor=#EC4899;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    
    # --- Container Box Style ---
    STYLE_GROUP = "rounded=1;whiteSpace=wrap;html=1;fillColor=#080E1A;strokeColor=#334155;strokeWidth=1.5;dashed=1;dashPattern=8 8;align=center;verticalAlign=top;fontColor=#94A3B8;fontStyle=1;fontSize=12;spacingTop=10;shadow=0;"

    # --- Edge Styles (Color-Coded Paths) ---
    EDGE_MAIN = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#10B981;strokeWidth=2;"
    EDGE_FLIGHT = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#38BDF8;strokeWidth=2;"
    EDGE_RECOMMEND = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#818CF8;strokeWidth=2;"
    EDGE_CHAT = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#FB923C;strokeWidth=2;"
    EDGE_SYNC = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#EC4899;strokeWidth=2;"
    EDGE_NEUTRAL = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#64748B;strokeWidth=1.5;"

    # Create XML Structure
    mxfile = ET.Element("mxfile", host="Electron", modified="2026-07-19T00:00:00.000Z", agent="5.0", version="20.0.0", type="device")
    diagram = ET.SubElement(mxfile, "diagram", id="diagram_1", name="Hoteleco-Pro Architecture Flowchart")
    mxGraphModel = ET.SubElement(diagram, "mxGraphModel", dx="1200", dy="1200", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="1400", pageHeight="850", math="0", shadow="0")
    root = ET.SubElement(mxGraphModel, "root")
    
    # Base cells
    ET.SubElement(root, "mxCell", id="0")
    ET.SubElement(root, "mxCell", id="1", parent="0")

    # --- Swimlane Group Containers (Dashed boxes for columns) ---
    groups = [
        ("g_flight", "FLIGHT SEARCH FLOW\n(Amadeus Integration)", STYLE_GROUP, 20, 200, 220, 310),
        ("g_recommend", "ML RECOMMENDATIONS FLOW\n(BallTree K-NN Query)", STYLE_GROUP, 260, 200, 240, 310),
        ("g_chat", "ECOBOT CHATBOT FLOW\n(n8n LLM Orchestration)", STYLE_GROUP, 520, 200, 220, 310),
        ("g_booking", "BOOKING & PAYMENTS FLOW\n(Firebase & Email Sync)", STYLE_GROUP, 760, 200, 240, 310),
        ("g_sync", "CLOUD FIREBASE BACKGROUND SYNC\n(BallTree Index Rebuild)", STYLE_GROUP, 1020, 200, 260, 310)
    ]
    for g_id, label, style, x, y, w, h in groups:
        cell = ET.SubElement(root, "mxCell", id=g_id, value=label, style=style, vertex="1", parent="1")
        ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(w), height=str(h), **{"as": "geometry"})

    # --- Vertices catalog: (id, label, style, x, y, w, h) ---
    vertices = [
        # Start & Initial Router
        ("start", "User Initiates Request\non React Frontend", STYLE_CAPSULE, 540, 30, 200, 50),
        ("req_router", "Determine Request Type\n(SPA Route / Component Action)", STYLE_DECISION, 530, 110, 220, 70),

        # Column 1: Flight Search (x ~ 30 - 230)
        ("fl_api", "Call FastAPI Endpoint\n/api/flights/search", STYLE_FASTAPI, 40, 250, 180, 50),
        ("fl_amadeus", "Query Amadeus API\n(Fallback to simulated data)", STYLE_EXTERNAL, 40, 330, 180, 50),
        ("fl_ret", "Return Flight Offers\nto Trip Planner UI", STYLE_CLIENT, 40, 410, 180, 50),

        # Column 2: ML Recommendations (x ~ 270 - 490)
        ("rec_api", "Call FastAPI Endpoint\n/recommend/hotels or /sites", STYLE_FASTAPI, 290, 250, 180, 50),
        ("rec_cache", "Query In-Memory Cache\n(Thread-locked BallTree)", STYLE_DATABASE, 290, 330, 180, 50),
        ("rec_ret", "Return Nearest Sites/Hotels\nto Frontend Map profiles", STYLE_CLIENT, 290, 410, 180, 50),

        # Column 3: EcoBot Chatbot (x ~ 530 - 730)
        ("chat_n8n", "Post message payload\nto n8n Chat Webhook", STYLE_N8N, 540, 250, 180, 50),
        ("chat_llm", "Query OpenAI/LLM API\n(GPT-4o/Claude Completion)", STYLE_EXTERNAL, 540, 330, 180, 50),
        ("chat_ret", "Return text response\nto EcoBot Floating UI", STYLE_CLIENT, 540, 410, 180, 50),

        # Column 4: Booking Automations (x ~ 770 - 990)
        ("book_rtdb", "Write Booking JSON to\nFirebase Realtime DB", STYLE_DATABASE, 790, 250, 180, 50),
        ("book_n8n", "n8n Webhook triggers on DB\nupdate & checks status", STYLE_N8N, 790, 330, 180, 50),
        ("book_mail", "Send confirmation emails\nto Customer & Hotel Owner", STYLE_EXTERNAL, 790, 410, 180, 50),

        # Column 5: Background Sync (x ~ 1030 - 1270)
        ("sync_listener", "Firestore destinations\nchange detected by gRPC", STYLE_DATABASE, 1060, 250, 180, 50),
        ("sync_rebuild", "Trigger worker thread\nto rebuild BallTree index", STYLE_FASTAPI, 1060, 330, 180, 50),
        ("sync_lock", "Swap memory pointers\nthread-safely via lock", STYLE_FASTAPI, 1060, 410, 180, 50),

        # Consolidation & End
        ("fe_render", "React 19 Frontend renders\nupdated UI with data", STYLE_CLIENT, 540, 550, 200, 50),
        ("end", "End: User Request Satisfied\n& UI Idle", STYLE_CAPSULE, 550, 630, 180, 50)
    ]

    # Add vertices to root
    for v_id, label, style, x, y, w, h in vertices:
        cell = ET.SubElement(root, "mxCell", id=v_id, value=label, style=style, vertex="1", parent="1")
        ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(w), height=str(h), **{"as": "geometry"})

    # --- Edges with labels and custom styles ---
    edges = [
        # Start to Router
        ("e_start_router", "", "start", "req_router", EDGE_MAIN),

        # Router branches
        ("e_r_flight", "Flight query", "req_router", "fl_api", EDGE_FLIGHT),
        ("e_r_rec", "K-NN Proximity", "req_router", "rec_api", EDGE_RECOMMEND),
        ("e_r_chat", "EcoBot message", "req_router", "chat_n8n", EDGE_CHAT),
        ("e_r_book", "Book hotel", "req_router", "book_rtdb", EDGE_MAIN),
        ("e_r_sync", "Admin edit", "req_router", "sync_listener", EDGE_SYNC),

        # Column 1 flows
        ("e_fl_amadeus", "", "fl_api", "fl_amadeus", EDGE_FLIGHT),
        ("e_amadeus_ret", "", "fl_amadeus", "fl_ret", EDGE_FLIGHT),
        ("e_fl_render", "", "fl_ret", "fe_render", EDGE_FLIGHT),

        # Column 2 flows
        ("e_rec_cache", "", "rec_api", "rec_cache", EDGE_RECOMMEND),
        ("e_cache_ret", "", "rec_cache", "rec_ret", EDGE_RECOMMEND),
        ("e_rec_render", "", "rec_ret", "fe_render", EDGE_RECOMMEND),

        # Column 3 flows
        ("e_chat_llm", "", "chat_n8n", "chat_llm", EDGE_CHAT),
        ("e_llm_ret", "", "chat_llm", "chat_ret", EDGE_CHAT),
        ("e_chat_render", "", "chat_ret", "fe_render", EDGE_CHAT),

        # Column 4 flows
        ("e_book_n8n", "", "book_rtdb", "book_n8n", EDGE_MAIN),
        ("e_n8n_mail", "", "book_n8n", "book_mail", EDGE_MAIN),
        ("e_mail_render", "", "book_mail", "fe_render", EDGE_MAIN),

        # Column 5 flows
        ("e_sync_rebuild", "", "sync_listener", "sync_rebuild", EDGE_SYNC),
        ("e_rebuild_lock", "", "sync_rebuild", "sync_lock", EDGE_SYNC),
        ("e_sync_render", "Background updated", "sync_lock", "fe_render", EDGE_SYNC),

        # Render to End
        ("e_render_end", "", "fe_render", "end", EDGE_MAIN)
    ]

    # Add edges to root
    for e_id, label, source, target, edge_style in edges:
        cell = ET.SubElement(root, "mxCell", id=e_id, value=label, style=edge_style, edge="1", parent="1", source=source, target=target)
        ET.SubElement(cell, "mxGeometry", relative="1", **{"as": "geometry"})

    # Ensure figures directory exists and save
    os.makedirs("figures", exist_ok=True)
    drawio_path = "figures/hotelecopro_architecture_flowchart.drawio"
    
    # Generate pretty XML
    tree = ET.ElementTree(mxfile)
    ET.indent(tree, space="  ", level=0)
    tree.write(drawio_path, encoding="utf-8", xml_declaration=True)
    print(f"[OK] Premium Architecture Flowchart Draw.io XML successfully saved to: {drawio_path}")

def print_mermaid_code():
    mermaid = """```mermaid
flowchart TD
    %% Styling definitions (Modern Theme)
    classDef start_end fill:#0F172A,stroke:#10B981,stroke-width:2.5px,color:#10B981,font-weight:bold;
    classDef client fill:#1E293B,stroke:#38BDF8,stroke-width:2px,color:#FFF;
    classDef api fill:#1E293B,stroke:#34D399,stroke-width:2px,color:#FFF;
    classDef decision fill:#1E293B,stroke:#FBBF24,stroke-width:2px,color:#FFF;
    classDef database fill:#1E293B,stroke:#818CF8,stroke-width:2px,color:#FFF;
    classDef n8n fill:#1E293B,stroke:#FB923C,stroke-width:2px,color:#FFF;
    classDef external fill:#1E293B,stroke:#EC4899,stroke-width:2px,color:#FFF;

    start([User Initiates Request on React Frontend]):::start_end
    req_router{Determine Request Type by SPA Router}:::decision

    %% Paths & Subgraphs
    subgraph Flight_Search_Column ["FLIGHT SEARCH COLUMN"]
        fl_api[Call FastAPI /api/flights/search]:::api
        fl_amadeus[Query Amadeus Flights API]:::external
        fl_ret[Return Flight Offers to Client]:::client
    end

    subgraph Recommendation_Column ["ML RECOMMENDATIONS COLUMN"]
        rec_api[Call FastAPI /recommend/hotels or /sites]:::api
        rec_cache[(Query RAM Cache BallTree)]:::database
        rec_ret[Return Proximity Recommendations]:::client
    end

    subgraph Chatbot_Column ["ECOBOT CHATBOT COLUMN"]
        chat_n8n[Post message payload to n8n Webhook]:::n8n
        chat_llm[Query OpenAI/LLM Chat API]:::external
        chat_ret[Return LLM Response to UI Chatbox]:::client
    end

    subgraph Booking_Column ["BOOKING & PAYMENTS COLUMN"]
        book_rtdb[(Write Booking to Firebase RTDB)]:::database
        book_n8n[n8n Webhook triggers on update]:::n8n
        book_mail[Send SMTP confirmation email]:::external
    end

    subgraph Background_Sync_Column ["BACKGROUND CLOUD DATA SYNC COLUMN"]
        sync_listener[(Firestore change gRPC Listener)]:::database
        sync_rebuild[Rebuild BallTree in background thread]:::api
        sync_lock[Swap memory index pointer thread-safely]:::api
    end

    fe_render[React 19 renders updated UI components]:::client
    finish([End: UI Idle]):::start_end

    %% Connections
    start --> req_router
    req_router -->|Flight Query| fl_api
    req_router -->|K-NN Proximity| rec_api
    req_router -->|EcoBot Chat| chat_n8n
    req_router -->|Hotel Booking| book_rtdb
    req_router -->|Admin Update| sync_listener

    %% Col 1
    fl_api --> fl_amadeus
    fl_amadeus --> fl_ret
    fl_ret --> fe_render

    %% Col 2
    rec_api --> rec_cache
    rec_cache --> rec_ret
    rec_ret --> fe_render

    %% Col 3
    chat_n8n --> chat_llm
    chat_llm --> chat_ret
    chat_ret --> fe_render

    %% Col 4
    book_rtdb --> book_n8n
    book_n8n --> book_mail
    book_mail --> fe_render

    %% Col 5
    sync_listener --> sync_rebuild
    sync_rebuild --> sync_lock
    sync_lock -->|RAM Sync| fe_render

    fe_render --> finish

    %% Link styles
    linkStyle 1,6,7,8 stroke:#38BDF8,stroke-width:2px;   %% Flight (Blue)
    linkStyle 2,9,10,11 stroke:#818CF8,stroke-width:2px;  %% Recommend (Indigo)
    linkStyle 3,12,13,14 stroke:#FB923C,stroke-width:2px;  %% Chat (Orange)
    linkStyle 4,15,16,17 stroke:#10B981,stroke-width:2px;  %% Booking (Green)
    linkStyle 5,18,19,20 stroke:#EC4899,stroke-width:2px;  %% Sync (Pink)
```"""
    print("\n--- ARCHITECTURE FLOWCHART MERMAID CODE BLOCK ---")
    print(mermaid)
    print("-------------------------------------------------\n")

if __name__ == "__main__":
    generate_architecture_flowchart_drawio()
    print_mermaid_code()
