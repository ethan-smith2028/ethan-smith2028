/* ==========================================
   Valley Catholic Uniform Closet
   script.js
   Part 1
========================================== */

// Buttons
const donateBtn = document.getElementById("donateBtn");
const pickupBtn = document.getElementById("pickupBtn");
const homeBtn = document.getElementById("homeBtn");

// Sections
const hero = document.getElementById("hero");
const mainContent = document.getElementById("mainContent");

const donatePage = document.getElementById("donatePage");
const pickupPage = document.getElementById("pickupPage");

// ------------------------------------------
// Navigation
// ------------------------------------------

donateBtn.addEventListener("click", () => {

    hero.style.display = "none";

    mainContent.style.display = "block";

    donatePage.classList.add("active");

    pickupPage.classList.remove("active");

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

    if(!donateLoaded){
        initDonateViewer();
        donateLoaded = true;
    }

});

pickupBtn.addEventListener("click", () => {

    hero.style.display = "none";

    mainContent.style.display = "block";

    pickupPage.classList.add("active");

    donatePage.classList.remove("active");

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

    if(!pickupLoaded){
        initPickupViewer();
        pickupLoaded = true;
    }

});

homeBtn.addEventListener("click", () => {

    mainContent.style.display = "none";

    hero.style.display = "flex";

    donatePage.classList.remove("active");

    pickupPage.classList.remove("active");

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

});

// ------------------------------------------
// Viewer Status
// ------------------------------------------

let donateLoaded = false;
let pickupLoaded = false;

//Floating Icons//
/* ==========================
   Animated Clothing Background
========================== */

const floatingContainer =
document.querySelector(".floating-icons");

const clothingIcons = [

"fa-shirt",
"fa-shirt",
"fa-shirt",
"fa-shirt",

"fa-person-dress",

"fa-socks",

"fa-shoe-prints",

"fa-bag-shopping"

];

function spawnClothing(){

    const piece =
    document.createElement("i");

    piece.className =
    "fa-solid " +
    clothingIcons[
        Math.floor(
            Math.random()*clothingIcons.length
        )
    ];

    piece.classList.add("floating-item");

    piece.style.left =
    Math.random()*100 + "vw";

    piece.style.top =
    Math.random()*100 + "vh";

    piece.style.fontSize =
    (20 + Math.random()*60) + "px";

    piece.style.opacity =
    0.05 + Math.random()*0.18;

    piece.style.animationDuration =
    (12 + Math.random()*18) + "s";

    piece.style.animationDelay =
    (-Math.random()*25) + "s";

    floatingContainer.appendChild(piece);

}

for(let i=0;i<100;i++){

    spawnClothing();

}

// ------------------------------------------
// Generic Viewer Creator
// ------------------------------------------

function createViewer(containerId){

    const container = document.getElementById(containerId);

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xeaf1fb);

    const camera = new THREE.PerspectiveCamera(

        45,

        container.clientWidth /
        container.clientHeight,

        0.1,

        1000

    );

    camera.position.set(0,60,120);

    const renderer = new THREE.WebGLRenderer({

        antialias:true

    });

    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(

        container.clientWidth,

        container.clientHeight

    );

    container.appendChild(renderer.domElement);

    // Orbit Controls

    const controls = new THREE.OrbitControls(

        camera,

        renderer.domElement

    );

    controls.enableDamping = true;

    controls.dampingFactor = 0.08;

    controls.enablePan = true;

    controls.enableZoom = true;

    controls.minDistance = 20;

    controls.maxDistance = 350;

// ------------------------------------------
// Lighting
// ------------------------------------------

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.8
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    0.7
);

directionalLight.position.set(60, 100, 50);

scene.add(directionalLight);

        // ------------------------------------------
    // Ground Grid
    // ------------------------------------------


    // ------------------------------------------
    // STL Loader
    // ------------------------------------------

    // ------------------------------------------
// GLB Loader
// ------------------------------------------



const loader = new THREE.GLTFLoader();

