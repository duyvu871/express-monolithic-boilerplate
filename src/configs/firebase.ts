// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDvHmPGInar6EoAmZ7EmYZVpzvaQVW1MHI",
	authDomain: "connected-brain-storage.firebaseapp.com",
	projectId: "connected-brain-storage",
	storageBucket: "connected-brain-storage.appspot.com",
	messagingSenderId: "108237950424",
	appId: "1:108237950424:web:4be59f325708694660b6ad",
	measurementId: "G-XZ8FGHSF6Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export {app, storage};