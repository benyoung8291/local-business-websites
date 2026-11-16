(() => {
  const toggle = document.querySelector('#motion-toggle');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage = document.querySelector('.character-stage');
  const characters = stage ? [...stage.querySelectorAll('.character')] : [];
  const scenes = [...document.querySelectorAll('[data-character-scene]')];
  const moving = [...characters, ...scenes.map(scene => scene.querySelector('img'))];
  let paused = preference.matches;
  let frame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pose = (element, x, y, rotation, scale = 1) => {
    element.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  };
  // Measure the stable parent, never a transformed sprite: motion cannot feed back into its own progress.
  const progress = rect => clamp((innerHeight - rect.top) / (innerHeight + rect.height));
  const render = () => {
    frame = 0;
    if (paused || document.hidden) return;
    const mobile = innerWidth <= 700;
    const distance = mobile ? 0.42 : 1;
    if (stage) {
      const rect = stage.getBoundingClientRect();
      if (rect.bottom > -150 && rect.top < innerHeight + 150) {
        const p = progress(rect);
        // The group comes together, then fans out as the cream section arrives.
        const enter = clamp(p / 0.42);
        const leave = clamp((p - 0.42) / 0.58);
        pose(characters[0], lerp(-105, 0, enter) * distance - 125 * leave * distance,
          lerp(48, 0, enter) * distance + 65 * leave * distance,
          lerp(-12, 0, enter) - 15 * leave, lerp(.92, 1, enter));
        pose(characters[1], 24 * Math.sin(p * Math.PI * 2) * distance,
          lerp(65, 0, enter) * distance - 130 * leave * distance,
          lerp(8, 0, enter) + 11 * leave, 1 + .10 * leave);
        pose(characters[2], lerp(115, 0, enter) * distance + 130 * leave * distance,
          lerp(38, 0, enter) * distance + 35 * leave * distance,
          lerp(12, 0, enter) + 17 * leave, lerp(.94, 1, enter));
      }
    }
    for (const scene of scenes) {
      const rect = scene.getBoundingClientRect();
      if (rect.bottom < -150 || rect.top > innerHeight + 150) continue;
      const p = progress(rect);
      const image = scene.querySelector('img');
      if (scene.dataset.characterScene === 'toolbox') {
        pose(image, lerp(85, -45, p) * distance, lerp(90, -65, p) * distance,
          lerp(15, -9, p), lerp(.86, 1.07, p));
      } else {
        pose(image, lerp(-65, 45, p) * distance, lerp(65, -55, p) * distance,
          lerp(-14, 10, p), lerp(.92, 1.04, p));
      }
    }
  };
  const requestRender = () => {
    if (!paused && !frame) frame = requestAnimationFrame(render);
  };
  const applyMotion = () => {
    document.documentElement.classList.toggle('motion-paused', paused);
    if (toggle) {
      toggle.hidden = false;
      toggle.disabled = preference.matches;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.innerHTML = preference.matches ? 'Reduced motion' : paused
        ? 'Play motion <span aria-hidden="true">▷</span>'
        : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
    }
    if (paused) {
      cancelAnimationFrame(frame);
      frame = 0;
      moving.forEach(element => { element.style.transform = ''; });
    } else requestRender();
  };
  toggle?.addEventListener('click', () => { paused = !paused; applyMotion(); });
  preference.addEventListener('change', event => { paused = event.matches; applyMotion(); });
  window.addEventListener('scroll', requestRender, {passive:true});
  window.addEventListener('resize', requestRender, {passive:true});
  window.addEventListener('pageshow', requestRender);
  document.addEventListener('visibilitychange', requestRender);
  applyMotion();
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
      if (element.getBoundingClientRect().top > innerHeight) {
        element.classList.add('is-waiting');
        observer.observe(element);
      }
    });
  }
})();
