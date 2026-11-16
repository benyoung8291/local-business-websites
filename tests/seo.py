"""Validate crawlability, graph references, sitemap parity and stable dates."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from datetime import datetime
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
CONFIG = json.loads((ROOT / 'site-config.json').read_text())
ORIGIN = CONFIG['origin'].rstrip('/')

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []; self.images = []; self.canonicals = []; self.robots = ''; self.ld = []; self.json_text = None
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'a': self.links.append(a.get('href', ''))
        if tag == 'img': self.images.append(a)
        if tag == 'link' and a.get('rel') == 'canonical': self.canonicals.append(a['href'])
        if tag == 'meta' and a.get('name') == 'robots': self.robots = a.get('content', '')
        if tag == 'script' and a.get('type') == 'application/ld+json': self.json_text = ''
    def handle_data(self, data):
        if self.json_text is not None: self.json_text += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.json_text is not None:
            self.ld.append(json.loads(self.json_text)); self.json_text = None

docs = {}
for file in DIST.rglob('*.html'):
    path = '/' + file.relative_to(DIST).as_posix().removesuffix('index.html')
    docs[path] = Document(file.read_text())

indexable = set()
for path, doc in docs.items():
    expected = ORIGIN + ('/404/' if path == '/404.html' else path)
    assert doc.canonicals == [expected], f'Incorrect canonical: {path}'
    if 'noindex' not in doc.robots: indexable.add(path)
    for img in doc.images:
        assert 'alt' in img and int(img.get('width', 0)) > 0 and int(img.get('height', 0)) > 0, f'Image dimensions/alt missing: {path}'
    nodes = doc.ld[0]['@graph']
    ids = {node['@id'] for node in nodes}
    assert len(ids) == len(nodes), f'Duplicate graph IDs: {path}'
    def references(value):
        if isinstance(value, dict):
            if set(value) == {'@id'}: assert value['@id'] in ids, f'Unresolved entity: {path} {value}'
            for child in value.values(): references(child)
        elif isinstance(value, list):
            for child in value: references(child)
    references(nodes)
    for node in nodes:
        if node['@type'] == 'BreadcrumbList':
            items = node['itemListElement']
            assert [v['position'] for v in items] == list(range(1, len(items)+1))
            assert items[-1]['item'] == expected
        if node['@type'] == 'Article':
            assert datetime.fromisoformat(node['datePublished']) <= datetime.fromisoformat(node['dateModified'])

ns = {'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap = ET.parse(DIST/'sitemap.xml')
entries = sitemap.findall('s:url', ns)
locations = [item.find('s:loc', ns).text for item in entries]
assert len(locations) == len(set(locations))
assert set(locations) == {ORIGIN + p for p in indexable}, 'Sitemap must exactly match indexable canonical pages'
dates = json.loads((ROOT/'content-dates.json').read_text())
for item in entries:
    path = item.find('s:loc',ns).text.removeprefix(ORIGIN)
    assert item.find('s:lastmod',ns).text == dates[path]['modified']
    assert datetime.fromisoformat(dates[path]['modified']) <= datetime.now().astimezone()
assert f'Sitemap: {ORIGIN}/sitemap.xml' in (DIST/'robots.txt').read_text()
assert not re.search(r'Disallow:\s*/\s*$', (DIST/'robots.txt').read_text(), re.M)

seen, queue = set(), ['/']
while queue:
    path = queue.pop()
    if path in seen or path not in docs: continue
    seen.add(path)
    for href in docs[path].links:
        url = urlsplit(href)
        if not url.netloc and not url.scheme and url.path.startswith('/'):
            queue.append(url.path)
assert indexable <= seen, f'Orphan pages: {indexable-seen}'
key = CONFIG['indexnow_key']
assert re.fullmatch(r'[A-Za-z0-9-]{8,128}', key)
assert (DIST/(key+'.txt')).read_text().strip() == key

before = (ROOT/'content-dates.json').read_bytes()
subprocess.run([sys.executable, str(ROOT/'build.py')], check=True, capture_output=True)
assert (ROOT/'content-dates.json').read_bytes() == before, 'Rebuild must not fake freshness'
print(f'PASS: {len(indexable)} reachable indexable pages; exact canonicals, sitemap parity, stable dates, schema references, breadcrumbs, image dimensions and IndexNow key.')
