/*==================================================
Kimberly Smith Tutoring Website
Part 1 - Navigation
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    /*==========================================
    Elements
    ==========================================*/

    const navbar = document.querySelector("header");
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const navItems = document.querySelectorAll(".nav-links a");

    /*==========================================
    Mobile Navigation
    ==========================================*/

    if (hamburger) {

        hamburger.addEventListener("click", () => {

            navLinks.classList.toggle("mobile-open");
            hamburger.classList.toggle("active");

        });

    }

    /*==========================================
    Close Mobile Menu
    ==========================================*/

    navItems.forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("mobile-open");
            hamburger.classList.remove("active");

        });

    });

    /*==========================================
    Sticky Navigation
    ==========================================*/

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    });

    /*==========================================
    Smooth Scrolling
    ==========================================*/

    navItems.forEach(link => {

        link.addEventListener("click", function(e) {

            const href = this.getAttribute("href");

            if (!href.startsWith("#")) return;

            e.preventDefault();

            const target = document.querySelector(href);

            if (!target) return;

            window.scrollTo({

                top: target.offsetTop - 90,

                behavior: "smooth"

            });

        });

    });

    /*==========================================
    Active Navigation Link
    ==========================================*/

    const sections = document.querySelectorAll("section");

    function updateActiveLink() {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 140;
            const height = section.offsetHeight;

            if (window.scrollY >= top &&
                window.scrollY < top + height) {

                current = section.getAttribute("id");

            }

        });

        navItems.forEach(link => {

            link.classList.remove("active-link");

            if (
                link.getAttribute("href") === "#" + current
            ) {

                link.classList.add("active-link");

            }

        });

    }

    updateActiveLink();

    window.addEventListener("scroll", updateActiveLink);

    /*==========================================
    Navbar Fade In
    ==========================================*/

    navbar.style.opacity = "0";
    navbar.style.transform = "translateY(-25px)";

    setTimeout(() => {

        navbar.style.transition =
            "opacity .6s ease, transform .6s ease";

        navbar.style.opacity = "1";
        navbar.style.transform = "translateY(0)";

    }, 100);

});

/*==================================================
Part 2 - Animations & Interactions
==================================================*/

/*==========================================
AOS Animation
==========================================*/

AOS.init({

    duration: 900,
    once: true,
    offset: 120,
    easing: "ease-out-cubic"

});

/*==========================================
Animated Counters
==========================================*/

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(!entry.isIntersecting) return;

        const counter = entry.target;

        const target = Number(counter.dataset.target);

        let current = 0;

        const increment = target / 80;

        function update(){

            current += increment;

            if(current < target){

                counter.textContent = Math.ceil(current);

                requestAnimationFrame(update);

            }else{

                counter.textContent = target + "+";

            }

        }

        update();

        counterObserver.unobserve(counter);

    });

},{
    threshold:.5
});

counters.forEach(counter=>{

    counterObserver.observe(counter);

});

/*==========================================
FAQ Accordion
==========================================*/

const faqButtons = document.querySelectorAll(".faq-question");

faqButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const answer = button.nextElementSibling;

        const icon = button.querySelector("i");

        const open =
            answer.style.maxHeight;

        document.querySelectorAll(".faq-answer").forEach(item=>{

            item.style.maxHeight = null;

        });

        document.querySelectorAll(".faq-question i").forEach(i=>{

            i.classList.remove("fa-minus");

            i.classList.add("fa-plus");

        });

        if(!open){

            answer.style.maxHeight =
                answer.scrollHeight + "px";

            icon.classList.remove("fa-plus");

            icon.classList.add("fa-minus");

        }

    });

});

/*==========================================
Fade Images On Scroll
==========================================*/

const images = document.querySelectorAll(

".about-image img, .students-image img, .image-card img"

);

const imageObserver = new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";

entry.target.style.transform="translateY(0)";

}

});

},{
threshold:.25
});

images.forEach(image=>{

image.style.opacity="0";

image.style.transform="translateY(40px)";

image.style.transition=".9s ease";

imageObserver.observe(image);

});

/*==========================================
Service Card Hover Effect
==========================================*/

document.querySelectorAll(".service-card").forEach(card=>{

card.addEventListener("mousemove",e=>{

const rect = card.getBoundingClientRect();

const x = e.clientX - rect.left;

const y = e.clientY - rect.top;

card.style.setProperty("--x",x+"px");
card.style.setProperty("--y",y+"px");

});

});

/*==========================================
Parallax Hero
==========================================*/

const hero = document.querySelector(".hero");

window.addEventListener("scroll",()=>{

const scroll = window.scrollY;

hero.style.backgroundPositionY =

scroll * .4 + "px";

});

/*==========================================
Floating Cards
==========================================*/

