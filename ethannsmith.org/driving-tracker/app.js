
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {

/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyDZjXZtfqEscgVBYOYDZS-vRwxBuXuVsbQ",
  authDomain: "email-list-83dfb.firebaseapp.com",
  projectId: "email-list-83dfb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tripRef = doc(db, "trips", "currentTrip");

/* =========================
   STATE
========================= */

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
   MAP (FIXED)
========================= */

const map = L.map("map", {
    zoomControl: true
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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

/* 🔥 FIX: force map to render correctly after layout loads */
setTimeout(() => {
    map.invalidateSize();
}, 300);

/* =========================
   UI
========================= */

function updateFuel() {
    const mpg = Number(el("mpg")?.value);
    const gallons = el("gallons");

    if (!mpg || mpg <= 0 || !gallons) return;

    gallons.textContent = (totalMiles / mpg).toFixed(2);
}

function updateUI() {

    const speedEl = el("speed");
    const maxEl = el("maxSpeed");
    const distEl = el("distance");

    if (speedEl) speedEl.textContent = currentSpeed.toFixed(1) + " mph";
    if (maxEl) maxEl.textContent = maxSpeed.toFixed(1) + " mph";
    if (distEl) distEl.textContent = totalMiles.toFixed(2) + " mi";

    updateFuel();
}

/* =========================
   STATUS
========================= */

function updateTrackerStatus() {
    const status = el("trackerStatus");
    if (!status) return;

    if (trackingDevice === deviceId && isTracking) {
        status.innerHTML = "🚗 Tracking Active";
        status.style.color = "#34c759";
    } else {
        status.innerHTML = "👁 Viewer Mode";
        status.style.color = "#fff";
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
    if (!(trackingDevice === deviceId && isTracking) && path.length > 0) {

        const last = path[path.length - 1];
        const point = L.latLng(last.lat, last.lng);

        if (!userMarker) {
            userMarker = L.marker(point, { icon: blueDot }).addTo(map);
        } else {
            userMarker.setLatLng(point);
        }

        map.panTo(point);
    }

    updateTrackerStatus();
    updateUI();
});

/* =========================
   SAVE
========================= */

async function saveTrip() {

    if (!(trackingDevice === deviceId && isTracking)) return;

    const now = Date.now();
    if (now - lastSave < 2500) return;
    lastSave = now;

    const mpg = Number(el("mpg")?.value || 25);

    await setDoc(tripRef, {
        trackingDevice,
        distance: totalMiles,
        currentSpeed,
        maxSpeed,
        gallonsUsed: totalMiles / mpg,
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

    // ALWAYS show marker (fixes blank map feeling)
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

    // DRIVER ONLY
    if (trackingDevice === deviceId && isTracking) {

        path.push({ lat, lng });

        routeLine.setLatLngs(path.map(p => [p.lat, p.lng]));

        if (previousPoint) {
            const meters = point.distanceTo(previousPoint);
            if (meters > 2) {
                totalMiles += meters * 0.000621371;
            }
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

    updateTrackerStatus();
});

el("stopTrip")?.addEventListener("click", async () => {

    isTracking = false;
    trackingDevice = null;

    await setDoc(tripRef, {
        trackingDevice: null
    }, { merge: true });

    updateTrackerStatus();
});

el("resetTrip")?.addEventListener("click", async () => {

    totalMiles = 0;
    maxSpeed = 0;
    path = [];

    routeLine.setLatLngs([]);

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
   DASHBOARD
========================= */

const dashboard = document.querySelector(".dashboard");
const toggleBtn = el("toggleDashboard");

let collapsed = false;

toggleBtn?.addEventListener("click", () => {
    collapsed = !collapsed;
    dashboard?.classList.toggle("collapsed", collapsed);

    setTimeout(() => {
        map.invalidateSize(); // 🔥 IMPORTANT when UI changes
    }, 200);
});

/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

});
