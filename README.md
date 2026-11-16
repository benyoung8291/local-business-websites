# Ben Young — AI consulting in Melbourne

Static, dependency-free personal consulting website. Primary production: https://www.benjaminyoung.com.au/ (GitHub + Vercel). The existing private Sites project is retained as a synchronized preview.

## Build and check

```sh
python3 build.py
python3 check.py
python3 -m http.server 8765 --directory dist
```

Edit `templates/home.html` for the homepage, `build.py` for shared navigation, contact form, metadata and guide content, and `dist/assets/style.css` for presentation. `site-config.json` supplies the domain and form endpoint. Assets stay in `dist/assets` across builds.

## Design

Inspired directly by https://mindmarket.com/: apple green and cream, white floating navigation, rounded sections, expressive characters, a winding path and pastel accents. Ben Young remains a small navigation wordmark. The character artwork is original, generated for this site; no MindMarket assets or copy are used. Final image prompts are in `artwork/PROMPTS.md`. Optimized transparent WebP images are committed under `dist/assets`; local original PNGs in `artwork` are excluded from Git.

`motion.js` enhances below-the-fold entrances with IntersectionObserver. CSS animates connected systems, report lines, paper, and hero accents. The pause control and `prefers-reduced-motion` disable movement; all content is visible without JavaScript. There is no animation library or scroll hijacking.

## Enquiries

Formspree endpoint: https://formspree.io/f/xbgogzjr. Expected recipient: benjaminyoung8@gmail.com. Successful delivery to this inbox must be verified in the Formspree account; simulated form tests do not prove email delivery. Native browser validation, honeypot, pending state, timeout and recoverable error messages are implemented.

## Search

Ten indexable pages plus a 404, unique titles and descriptions, canonical URLs, structured data and XML sitemap. Six substantive guides are accessible through contextual service links and the footer, with no crowded main navigation. No hidden keyword pages, fake reviews or fabricated client results. The $80,000 figure is annual subscription spend removed in Ben’s own business, not a claim of net savings after development/hosting costs.

## Character choreography

The hero uses three separate transparent sprites, each with its own scroll-linked translation, rotation and scale. Toolbox and coffee characters have separate scene choreography. `motion.js` measures stable parent containers and updates transforms once per animation frame on passive scroll events, with no scroll interception or continuous rendering loop. Scrolling back exactly reverses poses. Mobile travel distances are reduced. Pause resets character poses; OS reduced-motion disables character movement and the animation toggle. Run `node tests/motion.cjs` for motion reversal and accessibility behavior checks.

## Scroll scenes and portrait decorations

The portrait now uses `ben-young-cutout.webp` over five independent SVG/CSS decorations. The photographic layer stays stationary while shapes drift, the star rotates and the arrow draws according to scroll position. Service illustrations use contained SVG scenes with independently moving cards, drawing connectors and report lines; the old full-section ribbon was removed to avoid sliced shapes behind text and at section boundaries. The savings badge and breakfast-to-lunch clocks also respond to scrolling. All share the existing pause/reduced-motion behavior. The handwritten lowercase b/y logo has distinct strokes and a matching favicon.