loader.load(

    "models/closet.glb",

    function(gltf){

        const model = gltf.scene;

        // Compute bounding box
        const box = new THREE.Box3().setFromObject(model);

        const center = box.getCenter(new THREE.Vector3());

        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);

        // Center model
        model.position.sub(center);

        // Scale model to fit nicely
        const scale = 80 / maxDim;

        model.scale.setScalar(scale);

        // Enable shadows (optional)
        model.traverse((child) => {

    if (child.isMesh) {

        // Hide the ceiling
        if (child.name === "Ceiling_Room") {
            child.visible = false;
            return;
        }

        child.castShadow = true;
        child.receiveShadow = true;

    }

});

        scene.add(model);

        // Hide loading text
        container.classList.add("loaded");

    },

    function(xhr){

        if(xhr.total){

            console.log(
                Math.round(
                    (xhr.loaded / xhr.total) * 100
                ) + "% loaded"
            );

        }

    },

    

    function(error){

        console.error("Failed to load GLB:", error);

        container.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            justify-content:center;
            width:100%;
            height:100%;
            font-size:18px;
            font-weight:600;
            color:#123A72;
        ">
            Unable to load<br>models/closet.glb
        </div>
        `;

    }

);




    // ------------------------------------------
    // Animation Loop
    // ------------------------------------------

    function animate(){

        requestAnimationFrame(animate);

        controls.update();

        renderer.render(scene,camera);

    }

    animate();

    // ------------------------------------------
    // Resize Support
    // ------------------------------------------

    window.addEventListener("resize",()=>{

        camera.aspect =
            container.clientWidth /
            container.clientHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(

            container.clientWidth,

            container.clientHeight

        );

    });

    return {

        scene,
        camera,
        renderer,
        controls

    };
}


/* ==========================================
   Part 3
   Viewer Initialization
========================================== */

let donateViewer = null;
let pickupViewer = null;

// -----------------------------
// Donate Viewer
// -----------------------------

function initDonateViewer(){

    if(donateViewer) return;

    donateViewer = createViewer("viewerDonate");

}

// -----------------------------
// Pick-Up Viewer
// -----------------------------

function initPickupViewer(){

    if(pickupViewer) return;

    pickupViewer = createViewer("viewerPickup");

}

/* ==========================================
   Mobile Touch Improvements
========================================== */

function configureMobile(viewer){

    if(!viewer) return;

    viewer.controls.enablePan = true;

    viewer.controls.enableZoom = true;

    viewer.controls.enableRotate = true;

    viewer.controls.enableDamping = true;

    viewer.controls.dampingFactor = 0.08;

    viewer.controls.rotateSpeed = 0.7;

    viewer.controls.zoomSpeed = 0.9;

    viewer.controls.panSpeed = 0.8;

}

// Apply once initialized

const mobileQuery = window.matchMedia("(max-width:768px)");

mobileQuery.addEventListener("change",()=>{

    if(donateViewer){

        configureMobile(donateViewer);

    }

    if(pickupViewer){

        configureMobile(pickupViewer);

    }

});

/* ==========================================
   Optional Auto Rotate
========================================== */

let autoRotate = false;

function updateAutoRotate(){

    if(donateViewer){

        donateViewer.controls.autoRotate = autoRotate;

        donateViewer.controls.autoRotateSpeed = 1.2;

    }

    if(pickupViewer){

        pickupViewer.controls.autoRotate = autoRotate;

        pickupViewer.controls.autoRotateSpeed = 1.2;

    }

}
updateAutoRotate();

/* ==========================================
   FOOTER LINKS
========================================== */

document.getElementById("footerHome").addEventListener("click",(e)=>{

    e.preventDefault();

    homeBtn.click();

});

document.getElementById("footerDonate").addEventListener("click",(e)=>{

    e.preventDefault();

    donateBtn.click();

});

document.getElementById("footerPickup").addEventListener("click",(e)=>{

    e.preventDefault();

    pickupBtn.click();

});

/* ==========================================
   Keyboard Shortcut
   Press "R" to toggle rotation
========================================== */

document.addEventListener("keydown",(e)=>{

    if(e.key.toLowerCase() === "r"){

        autoRotate = !autoRotate;

        updateAutoRotate();

    }

});

/* ==========================================
   Smooth Fade Between Pages
========================================== */

function fadeIn(element){

    element.style.opacity = 0;

    element.style.display = "block";

    let opacity = 0;

    const interval = setInterval(()=>{

        opacity += 0.08;

        element.style.opacity = opacity;

        if(opacity >= 1){

            clearInterval(interval);

        }

    },16);

}

/* ==========================================
   Remove Loading Placeholder
========================================== */

document.querySelectorAll(".viewer").forEach(viewer=>{

    const observer = new MutationObserver(()=>{

        if(viewer.querySelector("canvas")){

            viewer.classList.add("loaded");

        }

    });

    observer.observe(viewer,{

        childList:true

    });

});

/* ==========================================
   HAMBURGER MENU
========================================== */

const menuButton = document.getElementById("menuButton");
const closeMenu = document.getElementById("closeMenu");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");

menuButton.addEventListener("click", () => {

    sideMenu.classList.add("open");
    menuOverlay.classList.add("show");

});

function closeNavigation(){

    sideMenu.classList.remove("open");
    menuOverlay.classList.remove("show");

}

closeMenu.addEventListener("click", closeNavigation);

menuOverlay.addEventListener("click", closeNavigation);

/* ==========================================
   MENU NAVIGATION
========================================== */

document.getElementById("menuDonate").addEventListener("click",(e)=>{

    e.preventDefault();

    closeNavigation();

    donateBtn.click();

});

document.getElementById("menuPickup").addEventListener("click",(e)=>{

    e.preventDefault();

    closeNavigation();

    pickupBtn.click();

});

/* ==========================================
   DRESS CODE DROPDOWN
========================================== */

document.getElementById("menuHome").addEventListener("click", (e) => {

    e.preventDefault();

    closeNavigation();

    homeBtn.click();

});

/* ==========================================
   RESOURCE POPUP
========================================== */

const resourcePopup =
document.getElementById("resourcePopup");

const closePopup =
document.getElementById("closePopup");

let popupShown = false;

function showResourcePopup(){

    if(popupShown) return;

    popupShown = true;

    resourcePopup.classList.add("show");

    // Restart progress animation
    const bar =
    resourcePopup.querySelector(".popupProgressBar");

    bar.style.animation = "none";

    bar.offsetHeight;

    bar.style.animation =
    "popupCountdown 7s linear forwards";

    // Auto close after 7 seconds
    setTimeout(()=>{

        resourcePopup.classList.remove("show");

    },7000);

}

// Show 7 seconds after page load
window.addEventListener("load",()=>{

    setTimeout(showResourcePopup,4000);

});

// Close manually
closePopup.addEventListener("click",()=>{

    resourcePopup.classList.remove("show");

});

/* ==========================================
   Welcome Message
========================================== */

console.log("%cValley Catholic Uniform Closet",
"color:#123A72;font-size:24px;font-weight:bold;");

console.log("Website loaded successfully.");

/* ==========================================
   End of script.js
========================================== */
