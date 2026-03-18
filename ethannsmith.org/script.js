// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(anchor.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  });
});

(function() {
    emailjs.init("31O7qMWoDFs0of_gr"); // Replace with your actual EmailJS user ID
})();

// Form submission event for the contact form
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    emailjs.sendForm('service_c2ufaj8', 'template_5bdudv6', this)
        .then(function(response) {
            alert('Your message has been sent successfully!');
            document.getElementById('contactForm').reset();
        }, function(error) {
            alert('Failed to send your message. Please try again later.');
        });
});