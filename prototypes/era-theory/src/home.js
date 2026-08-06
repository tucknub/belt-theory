const button = document.querySelector('.menu-button');
const nav = document.querySelector('#home-mobile-nav');

button?.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  nav.hidden = expanded;
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.hidden = true;
  button.setAttribute('aria-expanded', 'false');
}));
