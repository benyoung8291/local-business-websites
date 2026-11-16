"""Notify participating search engines after deployment: python3 submit_indexnow.py.

Uses a deliberately public site-ownership key. No account token is needed.
Checks the live sitemap/key before submitting and avoids repeat notifications.
"""
from pathlib import Path
import argparse
import json
import urllib.request
import urllib.error
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parent
STATE = ROOT / '.openai/.state/indexnow-submissions.json'
NS = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

def entries(xml):
    root = ET.fromstring(xml)
    return {item.find('s:loc', NS).text: item.find('s:lastmod', NS).text for item in root.findall('s:url', NS)}

def fetch(url):
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true', help='List URLs locally without network requests.')
    args = parser.parse_args()
    config = json.loads((ROOT / 'site-config.json').read_text())
    origin = config['origin'].rstrip('/')
    key = config['indexnow_key']
    key_url = origin + '/' + key + '.txt'
    urls = entries((ROOT / 'dist/sitemap.xml').read_bytes())
    assert all(urlsplit(url).netloc == urlsplit(origin).netloc for url in urls)
    previous = json.loads(STATE.read_text()) if STATE.exists() else {}
    changed = [url for url, modified in urls.items() if previous.get(url) != modified]
    changed += [url for url in previous if url not in urls and urlsplit(url).netloc == urlsplit(origin).netloc]
    if args.dry_run:
        print(json.dumps({'changed_urls': changed, 'key_location': key_url}, indent=2))
        return
    if not changed:
        print('No changed URLs to submit.')
        return
    if fetch(key_url).decode().strip() != key:
        raise SystemExit('Live IndexNow key does not match. Deploy before submitting.')
    if entries(fetch(origin + '/sitemap.xml')) != urls:
        raise SystemExit('Live sitemap does not match this build. Wait for deployment before submitting.')
    payload = {'host': urlsplit(origin).netloc, 'key': key, 'keyLocation': key_url, 'urlList': changed}
    request = urllib.request.Request('https://api.indexnow.org/indexnow', data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json; charset=utf-8'}, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            status = response.status
    except urllib.error.HTTPError as error:
        raise SystemExit(f'IndexNow returned HTTP {error.code}: {error.read().decode()[:300]}')
    if status not in (200, 202):
        raise SystemExit(f'Unexpected IndexNow status {status}; submission state was not saved.')
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(urls, indent=2) + '\n')
    print(f'IndexNow received {len(changed)} changed URLs (HTTP {status}). Receipt is not an indexing or ranking guarantee.')

if __name__ == '__main__':
    main()
