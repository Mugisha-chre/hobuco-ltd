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


       
       
// Dashboard JavaScript Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSidebar();
    initDropdowns();
    initCharts();
    initAnimations();
    initMobileMenu();
    initWhatsAppButton();
});

// Sidebar functionality
function initSidebar() {
    const menuItems = document.querySelectorAll('.menu-item');
    const menuLinks = document.querySelectorAll('.menu-link');
    
    // Handle active menu item
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuItems.forEach(item => item.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });
}

// Dropdown functionality
function initDropdowns() {
    // Notification dropdown
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    // Toggle notification dropdown
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
            profileDropdown.classList.remove('show');
            profileBtn.classList.remove('active');
        });
    }
    
    // Toggle profile dropdown
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
            profileBtn.classList.toggle('active');
            notificationDropdown.classList.remove('show');
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        if (notificationDropdown) notificationDropdown.classList.remove('show');
        if (profileDropdown) profileDropdown.classList.remove('show');
        if (profileBtn) profileBtn.classList.remove('active');
    });
    
    // Prevent dropdown close when clicking inside
    [notificationDropdown, profileDropdown].forEach(dropdown => {
        if (dropdown) {
            dropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    // Toggle mobile menu
    if (mobileMenuToggle && sidebar && mobileOverlay) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            mobileOverlay.classList.toggle('show');
            document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
        });
    }
    
    // Close mobile menu with sidebar toggle
    if (sidebarToggle && sidebar && mobileOverlay) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.remove('show');
            mobileOverlay.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
    
    // Close mobile menu with overlay
    if (mobileOverlay && sidebar) {
        mobileOverlay.addEventListener('click', function() {
            sidebar.classList.remove('show');
            mobileOverlay.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
    
    // Close mobile menu when clicking menu items
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('show');
                mobileOverlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });
}

// Chart initialization
function initCharts() {
    // Revenue Chart (Line Chart)
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 15000, 18000, 22000, 19000, 25000, 28000, 24000, 30000, 32000, 29000, 35000],
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4A90E2',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#4A90E2',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748B',
                            font: {
                                family: 'Poppins',
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#E2E8F0',
                            borderDash: [5, 5]
                        },
                        ticks: {
                            color: '#64748B',
                            font: {
                                family: 'Poppins',
                                size: 12
                            },
                            callback: function(value) {
                                return '$' + (value / 1000) + 'k';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    // Client Distribution Chart (Doughnut Chart)
    const clientCtx = document.getElementById('clientChart');
    if (clientCtx) {
        new Chart(clientCtx, {
            type: 'doughnut',
            data: {
                labels: ['Business Strategy', 'Financial Planning', 'Marketing', 'IT Consulting', 'Others'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        '#4A90E2',
                        '#6BA3E8',
                        '#357ABD',
                        '#2E7BC6',
                        '#E8F4FD'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                family: 'Poppins',
                                size: 12
                            },
                            color: '#64748B'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#4A90E2',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
}

// Animation functionality
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    const animatedElements = document.querySelectorAll('.widget-card, .chart-card, .table-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Counter animation for widget values
    animateCounters();
}

// Counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.widget-value');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format the number based on original content
            const originalText = counter.textContent;
            if (originalText.includes('$')) {
                counter.textContent = '$' + Math.floor(current).toLocaleString();
            } else {
                counter.textContent = Math.floor(current).toString();
            }
        }, 16);
    });
}

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

// Search functionality
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            // Here you would implement actual search functionality
            console.log('Searching for:', searchTerm);
        });
    }
}



// Notification functionality
function initNotifications() {
    // Mark notifications as read
    const notificationItems = document.querySelectorAll('.notification-item');
    
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.opacity = '0.6';
            console.log('Notification read');
        });
    });
    
    // Simulate new notifications
    setTimeout(() => {
        addNewNotification();
    }, 10000); // Add new notification after 10 seconds
}

