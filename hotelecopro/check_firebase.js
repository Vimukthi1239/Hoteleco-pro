import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, get } from "firebase/database";
import * as dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  databaseurl: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

get(ref(db, "destinations")).then((snap) => {
    console.log("Destinations exists?", snap.exists());
    if (snap.exists()) {
        console.log("Data count:", Object.keys(snap.val()).length);
    }
}).catch(console.error);
