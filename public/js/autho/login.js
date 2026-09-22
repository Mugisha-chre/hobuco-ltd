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


       
       
// Animation and form switching logic
const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");

signupBtn.onclick = (() => {
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
});

loginBtn.onclick = (() => {
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
});

// Check if signupLink exists before adding event listener
const signupLink = document.querySelector('.signup-link a');
if (signupLink) {
  signupLink.onclick = (() => {
    signupBtn.click();
    return false;
  });
}

function goBack() {
  window.history.back();
}

// Login form submission handler
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Use the same selector as your animation code
  const loginFormElement = document.querySelector("form.login");
  
  if (!loginFormElement) {
    console.error('Login form not found!');
    return;
  }
  
  loginFormElement.addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent default form submission
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Get the submit button within this specific form
    const submitBtn = form.querySelector('input[type="submit"]');
    const errorDiv = document.getElementById('errorMessage');
    
    // Convert FormData to regular object
    const data = {
      username: formData.get('username'),
      password: formData.get('password'),
      remember: formData.get('remember') ? true : false
    };
    
    // Show loading state
    if (submitBtn) {
      submitBtn.value = 'Logging in...';
      submitBtn.disabled = true;
      submitBtn.classList.add('login-btn-loading');
    }
    
    // Hide any previous error messages
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
    
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Success - redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        // Show error message
        if (errorDiv) {
          errorDiv.textContent = result.message;
          errorDiv.style.display = 'block';
        } else {
          alert(result.message); // Fallback if errorDiv doesn't exist
        }
        
        // Reset button state
        if (submitBtn) {
          submitBtn.value = 'Login';
          submitBtn.disabled = false;
          submitBtn.classList.remove('login-btn-loading');
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors
      const errorMessage = 'Network error. Please try again.';
      if (errorDiv) {
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
      } else {
        alert(errorMessage); // Fallback if errorDiv doesn't exist
      }
      
      // Reset button state
      if (submitBtn) {
        submitBtn.value = 'Login';
        submitBtn.disabled = false;
        submitBtn.classList.remove('login-btn-loading');
      }
    }
  });
});











// sign up 

document.addEventListener('DOMContentLoaded', function () {
  const signupFormElement = document.querySelector("#signupForm");

  if (!signupFormElement) return;

  signupFormElement.addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      // role: formData.get('role') || 'client' // optional
    };

    const submitBtn = form.querySelector('input[type="submit"]');
    const errorDiv = document.getElementById('signupErrorMessage');
    const successDiv = document.getElementById('signupSuccessMessage');

    // Reset messages
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';

    // Loading state
    if (submitBtn) {
      submitBtn.value = 'Signing up...';
      submitBtn.disabled = true;
    }

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        // Show success
        if (successDiv) {
          successDiv.textContent = result.message;
          successDiv.style.display = 'block';
        }

        form.reset(); // clear the form
      } else {
        if (errorDiv) {
          errorDiv.textContent = result.message;
          errorDiv.style.display = 'block';
        }
      }

    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = 'Network error. Try again later.';
        errorDiv.style.display = 'block';
      }
    }

    // Reset button
    if (submitBtn) {
      submitBtn.value = 'Signup';
      submitBtn.disabled = false;
    }
  });
});










document.addEventListener('DOMContentLoaded', function() {
  // Toggle password visibility
  const togglePassword = document.querySelector('#togglePassword');
  const password = document.querySelector('#password');
  
  togglePassword.addEventListener('click', function() {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
  });

  // Make remember me text clickable
  const rememberText = document.querySelector('.remember-text');
  const rememberCheckbox = document.querySelector('#remember');
  
  rememberText.addEventListener('click', function() {
    rememberCheckbox.checked = !rememberCheckbox.checked;
  });
});