// ─────────────────────────────────────────────────────────────
//  src/data/firebase.js
//  Firebase initialisation + Realtime Database & Auth helpers
// ─────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  get,
  onValue,
  query,
  orderByChild,
} from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// ── Config ────────────────────────────────────────────────────
// Values are loaded from .env  (REACT_APP_FIREBASE_*)
// Never commit .env to version control – it is listed in .gitignore
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// ── Init ──────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// ─────────────────────────────────────────────────────────────
//  BOOKINGS  (/bookings)
// ─────────────────────────────────────────────────────────────

/**
 * Save a guest booking to /bookings
 * Fields: name, email, phone, checkin, checkout, guests, room,
 *         nationality, special, hotel, hotelId, district,
 *         nights, totalPrice, roomRate
 * @returns {Promise<string>} the new Firebase key
 */
export async function saveBooking(data) {
  const bookingsRef = ref(db, "bookings");
  const snapshot = await push(bookingsRef, {
    ...data,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  });
  return snapshot.key;
}

/**
 * Fetch a single booking by key
 * @param {string} id  Firebase push key
 * @returns {Promise<Object|null>}
 */
export async function getBooking(id) {
  const snap = await get(ref(db, `bookings/${id}`));
  return snap.exists() ? { id: snap.key, ...snap.val() } : null;
}

/**
 * Update the status of a booking (e.g. "confirmed" | "cancelled")
 * @param {string} id
 * @param {string} status
 */
