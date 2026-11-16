(() => {
  const toggle = document.querySelector('#motion-toggle');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  const applyMotion = () => {
    document.documentElement.classList.toggle('motion-paused', paused);
    if (toggle) {
      toggle.hidden = false;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.innerHTML = paused ? 'Play motion <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
    }
  };
  applyMotion();
  toggle?.addEventListener('click', () => { paused = !paused; applyMotion(); });
  preference.addEventListener('change', (event) => { paused = event.matches; applyMotion(); });
  if ('IntersectionObserver' in window && !preference.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-waiting');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12});
    document.querySelectorAll('.reveal').forEach(element => {
      // Only animate content below the viewport, keeping the opening immediately readable.
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('is-waiting');
        observer.observe(element);
      }
    });
  }
})();
