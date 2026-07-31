# Hoteleco-Pro: System Architecture, Design & Implementation Report (A to Z)

මෙම ලේඛනය මඟින් **Hoteleco-Pro** ව්‍යාපෘතියේ (Final Year Project - FYP) සමස්ත තාක්ෂණික ව්‍යුහය, මෘදුකාංග ගෘහ නිර්මාණ ශිල්පය (Software Architecture), දත්ත සමුදාය (Database Schema), ස්වයංක්‍රීයකරණය (Workflows) සහ ක්‍රියාත්මක කිරීමේ ක්‍රියාවලිය පිළිබඳව සම්පූර්ණ (A to Z) විස්තරාත්මක විශ්ලේෂණයක් සපයයි.

---

## 1. Executive Summary & Overview (ව්‍යාපෘති හැඳින්වීම)

**Hoteleco-Pro** යනු ශ්‍රී ලංකාවේ පාරිසරික සංචාරක කර්මාන්තය (Eco-Tourism) ප්‍රවර්ධනය කිරීම සහ සංචාරකයින්ට මෙන්ම හෝටල් හිමියන්ට කාර්යක්ෂම සේවාවක් සැපයීම සඳහා නිර්මාණය කරන ලද නවීන, දෙමුහුන් (Hybrid) වෙබ් යෙදුමකි (Web Application).

### ප්‍රධාන අරමුණු (Key Objectives):
* **Sustainable Eco-Tourism:** පාරිසරික හිතකාමී සංචාරක ස්ථාන සහ හෝටල් ප්‍රවර්ධනය කිරීම.
* **Geospatial Recommendation Engine:** හෝටල් වලට ආසන්නතම සංචාරක ස්ථාන සහ සංචාරක ස්ථාන වලට ආසන්නතම හෝටල් භූගෝලීය ඛණ්ඩාංක (Coordinates) මත පදනම්ව නිර්දේශ කිරීම.
* **Automated Travel Planner:** පරිශීලකයාගේ මනාප (Nights, travel style, vehicle) අනුව ගුවන් ගමන්, හෝටල් වෙන්කිරීම් සහ ප්‍රවාහන ගාස්තු ගණනය කරන බුද්ධිමත් සැලසුම්කරුවෙකු (PickATrip Wizard) සැපයීම.
* **Serverless Operations & Automation:** n8n.io සහ Firebase හරහා සාම්ප්‍රදායික Backend Servers මඟහැර ක්‍රියාවලි ස්වයංක්‍රීය කිරීම.

---

## 2. High-Level System Architecture (පද්ධති ගෘහ නිර්මාණ ශිල්පය)

Hoteleco-Pro පද්ධතිය ප්‍රධාන ස්ථර 3ක් මත පදනම්ව **Client-Server Model** සහ **Serverless Architecture** දෙමුහුන්ව (Hybrid) භාවිතා කරයි. 

```mermaid
graph TD
    %% Presentation Layer
    subgraph Client Layer (React Frontend)
        A[React 19 SPA] <-->|Real-time DB Sync| B[(Firebase Realtime DB)]
        A -->|1. Local Intents Resolved| C[Local NLP Intent Engine]
        A <-->|2. Advanced Queries| D[EcoBot Chatbot Component]
    end

    %% Integration & Logic Layer
    subgraph Backend & Logic Layer
        E[FastAPI Python Backend] <-->|Sync Local Data| F[(Local CSV Data)]
        E <-->|Real-time Listener| G[(Firebase Firestore)]
        E <-->|Flight Query API| H[Amadeus Global API / Simulator]
        
        I[n8n Automation Engine] <-->|Chatbot Webhook| D
        I <-->|LLM API Call| J[OpenAI / Claude LLM]
        I -->|Booking Confirmation| K[SMTP Email Server]
        I -->|Financial Sync| L[Google Sheets / Excel]
    end

    %% Performance and flow paths
    A <-->|HTTP REST Requests / ML| E
    B <-->|Real-time sync stream| G
    I <-->|Payment Confirmations| B
```

### පද්ධති ක්‍රියාකාරී ස්ථර (System Layers):

1. **Presentation Layer (React 19 Frontend):**
   * පරිශීලකයාට අලංකාර UI එකක් ලබා දෙන අතර Mapbox GL සහ Leaflet සිතියම් හරහා දත්ත පෙන්වයි.
   * i18next භාවිතයෙන් භාෂා 8ක සහය (Multi-language) දක්වයි.
