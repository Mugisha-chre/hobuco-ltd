//pre-loader
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
    }
});



// Add mobile web app prompt if needed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log("HOBUCO is running as a PWA!");
}


//serviceWorker to cashe website in device
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registered:', registration);
    }).catch(error => {
      console.log('Service Worker registration failed:', error);
    });
  });
}

       
       
// Menu Toggle Functionality
const menuToggle = document.querySelector('.menu-toggle');
const bars = document.querySelectorAll('.bar');
const responsiveNav = document.getElementById('responsiveNav');

menuToggle.addEventListener('click', () => {
  responsiveNav.classList.toggle('active');

  // Animate bars
  bars[0].style.transform = responsiveNav.classList.contains('active') 
      ? 'rotate(45deg) translate(8px, 10px)' 
      : 'none';

  bars[1].style.opacity = responsiveNav.classList.contains('active') 
      ? '0' 
      : '1';

  bars[2].style.transform = responsiveNav.classList.contains('active') 
      ? 'rotate(-47deg) translate(3px, -4px)' 
      : 'none';
});

// Close menu if clicked outside
document.addEventListener('click', (e) => {
  if (!responsiveNav.contains(e.target) && !menuToggle.contains(e.target)) {
    responsiveNav.classList.remove('active');
    bars.forEach(bar => bar.style.transform = 'none');
    bars[1].style.opacity = '1';
  }
});



// Counter Animation
const counters = document.querySelectorAll('.counter');
const speed = 200;

// Animate all counters
function animateCounters() {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const inc = target / speed;

        function updateCount() {
            if (count < target) {
                count += inc;
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 10); // smoother animation
            } else {
                counter.innerText = target;
            }
        }

        updateCount();
    });
}

// Trigger counter animation when stats section is in view
const statsSection = document.querySelector('.stats-section');
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target); // Run only once
        }
    });
}, { threshold: 0.5 });

if (statsSection) {
    observer.observe(statsSection);
}

const startYear = 2016;
  const currentYear = new Date().getFullYear();
    const yearsAgo = currentYear - startYear;

  document.getElementById("yearsCount").textContent = `${yearsAgo}`;
  document.getElementById("yearsCount1").textContent = `${yearsAgo}`;
  document.getElementById("yearsCount2").textContent = `${yearsAgo}`;

document.getElementById("currentyear").textContent = `${currentYear}`;




// Get the button
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Show button when user scrolls down 100px
window.onscroll = function() {
  if (document.body.scrollTop > 250 || document.documentElement.scrollTop > 250) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
};

// Scroll to top smoothly when button clicked
scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});













// Whatsappp JavaScript Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initWhatsAppButton();
});



// WhatsApp button functionality
function initWhatsAppButton() {
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function(e) {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }, 150);
        });
    }
}




// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initWhatsAppButton
    };
}