function goBack() {
  try {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to previous page if no history
      window.location.href = document.referrer || '/';
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to homepage if everything fails
    window.location.href = '/';
  }
}
