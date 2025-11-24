function setCookie(name, value, days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}

window.addEventListener('DOMContentLoaded', () => {
  if (!getCookie('cookies_accepted')) {
    document.getElementById('cookie-banner').classList.add('show');
  }

  document.getElementById('accept-cookies').onclick = () => {
    setCookie('cookies_accepted', 'tak', 365);
    document.getElementById('cookie-banner').classList.remove('show');
  };

  document.getElementById('decline-cookies').onclick = () => {
    setCookie('cookies_accepted', 'nie', 365);
    document.getElementById('cookie-banner').classList.remove('show');
  };
});