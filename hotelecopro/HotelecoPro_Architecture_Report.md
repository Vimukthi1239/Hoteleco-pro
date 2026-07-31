# Hoteleco-pro: Software Architecture & Project Analysis (A to Z)

මෙම වාර්තාව මගින් Hoteleco-pro ව්‍යාපෘතියේ මෘදුකාංග ගෘහ නිර්මාණ ශිල්පය (Software Architecture), Frontend සහ Backend පිළිබඳව සම්පූර්ණ (A to Z) විශ්ලේෂණයක් සපයයි. ඔබට මෙය copy කරගෙන ඔබගේ documentation සඳහා භාවිතා කළ හැක.

---

## 1. High-Level Software Architecture (මෘදුකාංග ගෘහ නිර්මාණ ශිල්පය)

Hoteleco-pro යනු **Serverless Architecture** සහ **Client-Server Model** මත පදනම් වූ නවීන වෙබ් යෙදුමකි (Web Application). මෙහි ප්‍රධාන වශයෙන් Backend-as-a-Service (BaaS) ලෙස **Firebase** භාවිතා කරන අතර, Frontend එක සම්පූර්ණයෙන්ම **React.js** මත ගොඩනගා ඇත. 

### ප්‍රධාන ලක්ෂණ (Key Architectural Patterns):
* **Single Page Application (SPA):** React මගින් සම්පූර්ණ වෙබ් අඩවියම එකම page එකක් (Single Page) ලෙස load වන අතර, components මාරු වීම හරහා (state-based routing) පිටු අතර ගමන් කිරීම (Navigation) සිදු කරයි.
* **Microservices & Automation Integration:** සාම්ප්‍රදායික Backend එකක් වෙනුවට Firebase සහ **n8n.io** වැනි automation tools භාවිතා කර ඇත (විශේෂයෙන් AI Chatbot සහ Email Automations සඳහා).
* **Real-time Data Sync:** Firebase Realtime Database හරහා දත්ත තත්‍ය කාලීනව (Real-time) යාවත්කාලීන වේ (උදා: Bookings, Hotel Metrics).

---

## 2. Frontend Architecture (ඉදිරිපස සැකසුම)

Frontend එක සම්පූර්ණයෙන්ම ගොඩනගා ඇත්තේ **React 19** සහ **JavaScript (ES6+)** භාවිතා කරමිනි.

### 2.1. තාක්ෂණික තොරතුරු (Tech Stack)
* **Core Framework:** React (React Scripts/Create React App)
* **Styling (CSS):** Vanilla CSS සහ Inline styling භාවිතා කර ඇත. අලංකාර නිමාවක් සඳහා Google Fonts (`Outfit`, `Playfair Display`) භාවිතා කර ඇත.
* **State Management:** සාම්ප්‍රදායික Redux වෙනුවට React Hooks (`useState`, `useEffect`) හරහා state කළමනාකරණය කරයි.
* **Routing:** බාහිර React Router වෙනුවට `App.js` හි custom state-based routing (`const [page, setPage] = useState("home")`) ක්‍රමයක් භාවිතා කර ඇත.
* **Maps & Geolocation:** සිතියම් පෙන්වීම සඳහා **Mapbox GL** (`mapbox-gl`, `react-map-gl`) සහ **Leaflet** භාවිතා කර ඇත.
* **Multi-language Support (i18n):** `i18next` සහ `react-i18next` හරහා ඉංග්‍රීසි, සිංහල වැනි භාෂා කිහිපයකට සහය දක්වයි.

### 2.2. ප්‍රධාන Components සහ Pages (Key Structure)
* **Pages (`src/pages/`):**
  * `HomePage.jsx` - ප්‍රධාන මුල් පිටුව.
  * `MapPage.jsx` - හෝටල් සහ ගමනාන්ත සිතියම් ගත කිරීමේ පිටුව (Mapbox හරහා).
  * `BookingPage.jsx` - පරිශීලකයින්ට හෝටල් වෙන්කරවා ගැනීමේ පිටුව.
  * `AdminDashboard.jsx` & `HotelDashboard.jsx` - පරිපාලක සහ හෝටල් හිමියන් සඳහා වූ පාලක පැනල.
  * `DestinationsPage.jsx`, `HotelsPage.jsx` - සංචාරක ස්ථාන සහ හෝටල් ලැයිස්තුගත කරන පිටු.
* **Components (`src/components/`):**
  * `Navbar.jsx`, `Footer.jsx` - වෙබ් අඩවියේ ප්‍රධාන Navigation සහ Footer.
  * `AIChatBot.jsx` - n8n AI Chatbot එක Frontend එකට සම්බන්ධ කරන component එක.
  * `MLRecommendations.jsx` - පරිශීලකයින්ට ගැලපෙන යෝජනා (Recommendations) ලබා දීමේ විශේෂාංගය.

