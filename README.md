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

`motion.js` enhances below-the-fold entrances with IntersectionObserver. Layered SVG scenes animate characters, tools and story details; CSS handles the hero accents. The pause control and `prefers-reduced-motion` disable movement; all content is visible without JavaScript. There is no animation library or scroll hijacking.

## Enquiries

Formspree endpoint: https://formspree.io/f/xbgogzjr. Expected recipient: benjaminyoung8@gmail.com. Successful delivery to this inbox must be verified in the Formspree account; simulated form tests do not prove email delivery. Native browser validation, honeypot, pending state, timeout and recoverable error messages are implemented.

## Search

Fifteen indexable pages plus a 404, unique titles and descriptions, canonical URLs, structured data and XML sitemap. Eight substantive guides are accessible through contextual service links and the footer, with no crowded main navigation. No hidden keyword pages, fake reviews or fabricated client results. The $80,000 figure is annual subscription spend removed in Ben’s own business, not a claim of net savings after development/hosting costs.

## Character choreography

The hero, toolbox and illustrated Ben use the original detailed WebPs, unchanged. `build_illustrations.py` generates inline SVG masks and clipping paths that separate head, hand, foot and prop layers from those exact images. Small colour patches under joints cover the gaps exposed by rotation. `living-art.js` drives the joints independently and reversibly while the full character remains anchored. The original clothing, facial features and ink lines are preserved. The systems handoff and report-writing sequences remain vector-based. `motion.js` owns passive scroll scheduling and resets all layers for pause/reduced-motion. No continuous rendering loop or scroll interception is used. Run `node tests/living-art.cjs` for sequencing, original-art references and reversibility, and `node tests/motion.cjs` for controller/accessibility checks.

## Scroll scenes and portrait decorations

The portrait now uses `ben-young-cutout.webp` over five independent SVG/CSS decorations. The photographic layer stays stationary while shapes drift, the star rotates and the arrow draws according to scroll position. Service illustrations use contained SVG scenes with independently moving cards, drawing connectors and report lines; the old full-section ribbon was removed to avoid sliced shapes behind text and at section boundaries. The savings badge and breakfast-to-lunch clocks also respond to scrolling. All share the existing pause/reduced-motion behavior. The handwritten lowercase b/y logo has distinct strokes and a matching favicon.

## Responsive polish

The header uses the same clear “Talk to Ben” CTA at every width. Phone contact copy sits beside the smaller coffee illustration so the form arrives sooner. Tablet headings, hero artwork and service spacing use narrower proportions; the lavender-to-yellow join has an explicit underlay. Scroll-driven transforms have a short 140ms follow-through, and story traces finish while still in view. Entrances begin just before the viewport. Pause and reduced-motion disable all transition smoothing. Clock completion at viewport centre is covered in `tests/motion.cjs`.

## First impression

The opening leads with the customer's problem: “Stop losing hours to business admin.” It identifies Melbourne small businesses and trades, explains the offer in plain language, and places a direct enquiry CTA and Ben's own $80k annual subscription proof before the artwork. The next section recognises everyday double-handling and provides a three-step plan: show one slow task, agree a practical first fix, then build and test it together. The enquiry form explains what happens after sending. The proof is explicitly Ben's experience, not a guaranteed customer result. All opening content is immediately visible without waiting for animation.

## Search optimisation and publication

The homepage targets AI consulting for Melbourne small businesses. Three service pages cover systems integration, AI workflow automation and custom business apps. Eight supporting guides answer informational questions, including trade workflows, reducing admin, costs and changing job management software. Existing guide URLs are preserved. The service pages are linked from the homepage and footer; guides link to a relevant service and a small set of related reading. All content is static HTML and crawlable without JavaScript.

`seo.py` emits connected WebSite, WebPage, Person and Organization entities, with Article and BreadcrumbList nodes for guides and Service nodes for service pages. There is no invented street address, rating, client result or price. Organization is used instead of suggesting eligibility for Google's address-based LocalBusiness feature. The visible FAQs are useful content, not a claim to qualify for FAQ rich results.

`content-dates.json` records content hashes and real publication/modification times. An unchanged rebuild leaves dates untouched. Sitemap lastmod matches those records. Keep this tracked file when building on a new machine. Guide templates include a visible author, updated date, contents navigation and author context.

The self-hosted font is preloaded with swap rendering. Guides do not load form or animation JavaScript. Vercel caches the unchanged font for one year, images for one day, and versioned CSS/JS for one hour. HTML and crawl files keep revalidation. Existing original-art assets and scroll accessibility remain intact.

Run `python3 build.py`, `python3 check.py` and `python3 tests/seo.py` before publication. The SEO check verifies exact canonical URLs, crawlable internal paths, absence of orphan pages, sitemap parity, entity references, breadcrumb positions, image dimensions, IndexNow key and stable dates. Run the existing motion checks when shared layout or animation code changes.

After the custom-domain deployment is ready, run `python3 submit_indexnow.py`. It verifies the live key and sitemap before notifying IndexNow (including Bing), and records accepted submissions locally to avoid repeats. `--dry-run` lists changes without network access. The ownership key is intentionally public; it is not an account credential. Acceptance means receipt, not indexing or a ranking guarantee. Google does not use this submission mechanism: submit `/sitemap.xml` in Search Console and request inspection of priority pages there.

Google Search Console and Bing Webmaster Tools verification tags are supported through optional `google_site_verification` and `bing_site_verification` values in `site-config.json`. Add only actual tokens supplied by the chosen account, rebuild, deploy, then verify. Search Console already has a domain property under Ben’s personal Google account. Reuse that property; do not create a duplicate. Account verification is separate from the code checks.

After verification, use Search Console and Bing Webmaster Tools to establish the baseline: indexed canonical pages, impressions, clicks, queries and enquiries. Review these monthly before changing content. Core Web Vitals require real-user data; a lab performance score alone is not evidence of a field pass. For local discovery, complete an eligible Google Business Profile with accurate business/service-area details and genuine customer reviews. Do not create fake offices or near-identical suburb pages. Add public case-study evidence, named business context and real customer results as they become available.
