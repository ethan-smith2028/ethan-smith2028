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
   CONFIG (FILL THIS IN)
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

/* =========================
   INIT FIREBASE
========================= */

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

/* =========================
   SPEED ALERT STATE
========================= */

let lastSpeedAlert = 0;

/* =========================
   MAP
========================= */

const map = L.map("map");

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
}).addTo(map);

/* =========================
   BLUE DOT ICON
========================= */

const blueDot = L.divIcon({
    className: "blue-dot",
    iconSize: [18, 18]
});

/* =========================
   STATE
========================= */

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
   UI HELPERS
========================= */

function updateFuel() {

    const mpg =
        Number(document.getElementById("mpg").value);

    if (!mpg || mpg <= 0) return;

    document.getElementById("gallons").textContent =
        (totalMiles / mpg).toFixed(2);
}

function updateUI() {

    document.getElementById("distance").textContent =
        totalMiles.toFixed(2) + " mi";

    document.getElementById("speed").textContent =
        currentSpeed.toFixed(1) + " mph";

    document.getElementById("maxSpeed").textContent =
        maxSpeed.toFixed(1) + " mph";

    updateFuel();
}

function updateTrackerStatus() {

    const el = document.getElementById("trackerStatus");

    if (trackingDevice === deviceId) {

        el.innerHTML =
            `<i class="fa-solid fa-satellite-dish"></i> Tracking Active`;

        el.style.color = "#34c759";

    } else {

        el.innerHTML =
            `<i class="fa-solid fa-eye"></i> Viewer Mode`;

        el.style.color = "#fff";
    }
}

/* =========================
   SAVE (THROTTLED)
========================= */

let lastSave = 0;

async function saveTrip() {

    if (trackingDevice !== deviceId || !isTracking) return;

    const now = Date.now();

    if (now - lastSave < 3000) return;

    lastSave = now;

    const mpg =
        Number(document.getElementById("mpg").value) || 25;

    await setDoc(tripRef, {
        distance: totalMiles,
        maxSpeed,
        gallonsUsed: totalMiles / mpg,
        route: path,
        trackingDevice,
        updatedAt: now
    }, { merge: true });
}

/* =========================
   FIREBASE SYNC
========================= */

onSnapshot(tripRef, (snap) => {

    if (!snap.exists()) return;

    const data = snap.data();

    trackingDevice = data.trackingDevice || null;

    totalMiles = data.distance || 0;
    maxSpeed = data.maxSpeed || 0;
    path = data.route || [];
    currentSpeed =
    data.currentSpeed || 0;

    routeLine.setLatLngs(path);

    updateTrackerStatus();
    updateUI();
});

/* =========================
   GPS TRACKING
========================= */

navigator.geolocation.watchPosition(
    (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const point = L.latLng(lat, lng);

        /* marker */
        if (!userMarker) {
            userMarker = L.marker(point, { icon: blueDot }).addTo(map);
        } else {
            userMarker.setLatLng(point);
        }

        if (firstFix) {
            map.setView(point, 17);
            firstFix = false;
        } else {
            map.panTo(point, { animate: true, duration: 0.5 });
        }

        /* ONLY DRIVER WRITES DATA */
        if (trackingDevice === deviceId && isTracking) {

            path.push([lat, lng]);
            routeLine.setLatLngs(path);

            /* distance */
            if (previousPoint) {
                const meters = point.distanceTo(previousPoint);

                if (meters > 2) {
                    totalMiles += meters * 0.000621371;
                }
            }

            previousPoint = point;

            /* speed */
            let speed = pos.coords.speed;

            if (speed !== null) {

                speed *= 2.23694;

currentSpeed = speed;

document.getElementById("speed").textContent =
    currentSpeed.toFixed(1) + " mph";

                if (currentSpeed > maxSpeed) {
                    maxSpeed = currentSpeed;
                }

                /* SPEED ALERT */
                const limit =
                    Number(document.getElementById("speedLimit")?.value) || 65;

                const now = Date.now();

                if (speed > limit + 10 && now - lastSpeedAlert > 5000) {

                    lastSpeedAlert = now;

                    alert(`⚠️ Overspeed: ${speed.toFixed(1)} mph`);

                    if (navigator.vibrate) {
                        navigator.vibrate([200, 100, 200]);
                    }
                }
            }

            updateUI();
            saveTrip();
        }
    },
    (err) => console.error(err),
    {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    }
);

/* =========================
   START TRIP
========================= */

document.getElementById("startTrip")
.addEventListener("click", async () => {

    isTracking = true;

    // Activate reload protection
    window.addEventListener(
        "beforeunload",
        beforeUnloadHandler
    );

    await setDoc(tripRef, {
    distance: totalMiles,
    currentSpeed,
    maxSpeed,
    gallonsUsed: totalMiles / mpg,
    route: path,
    trackingDevice,
    updatedAt: now
}, { merge: true });

    alert("Tracking started. Page is now locked.");
});

/* =========================
   STOP TRIP
========================= */

document.getElementById("stopTrip")
.addEventListener("click", async () => {

    isTracking = false;

    // Remove reload protection
    window.removeEventListener(
        "beforeunload",
        beforeUnloadHandler
    );

    await setDoc(tripRef, {
        trackingDevice: null
    }, { merge: true });

    alert("Tracking stopped. Page unlocked.");
});

/* =========================
   RESET TRIP (GLOBAL)
========================= */

document.getElementById("resetTrip").addEventListener("click", async () => {

    if (!confirm("Reset trip for ALL devices?")) return;

    totalMiles = 0;
    maxSpeed = 0;
    path = [];
    previousPoint = null;

    routeLine.setLatLngs([]);

    await setDoc(tripRef, {
        distance: 0,
        maxSpeed: 0,
        gallonsUsed: 0,
        route: [],
        updatedAt: Date.now()
    }, { merge: true });

    updateUI();
});

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // You can show a custom install button here
    console.log("PWA install available");
});

function installApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
    });
}

const dashboard =
    document.querySelector(".dashboard");

const toggleBtn =
    document.getElementById("toggleDashboard");

let isCollapsed = false;

toggleBtn.addEventListener("click", () => {

    isCollapsed = !isCollapsed;

    dashboard.classList.toggle(
        "collapsed",
        isCollapsed
    );

    toggleBtn.innerHTML = isCollapsed
        ? "☰"
        : "✕";
});

/* =========================
   MPG CHANGE
========================= */

document.getElementById("mpg").addEventListener("input", () => {
    updateFuel();
    saveTrip();
});

function beforeUnloadHandler(e) {

    // Standard browser behavior requirement
    e.preventDefault();
    e.returnValue =
        "Tracking is active. Are you sure you want to leave?";
}

/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}