// Add new notification
function addNewNotification() {
    const notificationList = document.querySelector('.notification-list');
    const notificationBadge = document.querySelector('.notification-badge');
    const notificationCount = document.querySelector('.notification-count');
    
    if (notificationList && notificationBadge && notificationCount) {
        const newNotification = document.createElement('div');
        newNotification.className = 'notification-item';
        newNotification.innerHTML = `
            <i class="fas fa-envelope notification-icon"></i>
            <div class="notification-content">
                <p>New message received</p>
                <span class="notification-time">Just now</span>
            </div>
        `;
        
        // Add to top of list
        notificationList.insertBefore(newNotification, notificationList.firstChild);
        
        // Update badge and count
        const currentCount = parseInt(notificationBadge.textContent);
        notificationBadge.textContent = currentCount + 1;
        notificationCount.textContent = (currentCount + 1) + ' new';
        
        // Add animation
        newNotification.style.opacity = '0';
        newNotification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            newNotification.style.transition = 'all 0.3s ease';
            newNotification.style.opacity = '1';
            newNotification.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Responsive handling
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (sidebar) sidebar.classList.remove('show');
            if (mobileOverlay) mobileOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
}

// Theme switching (for future enhancement)
function initThemeSwitch() {
    // This can be expanded to include dark/light theme switching
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    prefersDark.addEventListener('change', function(e) {
        if (e.matches) {
            console.log('User prefers dark theme');
        } else {
            console.log('User prefers light theme');
        }
    });
}

// Performance optimization
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Error handling
function handleErrors() {
    window.addEventListener('error', function(e) {
        console.error('JavaScript error:', e.error);
        // You could send this to an error reporting service
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        // You could send this to an error reporting service
    });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initSearch();
    initNotifications();
    handleResize();
    initThemeSwitch();
    optimizePerformance();
    handleErrors();
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSidebar,
        initDropdowns,
        initCharts,
        initAnimations,
        initMobileMenu,
        initWhatsAppButton
    };
}










