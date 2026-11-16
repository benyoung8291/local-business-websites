"""Shared metadata, truthful entities, stable content dates and readable navigation."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import html
import json
import re

ROOT = Path(__file__).parent
DATE_FILE = ROOT / 'content-dates.json'
DATES = json.loads(DATE_FILE.read_text()) if DATE_FILE.exists() else {}

def content_dates(path, content):
    digest = hashlib.sha256(content.encode()).hexdigest()
    old = DATES.get(path, {})
    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    if old.get('hash') != digest:
        DATES[path] = {'hash': digest, 'published': old.get('published', now), 'modified': now}
    return DATES[path]

def save_dates():
    DATE_FILE.write_text(json.dumps(DATES, indent=2) + '\n')

def readable_date(value):
    return datetime.fromisoformat(value).strftime('%-d %B %Y')

def breadcrumbs(items):
    parts = [f'<a href="{html.escape(url)}">{html.escape(name)}</a>' if url else f'<span aria-current="page">{html.escape(name)}</span>' for name, url in items]
    return '<nav class="breadcrumb" aria-label="Breadcrumb">' + '<span aria-hidden="true"> / </span>'.join(parts) + '</nav>'

def breadcrumb_schema(origin, path, items):
    return {'@type': 'BreadcrumbList', '@id': origin + path + '#breadcrumbs', 'itemListElement': [
        {'@type': 'ListItem', 'position': i, 'name': name, 'item': origin + (url or path)}
        for i, (name, url) in enumerate(items, 1)]}

def entities(origin, email):
    return [
        {'@type': 'WebSite', '@id': origin + '/#website', 'url': origin + '/', 'name': 'Ben Young', 'alternateName': 'Ben Young AI Consulting', 'inLanguage': 'en-AU', 'publisher': {'@id': origin + '/#business'}},
        {'@type': 'Person', '@id': origin + '/#ben', 'name': 'Ben Young', 'url': origin + '/#my-story', 'image': origin + '/assets/ben-young-photo.webp', 'jobTitle': 'Business owner and AI consultant', 'worksFor': {'@id': origin + '/#business'}},
        {'@type': 'Organization', '@id': origin + '/#business', 'name': 'Ben Young', 'url': origin + '/', 'email': email, 'logo': origin + '/assets/favicon.svg', 'founder': {'@id': origin + '/#ben'}, 'areaServed': {'@type': 'City', 'name': 'Melbourne'}, 'description': 'AI consulting, systems integration, workflow automation and custom business apps for Melbourne small businesses and trades.', 'contactPoint': {'@type': 'ContactPoint', 'email': email, 'contactType': 'enquiries', 'availableLanguage': 'English'}},
    ]

def graph(origin, email, path, title, description, dates, extra=None):
    web_page = {'@type': 'WebPage', '@id': origin + path + '#webpage', 'url': origin + path, 'name': title, 'description': description, 'inLanguage': 'en-AU', 'isPartOf': {'@id': origin + '/#website'}, 'about': {'@id': origin + '/#business'}, 'dateModified': dates['modified']}
    nodes = extra or []
    if any(n.get('@type') == 'BreadcrumbList' for n in nodes):
        web_page['breadcrumb'] = {'@id': origin + path + '#breadcrumbs'}
    main = next((n for n in nodes if n.get('@type') in ('Article', 'Service')), None)
    if main:
        web_page['mainEntity'] = {'@id': main['@id']}
    return {'@context': 'https://schema.org', '@graph': entities(origin, email) + [web_page] + nodes}

def faq_html(items, title='A few practical questions', section_id=None):
    attr = f' id="{section_id}"' if section_id else ''
    return f'<section class="questions"{attr}><h2>{title}</h2>' + ''.join(f'<details><summary>{html.escape(q)}</summary><div><p>{a}</p></div></details>' for q, a in items) + '</section>'

def with_contents(body):
    headings = []
    def heading(match):
        title = re.sub('<[^>]+>', '', match.group(1))
        anchor = re.sub(r'[^a-z0-9]+', '-', html.unescape(title).lower()).strip('-')
        # A suffix avoids duplicate IDs if two headings have the same wording.
        anchor = f'section-{len(headings) + 1}-{anchor}'
        headings.append((title, anchor))
        return f'<h2 id="{anchor}">{match.group(1)}</h2>'
    body = re.sub(r'<h2>(.*?)</h2>', heading, body)
    toc = '<nav class="article-contents" aria-label="On this page"><strong>On this page</strong><ul>' + ''.join(f'<li><a href="#{anchor}">{title}</a></li>' for title, anchor in headings) + '</ul></nav>'
    return toc, body

def author_box():
    return '''<section class="author-box" aria-label="About the author"><img src="/assets/ben-young-photo.webp" width="64" height="64" alt="Ben Young" loading="lazy" decoding="async"><div><h2>Written by Ben Young</h2><p>I’m a Melbourne business owner and AI consultant. I replaced the SaaS tools in my own business with one in-house app. <a href="/case-study/">Read my experience</a> or <a href="/#contact">talk to me about your business</a>.</p></div></section>'''
