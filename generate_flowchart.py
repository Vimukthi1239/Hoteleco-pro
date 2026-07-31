import os
import xml.etree.ElementTree as ET

def generate_drawio_xml():
    # --- Style Presets with Vibrant Gradients & Shadows ---
    STYLE_CAPSULE = "rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=#0F172A;gradientColor=#064E3B;strokeColor=#10B981;strokeWidth=2.5;fontColor=#FFFFFF;fontStyle=1;fontSize=12;shadow=1;"
    STYLE_CLIENT = "rounded=1;whiteSpace=wrap;html=1;arcSize=12;fillColor=#1E293B;gradientColor=#0B1329;strokeColor=#38BDF8;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    STYLE_FASTAPI = "rounded=1;whiteSpace=wrap;html=1;arcSize=12;fillColor=#1E293B;gradientColor=#064E3B;strokeColor=#34D399;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    STYLE_DECISION = "rhombus;whiteSpace=wrap;html=1;fillColor=#1E293B;gradientColor=#78350F;strokeColor=#FBBF24;strokeWidth=2;fontColor=#FFFFFF;fontSize=10.5;shadow=1;"
    STYLE_DATABASE = "shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=15;whiteSpace=wrap;html=1;fillColor=#1E293B;gradientColor=#1E1B4B;strokeColor=#818CF8;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    STYLE_N8N = "rounded=1;whiteSpace=wrap;html=1;arcSize=12;fillColor=#1E293B;gradientColor=#7C2D12;strokeColor=#FB923C;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    STYLE_EXTERNAL = "rounded=1;whiteSpace=wrap;html=1;arcSize=12;fillColor=#1E293B;gradientColor=#701A75;strokeColor=#EC4899;strokeWidth=2;fontColor=#FFFFFF;fontSize=11;shadow=1;"
    
    # --- Background Container Group Style ---
    STYLE_GROUP = "rounded=1;whiteSpace=wrap;html=1;fillColor=#080E1A;strokeColor=#334155;strokeWidth=1.5;dashed=1;dashPattern=8 8;align=center;verticalAlign=top;fontColor=#94A3B8;fontStyle=1;fontSize=12.5;spacingTop=10;shadow=0;"

    # --- Edge / Arrow Styles (Color-Coded Paths) ---
    EDGE_MAIN = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#10B981;strokeWidth=2;fontColor=#10B981;fontSize=9.5;"
    EDGE_FLIGHT = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#38BDF8;strokeWidth=2;fontColor=#38BDF8;fontSize=9.5;"
    EDGE_RECOMMEND = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#818CF8;strokeWidth=2;fontColor=#818CF8;fontSize=9.5;"
    EDGE_CHAT = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#FB923C;strokeWidth=2;fontColor=#FB923C;fontSize=9.5;"
    EDGE_SYNC = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#EC4899;strokeWidth=2;fontColor=#EC4899;fontSize=9.5;"
    EDGE_NEUTRAL = "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#64748B;strokeWidth=1.5;fontColor=#94A3B8;fontSize=9.5;"

    # Create XML Structure
    mxfile = ET.Element("mxfile", host="Electron", modified="2026-07-19T00:00:00.000Z", agent="5.0", version="20.0.0", type="device")
    diagram = ET.SubElement(mxfile, "diagram", id="diagram_1", name="Hoteleco-Pro Full Workflow")
    mxGraphModel = ET.SubElement(diagram, "mxGraphModel", dx="1200", dy="1200", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="1180", pageHeight="1450", math="0", shadow="0")
    root = ET.SubElement(mxGraphModel, "root")
    
    # Base cells
    ET.SubElement(root, "mxCell", id="0")
    ET.SubElement(root, "mxCell", id="1", parent="0")

    # --- Draw Bounding Swimlane Groups First (for lower z-order / background rendering) ---
    groups = [
        ("g_planning", "PHASE 1: ITINERARY PLANNING & RECOMMENDATIONS SYSTEM", STYLE_GROUP, 20, 20, 830, 610),
        ("g_booking", "PHASE 2: SECURE BOOKING & EMAIL WORKFLOW AUTOMATIONS", STYLE_GROUP, 330, 650, 310, 420),
        ("g_chat", "INTEGRATED ECOBOT CHAT COMPLETIONS (n8n & LLM)", STYLE_GROUP, 880, 160, 240, 370),
        ("g_sync", "CLOUD FIREBASE REALTIME SYNC & MEMORY CACHE INDEX BUILDER", STYLE_GROUP, 880, 650, 240, 330)
    ]
    for g_id, label, style, x, y, w, h in groups:
        cell = ET.SubElement(root, "mxCell", id=g_id, value=label, style=style, vertex="1", parent="1")
        ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(w), height=str(h), **{"as": "geometry"})

    # --- Vertices catalog: (id, label, style, x, y, w, h) ---
    vertices = [
        # Main Flow (x ~ 380 - 580)
        ("start", "Start: User Visits\nHoteleco-Pro SPA Client", STYLE_CAPSULE, 390, 50, 190, 50),
        ("lang_switch", "Select Language\n(i18n support, 8 languages)", STYLE_CLIENT, 395, 120, 180, 50),
        ("pick_trip", "Open PickATrip Wizard\n& Enter travel preferences\n(style, nights, vehicle)", STYLE_CLIENT, 380, 200, 210, 60),
        
        # Flight Booking Branch (Left, x ~ 100 - 300)
        ("flight_search", "API Call to FastAPI\n/api/flights/search", STYLE_FASTAPI, 130, 285, 180, 50),
        ("check_amadeus", "Amadeus API\ncredentials active?", STYLE_DECISION, 120, 360, 200, 70),
        ("call_amadeus", "Fetch live ticket prices\nvia Amadeus API", STYLE_EXTERNAL, 40, 460, 160, 50),
        ("call_sim", "Fetch simulated ticket\nfallback data (BIA/CMB)", STYLE_FASTAPI, 240, 460, 160, 50),
        ("select_flight", "User selects flight offer\nand returns to wizard", STYLE_CLIENT, 140, 540, 160, 50),

        # Recommendation & Cost Branch (Right, x ~ 630 - 830)
        ("trip_calc", "API Call to FastAPI\n/api/trip/calculate", STYLE_FASTAPI, 640, 285, 180, 50),
        ("knn_query", "Query BallTree index\nfor nearest sites from BIA", STYLE_FASTAPI, 630, 360, 200, 55),
        ("return_itinerary", "Return itinerary,\nhotel recommendations & cost", STYLE_CLIENT, 630, 440, 200, 50),
        ("view_details", "User views detailed profile\n(Hotel or Tourist Site)", STYLE_CLIENT, 630, 520, 200, 50),
        ("knn_profile", "Query hotel_tree or dest_tree\nfor dynamic relative metrics", STYLE_FASTAPI, 620, 595, 220, 55),

        # Re-merge to Booking Flow (Phase 2, x ~ 350 - 600)
        ("make_booking", "Confirm Booking details\n& complete payment", STYLE_CLIENT, 385, 680, 200, 50),
        ("write_rtdb", "Write Booking info to\nFirebase Realtime Database", STYLE_DATABASE, 375, 760, 220, 60),
        ("trigger_webhook", "Firebase DB Update\ntriggers n8n Webhook", STYLE_N8N, 395, 850, 180, 50),
        ("send_emails", "n8n Workflow executes:\nSends SMTP emails to\nCustomer & Hotel Owner", STYLE_N8N, 375, 930, 220, 60),
        ("end", "End: Itinerary Booked\n& Confirmation Sent", STYLE_CAPSULE, 385, 1010, 200, 50),

        # AI Chatbot Flow (Swimlane Right, x ~ 910)
        ("chat_input", "User types message\nin EcoBot Floating Chat", STYLE_CLIENT, 910, 200, 180, 55),
        ("call_n8n_chat", "Send message payload\nto n8n Chat Webhook", STYLE_N8N, 910, 285, 180, 50),
        ("query_llm", "Query OpenAI/LLM API\nfor contextual answer", STYLE_EXTERNAL, 910, 365, 180, 50),
        ("r_chat", "Return chatbot answer\nto React Frontend client", STYLE_CLIENT, 910, 445, 180, 50),

        # Background Sync Flow (Swimlane Left, x ~ 910 / y ~ 650)
        ("firestore_listener", "Firestore destinations\nchange detected", STYLE_DATABASE, 910, 680, 180, 50),
        ("merge_csv", "Merge cloud updates with\nlocal CSVs in memory", STYLE_FASTAPI, 910, 755, 180, 50),
        ("bg_rebuild", "Spawn worker thread\nto rebuild BallTree index", STYLE_FASTAPI, 890, 830, 220, 55),
        ("swap_pointer", "Swap memory pointers\nthread-safely via lock", STYLE_FASTAPI, 900, 910, 200, 50)
    ]

    # Add vertices to root
    for v_id, label, style, x, y, w, h in vertices:
        cell = ET.SubElement(root, "mxCell", id=v_id, value=label, style=style, vertex="1", parent="1")
        ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(w), height=str(h), **{"as": "geometry"})

    # --- Edges Catalog with Color-Coded Routing ---
    edges = [
        # Main Flow (Green / Neutral)
        ("e_start_lang", "", "start", "lang_switch", EDGE_MAIN),
        ("e_lang_pick", "", "lang_switch", "pick_trip", EDGE_MAIN),
        
        # Branch to flight search and trip calculations
        ("e_pick_flight", "Flight Search Request", "pick_trip", "flight_search", EDGE_FLIGHT),
        ("e_pick_calc", "Proximity & Costs Path", "pick_trip", "trip_calc", EDGE_RECOMMEND),

        # Flight search internal branch (Blue)
        ("e_fl_check", "", "flight_search", "check_amadeus", EDGE_FLIGHT),
        ("e_check_yes", "Yes (Online)", "check_amadeus", "call_amadeus", EDGE_FLIGHT),
        ("e_check_no", "No (Simulated)", "check_amadeus", "call_sim", EDGE_FLIGHT),
        ("e_call_select", "", "call_amadeus", "select_flight", EDGE_FLIGHT),
        ("e_sim_select", "", "call_sim", "select_flight", EDGE_FLIGHT),
        ("e_select_booking", "", "select_flight", "make_booking", EDGE_FLIGHT),

        # Recommendations branch internal (Purple)
        ("e_calc_knn", "", "trip_calc", "knn_query", EDGE_RECOMMEND),
        ("e_knn_ret", "", "knn_query", "return_itinerary", EDGE_RECOMMEND),
        ("e_ret_view", "", "return_itinerary", "view_details", EDGE_RECOMMEND),
        ("e_view_knn", "", "view_details", "knn_profile", EDGE_RECOMMEND),
        ("e_profile_booking", "", "knn_profile", "make_booking", EDGE_RECOMMEND),

        # Booking to DB write & email sync (Green)
        ("e_booking_db", "", "make_booking", "write_rtdb", EDGE_MAIN),
        ("e_db_webhook", "", "write_rtdb", "trigger_webhook", EDGE_MAIN),
        ("e_webhook_email", "", "trigger_webhook", "send_emails", EDGE_MAIN),
        ("e_email_end", "", "send_emails", "end", EDGE_MAIN),

        # Chatbot Flow connections (Orange)
        ("e_chat_in_n8n", "", "chat_input", "call_n8n_chat", EDGE_CHAT),
        ("e_chat_n8n_llm", "", "call_n8n_chat", "query_llm", EDGE_CHAT),
        ("e_chat_llm_ret", "", "query_llm", "r_chat", EDGE_CHAT),
        ("e_chat_ret_loop", "User Loop", "r_chat", "chat_input", EDGE_CHAT),

        # Sync Flow connections (Pink)
        ("e_sync_start", "", "firestore_listener", "merge_csv", EDGE_SYNC),
        ("e_sync_rebuild", "", "merge_csv", "bg_rebuild", EDGE_SYNC),
        ("e_sync_swap", "", "bg_rebuild", "swap_pointer", EDGE_SYNC)
    ]

    # Add edges to root
    for e_id, label, source, target, edge_style in edges:
        cell = ET.SubElement(root, "mxCell", id=e_id, value=label, style=edge_style, edge="1", parent="1", source=source, target=target)
        ET.SubElement(cell, "mxGeometry", relative="1", **{"as": "geometry"})

    # Ensure target directory exists and save file
    os.makedirs("figures", exist_ok=True)
    drawio_path = "figures/hotelecopro_workflow.drawio"
    
    # Generate pretty formatted XML
    tree = ET.ElementTree(mxfile)
    ET.indent(tree, space="  ", level=0)
    tree.write(drawio_path, encoding="utf-8", xml_declaration=True)
    print(f"[OK] Premium Colorful Draw.io Flowchart XML successfully generated and saved to: {drawio_path}")

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

    %% Subgraph 1: User Itinerary Creation Flow
    subgraph Itinerary_Planning_Flow ["PHASE 1: ITINERARY PLANNING & RECOMMENDATIONS SYSTEM"]
        start([Start: User Visits Hoteleco-Pro SPA]):::start_end
        lang_switch[Select Language / i18n support]:::client
        pick_trip[Open PickATrip Wizard & Enter preferences]:::client
        
        %% Flight selection path
        flight_search[API Call /api/flights/search]:::api
        check_amadeus{Amadeus API credentials available?}:::decision
        call_amadeus[Fetch live ticket prices via Amadeus API]:::external
        call_sim[Fetch simulated flight ticket fallback data]:::api
        select_flight[User selects flight offer]:::client
        
        %% Recommendations path
        trip_calc[API Call /api/trip/calculate]:::api
        knn_query[Query BallTree index for nearest sites from BIA]:::api
        return_itinerary[Return itinerary, hotels & costs]:::client
        view_details[User views Detailed Profile page]:::client
        knn_profile[Query relative metrics from BallTree index]:::api
        
        start --> lang_switch
        lang_switch --> pick_trip
        
        pick_trip -->|Flight Search Request| flight_search
        pick_trip -->|Cost & Spots Calculation| trip_calc
        
        flight_search --> check_amadeus
        check_amadeus -->|Yes| call_amadeus
        check_amadeus -->|No / Offline| call_sim
        call_amadeus --> select_flight
        call_sim --> select_flight
        
        trip_calc --> knn_query
        knn_query --> return_itinerary
        return_itinerary --> view_details
        view_details --> knn_profile
    end

    %% Subgraph 2: Booking and Automation Flow
    subgraph Booking_and_Email_Automation ["PHASE 2: SECURE BOOKING & EMAIL WORKFLOW AUTOMATIONS"]
        make_booking[Confirm Booking & complete payment]:::client
        write_rtdb[(Write Booking info to Firebase RTDB)]:::database
        trigger_webhook[Firebase Update triggers n8n Webhook]:::n8n
        send_emails[n8n Sends SMTP Emails to Customer & Hotel Owner]:::n8n
        finish([End: Booking & Itinerary Finalized]):::start_end
        
        select_flight --> make_booking
        knn_profile --> make_booking
        make_booking --> write_rtdb
        write_rtdb --> trigger_webhook
        trigger_webhook --> send_emails
        send_emails --> finish
    end

    %% Subgraph 3: AI Chatbot (EcoBot) Flow
    subgraph EcoBot_Chat_Support ["INTEGRATED ECOBOT CHAT COMPLETIONS (n8n & LLM)"]
        chat_input[User types message in floating EcoBot UI]:::client
        call_n8n_chat[Send message payload to n8n Webhook]:::n8n
        query_llm[Query OpenAI/LLM API for reply]:::external
        r_chat[Return response back to React Frontend]:::client
        
        chat_input --> call_n8n_chat
        call_n8n_chat --> query_llm
        query_llm --> r_chat
        r_chat -->|Loop| chat_input
    end

    %% Subgraph 4: Background Sync & Index Rebuilding
    subgraph Background_Data_Sync ["CLOUD FIREBASE REALTIME SYNC & MEMORY CACHE INDEX BUILDER"]
        firestore_listener[(Firestore destinations change detected)]:::database
        merge_csv[Merge Firestore updates with local CSVs]:::api
        bg_rebuild[Spawn worker thread to rebuild BallTree index]:::api
        swap_pointer[Swap memory pointers thread-safely via lock]:::api
        
        firestore_listener --> merge_csv
        merge_csv --> bg_rebuild
        bg_rebuild --> swap_pointer
    end
    
    %% Link Styles for Visual Separation (Mermaid-specific)
    linkStyle 0,1,13,14,15,16 stroke:#10B981,stroke-width:2px; %% Green Main Paths
    linkStyle 2,5,6,7,8,9,10 stroke:#38BDF8,stroke-width:2px; %% Blue Flight Paths
    linkStyle 3,11,12,17,18 stroke:#818CF8,stroke-width:2px;  %% Indigo Recommendations Paths
    linkStyle 19,20,21,22 stroke:#FB923C,stroke-width:2px;    %% Orange Chat Paths
    linkStyle 23,24,25 stroke:#EC4899,stroke-width:2px;       %% Pink Background Sync Paths
```"""
    print("\n--- MERMAID CODE BLOCK ---")
    print(mermaid)
    print("--------------------------\n")

if __name__ == "__main__":
    generate_drawio_xml()
    print_mermaid_code()
