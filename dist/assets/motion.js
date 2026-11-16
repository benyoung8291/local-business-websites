(() => {
  const toggle = document.querySelector('#motion-toggle');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage = document.querySelector('.character-stage');
  const characters = stage ? [...stage.querySelectorAll('.character')] : [];
  const scenes = [...document.querySelectorAll('[data-character-scene]')];
  const portrait = document.querySelector('[data-portrait-scene]');
  const portraitLayers = portrait ? [...portrait.querySelectorAll('.portrait-decoration')] : [];
  const portraitLine = portrait?.querySelector('.portrait-loop-line');
  const stories = [...document.querySelectorAll('[data-story-scene]')].map(element => ({
    element,
    parts: Object.fromEntries([...element.querySelectorAll('[data-part]')].map(part => [part.dataset.part, part])),
    traces: [...element.querySelectorAll('[data-trace]')]
  }));
  const proofScene = document.querySelector('.proof-grid');
  const proofBadge = document.querySelector('[data-proof-badge]');
  const proofLine = document.querySelector('[data-proof-line]');
  const dayScene = document.querySelector('[data-day-scene]');
  const dayMoments = dayScene ? [...dayScene.querySelectorAll('.day-moment')] : [];
  const dayClocks = dayScene ? [...dayScene.querySelectorAll('.clock-face')] : [];
  const dayLine = dayScene?.querySelector('[data-day-line]');
  const moving = [...characters, ...scenes.map(scene => scene.querySelector('img')), ...portraitLayers,
    ...stories.flatMap(story => Object.values(story.parts)), ...dayMoments, ...(proofBadge ? [proofBadge] : [])];
  const drawing = [...stories.flatMap(story => story.traces), ...[portraitLine, proofLine, dayLine].filter(Boolean)];
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
    window.BenIllustrations?.render();
    const mobile = innerWidth <= 700;
    const distance = mobile ? 0.42 : 1;
    if (stage && characters.length === 3) {
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
    if (portrait) {
      const rect = portrait.getBoundingClientRect();
      if (rect.bottom > -100 && rect.top < innerHeight + 100) {
        const p = progress(rect);
        // Decorative layers move independently; the photographic layer stays untouched.
        pose(portraitLayers[0], lerp(-16, 16, p) * distance, lerp(26, -22, p) * distance,
          lerp(-52, -18, p), lerp(.94, 1.06, p));
        pose(portraitLayers[1], lerp(14, -12, p) * distance, lerp(32, -28, p) * distance,
          0, lerp(.88, 1.12, p));
        pose(portraitLayers[2], lerp(-5, 9, p) * distance, lerp(18, -16, p) * distance,
          lerp(-35, 100, p));
        pose(portraitLayers[3], lerp(-8, 5, p) * distance, lerp(17, -16, p) * distance,
          lerp(-10, 8, p));
        pose(portraitLayers[4], lerp(9, -5, p) * distance, lerp(22, -20, p) * distance,
          lerp(-16, 17, p));
        portraitLine.style.strokeDashoffset = (1 - clamp((p - .08) / .47)).toFixed(3);
      }
    }
    for (const story of stories) {
      const rect = story.element.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > innerHeight + 100) continue;
      const p = progress(rect);
      const t = clamp((p - .08) / .52);
      const parts = story.parts;
      if (parts.wash) pose(parts.wash, 0, lerp(14, -14, t) * distance, lerp(-8, 8, t), lerp(.92, 1.04, t));
      if (parts.left) pose(parts.left, lerp(-42, 14, t) * distance, lerp(-26, 12, t) * distance, lerp(-8, 5, t));
      if (parts.right) pose(parts.right, lerp(44, -12, t) * distance, lerp(35, -16, t) * distance, lerp(11, -5, t));
      if (parts.star) pose(parts.star, 0, lerp(12, -12, t) * distance, lerp(-30, 100, t));
      if (parts.tick) pose(parts.tick, 0, lerp(10, 0, t), lerp(-16, 0, t), lerp(.65, 1, clamp((t - .18) / .5)));
      story.traces.forEach((line, index) => {
        line.style.strokeDashoffset = (1 - clamp((p - .08 - index * .025) / .32)).toFixed(3);
      });
    }
    if (proofScene && proofBadge) {
      const rect = proofScene.getBoundingClientRect();
      if (rect.bottom > -100 && rect.top < innerHeight + 100) {
        const p = progress(rect);
        pose(proofBadge, 0, lerp(30, -18, p) * distance, lerp(-14, 3, p), lerp(.93, 1.04, p));
        if (proofLine) proofLine.style.strokeDashoffset = (1 - clamp((p - .08) / .38)).toFixed(3);
      }
    }
    if (dayScene) {
      const rect = dayScene.getBoundingClientRect();
      if (rect.bottom > -100 && rect.top < innerHeight + 100) {
        const p = progress(rect), t = clamp((p - .08) / .42);
        dayMoments.forEach((moment, i) => pose(moment, (i ? 1 : -1) * lerp(24, 0, t) * distance, lerp(18, 0, t) * distance, 0));
        dayClocks.forEach((clock, i) => {
          clock.style.setProperty('--minute-angle', `${-90 + 720 * t}deg`);
          clock.style.setProperty('--hour-angle', `${i ? lerp(180, 270, t) : 180}deg`);
        });
        if (dayLine) dayLine.style.strokeDashoffset = (1 - t).toFixed(3);
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
      window.BenIllustrations?.reset();
      cancelAnimationFrame(frame);
      frame = 0;
      moving.forEach(element => { element.style.transform = ''; });
      drawing.forEach(line => { line.style.strokeDashoffset = ''; });
      dayClocks.forEach(clock => {
        clock.style.removeProperty('--minute-angle');
        clock.style.removeProperty('--hour-angle');
      });
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
    }, {threshold: 0, rootMargin: '0px 0px 60px 0px'});
    document.querySelectorAll('.reveal').forEach(element => {
      if (element.getBoundingClientRect().top > innerHeight) {
        element.classList.add('is-waiting');
        observer.observe(element);
      }
    });
  }
})();
