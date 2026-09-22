
document.querySelector('.back').addEventListener('click', goBack);


function goBack() {
  const userRole = '<%= user.role %>';
  
  switch(userRole.toLowerCase()) {
    case 'admin':
      window.location.href = '/admin/dashboard';
      break;
    case 'manager':
      window.location.href = '/manager/dashboard';
      break;
    case 'client':
      window.location.href = '/client/dashboard';
      break;
    default:
      window.location.href = '/dashboard';
  }
}