document.querySelectorAll(

".service-card,.benefit-card,.highlight-card"

).forEach((card,index)=>{

card.animate([

{

transform:"translateY(0px)"

},

{

transform:"translateY(-8px)"

},

{

transform:"translateY(0px)"

}

],{

duration:3500 + (index*300),

iterations:Infinity,

easing:"ease-in-out"

});

});

/*==========================================
Button Ripple
==========================================*/

document.querySelectorAll(

".primary-btn,.secondary-btn"

).forEach(button=>{

button.addEventListener("click",function(e){

const circle=document.createElement("span");

const diameter=Math.max(

this.clientWidth,

this.clientHeight

);

circle.style.width=

circle.style.height=

diameter+"px";

circle.style.left=

e.offsetX-diameter/2+"px";

circle.style.top=

e.offsetY-diameter/2+"px";

circle.classList.add("ripple");

const ripple=this.querySelector(".ripple");

if(ripple){

ripple.remove();

}

this.appendChild(circle);

});

});

/*==========================================
Reveal Sections
==========================================*/

const revealSections=document.querySelectorAll("section");

const revealObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("section-visible");

}

});

},{
threshold:.15
});

revealSections.forEach(section=>{

section.classList.add("section-hidden");

revealObserver.observe(section);

});

/*==================================================
Part 3 - Contact Form & EmailJS
==================================================*/

/*
==========================================
EmailJS Configuration

Replace these with your own values.
==========================================

YOUR_PUBLIC_KEY
YOUR_SERVICE_ID
YOUR_TEMPLATE_ID

==========================================
*/

emailjs.init({
    publicKey: "vHIDLdi3X5reb8cUw"
});

const contactForm = document.getElementById("contactForm");
const status = document.getElementById("form-status");

let sending = false;

if (contactForm) {

    contactForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        if (sending) return;

        const honeypot =
            document.getElementById("website");

        if (honeypot.value !== "") {

            return;

        }

        const submitButton =
            contactForm.querySelector("button");

        submitButton.disabled = true;

        submitButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

        status.textContent = "";
        status.style.color = "";

        sending = true;

        const formData = {

            name:
                contactForm.name.value.trim(),

            email:
                contactForm.email.value.trim(),

            phone:
                contactForm.phone.value.trim(),

            grade:
                contactForm.grade.value,

            message:
                contactForm.message.value.trim(),

            subjects:
                [...contactForm.querySelectorAll(
                    'input[name="subjects"]:checked'
                )]
                .map(cb => cb.value)
                .join(", ")

        };

        if (
            formData.name === "" ||
            formData.email === ""
        ) {

            status.textContent =
                "Please complete all required fields.";

            status.style.color = "#d32f2f";

            resetButton();

            return;

        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {

            status.textContent =
                "Please enter a valid email address.";

            status.style.color = "#d32f2f";

            resetButton();

            return;

        }

        try {

            await emailjs.send(

                "service_pqygao5",

                "template_5yj9h2b",

                formData

            );

            status.textContent =
                "Thank you! Kimberly will respond as soon as possible.";

            status.style.color =
                "#1b7d32";

            contactForm.reset();

        }

        catch (error) {

            console.error(error);

            status.textContent =
                "Sorry, something went wrong. Please try again.";

            status.style.color =
                "#d32f2f";

        }

        resetButton();

    });

}

function resetButton() {

    sending = false;

    const submitButton =
        contactForm.querySelector("button");

    submitButton.disabled = false;

    submitButton.innerHTML =
        "Send Inquiry";

}

/*==========================================
Phone Formatting
==========================================*/

const phoneField =
    document.querySelector('input[name="phone"]');

if (phoneField) {

    phoneField.addEventListener("input", function () {

        let numbers =
            this.value.replace(/\D/g, "");

        if (numbers.length > 10)
            numbers = numbers.slice(0, 10);

        if (numbers.length >= 6) {

            this.value =
                "(" +
                numbers.substring(0, 3) +
                ") " +
                numbers.substring(3, 6) +
                "-" +
                numbers.substring(6);

        }

        else if (numbers.length >= 3) {

            this.value =
                "(" +
                numbers.substring(0, 3) +
                ") " +
                numbers.substring(3);

        }

        else {

            this.value = numbers;

        }

    });

}

/*==========================================
Message Character Counter
==========================================*/

const textarea =
    document.querySelector(
        'textarea[name="message"]'
    );

if (textarea) {

    const counter =
        document.createElement("small");

    counter.style.display = "block";
    counter.style.marginTop = "10px";
    counter.style.color = "#66768A";

    textarea.after(counter);

    const updateCounter = () => {

        counter.textContent =
            `${textarea.value.length} / 1000 characters`;

    };

    textarea.maxLength = 1000;

    textarea.addEventListener(
        "input",
        updateCounter
    );

    updateCounter();

}

console.log(
    "%cKimberly Smith Tutoring",
    "color:#0F4C81;font-size:20px;font-weight:bold;"
);

console.log(
    "Website developed with HTML, CSS & JavaScript."
);