/* Production-only Analytics with a persistent, unobtrusive opt-out. */
(() => {
  'use strict';
  const tag = document.querySelector('script[data-analytics-id]');
  const id = tag?.dataset.analyticsId;
  const preferences = document.querySelector('[data-analytics-preferences]');
  if (!/^G-[A-Z0-9]+$/.test(id || '') || location.hostname !== 'www.benjaminyoung.com.au') return;
  const key = 'ben-young-analytics-consent-v1';
  let consent = false, started = false;
  window.dataLayer = window.dataLayer || [];
  const gtag = function () { window.dataLayer.push(arguments); };
  const safeUrl = value => { try { const url = new URL(value); return url.origin + url.pathname; } catch { return ''; } };
  const page = {page_location: safeUrl(location.href), page_referrer: safeUrl(document.referrer), page_title: document.title};
  gtag('consent', 'default', {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
  function allow() {
    consent = true;
    window['ga-disable-' + id] = false;
    gtag('consent', 'update', {analytics_storage:'granted'});
    if (started) return;
    started = true;
    gtag('js', new Date());
    gtag('config', id, {...page, send_page_view:false, allow_google_signals:false, allow_ad_personalization_signals:false, cookie_flags:'SameSite=Lax;Secure'});
    gtag('event', 'page_view', {...page, send_to:id});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
  }
  function decline() {
    consent = false;
    window['ga-disable-' + id] = true;
    gtag('consent', 'update', {analytics_storage:'denied'});
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of ['', ';domain=www.benjaminyoung.com.au', ';domain=.benjaminyoung.com.au']) {
        document.cookie = name + '=;Max-Age=0;path=/' + domain + ';SameSite=Lax;Secure';
      }
    }
  }
  function choose(value) {
    try { localStorage.setItem(key, value); } catch {}
    value === 'allowed' ? allow() : decline();
    preferences.textContent = consent ? 'Turn off analytics' : 'Turn on analytics';
  }

  window.BenAnalytics = Object.freeze({track(name, method) {
    if (!consent) return;
    if (name === 'generate_lead') gtag('event', name, {...page, send_to:id, method:'contact_form'});
    if (name === 'contact_click' && ['email','enquiry'].includes(method)) gtag('event', name, {...page, send_to:id, method});
  }});
  preferences.hidden = false;
  preferences.addEventListener('click', () => choose(consent ? 'declined' : 'allowed'));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('mailto:')) window.BenAnalytics.track('contact_click', 'email');
    else if (href.endsWith('#contact')) window.BenAnalytics.track('contact_click', 'enquiry');
  });
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  if (saved === 'declined') decline();
  else allow();
  preferences.textContent = consent ? 'Turn off analytics' : 'Turn on analytics';
})();
