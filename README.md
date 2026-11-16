# Ben Young — AI consulting

Static, mobile-friendly website for BenjaminYoung.com.au. Generated HTML, CSS and a small progressive-enhancement script; no runtime framework; open-source fonts are served locally.

## Update

Edit `templates/home.html` and `build.py` for content, `dist/assets/style.css` for styling and `site-config.json` for canonical origin, contact email and Formspree endpoint. Run:

```sh
python3 build.py
python3 check.py
python3 -m http.server 8765 --directory dist
```

Commit the generated `dist/` with source changes. Vercel serves `dist/` directly; no package installation or build is required. `.openai/hosting.json` is only for the private Sites copy and is not needed by Vercel.

## Pages and search

Homepage targets AI consulting for Melbourne small business. Six distinct guides cover getting started, trade businesses, integration, automation, custom apps and replacing job management software. A separate case study uses the owner's supplied claims. Guides are reachable through the footer, service links and related articles. All pages include unique titles/descriptions, canonical URLs, social metadata and JSON-LD. `sitemap.xml` lists ten indexable pages. `404.html` is noindex.

After domain deployment, submit `https://www.benjaminyoung.com.au/sitemap.xml` in the owner's Google Search Console. Indexing and rankings depend on search engines and are not guaranteed. The private Sites copy is not the SEO destination.

## Enquiries

Formspree endpoint: https://formspree.io/f/xbgogzjr. Intended recipient: benjaminyoung8@gmail.com. The destination inbox is configured in Formspree, not in website HTML. Confirm its recipient and activation in the Formspree dashboard; this code cannot verify mailbox delivery. A direct email link is provided.

Native HTML validation, a honeypot, duplicate-submission prevention, a 20-second timeout and accessible status messages are included. Success is shown only after an HTTP success from Formspree; failures preserve fields. Without JavaScript the form posts directly to Formspree.

## Validation

`check.py` verifies local links/fragments, one H1, unique metadata, canonical URLs, JSON-LD and sitemap parsing. Desktop/mobile layout, accordion expansion and empty-form validation were checked in the browser. Form success/error/timeout handling was tested with mocked responses, without sending a live enquiry.

## Existing production project

Vercel team: team_RoZBcsghJxxr0DbcBLVnOa1X
Project: local-business-websites (prj_IPA4qEkdx9bABFzwavzsA35pO4zg)
GitHub: benyoung8291/local-business-websites
Production branch: claude/marketing-website-services-RbvhW
Previous production commit: d2c4d685a3679020a0399f07bce0dfb0029edeb2
Previous deployment: dpl_DkgdmiqEKpjzBqPZQfwQuJ1hFXt8
The old desktop remains recoverable from Git history and the previous Vercel deployment.

## Design direction

The revised identity uses Ben Young, Inter Tight and IBM Plex Mono, a black/white/cobalt palette, a small header signature, compact first-person introduction, an unboxed service list and a short enquiry form. Fonts are self-hosted; their SIL Open Font License files are in `dist/assets/fonts/`.

Research references reviewed on 16 November 2026:
- Justin Schüler, featured on One Page Love 12 November 2026: https://onepagelove.com/justin-schuler — compact editorial layout and direct personal introduction.
- Pete Sena, featured on One Page Love 4 November 2026: https://onepagelove.com/pete-sena — personal identity and evidence-led consulting presentation.
- Jamie R. Cox: https://jamiercox.com/ — distinctive typography and a personal consulting voice; discovered through Site Builder Report's consulting gallery.

The design is an original implementation; no reference-site assets or text are reused.