2. **Computational Backend (FastAPI Python Backend):**
   * Scikit-Learn BallTree ඇල්ගොරිතමය භාවිතයෙන් ආසන්නතම ස්ථාන නිර්දේශ කරයි (K-Nearest Neighbors).
   * ගුවන් ගමන් සෙවීම සහ ගමන් වියදම් ගණනය කරයි.
3. **Storage & Integration Layer (Firebase & n8n.io):**
   * Auth, Firestore, සහ Realtime Database ලෙස Google Firebase ක්‍රියා කරයි.
   * Workflows, Emails, සහ Chatbot integrations n8n.io මඟින් සිදු කරයි.

---

## 3. Frontend Architecture (ඉදිරිපස සැකසුම)

Frontend එක සම්පූර්ණයෙන්ම React 19 සහ Vanilla CSS භාවිතයෙන් තනි පිටුවක් (Single Page Application - SPA) ලෙස සකසා ඇත.

### 3.1 Tech Stack & UI Libraries
* **Framework:** React 19 (JavaScript ES6+)
* **Styling:** Premium Dark & Light UI UX themes සහිත Vanilla CSS.
* **Routing:** බාහිර රවුටර (React Router) වෙනුවට State-based routing ක්‍රමයක් (`App.js` හි `page` state එක හරහා) භාවිතා කරයි.
* **Maps & Geolocation:**
  * **Mapbox GL** (`mapbox-gl`, `react-map-gl`) - අධි-විභේදන 3D සිතියම් සහ ගමන් මාර්ග (Itinerary Routes) පෙන්වීමට.
  * **Leaflet** - හෝටල් සහ සංචාරක ස්ථාන සිතියම් ගත කිරීම සඳහා.
* **Multi-language Support:** `i18next` සහ `react-i18next` මඟින් භාෂා 8ක් සපයයි:
  * 🇬🇧 English, 🇱🇰 සිංහල, 🇨🇳 中文, 🇮🇳 हिन्दी, 🇯🇵 日本語, 🇷🇺 Русский, 🇩🇪 Deutsch, 🇫🇷 Français

### 3.2 Main Pages & Components
පද්ධතියේ ප්‍රධාන පිටු (`src/pages/`) සහ සංරචක (`src/components/`) ව්‍යුහය පහත පරිදි වේ:

| Page / Component | File Path | Description |
| :--- | :--- | :--- |
| **HomePage** | `src/pages/HomePage.jsx` | ප්‍රධාන මුල් පිටුව. PickATrip wizard එකට පිවිසුම් බොත්තම ඇතුළත් වේ. |
| **TripPlannerWizard** | `src/pages/TripPlannerWizard.jsx` | PickATrip travel planner wizard එක. ගුවන් ගමන්, හෝටල් සහ ප්‍රවාහන ගාස්තු ගණනය කරයි. |
| **ItineraryPage** | `src/pages/ItineraryPage.jsx` | දිනෙන් දින සංචාරක සැලැස්ම (Day-by-day Itinerary) සිතියමක් සමඟ පෙන්වන පිටුව. |
| **MapPage** | `src/pages/MapPage.jsx` | Mapbox GL හරහා හෝටල් සහ සංචාරක ස්ථාන සිතියමක සලකුණු කර පෙන්වන පිටුව. |
| **DestinationsPage** | `src/pages/DestinationsPage.jsx` | සංචාරක ස්ථාන ලැයිස්තුව සහ ML Recommendations පෙන්වන පිටුව. |
| **DestinationProfile** | `src/pages/DestinationProfile.jsx` | තෝරාගත් ස්ථානයක විස්තර සහ ආසන්නතම හෝටල් 5 ML මඟින් පෙන්වන පිටුව. |
| **HotelsPage** | `src/pages/HotelsPage.jsx` | පද්ධතියේ ලියාපදිංචි හෝටල් ලැයිස්තුව. |
| **HotelProfile** | `src/pages/HotelProfile.jsx` | හෝටලයක කාමර, මිල ගණන් සහ ආසන්නතම සංචාරක ස්ථාන පෙන්වන පිටුව. |
| **HotelDashboard** | `src/pages/HotelDashboard.jsx` | හෝටල් හිමියන්ට වෙන්කිරීම් (Bookings) සහ මූල්‍ය දත්ත (Analytics) කළමනාකරණය කිරීමට ඇති ඩෑෂ්බෝඩ් එක. |
| **AdminDashboard** | `src/pages/AdminDashboard.jsx` | පද්ධති පරිපාලක සඳහා වන ප්‍රධාන පාලක පැනලය. |
| **CustomerAuthPage** | `src/pages/CustomerAuthPage.jsx` | සංචාරකයින් සඳහා Sign-in/Sign-up ද්වාරය. |
| **AIChatBot Component** | `src/components/AIChatBot.jsx` | n8n AI Chatbot (EcoBot) සහ Local Intent Engine එක Frontend එකට සම්බන්ධ කරන component එක. |

