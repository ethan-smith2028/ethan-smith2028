/* =========================
   FIREBASE IMPORTS
========================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

/* =========================
   INIT APP AFTER DOM LOAD
========================= */

window.addEventListener("DOMContentLoaded", init);

function init() {

/* =========================
   CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyDZjXZtfqEscgVBYOYDZS-vRwxBuXuVsbQ",
  authDomain: "email-list-83dfb.firebaseapp.com",
  databaseURL: "https://email-list-83dfb-default-rtdb.firebaseio.com",
  projectId: "email-list-83dfb",
  storageBucket: "email-list-83dfb.firebasestorage.app",
  messagingSenderId: "471452404510",
  appId: "1:471452404510:web:e91752174f6f0000c1570f",
  measurementId: "G-3X5TK2WYBF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tripRef = doc(db, "trips", "currentTrip");

/* =========================
   DEVICE / STATE
========================= */

const deviceId = crypto.randomUUID();

let trackingDevice = null;
let isTracking = false;
let currentSpeed = 0;

let lastSpeedAlert = 0;

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

let path = [];
let totalMiles = 0;
let maxSpeed = 0;
let previousPoint = null;
let firstFix = true;

/* =========================
   SAFE ELEMENT GETTER
========================= */

function el(id) {
    return document.getElementById(id);
}

/* =========================
   UI
========================= */

function updateFuel() {
    const mpgEl = el("mpg");
    const gallonsEl = el("gallons");

    if (!mpgEl || !gallonsEl) return;

    const mpg = Number(mpgEl.value);
    if (!mpg || mpg <= 0) return;

    gallonsEl.textContent = (totalMiles / mpg).toFixed(2);
}

function updateUI() {

    const speedEl = el("speed");
    const maxSpeedEl = el("maxSpeed");
    const distanceEl = el("distance");

    if (speedEl) speedEl.textContent = currentSpeed.toFixed(1) + " mph";
    if (maxSpeedEl) maxSpeedEl.textContent = maxSpeed.toFixed(1) + " mph";
    if (distanceEl) distanceEl.textContent = totalMiles.toFixed(2) + " mi";

    updateFuel();
}

function updateTrackerStatus() {
    const elStatus = el("trackerStatus");
    if (!elStatus) return;

    if (trackingDevice === deviceId) {
        elStatus.innerHTML =
            `<i class="fa-solid fa-satellite-dish"></i> Tracking Active`;
        elStatus.style.color = "#34c759";
    } else {
        elStatus.innerHTML =
            `<i class="fa-solid fa-eye"></i> Viewer Mode`;
        elStatus.style.color = "#fff";
    }
}

/* =========================
   SAVE
========================= */

let lastSave = 0;

async function saveTrip() {

    if (trackingDevice !== deviceId || !isTracking) return;

    const now = Date.now();
    if (now - lastSave < 3000) return;
    lastSave = now;

    const mpg = Number(el("mpg")?.value) || 25;

    try {
        await setDoc(tripRef, {
            distance: totalMiles,
            currentSpeed,
            maxSpeed,
            gallonsUsed: totalMiles / mpg,
            route: path,
            trackingDevice,
            updatedAt: now
        }, { merge: true });

    } catch (err) {
        console.error("Firestore save failed:", err);
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
    path = data.route || [];
    currentSpeed = data.currentSpeed || 0;

    routeLine.setLatLngs(path);

    updateTrackerStatus();
    updateUI();
});

/* =========================
   GPS
========================= */

navigator.geolocation.watchPosition((pos) => {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const point = L.latLng(lat, lng);

    if (!userMarker) {
        userMarker = L.marker(point, { icon: blueDot }).addTo(map);
    } else {
        userMarker.setLatLng(point);
    }

    if (firstFix) {
        map.setView(point, 17);
        firstFix = false;
    } else {
        map.panTo(point, { animate: true });
    }

    if (trackingDevice === deviceId && isTracking) {

        path.push([lat, lng]);
        routeLine.setLatLngs(path);

        if (previousPoint) {
            const meters = point.distanceTo(previousPoint);
            if (meters > 2) totalMiles += meters * 0.000621371;
        }

        previousPoint = point;

        let speed = pos.coords.speed;

        if (speed !== null) {
            speed *= 2.23694;
            currentSpeed = speed;

            if (speed > maxSpeed) maxSpeed = speed;

            const limit = Number(el("speedLimit")?.value) || 65;
            const now = Date.now();

            if (speed > limit + 10 && now - lastSpeedAlert > 5000) {
                lastSpeedAlert = now;
                alert(`⚠️ Overspeed: ${speed.toFixed(1)} mph`);
                navigator.vibrate?.([200, 100, 200]);
            }
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
   BUTTONS (SAFE)
========================= */

el("startTrip")?.addEventListener("click", async () => {

    isTracking = true;
    trackingDevice = deviceId;

    const mpg = Number(el("mpg")?.value) || 25;
    const now = Date.now();

    await setDoc(tripRef, {
        trackingDevice: deviceId,
        updatedAt: now
    }, { merge: true });

    updateTrackerStatus();
    alert("Tracking started.");
});

el("stopTrip")?.addEventListener("click", async () => {

    isTracking = false;
    trackingDevice = null;

    await setDoc(tripRef, {
        trackingDevice: null
    }, { merge: true });

    alert("Tracking stopped.");
});

el("resetTrip")?.addEventListener("click", async () => {

    if (!confirm("Reset trip for ALL devices?")) return;

    totalMiles = 0;
    maxSpeed = 0;
    path = [];
    previousPoint = null;

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

el("mpg")?.addEventListener("input", () => {
    updateFuel();
    saveTrip();
});

/* =========================
   DASHBOARD
========================= */

const dashboard = document.querySelector(".dashboard");
const toggleBtn = el("toggleDashboard");

let isCollapsed = false;

toggleBtn?.addEventListener("click", () => {
    isCollapsed = !isCollapsed;
    dashboard?.classList.toggle("collapsed", isCollapsed);
    if (toggleBtn) toggleBtn.innerHTML = isCollapsed ? "☰" : "✕";
});

/* =========================
   PWA
========================= */

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

window.installApp = function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => deferredPrompt = null);
};

/* =========================
   SW
========================= */

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

}
