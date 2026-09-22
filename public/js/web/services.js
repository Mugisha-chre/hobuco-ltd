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

        // Scroll to Top Button
        const scrollToTopBtn = document.getElementById("scrollToTopBtn");

        // Show button when user scrolls down 240px
        window.onscroll = function() {
            if (document.body.scrollTop > 240 || document.documentElement.scrollTop > 240) {
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

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Service cards hover effect enhancement
        const serviceCards = document.querySelectorAll('.main-service-card');
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-15px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Additional service items animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                }
            });
        }, observerOptions);

        // Observe additional service items
        document.querySelectorAll('.additional-service-item').forEach(item => {
            observer.observe(item);
        });

        // Add slideInUp animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .additional-service-item {
                opacity: 0;
            }
        `;
        document.head.appendChild(style);






        


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