---

## 4. Backend API & Machine Learning Engine (FastAPI & ML)

පද්ධතියේ ප්‍රධාන ගණනය කිරීම් සහ Machine Learning නිර්දේශයන් සිදු කරන්නේ **FastAPI Python Backend** එක මඟිනි (`main.py`).

### 4.1 Recommendation Algorithm (Haversine BallTree)
සංචාරක ස්ථාන සහ හෝටල් අතර ආසන්නතම පිහිටීම ගණනය කිරීම සඳහා **Scikit-Learn** හි **BallTree** ඇල්ගොරිතමය භාවිතා කරයි. මෙහිදී සාම්ප්‍රදායික Euclidean දුර වෙනුවට පෘථිවියේ වක්‍රතාවය සැලකිල්ලට ගන්නා **Haversine Metric** එක භාවිතා කරයි.

$$\text{Distance} = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

```python
def build_tree(df: pd.DataFrame) -> Optional[BallTree]:
    if df.empty:
        return None
    coords = np.radians(df[["Latitude", "Longitude"]].values)
    return BallTree(coords, metric="haversine")
```

### 4.2 Backend API Endpoints
FastAPI backend එක මඟින් පහත සඳහන් API සේවාවන් සපයයි:

* **`GET /status` (Health Check):** පද්ධතියේ දත්ත ප්‍රමාණය, Firebase සම්බන්ධතාවය සහ BallTree indexes වල සක්‍රීයතාවය පෙන්වයි.
* **`GET /recommend/hotels?site_name=Galle&top_k=5`:** යම් සංචාරක ස්ථානයකට ආසන්නතම හෝටල් 5 (Latitude/Longitude අනුව) නිර්දේශ කරයි.
* **`GET /recommend/sites?hotel_name=Heritance&top_k=5`:** යම් හෝටලයකට ආසන්නතම සංචාරක ස්ථාන නිර්දේශ කරයි.
* **`POST /add/hotel` & `POST /add/site`:** නව හෝටල්/ස්ථාන index එකට එකතු කිරීම සහ CSV ගොනුවට ලිවීම.
* **`GET /api/airports?country=LK`:** රටක කේතය අනුව `airports.csv` ගොනුවෙන් ගුවන්තොටුපළ ලැයිස්තුව ලබා දේ.
* **`GET /api/flights/search`:** Amadeus Global Flight API හරහා ගුවන් ගමන් ගාස්තු ලබා දේ (නොබැඳි අවස්ථාවන්හිදී Simulated Fallback එකක් ක්‍රියාත්මක වේ).
* **`POST /api/trip/calculate`:** තෝරාගත් වාහන වර්ගය (tuk-tuk, sedan, suv, luxury-van) සහ රැඳී සිටින දින ගණන අනුව ප්‍රවාහන ගාස්තු, රියදුරු ගාස්තු සහ මුළු සංචාරක පිරිවැය ගණනය කරයි.

### 4.3 Thread-Safety Strategy
FastAPI backend එකෙහි දත්ත ලිවීම් (Write Operations) සහ කියවීම් (Read Operations) සිදුවන විට දත්ත අතර ගැටුම් (Race Conditions) මඟහැරීම සඳහා `threading.RLock()` (Re-entrant Lock) භාවිතා කර ඇත.

---

## 5. Database Architecture (දත්ත සමුදාය)

Hoteleco-Pro පද්ධතිය **Firebase Realtime Database** සහ **Cloud Firestore** යන දත්ත සමුදායන් දෙකම භාවිතා කරයි.