---

## 3. Backend Architecture & Database (පසුපස සැකසුම සහ දත්ත සමුදාය)

සාම්ප්‍රදායික Node.js/Python server එකක් වෙනුවට, මෙහි Backend එක සම්පූර්ණයෙන්ම මෙහෙයවන්නේ **Google Firebase** සහ **n8n Automation** හරහාය.

### 3.1. Database (Firebase Realtime Database)
දත්ත ගබඩා කිරීම සඳහා Firebase Realtime Database භාවිතා කර ඇති අතර, එහි දත්ත ව්‍යුහය (Data Schema) පහත පරිදි වේ (`database.rules.json` අනුව):
* `destinations`: සංචාරක ස්ථාන වල විස්තර ගබඩා කරයි.
* `bookings`: හෝටල් වෙන්කරවා ගැනීමේ දත්ත (Hotel Bookings).
* `hotelRegistrations` / `hotelProfiles`: හෝටල් හිමියන්ගේ ලියාපදිංචි කිරීම් සහ ඔවුන්ගේ ප්‍රොෆයිල් දත්ත.
* `contactMessages`: පරිශීලකයින් විසින් යවන පණිවිඩ.
* `hotelMetrics`: හෝටල් වල ක්‍රියාකාරීත්ව දත්ත (Metrics).
* `hotelReviews` / `destinationReviews`: හෝටල් සහ ගමනාන්ත පිළිබඳ පාරිභෝගික සමාලෝචන (Reviews).

### 3.2. Security Rules (ආරක්ෂාව)
Firebase Rules හරහා දත්ත ආරක්ෂාව තහවුරු කර ඇත. උදාහරණයක් ලෙස:
* `destinations` ඕනෑම කෙනෙකුට කියවිය හැක (`.read: true`).
* `bookings` සහ `hotelMetrics` කියවිය හැක්කේ ලොග් වී ඇති (Authenticated) පරිශීලකයින්ට පමණි (`.read: "auth != null"`).

### 3.3. AI සහ Automations (n8n Integration)
ව්‍යාපෘතියේ විශේෂතම අංගයක් වන්නේ බාහිර Backend API එකක් ලෙස **n8n** භාවිතා කිරීමයි.
* **AI Chatbot (EcoBot):** පරිශීලකයාගේ පණිවිඩ (Messages) Frontend හි `AIChatBot.jsx` සිට n8n webhook එකකට යවනු ලබයි. n8n හි ඇති LLM (Large Language Model) හරහා පිළිතුරු සකසා නැවත Frontend එකට ලබා දෙයි.
* **Email Automation:** හෝටලයක් Booking එකක් කළ විට, එය n8n workflow එකක් හරහා හඳුනාගෙන, පාරිභෝගිකයාට සහ හෝටල් හිමියාට ස්වයංක්‍රීයව ඊමේල් (Automated Emails) යැවීම සිදු කරයි.

---

## 4. පද්ධතියේ ක්‍රියාකාරී ගැලීම (System Data Flow Workflow)

1. **User Interaction:** පරිශීලකයා වෙබ් අඩවියට පිවිස (React Frontend) හෝටල් හෝ ගමනාන්ත සොයයි.
2. **Data Fetching:** Frontend එක මගින් Firebase Realtime Database එකෙන් අදාළ දත්ත ලබාගෙන තිරයේ පෙන්වයි.
3. **Map Rendering:** MapPage එකට ගිය විට, Firebase හි ඇති දත්ත වල ඛණ්ඩාංක (Coordinates) භාවිතා කර Mapbox GL හරහා සිතියම නිර්මාණය කරයි.
4. **Booking Process:** පරිශීලකයා Booking එකක් සිදු කළ විට, එම දත්ත Firebase හි `bookings` node එකට එක් වේ. සමගාමීව n8n webhook එකක් trigger වී අදාළ ඊමේල් යවනු ලැබේ.
5. **AI Chatbot Support:** පරිශීලකයාට ප්‍රශ්නයක් ඇත්නම්, Chatbot එක හරහා විමසූ විට, එම ඉල්ලීම n8n හරහා AI වෙත ගොස් ක්ෂණික පිළිතුරු ලබා දේ.

---

**සාරාංශය:**
Hoteleco-pro යනු ඉතා කාර්යක්ෂම, Server-less තාක්ෂණයෙන් යුත් ව්‍යාපෘතියකි. React මගින් අලංකාර සහ වේගවත් Frontend එකක් ලබා දෙන අතර, Firebase හරහා ආරක්ෂිතව දත්ත කළමනාකරණය කරයි. n8n භාවිතය මගින් AI සහ Automations ඉතා පහසුවෙන් පද්ධතියට සම්බන්ධ කර ඇත.
