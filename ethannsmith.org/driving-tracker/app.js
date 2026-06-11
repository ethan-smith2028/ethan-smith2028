
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {

const firebaseConfig = {
  apiKey: "AIzaSyDZjXZtfqEscgVBYOYDZS-vRwxBuXuVsbQ",
  authDomain: "email-list-83dfb.firebaseapp.com",
  projectId: "email-list-83dfb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tripRef = doc(db, "trips", "currentTrip");

const deviceId = crypto.randomUUID();

let trackingDevice = null;
let isTracking = false;

let currentSpeed = 0;
let maxSpeed = 0;
let totalMiles = 0;

let path = [];
let previousPoint = null;
let firstFix = true;

let lastSave = 0;
let lastSpeedAlert = 0;

const el = (id) => document.getElementById(id);

/* =========================
   MAP
========================= */

const map = L.map("map");

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
}).addTo(map);

const blueDot = L.divIcon({
    className: "blue-dot",
    iconSize: [18, 18]
});

let userMarker = null;

let routeLine = L.polyline([], {
    color: "#1a73e8",
    weight: 5,
    opacity: 0.9
}).addTo(map);

/* =========================
   ROLE
========================= */

const isDriver = () =>
    isTracking && trackingDevice === deviceId;

/* =========================
   UI
========================= */

function updateUI() {

    el("speed") && (el("speed").textContent = currentSpeed.toFixed(1) + " mph");
    el("maxSpeed") && (el("maxSpeed").textContent = maxSpeed.toFixed(1) + " mph");
    el("distance") && (el("distance").textContent = totalMiles.toFixed(2) + " mi");

    const mpg = Number(el("mpg")?.value || 25);
    if (el("gallons"))
        el("gallons").textContent = (totalMiles / mpg).toFixed(2);
}

function updateTrackerStatus() {

    const elStatus = el("trackerStatus");
    if (!elStatus) return;

    if (isDriver()) {
        elStatus.innerHTML = "🚗 Tracking Active";
        elStatus.style.color = "#34c759";
    } else {
        elStatus.innerHTML = "👁 Viewer Mode";
        elStatus.style.color = "#fff";
    }
}

/* =========================
   FIRESTORE SYNC
========================= */

onSnapshot(tripRef, (snap) => {

    if (!snap.exists()) return;

    const data = snap.data();

    trackingDevice = data.trackingDevice || null;
    totalMiles = data.distance || 0;
    maxSpeed = data.maxSpeed || 0;
    currentSpeed = data.currentSpeed || 0;

    path = Array.isArray(data.route) ? data.route : [];

    routeLine.setLatLngs(path.map(p => [p.lat, p.lng]));

    // viewer follows driver
    if (!isDriver() && path.length) {
        const last = path[path.length - 1];
        const point = L.latLng(last.lat, last.lng);

        if (!userMarker) {
            userMarker = L.marker(point, { icon: blueDot }).addTo(map);
        } else {
            userMarker.setLatLng(point);
        }
    }

    updateUI();
    updateTrackerStatus();
});

/* =========================
   SAVE
========================= */

async function saveTrip() {

    if (!isDriver()) return;

    const now = Date.now();
    if (now - lastSave < 2500) return;
    lastSave = now;

    await setDoc(tripRef, {
        trackingDevice,
        distance: totalMiles,
        currentSpeed,
        maxSpeed,
        route: path,
        updatedAt: now
    }, { merge: true });
}

/* =========================
   GPS
========================= */

navigator.geolocation.watchPosition((pos) => {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const point = L.latLng(lat, lng);

    if (isDriver()) {

        if (!userMarker) {
            userMarker = L.marker(point, { icon: blueDot }).addTo(map);
        } else {
            userMarker.setLatLng(point);
        }

        if (firstFix) {
            map.setView(point, 17);
            firstFix = false;
        } else {
            map.panTo(point);
        }

        path.push({ lat, lng });
        routeLine.setLatLngs(path.map(p => [p.lat, p.lng]));

        if (previousPoint) {
            const meters = point.distanceTo(previousPoint);
            if (meters > 2) totalMiles += meters * 0.000621371;
        }

        previousPoint = point;

        let speed = pos.coords.speed;

        if (speed !== null) {
            currentSpeed = speed * 2.23694;
            maxSpeed = Math.max(maxSpeed, currentSpeed);
        }

        updateUI();
        saveTrip();
    }

}, console.error, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
});

/* =========================
   BUTTONS
========================= */

el("startTrip")?.addEventListener("click", async () => {

    isTracking = true;
    trackingDevice = deviceId;

    await setDoc(tripRef, {
        trackingDevice: deviceId,
        updatedAt: Date.now()
    }, { merge: true });

});

el("stopTrip")?.addEventListener("click", async () => {

    isTracking = false;

    await setDoc(tripRef, {
        trackingDevice: null
    }, { merge: true });
});

el("resetTrip")?.addEventListener("click", async () => {

    totalMiles = 0;
    maxSpeed = 0;
    path = [];

    await setDoc(tripRef, {
        distance: 0,
        maxSpeed: 0,
        route: [],
        updatedAt: Date.now()
    }, { merge: true });

    updateUI();
});

/* =========================
   MPG
========================= */

el("mpg")?.addEventListener("input", updateUI);

/* =========================
   SW
========================= */

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

});