### 5.1 Realtime Database Schema (JSON Node Structure)
Realtime database එකෙහි දත්ත ගබඩා වන ආකාරය පහත පරිදි වේ:

```json
{
  "bookings": {
    "-OK78xYt...": {
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "hotelName": "Ella Jungle Resort",
      "checkin": "2026-08-01",
      "checkout": "2026-08-05",
      "totalPrice": 480.00,
      "status": "confirmed",
      "createdAt": "2026-07-23T10:52:32Z"
    }
  },
  "customerProfiles": {
    "UID_12345": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "nationality": "US",
      "role": "customer"
    }
  },
  "hotelRegistrations": {
    "-OK82yZw...": {
      "hotelName": "Ella Jungle Resort",
      "email": "manager@ellajungle.com",
      "district": "Badulla",
      "status": "approved"
    }
  },
  "hotelMetrics": {
    "hotel_id_123": {
      "2026-07-23": {
        "revenue": 1200.00,
        "bookings": 3,
        "occupancy": 80.00
      }
    }
  }
}
```

### 5.2 Firebase Hybrid Pipeline (Real-time Cloud Sync)
FastAPI backend එක ධාවනය වන විට, Firebase Firestore හි ඇති `destinations` collection එක සමඟ සම්බන්ධ වීමට **Real-time Listener** එකක් භාවිතා කරයි.
* Firestore හි යම් දත්තයක් වෙනස් වූ සැනින්, FastAPI backend එකෙහි පසුබිම් thread එකක් (Background Worker Thread) මඟින් BallTree index එක තත්පර කිහිපයක් ඇතුළත ස්වයංක්‍රීයව නැවත ගොඩනගයි (Async Index Rebuild).

---

## 6. Automations & Workflows (n8n.io Integration)

ව්‍යාපෘතියේ විශේෂතම අංගයක් වන්නේ සාම්ප්‍රදායික Backend එකක් වෙනුවට **n8n.io Automation Engine** එක භාවිතා කර ක්‍රියාවලි ස්වයංක්‍රීය කිරීමයි.

### 6.1 Workflow 1: Real-time Booking & Email Automation
1. පරිශීලකයා `BookingPage.jsx` හරහා booking එකක් සිදු කරයි.
2. React app එකෙන් n8n webhook එකකට (`POST /booking-trigger`) දත්ත යවයි.
3. n8n workflow එක මඟින්:
   * Google Sheets වෙත අදාළ booking දත්ත ඇතුළත් කරයි (Append Row).
   * Gmail/SMTP node එක හරහා පාරිභෝගිකයාට සහ හෝටල් හිමියාට ස්වයංක්‍රීයව අලංකාර Eco- stay confirmation ඊමේල් යවයි.

### 6.2 Workflow 2: Climate & Seasonal Marketing Advisor
1. n8n හි ඇති Cron Trigger එක මඟින් සෑම දිනකම උදෑසන 8.00 ට අවදි වේ.
2. OpenWeatherMap API එක හරහා අදාළ හෝටලය පිහිටි ප්‍රදේශයේ කාලගුණ තොරතුරු ලබා ගනී.
3. **IF Conditional Node** එකක් මඟින්:
   * **වැසි සහිත නම්:** හෝටල් හිමියාට ආයුර්වේද සහ ගෘහස්ථ පැකේජ ප්‍රවර්ධනය කිරීමට (Ayurvedic/Indoor Packages marketing tips) Slack/Email හරහා උපදෙස් යවයි.
   * **පායන කාලගුණය නම්:** එළිමහන් සංචාර සහ ක්‍රියාකාරකම් (Outdoor activities, Beach tours) ප්‍රවර්ධනය කිරීමට උපදෙස් යවයි.

### 6.3 Workflow 3: Monthly Financial Report Generation
1. සෑම මසකම 1 වනදා n8n cron trigger එක ක්‍රියාත්මක වේ.
2. Firebase Database එකෙන් හෝටලයේ මාසික metrics ලබා ගනී.
3. HTML-to-PDF Converter API එකක් හරහා මූල්‍ය විශ්ලේෂණ PDF වාර්තාවක් සාදයි.
4. Gmail node එක මඟින් එම PDF වාර්තාව හෝටල් හිමියාගේ විද්‍යුත් තැපෑලට ඇමුණුමක් (Attachment) ලෙස යවනු ලබයි.