// Open modal
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.dataset.id;
      document.getElementById('modal-' + id).classList.add('show');
    });
  });

  



  function openModal(id) {
  document.getElementById('modal-' + id).classList.add('show');
}
// Close modal function
function closeModal(id) {
  document.getElementById('modal-' + id).classList.remove('show');
}











 function loadModal(id) {
  fetch(`/consultations/api/${id}`)
    .then(res => res.json())
    .then(data => {
      const modal = document.getElementById('mobileOverlay1');
      const formContainer = document.getElementById('modalFormContainer');

      formContainer.innerHTML = `
        <form id="editConsultationForm">
          <button type="button" class="close-btn" onclick="closeModal2()">×</button>
          <h2>Edit Consultation</h2>
          
          
          
          <label>First Name</label>
          <input type="text" name="first_name" value="${data.first_name || ''}" required>
          
          <label>Last Name</label>
          <input type="text" name="last_name" value="${data.last_name || ''}" required>
          
          <label>Email</label>
          <input type="email" name="email" value="${data.email || ''}" required>
          
          <label>Phone</label>
          <input type="text" name="phone" value="${data.phone || ''}">
          
          <label>Company / Organization</label>
          <input type="text" name="companyOrg" value="${data.company_org || ''}">
          
          <label>Subject</label>
          <input type="text" name="subject" value="${data.subject || ''}">
          
          <label>Service</label>
          <input type="text" name="service" value="${data.service || ''}">
          
          <label>Message</label>
          <textarea name="message">${data.message || ''}</textarea>

          <div id="modalMessage" style="display: none; padding: 10px; margin-bottom: 10px; border-radius: 4px;"></div>
          
          <button type="submit" id="updateBtn">Update</button>
        </form>
      `;

      // Add form submission handler
      const form = document.getElementById('editConsultationForm');
      form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        const formData = new FormData(form);
        const updateBtn = document.getElementById('updateBtn');
        const messageDiv = document.getElementById('modalMessage');
        
        // Convert FormData to regular object for JSON sending
        const formObject = {};
        formData.forEach((value, key) => {
          formObject[key] = value;
        });
        
        console.log('Sending data:', formObject); // Debug log
        
        // Disable button during submission
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';
        
        fetch(`/consultations/update/${data.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formObject)
        })
        .then(response => {
          console.log('Response status:', response.status); // Debug log
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(result => {
          console.log('Server response:', result); // Debug log
          
          if (result.success) {
            // Show success message
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'rgb(8, 165, 13)';
            messageDiv.textContent = 'Consultation updated successfully!';
            
            // Close modal after 1.5 seconds and redirect
            setTimeout(() => {
              closeModal2();    
              if (result.redirect) {
                window.location.href = result.redirect;
              } else {
                window.location.reload(); // Refresh current page
              }
            }, 1500);
          } else {
            // Show error message in modal
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'rgb(255, 0, 0)';
            messageDiv.textContent = result.message || 'Unknown error occurred';
          }
        })
        .catch(error => {
          console.error('Fetch error:', error); // Debug log
          messageDiv.style.display = 'block';
          messageDiv.style.backgroundColor = '#f8d7da';
          messageDiv.style.color = '#721c24';
          messageDiv.style.border = '1px solid #f5c6cb';
          messageDiv.textContent = 'Network error: Unable to connect to server';
        })
        .finally(() => {
          // Re-enable button
          updateBtn.disabled = false;
          updateBtn.textContent = 'Update';
        });
      });

      modal.classList.add('active');
      document.body.classList.add('modal-open');
    })
    .catch(error => {
      console.error('Error loading consultation:', error);
    });
}

    function closeModal2() {
      document.getElementById('mobileOverlay1').classList.remove('active');
      document.body.classList.remove('modal-open');
    }











    function loadModal2() {
          const modal = document.getElementById('mobileOverlay1');
          const formContainer = document.getElementById('modalFormContainer');

          formContainer.innerHTML = `
            <form method="POST" action="/book-consultation">
              <button type="button" class="close-btn" onclick="closeModal3()">×</button>
              <h2>Add New Consultation</h2>

              <label>First Name</label>
              <input type="text" name="firstName"  required>

              <label>Last Name</label>
              <input type="text" name="lastName"  required>

              <label>Email</label>
              <input type="email" name="email"  required>

              <label>Phone</label>
              <input type="text" name="phone" >

              <label>Company / Organization</label>
              <input type="text" name="companyOrg" >

              <label>Subject</label>
              <input type="text" name="subject" >

              <label>Service</label>
              <input type="text" name="service" >

              <label>Message</label>
              <textarea name="message"></textarea>

              <button type="submit"><i class="fas fa-plus"></i> Add New</button>
            </form>
          `;

          modal.classList.add('active');
          document.body.classList.add('modal-open');
        }
    

    function closeModal3() {
      document.getElementById('mobileOverlay1').classList.remove('active');
      document.body.classList.remove('modal-open');
    }









    

// search functionality
    document.getElementById('searchInput').addEventListener('input', function () {
  const searchQuery = this.value.trim();
  const searchLower = searchQuery.toLowerCase();

  fetch('/search-consultations?query=' + encodeURIComponent(searchQuery))
    .then(res => res.json())
    .then(data => {
      const tableBody = document.getElementById('tableBody');
      tableBody.innerHTML = '';

      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">No matching records.</td></tr>`;
        return;
      }

      data.forEach(row => {
        const tr = document.createElement('tr');

        // Highlight matched letters in each column
        const highlight = (text) => {
          if (!searchQuery) return text;
          const regex = new RegExp(`(${searchQuery})`, 'ig');
          return text.replace(regex, '<span class="highlight">$1</span>');
        };

        tr.innerHTML = `
          <td>${highlight(row.first_name)}</td>
          <td>${highlight(row.email)}</td>
          <td>${highlight(row.service)}</td>
          <td>${highlight(new Date(row.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }))}</td>

           <td style="color: rgb(185, 182, 182);">Disabled</td>



        `;
        tableBody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error('Search failed:', err);
    });
});














//remove the search function
const searchInput = document.getElementById("searchInput");
  const tableBody = document.getElementById("tableBody");

  // 🔸 Save original content on load
  const originalTable = tableBody.innerHTML;

  // 🔸 Search filter + highlight
  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach((row) => {
      const rowText = row.textContent.toLowerCase();

      if (rowText.includes(query)) {
        row.style.display = "";
        highlightMatch(row, query);
      } else {
        row.style.display = "none";
      }
    });
  });

  function highlightMatch(row, query) {
    row.querySelectorAll("td").forEach((cell) => {
      const original = cell.textContent;
      const regex = new RegExp(`(${query})`, "gi");
      cell.innerHTML = original.replace(regex, `<mark>$1</mark>`);
    });
  }

  // 🔸 Reset table to original
  function resetTableToOriginal() {
    tableBody.innerHTML = originalTable;
    searchInput.value = "";
  }

  // 🔸 Listen for outside click to reset
  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target)) {
      resetTableToOriginal();
    }
  });










//deleteConsultation
  function deleteConsultation(id) {
    if (!confirm('Are you sure you want to delete this consultation?')) return;

    fetch(`/consultations/delete/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        // Optionally remove the row from UI or reload
        location.reload(); // or dynamically remove the row
      } else {
        return response.text().then(text => { throw new Error(text) });
      }
    })
    .catch(error => {
      alert("Failed to delete: " + error.message);
    });
  }




//confirmExport
function confirmExport() {
    const confirmed = confirm('Are you sure you want to export the list of consultations?');
    if (confirmed) {
        window.location.href = '/export/consultations';
        return true;
    }
    return false; 
}