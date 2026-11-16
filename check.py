"""Check generated pages for broken local links and SEO omissions."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json, xml.etree.ElementTree as ET
ROOT=Path(__file__).parent/'dist'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(); self.links=[]; self.ids=set(); self.h1=0; self.title=''; self.in_title=False; self.meta={}; self.canonical=None; self.ld=[]; self.in_ld=False; self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1': self.h1+=1
  if tag=='title': self.in_title=True
  if tag=='script' and a.get('type')=='application/ld+json': self.in_ld=True
  if 'id' in a:self.ids.add(a['id'])
  if tag=='meta':self.meta[a.get('name',a.get('property'))]=a.get('content')
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
  for key in ('href','src'):
   if key in a:self.links.append(a[key])
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script':self.in_ld=False
 def handle_data(self,data):
  if self.in_title:self.title+=data
  if self.in_ld:self.ld.append(json.loads(data))
pages={f:Page(f.read_text()) for f in ROOT.rglob('*.html')}
errors=[]; titles=set(); descriptions=set()
for f,p in pages.items():
 if p.h1!=1:errors.append(f'{f}: expected one h1')
 if not p.canonical or not p.canonical.startswith('https://www.benjaminyoung.com.au/'):errors.append(f'{f}: canonical missing')
 if not p.meta.get('description') or not p.ld:errors.append(f'{f}: metadata missing')
 if p.title in titles or p.meta['description'] in descriptions:errors.append(f'{f}: duplicated title or description')
 titles.add(p.title);descriptions.add(p.meta['description'])
 for href in p.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:continue
  target=ROOT/u.path.lstrip('/') if u.path.startswith('/') else (f.parent/u.path if u.path else f)
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{f}: missing {href}')
  elif u.fragment and target in pages and u.fragment not in pages[target].ids:errors.append(f'{f}: bad fragment {href}')
 ET.parse(ROOT/'sitemap.xml')
assert not errors,'\n'.join(errors)
assert (ROOT/'assets/ben-young-social-v2.jpg').exists()
print(f'PASS: {len(pages)} pages; local links, fragments, unique titles/descriptions, canonical URLs, JSON-LD and sitemap.')