---

## 7. Intelligent Hybrid Chatbot Strategy (ද්විත්ව චැට්බොට් ක්‍රමය)

Hoteleco-Pro හි චැට්බොට් ක්‍රියාකාරීත්වය කොටස් දෙකකින් සමන්විත වේ:

1. **Local NLP Intent Engine (`chatEngine.js`):**
   * බාහිර API පිරිවැය (API Costs) ඉතිරි කර ගැනීමට සහ ක්ෂණික පිළිතුරු සැපයීමට භාවිතා වේ.
   * පරිශීලකයාගේ යෙදවුම (Input string) වචන වලට කඩා (Tokenize) රටා (Patterns) සමඟ සසඳා ලකුණු ලබා දේ (Scoring).
   * උදා: පරිශීලකයා "how to book" ලෙස ඇසුවහොත්, පද්ධතිය ස්වයංක්‍රීයව booking page එකට navigate කර suggest chips පෙන්වයි.
2. **n8n AI EcoBot:**
   * පද්ධතියට අදාළ නැති පොදු ප්‍රශ්න හෝ සංකීර්ණ සංචාරක තොරතුරු විමසන විට, එම පණිවිඩ n8n webhook හරහා OpenAI / Claude LLM වෙත යවා පිළිතුරු ලබා ගනී.

---

## 8. Dockerization & Deployment (ධාවනය කිරීම සහ ස්ථාපනය)

Hoteleco-Pro ව්‍යාපෘතිය පහසුවෙන් කුමන පරිගණකයක වුවද ධාවනය කිරීම සඳහා **Docker** සහ **Docker Compose** භාවිතා කර ඇත.

### 8.1 Docker Compose Configuration
`docker-compose.yml` ගොනුව මඟින් සේවා දෙකක් ධාවනය කරයි:
* **`backend` (FastAPI Python):** Dockerfile එකක් හරහා python 3.10-slim රූපය (image) මත ගොඩනැගෙන අතර 8000 වරාය (Port 8000) හරහා සන්නිවේදනය කරයි.
* **`frontend` (React 19 & Nginx):** Node environment එකක් තුළ React app එක build කර, පසුව සැහැල්ලු Nginx container එකක් හරහා Port 80 (HTTP) ඔස්සේ සේවා සපයයි.

---

## 9. Quickstart Guide (ව්‍යාපෘතිය ක්‍රියාත්මක කිරීමට උපදෙස්)

### 9.1 Backend ධාවනය කිරීම
```bash
# 1. Python virtual environment එකක් සාදා ගන්න
python -m venv .venv
.venv\Scripts\activate

# 2. අවශ්‍ය packages install කරගන්න
pip install -r requirements.txt

# 3. Uvicorn server එක ක්‍රියාත්මක කරන්න
python main.py
```
*Backend API එක `http://localhost:8000` ඔස්සේ සක්‍රීය වේ. API docs නැරඹීමට `http://localhost:8000/docs` වෙත පිවිසෙන්න.*

### 9.2 Frontend ධාවනය කිරීම
```bash
cd hotelecopro

# 1. Packages install කරගන්න
npm install --legacy-peer-deps

# 2. Local environment environment setup කරන්න
# (.env ගොනුව සාදා Firebase config එකතු කරන්න)

# 3. React server එක ධාවනය කරන්න
npm start
```
*Frontend එක `http://localhost:3000` ඔස්සේ සක්‍රීය වේ.*

### 9.3 Docker Compose හරහා සම්පූර්ණ පද්ධතියම ධාවනය කිරීම
```bash
docker-compose up --build
```
*මෙමඟින් Backend සහ Frontend සේවා දෙකම එකවර ක්‍රියාත්මක කරනු ලබයි.*

---

**වාර්තාවේ අවසානය (End of Report)**  
Hoteleco-Pro ව්‍යාපෘතිය යනු React, FastAPI, Firebase සහ n8n automation යන නවීන තාක්ෂණයන් ඉතා සාර්ථකව ඒකාබද්ධ කර නිර්මාණය කරන ලද උසස් මට්ටමේ මෘදුකාංග පද්ධතියකි.