export function updateBookingStatus(id, status) {
  return update(ref(db, `bookings/${id}`), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Permanently delete a booking record
 * @param {string} id  Firebase push key
 */
export function deleteBooking(id) {
  return remove(ref(db, `bookings/${id}`));
}

/**
 * Real-time listener for all bookings (newest first)
 * @param {Function} callback  receives Array<booking>
 * @returns {Function} unsubscribe
 */
export function listenBookings(callback) {
  const q = query(ref(db, "bookings"), orderByChild("createdAt"));
  return onValue(q, (snap) => {
    const data = [];
    snap.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
    callback(data.reverse());
  });
}

// ─────────────────────────────────────────────────────────────
//  HOTEL REGISTRATIONS  (/hotelRegistrations)
// ─────────────────────────────────────────────────────────────

/**
 * Save a hotel registration to /hotelRegistrations
 * Fields: hotelName, email, contact, district, type
 * Initial status: "pending"
 * @returns {Promise<string>} the new Firebase key
 */
export async function saveHotelRegistration(data) {
  const regRef = ref(db, "hotelRegistrations");
  const snapshot = await push(regRef, {
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  return snapshot.key;
}

/**
 * Update a hotel registration's status
 * @param {string} id     Firebase push key
 * @param {string} status "pending" | "approved" | "rejected"
 */
export function updateHotelRegistrationStatus(id, status) {
  return update(ref(db, `hotelRegistrations/${id}`), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a hotel registration
 * @param {string} id  Firebase push key
 */
export function deleteHotelRegistration(id) {
  return remove(ref(db, `hotelRegistrations/${id}`));
}

/**
 * Real-time listener for all hotel registrations (newest first)
 * @param {Function} callback  receives Array<registration>
 * @returns {Function} unsubscribe
 */
export function listenHotelRegistrations(callback) {
  const q = query(ref(db, "hotelRegistrations"), orderByChild("createdAt"));
  return onValue(q, (snap) => {
    const data = [];
    snap.forEach((child) => { data.push({ id: child.key, ...child.val() }); });
    callback(data.reverse());
  });
}

// ─────────────────────────────────────────────────────────────
//  CONTACT MESSAGES  (/contactMessages)
// ─────────────────────────────────────────────────────────────

/**
 * Save a contact message to /contactMessages
 * Fields: name, email, subject, message, type
 * @returns {Promise<string>} the new Firebase key
 */
export async function saveContactMessage(data) {
  const msgRef = ref(db, "contactMessages");
  const snapshot = await push(msgRef, {
    ...data,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  return snapshot.key;
}

/**
 * Mark a contact message as read
 * @param {string} id  Firebase push key
 */
export function markMessageRead(id) {
  return update(ref(db, `contactMessages/${id}`), {
    isRead: true,
    readAt: new Date().toISOString(),
  });
}

/**
 * Delete a contact message
 * @param {string} id  Firebase push key
 */
export function deleteContactMessage(id) {
  return remove(ref(db, `contactMessages/${id}`));
}

/**
 * Real-time listener for all contact messages (newest first)
 * @param {Function} callback  receives Array<message>
 * @returns {Function} unsubscribe
 */
export function listenContactMessages(callback) {
  const q = query(ref(db, "contactMessages"), orderByChild("createdAt"));
  return onValue(q, (snap) => {
    const data = [];
    snap.forEach((child) => { data.push({ id: child.key, ...child.val() }); });
    callback(data.reverse());
  });
}

// ─────────────────────────────────────────────────────────────
//  FIREBASE AUTHENTICATION
// ─────────────────────────────────────────────────────────────

/** Sign in a hotel partner with email + password */
export function loginHotel(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Create a new hotel partner account */
export function registerHotelAuth(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/** Sign out the current user */
export function logoutHotel() {
  return signOut(auth);
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback  receives Firebase User | null
 * @returns {Function} unsubscribe
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─────────────────────────────────────────────────────────────
//  HOTEL PROFILE  (find registration record by email)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch the hotel registration record for a given email.
 * Returns the first matching record (the hotel partner's own profile).
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export async function getHotelProfile(email) {
  const q = query(ref(db, "hotelRegistrations"), orderByChild("email"));
  const snap = await get(q);
  if (!snap.exists()) return null;
  let profile = null;
  snap.forEach((child) => {
    if (child.val().email === email) {
      profile = { id: child.key, ...child.val() };
    }
  });
  return profile;
}

// ─────────────────────────────────────────────────────────────
//  HOTEL-SCOPED BOOKINGS  (/bookings filtered by hotelName)
// ─────────────────────────────────────────────────────────────

/**
 * Real-time listener for bookings belonging to a specific hotel.
 * Matches on the `hotel` field (hotelName string).
 * @param {string} hotelName
 * @param {Function} callback  receives Array<booking>
 * @returns {Function} unsubscribe
 */
export function listenHotelBookings(hotelName, callback) {
  const q = query(ref(db, "bookings"), orderByChild("createdAt"));
  return onValue(q, (snap) => {
    const data = [];
    snap.forEach((child) => {
      const val = child.val();
      if (val.hotel === hotelName) {
        data.push({ id: child.key, ...val });
      }
    });
    callback(data.reverse());
  });
}

// ─────────────────────────────────────────────────────────────
//  HOTEL REVIEWS  (/hotelReviews/{hotelId})
// ─────────────────────────────────────────────────────────────

/**
 * Save a customer review for a hotel
 * Fields: name, country, rating, text
 * @returns {Promise<string>} the new Firebase key
 */
export async function saveHotelReview(hotelId, data) {
  const reviewsRef = ref(db, `hotelReviews/${hotelId}`);
  const snapshot = await push(reviewsRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return snapshot.key;
}

/**
 * Real-time listener for hotel reviews (newest first)
 * @param {string} hotelId
 * @param {Function} callback  receives Array<review>
 * @returns {Function} unsubscribe
 */
export function listenHotelReviews(hotelId, callback) {
  const q = query(ref(db, `hotelReviews/${hotelId}`), orderByChild("createdAt"));
  return onValue(q, (snap) => {
    const data = [];
    snap.forEach((child) => { data.push({ id: child.key, ...child.val() }); });
    callback(data.reverse());
  });
}

// ─────────────────────────────────────────────────────────────
//  HOTEL METRICS  (/hotelMetrics/{hotelId}/YYYY-MM-DD)
// ─────────────────────────────────────────────────────────────

/**
 * Write (merge) daily metrics for a hotel.
 * @param {string} hotelId  Firebase push key of the hotelRegistration
 * @param {string} date     "YYYY-MM-DD"
 * @param {object} data     { revenue, bookings, occupancy }
 */
export function saveHotelMetrics(hotelId, date, data) {
  return update(ref(db, `hotelMetrics/${hotelId}/${date}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Real-time listener for all daily metrics of a hotel.
 * @param {string} hotelId
 * @param {Function} callback  receives Array<{date, revenue, bookings, occupancy}>
 * @returns {Function} unsubscribe
 */
export function listenHotelMetrics(hotelId, callback) {
  return onValue(ref(db, `hotelMetrics/${hotelId}`), (snap) => {
    const data = [];
    if (snap.exists()) {
      snap.forEach((child) => {
        data.push({ date: child.key, ...child.val() });
      });
    }
    callback(data.sort((a, b) => a.date.localeCompare(b.date)));
  });
}


// ─────────────────────────────────────────────────────────────
//  HOTEL CUSTOM PROFILE  (/hotelProfiles/{hotelId})
// ─────────────────────────────────────────────────────────────

/**
 * Write the hotel's customizable profile data.
 * Fields: photoUrl, description, packages (array), offers (array)
 * @param {string} hotelId  Firebase push key of the hotelRegistration
 * @param {object} data     Profile fields to merge
 */
export function updateHotelProfile(hotelId, data) {
  return update(ref(db, `hotelProfiles/${hotelId}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Real-time listener for a hotel's custom profile.
 * @param {string} hotelId
 * @param {Function} callback  receives profile object or null
 * @returns {Function} unsubscribe
 */
export function listenHotelProfile(hotelId, callback) {
  return onValue(ref(db, `hotelProfiles/${hotelId}`), (snap) => {
    callback(snap.exists() ? snap.val() : null);
  });
}

/**
 * Real-time listener for ALL hotel profiles.
 * @param {Function} callback  receives an object mapping hotelId to profile
 * @returns {Function} unsubscribe
 */
export function listenAllHotelProfiles(callback) {
  return onValue(ref(db, "hotelProfiles"), (snap) => {
    callback(snap.exists() ? snap.val() : {});
  });
}

/**
 * Add a single daily metric record for manual historical data entry.
 * @param {string} hotelId  Firebase push key
 * @param {string} date     "YYYY-MM-DD"
 * @param {object} data     { revenue, bookings, occupancy }
 */
export function saveHotelDailyMetric(hotelId, date, data) {
  return set(ref(db, `hotelMetrics/${hotelId}/${date}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a single daily metric record.
 * @param {string} hotelId  Firebase push key
 * @param {string} date     "YYYY-MM-DD"
 */
export function deleteHotelDailyMetric(hotelId, date) {
  return remove(ref(db, `hotelMetrics/${hotelId}/${date}`));
}
// ─────────────────────────────────────────────────────────────
//  DESTINATIONS  (/destinations)
// ─────────────────────────────────────────────────────────────

/**
 * Save a destination to /destinations
 * @returns {Promise<string>} the new Firebase key
 */
export async function saveDestination(data) {
  const destRef = ref(db, "destinations");
  const snapshot = await push(destRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return snapshot.key;
}

/**
 * Real-time listener for all destinations (newest first)
 * @param {Function} callback  receives Array<destination>
 * @returns {Function} unsubscribe
 */
export function listenDestinations(callback) {
  const q = query(ref(db, "destinations"), orderByChild("createdAt"));
  return onValue(q, (snap) => {
    const data = [];
    snap.forEach((child) => { data.push({ id: child.key, ...child.val() }); });
    callback(data.reverse());
  });
}

// ─────────────────────────────────────────────────────────────
//  DESTINATION REVIEWS  (/destinationReviews/{destName})
// ─────────────────────────────────────────────────────────────

/**
 * Save a customer review for a destination
 * Fields: name, country, rating, text
 * @returns {Promise<string>} the new Firebase key
 */
export async function saveDestinationReview(destName, data) {
  const safeName = encodeURIComponent(destName).replace(/\./g, '%2E');
  const reviewsRef = ref(db, `destinationReviews/${safeName}`);
  const snapshot = await push(reviewsRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return snapshot.key;
}

/**
 * Real-time listener for destination reviews (newest first)
 * @param {string} destName
 * @param {Function} callback  receives Array<review>
 * @returns {Function} unsubscribe
 */
export function listenDestinationReviews(destName, callback) {
  const safeName = encodeURIComponent(destName).replace(/\./g, '%2E');
  const q = query(ref(db, `destinationReviews/${safeName}`), orderByChild("createdAt"));
  return onValue(q, (snap) => {
    const data = [];
    snap.forEach((child) => { data.push({ id: child.key, ...child.val() }); });
    callback(data.reverse());
  });
}
