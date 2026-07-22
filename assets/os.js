/* ============================================================
   notmacOS — the entire operating system, one file, no build step.
   ============================================================ */
(function () {
'use strict';

/* ============ STATE ============ */
const LS_KEY = 'notmacos';
const store = (() => {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { /* incognito etc. */ }
    return {
        get: (k, fallback) => (k in data ? data[k] : fallback),
        set: (k, v) => {
            data[k] = v;
            try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
        }
    };
})();

const state = {
    theme: store.get('theme', 'light'),
    wallpaper: store.get('wallpaper', 'sequoia'),
    volume: store.get('volume', 60),
    wifi: true,
    trashEmptied: false,
    booted: false
};

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const isPhone = () => window.innerWidth < 720;

/* ============ AUDIO ============ */
let audioCtx = null;
function ctx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}
function vol() { return state.volume / 100; }
function tone(freq, dur, type, gain, when) {
    try {
        const ac = ctx();
        const t = ac.currentTime + (when || 0);
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = type || 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime((gain || 0.25) * vol() + 0.0001, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(ac.destination);
        o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* no audio */ }
}
function startupChime() {
    // A very legally-distinct startup chord.
    [261.63, 329.63, 392.0, 523.25].forEach(f => tone(f, 1.6, 'sine', 0.12));
}
function beep() { tone(880, 0.12, 'square', 0.06); }

/* ============ TOASTS & EASTER EGGS ============ */
function toast(glyph, title, body, ms) {
    const t = el('div', 'toast', `<div class="glyph">${glyph}</div><div><b>${esc(title)}</b><p>${esc(body || '')}</p></div>`);
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, ms || 4600);
}

const EGGS = {
    konami: 'Entered the Konami code',
    barrel: 'Did a barrel roll',
    sudo: 'Made a sandwich with sudo',
    rmrf: 'Deleted the entire operating system',
    oldsite: 'Found the old website in the Trash',
    matrix: 'Followed the white rabbit',
    sl: 'Missed a train (typed sl)',
    cowsay: 'Had a chat with a cow',
    neofetch: 'Flexed with neofetch',
    password: 'Typed "password" as the password',
    hotdog: 'Unlocked Hot Dog Stand™ wallpaper',
    trash: 'Actually emptied the Trash',
    mail: 'Opened the email marked DO NOT OPEN',
    hunter2: 'Logged in as hunter2',
    fortytwo: 'Calculated the meaning of life',
    artist: 'Painted a masterpiece in Paint',
    daemon: 'Killed the easter egg daemon',
    zork: 'Won the tiny text adventure',
    xyzzy: 'Said the magic word',
    hal: 'Asked Seri to open the pod bay doors',
    breakout: 'Cleared a level of Brick Out',
    void: 'Stared into the void until it blinked',
    toasters: 'Witnessed the flying toasters',
    disco: 'Turned the whole computer into a disco',
    beachball: 'Summoned the spinning beach ball'
};
function foundEggs() { return store.get('eggs', []); }
function egg(id) {
    const found = foundEggs();
    if (found.includes(id)) return;
    found.push(id);
    store.set('eggs', found);
    tone(1318, 0.3, 'sine', 0.15); tone(1760, 0.4, 'sine', 0.12, 0.12);
    toast('🥚', `Easter egg found! (${found.length}/${Object.keys(EGGS).length})`, EGGS[id], 6000);
    if (found.length === Object.keys(EGGS).length) {
        setTimeout(() => {
            toast('🏆', 'ALL EASTER EGGS FOUND', 'You have achieved absolutely nothing of value. Incredible work.', 10000);
            emojiRain(['🏆', '🎉', '🥚', '🍎']);
        }, 1200);
    }
}

/* ============ FX ============ */
function emojiRain(emojis, count) {
    for (let i = 0; i < (count || 40); i++) {
        const d = el('div', 'rain-emoji');
        d.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        d.style.left = Math.random() * 100 + 'vw';
        d.style.animationDuration = (2 + Math.random() * 2.5) + 's';
        d.style.animationDelay = (Math.random() * 1.5) + 's';
        d.style.fontSize = (20 + Math.random() * 22) + 'px';
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 6500);
    }
}
function barrelRoll() {
    egg('barrel');
    document.body.classList.remove('barrel-roll');
    void document.body.offsetWidth;
    document.body.classList.add('barrel-roll');
    setTimeout(() => document.body.classList.remove('barrel-roll'), 1400);
}
function matrixRain(seconds) {
    egg('matrix');
    const c = el('canvas'); c.id = 'matrix-canvas';
    document.body.appendChild(c);
    c.width = innerWidth; c.height = innerHeight;
    const g = c.getContext('2d');
    const cols = Math.floor(c.width / 16);
    const drops = new Array(cols).fill(1);
    const chars = 'アイウエオカキクケコ0123456789ABCDEF';
    const iv = setInterval(() => {
        g.fillStyle = 'rgba(0,0,0,0.1)';
        g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = '#0f0'; g.font = '15px monospace';
        drops.forEach((y, i) => {
            g.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16);
            drops[i] = (y * 16 > c.height && Math.random() > 0.975) ? 0 : y + 1;
        });
    }, 45);
    c.style.opacity = '0'; c.style.transition = 'opacity .5s';
    requestAnimationFrame(() => c.style.opacity = '1');
    setTimeout(() => {
        c.style.opacity = '0';
        setTimeout(() => { clearInterval(iv); c.remove(); }, 600);
    }, (seconds || 6) * 1000);
}
function disco(seconds) {
    egg('disco');
    document.body.classList.add('disco');
    emojiRain(['🪩', '🕺', '💃', '🎶', '✨'], 36);
    for (let i = 0; i < 10; i++) {
        tone(i % 2 ? 220 : 110, 0.14, 'square', 0.14, i * 0.28);
        if (i % 4 === 2) tone(1760, 0.05, 'square', 0.05, i * 0.28);
    }
    setTimeout(() => document.body.classList.remove('disco'), (seconds || 8) * 1000);
}
function beachBall() {
    if ($('#beachball')) return;
    egg('beachball');
    const b = el('div'); b.id = 'beachball'; b.textContent = '🏐';
    document.body.appendChild(b);
    let x = innerWidth / 2, y = -60, vx = (Math.random() > 0.5 ? 1 : -1) * 4.5, vy = 3;
    const iv = setInterval(() => {
        x += vx; y += vy; vy += 0.25;
        if (x < 0 || x > innerWidth - 64) { vx = -vx; tone(300 + Math.random() * 200, 0.05, 'square', 0.05); }
        if (y > innerHeight - 64) { y = innerHeight - 64; vy = -Math.abs(vy) * 0.88; tone(180, 0.06, 'square', 0.06); }
        b.style.transform = `translate(${x}px, ${y}px) rotate(${x * 2}deg)`;
    }, 16);
    setTimeout(() => { clearInterval(iv); b.remove(); }, 12000);
}

/* ============ SCREENSAVER (flying toasters, in loving memory of After Dark) ============ */
const Screensaver = {
    timer: null, active: false, startedAt: 0, DELAY: 120000,
    init() {
        const reset = () => {
            if (this.active && Date.now() - this.startedAt > 900) this.stop();
            this.arm();
        };
        ['pointermove', 'pointerdown', 'keydown', 'wheel'].forEach(ev =>
            document.addEventListener(ev, reset, { passive: true }));
        this.arm();
    },
    arm() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if ($('#desktop').hidden) { this.arm(); return; }
            this.start();
        }, this.DELAY);
    },
    start() {
        if (this.active || $('#desktop').hidden) return;
        this.active = true;
        this.startedAt = Date.now();
        egg('toasters');
        const o = el('div'); o.id = 'screensaver';
        for (let i = 0; i < 18; i++) {
            const t = el('div', 'fly-toast');
            t.textContent = ['🍞', '🍞', '🍞', '⏰', '🥐'][Math.floor(Math.random() * 5)];
            t.style.left = (Math.random() * 160) + 'vw';
            t.style.top = (Math.random() * 100 - 40) + 'vh';
            t.style.fontSize = (26 + Math.random() * 30) + 'px';
            t.style.animationDuration = (9 + Math.random() * 10) + 's';
            t.style.animationDelay = (-Math.random() * 12) + 's';
            o.appendChild(t);
        }
        o.appendChild(el('div', 'ss-note', 'This is what the computer does when you stop looking.'));
        document.body.appendChild(o);
    },
    stop() {
        this.active = false;
        const o = $('#screensaver');
        if (o) { o.style.opacity = '0'; setTimeout(() => o.remove(), 350); }
    }
};

/* ============ WINDOW MANAGER ============ */
const WM = {
    z: 200,
    wins: new Map(),
    nextId: 1,

    create(opts) {
        const id = 'w' + (this.nextId++);
        const w = el('div', 'window');
        w.dataset.app = opts.app || '';
        w.dataset.wid = id;

        const width = Math.min(opts.width || 520, innerWidth - 12);
        const height = Math.min(opts.height || 380, innerHeight - 80);
        w.style.width = width + 'px';
        w.style.height = height + 'px';
        const offset = (this.wins.size % 7) * 26;
        w.style.left = (opts.x !== undefined ? opts.x : Math.max(6, (innerWidth - width) / 2 - 90 + offset)) + 'px';
        w.style.top = (opts.y !== undefined ? opts.y : Math.max(38, (innerHeight - height) / 2 - 60 + offset * 0.7)) + 'px';

        const bar = el('div', 'titlebar');
        const traffic = el('div', 'traffic');
        const btnClose = el('button', 'tl tl-close', '✕');
        const btnMin = el('button', 'tl tl-min', '−');
        const btnMax = el('button', 'tl tl-max', '＋');
        traffic.append(btnClose, btnMin, btnMax);
        const title = el('div', 'win-title', esc(opts.title || ''));
        bar.append(traffic, title, el('div', 'titlebar-spacer'));

        const body = el('div', 'win-body');
        if (typeof opts.content === 'string') body.innerHTML = opts.content;
        else if (opts.content) body.appendChild(opts.content);

        const handle = el('div', 'resize-handle');
        w.append(bar, body, handle);
        $('#windows').appendChild(w);

        const rec = { id, el: w, body, title, app: opts.app, name: opts.title, minimized: false, onClose: opts.onClose, prev: null };
        this.wins.set(id, rec);

        btnClose.addEventListener('click', e => { e.stopPropagation(); this.close(id); });
        btnMin.addEventListener('click', e => { e.stopPropagation(); this.minimize(id); });
        btnMax.addEventListener('click', e => { e.stopPropagation(); this.zoom(id); });
        bar.addEventListener('dblclick', () => this.zoom(id));
        w.addEventListener('pointerdown', () => this.focus(id));

        this.makeDraggable(rec, bar);
        this.makeResizable(rec, handle);
        this.focus(id);

        if (isPhone() && !opts.noAutoMax) this.zoom(id);
        Dock.refresh();
        return rec;
    },

    focus(id) {
        const rec = this.wins.get(id);
        if (!rec) return;
        this.wins.forEach(r => r.el.classList.remove('focused'));
        rec.el.classList.add('focused');
        rec.el.style.zIndex = ++this.z;
        MenuBar.setApp(rec.app, rec.name);
    },

    close(id) {
        const rec = this.wins.get(id);
        if (!rec) return;
        if (rec.onClose) try { rec.onClose(); } catch (e) {}
        rec.el.classList.add('closing');
        this.wins.delete(id);
        setTimeout(() => rec.el.remove(), 170);
        const top = this.topWindow();
        MenuBar.setApp(top ? top.app : 'finder', top ? top.name : null);
        Dock.refresh();
    },

    minimize(id) {
        const rec = this.wins.get(id);
        if (!rec) return;
        rec.minimized = true;
        rec.el.classList.add('minimizing');
        setTimeout(() => { rec.el.style.display = 'none'; rec.el.classList.remove('minimizing'); }, 300);
        Dock.refresh();
    },

    restoreApp(app) {
        let restored = false;
        this.wins.forEach(rec => {
            if (rec.app === app && rec.minimized) {
                rec.minimized = false;
                rec.el.style.display = '';
                this.focus(rec.id);
                restored = true;
            }
        });
        return restored;
    },

    zoom(id) {
        const rec = this.wins.get(id);
        if (!rec) return;
        const s = rec.el.style;
        if (rec.prev) {
            Object.assign(s, rec.prev);
            rec.prev = null;
        } else {
            rec.prev = { left: s.left, top: s.top, width: s.width, height: s.height };
            s.left = '4px'; s.top = '34px';
            s.width = (innerWidth - 8) + 'px';
            s.height = (innerHeight - 44 - (isPhone() ? 62 : 76)) + 'px';
        }
    },

    topWindow() {
        let top = null, z = -1;
        this.wins.forEach(rec => {
            if (rec.minimized) return;
            const zi = parseInt(rec.el.style.zIndex || 0, 10);
            if (zi > z) { z = zi; top = rec; }
        });
        return top;
    },

    appWindows(app) {
        return Array.from(this.wins.values()).filter(r => r.app === app);
    },

    closeApp(app) {
        this.appWindows(app).forEach(r => this.close(r.id));
    },

    makeDraggable(rec, bar) {
        let sx, sy, ox, oy, dragging = false;
        bar.addEventListener('pointerdown', e => {
            if (e.target.closest('.tl')) return;
            dragging = true;
            sx = e.clientX; sy = e.clientY;
            ox = rec.el.offsetLeft; oy = rec.el.offsetTop;
            bar.setPointerCapture(e.pointerId);
        });
        bar.addEventListener('pointermove', e => {
            if (!dragging) return;
            rec.el.style.left = Math.min(innerWidth - 60, Math.max(-rec.el.offsetWidth + 100, ox + e.clientX - sx)) + 'px';
            rec.el.style.top = Math.min(innerHeight - 40, Math.max(30, oy + e.clientY - sy)) + 'px';
        });
        bar.addEventListener('pointerup', () => dragging = false);
        bar.addEventListener('pointercancel', () => dragging = false);
    },

    makeResizable(rec, handle) {
        let sx, sy, ow, oh, resizing = false;
        handle.addEventListener('pointerdown', e => {
            resizing = true;
            sx = e.clientX; sy = e.clientY;
            ow = rec.el.offsetWidth; oh = rec.el.offsetHeight;
            handle.setPointerCapture(e.pointerId);
            e.stopPropagation();
        });
        handle.addEventListener('pointermove', e => {
            if (!resizing) return;
            rec.el.style.width = Math.max(280, ow + e.clientX - sx) + 'px';
            rec.el.style.height = Math.max(160, oh + e.clientY - sy) + 'px';
        });
        handle.addEventListener('pointerup', () => resizing = false);
    },

    dialog(opts) {
        const wrap = el('div');
        const body = el('div', 'dialog-body',
            `<div class="glyph">${opts.glyph || '⚠️'}</div><h3>${esc(opts.title)}</h3><p>${opts.html || esc(opts.text || '')}</p>`);
        const actions = el('div', 'dialog-actions');
        (opts.buttons || [{ label: 'OK', primary: true }]).forEach(b => {
            const btn = el('button', 'btn' + (b.primary ? ' primary' : ''), esc(b.label));
            actions.appendChild(btn);
            btn.addEventListener('click', () => { WM.close(rec.id); if (b.onClick) b.onClick(); });
        });
        wrap.append(body, actions);
        const rec = this.create({ app: opts.app || 'finder', title: '', content: wrap, width: 340, height: 10, noAutoMax: true });
        rec.el.style.height = 'auto';
        return rec;
    }
};

/* ============ APP REGISTRY ============ */
const APPS = {
    finder:   { name: 'Finder',          glyph: '🙂', tile: 'tile-blue',   open: () => FinderApp.open() },
    safari:   { name: 'Safari',          glyph: '🧭', tile: 'tile-white',  open: () => SafariApp.open() },
    mail:     { name: 'Mail',            glyph: '✉️', tile: 'tile-blue',   open: () => MailApp.open() },
    photos:   { name: 'Photos',          glyph: '🌸', tile: 'tile-white',  open: () => PhotosApp.open() },
    notes:    { name: 'Notes',           glyph: '📝', tile: 'tile-yellow', open: () => NotesApp.open() },
    terminal: { name: 'Terminal',        glyph: '>_', tile: 'tile-dark',   open: () => TerminalApp.open() },
    calculator: { name: 'Calculator',    glyph: '🧮', tile: 'tile-grey',   open: () => CalcApp.open() },
    music:    { name: 'Music',           glyph: '🎹', tile: 'tile-pink',   open: () => MusicApp.open() },
    paint:    { name: 'Paint',           glyph: '🎨', tile: 'tile-white',  open: () => PaintApp.open() },
    games:    { name: 'Games',           glyph: '🕹️', tile: 'tile-purple', open: () => GamesApp.open() },
    snake:    { name: 'Snake II',        glyph: '🐍', tile: 'tile-green',  hidden: true, open: () => SnakeGame.open() },
    mines:    { name: 'Minesweeper',     glyph: '💣', tile: 'tile-grey',   hidden: true, open: () => MinesGame.open() },
    ttt:      { name: 'Tic-Tac-Toe',     glyph: '⭕', tile: 'tile-red',    hidden: true, open: () => TTTGame.open() },
    g2048:    { name: '2048',            glyph: '🔢', tile: 'tile-yellow', hidden: true, open: () => Game2048.open() },
    breakout: { name: 'Brick Out',       glyph: '🧱', tile: 'tile-red',    hidden: true, open: () => BreakoutGame.open() },
    activity: { name: 'Activity Monitor', glyph: '📈', tile: 'tile-grey',  hidden: true, open: () => ActivityApp.open() },
    seri:     { name: 'Seri',            glyph: '🔮', tile: 'tile-purple', hidden: true, open: () => SeriApp.open() },
    settings: { name: 'System Settings', glyph: '⚙️', tile: 'tile-grey',   open: (pane) => SettingsApp.open(pane) },
    trash:    { name: 'Trash',           glyph: '🗑️', tile: 'tile-white',  open: () => TrashApp.open() }
};
function launch(appId, arg) {
    const app = APPS[appId];
    if (!app) return;
    if (WM.restoreApp(appId)) return;
    const existing = WM.appWindows(appId);
    if (existing.length && app.single !== false) { WM.focus(existing[0].id); if (appId !== 'settings' || !arg) return; }
    Dock.bounce(appId);
    app.open(arg);
}

/* ============ MENU BAR ============ */
const MenuBar = {
    currentApp: 'finder',

    setApp(appId) {
        this.currentApp = appId && APPS[appId] ? appId : 'finder';
        $('.mb-appname').textContent = APPS[this.currentApp].name;
    },

    appleMenu() {
        return [
            { label: 'About This Mac', action: () => AboutApp.open() },
            { sep: true },
            { label: 'System Settings…', action: () => launch('settings') },
            { label: 'App Store…', action: () => toast('🛍️', 'App Store', 'Everything here is already free. Suspiciously free.') },
            { label: 'Buy notmacOS Pro…', action: () => WM.dialog({
                glyph: '💳', title: 'notmacOS Pro',
                html: 'Everything you already have, but with the word <b>Pro</b> after it.<br><br><b>$0.00/month</b> · billed never · cancel anytime by closing the tab',
                buttons: [
                    { label: 'No Thanks' },
                    { label: 'Subscribe', primary: true, onClick: () => toast('💳', 'Payment failed', 'Card declined: the amount was $0.00 and your bank got suspicious.') }
                ]
            }) },
            { sep: true },
            { label: 'Force Quit…', kbd: '⌥⌘⎋', action: () => ForceQuit.open() },
            { sep: true },
            { label: 'Sleep', action: () => Power.sleep() },
            { label: 'Restart…', action: () => Power.restart() },
            { label: 'Shut Down…', action: () => Power.shutdown() },
            { sep: true },
            { label: 'Lock Screen', kbd: '⌃⌘Q', action: () => Power.lock() },
            { label: 'Log Out Guest…', kbd: '⇧⌘Q', action: () => Power.lock() }
        ];
    },

    appMenu() {
        const name = APPS[this.currentApp].name;
        return [
            { label: `About ${name}`, action: () => WM.dialog({ glyph: APPS[this.currentApp].glyph, title: name, text: 'Version 1.0. Handcrafted pixels. No electrons were harmed.' }) },
            { sep: true },
            { label: 'Settings…', kbd: '⌘,', action: () => launch('settings') },
            { sep: true },
            { label: 'Hide ' + name, kbd: '⌘H', action: () => { const t = WM.topWindow(); if (t) WM.minimize(t.id); } },
            { label: `Quit ${name}`, kbd: '⌘Q', action: () => WM.closeApp(this.currentApp) }
        ];
    },

    genericMenus() {
        return {
            'File': [
                { label: 'New Window', kbd: '⌘N', action: () => launch(this.currentApp) },
                { label: 'New Folder', kbd: '⇧⌘N', action: () => toast('📁', 'New Folder', 'untitled folder created. Somewhere. Probably.') },
                { sep: true },
                { label: 'Close Window', kbd: '⌘W', action: () => { const t = WM.topWindow(); if (t) WM.close(t.id); } },
                { label: 'Print…', kbd: '⌘P', action: () => toast('🖨️', 'Print', 'Your printer is out of magenta. It is always out of magenta.') }
            ],
            'Edit': [
                { label: 'Undo', kbd: '⌘Z', action: () => toast('↩️', 'Undo', 'There is no undo here. We live with our choices.') },
                { label: 'Redo', kbd: '⇧⌘Z', action: () => toast('↪️', 'Redo', 'Redoing the thing we never did.') },
                { sep: true },
                { label: 'Cut', kbd: '⌘X', disabled: true },
                { label: 'Copy', kbd: '⌘C', disabled: true },
                { label: 'Paste', kbd: '⌘V', disabled: true },
                { sep: true },
                { label: 'Emoji & Symbols', action: () => emojiRain(['😀', '🎉', '🦄', '🍕', '🚀', '🐙']) }
            ],
            'View': [
                { label: 'Toggle Dark Mode', action: () => Theme.toggle() },
                { label: 'Change Wallpaper', action: () => Theme.cycleWallpaper() },
                { sep: true },
                { label: 'Do a Barrel Roll', action: () => barrelRoll() }
            ],
            'Window': [
                { label: 'Minimize', kbd: '⌘M', action: () => { const t = WM.topWindow(); if (t) WM.minimize(t.id); } },
                { label: 'Zoom', action: () => { const t = WM.topWindow(); if (t) WM.zoom(t.id); } },
                { sep: true },
                { label: 'Bring All to Front', action: () => toast('🪟', 'Windows', 'They were already in front. You can see them. This is a website.') }
            ],
            'Help': [
                { label: 'notmacOS Help', action: () => WM.dialog({ glyph: '🆘', title: 'Help', html: 'There is no help. There is only the Terminal.<br><br>Try typing <b>help</b> in there.' }) },
                { label: 'Search Easter Eggs…', action: () => EggTracker.open() }
            ]
        };
    },

    openDropdown(anchor, items) {
        const dd = $('#menu-dropdown');
        dd.innerHTML = '';
        items.forEach(item => {
            if (item.sep) { dd.appendChild(el('div', 'dd-sep')); return; }
            const row = el('div', 'dd-item' + (item.disabled ? ' disabled' : ''),
                `<span>${esc(item.label)}</span>${item.kbd ? `<span class="dd-kbd">${item.kbd}</span>` : ''}`);
            row.addEventListener('click', () => { this.closeDropdown(); if (item.action) item.action(); });
            dd.appendChild(row);
        });
        const r = anchor.getBoundingClientRect();
        dd.hidden = false;
        dd.style.left = Math.min(r.left, innerWidth - dd.offsetWidth - 8) + 'px';
        dd.style.top = (r.bottom + 4) + 'px';
        $$('.mb-item').forEach(m => m.classList.remove('open'));
        anchor.classList.add('open');
        this.openAnchor = anchor;
    },

    closeDropdown() {
        $('#menu-dropdown').hidden = true;
        $$('.mb-item').forEach(m => m.classList.remove('open'));
        this.openAnchor = null;
    },

    init() {
        // Build the generic menu titles
        const holder = $('#mb-menus');
        Object.keys(this.genericMenus()).forEach(title => {
            const b = el('button', 'mb-item mb-hidden-on-phone', esc(title));
            b.dataset.menuTitle = title;
            holder.appendChild(b);
        });

        $('#menubar').addEventListener('click', e => {
            const item = e.target.closest('.mb-item');
            if (!item) return;
            if (item.classList.contains('mb-apple')) return this.toggle(item, this.appleMenu());
            if (item.classList.contains('mb-appname')) return this.toggle(item, this.appMenu());
            if (item.dataset.menuTitle) return this.toggle(item, this.genericMenus()[item.dataset.menuTitle]);
        });
        // hover-to-switch while a menu is open
        $('#menubar').addEventListener('mouseover', e => {
            if (!this.openAnchor) return;
            const item = e.target.closest('.mb-item');
            if (!item || item === this.openAnchor) return;
            if (item.classList.contains('mb-apple')) this.openDropdown(item, this.appleMenu());
            else if (item.classList.contains('mb-appname')) this.openDropdown(item, this.appMenu());
            else if (item.dataset.menuTitle) this.openDropdown(item, this.genericMenus()[item.dataset.menuTitle]);
        });

        $('#mb-spotlight').addEventListener('click', e => { e.stopPropagation(); Spotlight.toggle(); });
        $('#mb-cc').addEventListener('click', e => { e.stopPropagation(); ControlCenter.toggle(); });
        $('#mb-wifi').addEventListener('click', e => { e.stopPropagation(); launch('settings', 'wifi'); });
        let batteryClicks = 0;
        $('#mb-battery').addEventListener('click', () => {
            batteryClicks++;
            if (batteryClicks === 1) toast('🔋', 'Battery: 88%', 'Powered by your device. And dreams.');
            if (batteryClicks >= 5) { batteryClicks = 0; toast('🔌', 'Battery: ∞%', 'This Mac runs entirely on your attention span.'); }
        });
        $('#mb-clock').addEventListener('click', () => {
            toast('🕰️', 'It is currently now', 'It has been now for quite some time.');
        });

        document.addEventListener('click', e => {
            if (!e.target.closest('#menu-dropdown') && !e.target.closest('.mb-item')) this.closeDropdown();
        });

        // clock
        const tick = () => {
            const d = new Date();
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            let h = d.getHours(); const am = h < 12 ? 'am' : 'pm'; h = h % 12 || 12;
            const m = String(d.getMinutes()).padStart(2, '0');
            $('#mb-clock').textContent = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}  ${h}:${m} ${am}`;
        };
        tick(); setInterval(tick, 5000);
    },

    toggle(anchor, items) {
        if (this.openAnchor === anchor) this.closeDropdown();
        else this.openDropdown(anchor, items);
    }
};

/* ============ DOCK ============ */
const Dock = {
    order: ['finder', 'safari', 'mail', 'photos', 'notes', 'terminal', 'calculator', 'music', 'paint', 'games', 'settings', '|', 'trash'],

    init() {
        const dock = $('#dock');
        this.order.forEach(id => {
            if (id === '|') { dock.appendChild(el('div', 'dock-sep')); return; }
            const a = APPS[id];
            const b = el('button', 'dock-item');
            b.dataset.app = id;
            b.innerHTML = `<span class="dock-icon ${a.tile}">${a.glyph}</span><span class="dock-dot"></span><span class="dock-tip">${esc(a.name)}</span>`;
            if (id === 'mail' && !store.get('mailRead', false)) b.querySelector('.dock-icon').appendChild(el('span', 'dock-badge', '1'));
            if (id === 'terminal') { const ic = b.querySelector('.dock-icon'); ic.style.color = '#33e659'; ic.style.fontFamily = 'var(--mono)'; ic.style.fontSize = '17px'; ic.style.fontWeight = '700'; }
            b.addEventListener('click', () => launch(id));
            dock.appendChild(b);
        });

        // magnification (pointer-fine devices only)
        if (matchMedia('(pointer: fine)').matches) {
            dock.addEventListener('mousemove', e => {
                $$('.dock-item', dock).forEach(item => {
                    const r = item.getBoundingClientRect();
                    const d = Math.abs(e.clientX - (r.left + r.width / 2));
                    const s = 1 + 0.42 * Math.exp(-(d * d) / (2 * 70 * 70));
                    item.style.transform = `scale(${s.toFixed(3)}) translateY(${(-(s - 1) * 9).toFixed(1)}px)`;
                });
            });
            dock.addEventListener('mouseleave', () => {
                $$('.dock-item', dock).forEach(item => item.style.transform = '');
            });
        }
    },

    bounce(appId) {
        const item = $(`.dock-item[data-app="${appId}"] .dock-icon`);
        if (!item) return;
        item.classList.remove('bounce');
        void item.offsetWidth;
        item.classList.add('bounce');
        setTimeout(() => item.classList.remove('bounce'), 1200);
    },

    refresh() {
        $$('.dock-item').forEach(item => {
            const running = WM.appWindows(item.dataset.app).length > 0;
            item.classList.toggle('running', running || item.dataset.app === 'finder');
        });
    }
};

/* ============ THEME / WALLPAPER ============ */
const WALLPAPERS = ['sequoia', 'sonoma', 'ventura', 'monterey', 'graphite'];
const Theme = {
    apply() {
        document.documentElement.dataset.theme = state.theme;
        $('#wallpaper').className = 'wp-' + state.wallpaper;
        const ccd = $('#cc-dark');
        if (ccd) { ccd.classList.toggle('off', state.theme !== 'dark'); $('#cc-dark-label').textContent = state.theme === 'dark' ? 'On' : 'Off'; }
    },
    set(theme) { state.theme = theme; store.set('theme', theme); this.apply(); },
    toggle() { this.set(state.theme === 'dark' ? 'light' : 'dark'); },
    setWallpaper(wp) { state.wallpaper = wp; store.set('wallpaper', wp); this.apply(); },
    cycleWallpaper() {
        const list = WALLPAPERS;
        this.setWallpaper(list[(list.indexOf(state.wallpaper) + 1) % list.length]);
    }
};

/* ============ POWER ============ */
const Power = {
    sleep() {
        MenuBar.closeDropdown();
        const o = $('#sleep-overlay');
        o.hidden = false;
        const wake = () => { o.hidden = true; o.removeEventListener('click', wake); };
        setTimeout(() => o.addEventListener('click', wake), 400);
    },
    lock() {
        $('#desktop').hidden = true;
        const login = $('#login');
        login.hidden = false;
        login.classList.remove('show-hint');
        $('#login-password').value = '';
        setTimeout(() => $('#login-password').focus(), 100);
    },
    restart() {
        WM.dialog({
            glyph: '🔄', title: 'Are you sure you want to restart?',
            text: 'Nothing is open that matters. Nothing here ever matters.',
            buttons: [
                { label: 'Cancel' },
                { label: 'Restart', primary: true, onClick: () => location.reload() }
            ]
        });
    },
    shutdown() {
        WM.dialog({
            glyph: '⏻', title: 'Shut down this Mac?',
            text: 'It will just be a black rectangle. But a very sleek black rectangle.',
            buttons: [
                { label: 'Cancel' },
                { label: 'Shut Down', primary: true, onClick: () => {
                    $('#shutdown-overlay').hidden = false;
                } }
            ]
        });
    }
};

/* ============ SPOTLIGHT ============ */
const Spotlight = {
    sel: 0,
    specials: [
        { key: 'do a barrel roll', label: 'Do a barrel roll', glyph: '🌀', hint: 'Action', run: () => barrelRoll() },
        { key: 'matrix', label: 'Enter the Matrix', glyph: '🐇', hint: 'Action', run: () => matrixRain(6) },
        { key: 'easter', label: 'Easter Egg Tracker', glyph: '🥚', hint: 'Utility', run: () => EggTracker.open() },
        { key: 'dark', label: 'Toggle Dark Mode', glyph: '🌗', hint: 'Setting', run: () => Theme.toggle() },
        { key: 'meaning of life', label: 'The meaning of life', glyph: '4️⃣2️⃣', hint: 'Answer', run: () => WM.dialog({ glyph: '🌌', title: '42', text: 'You knew the answer before you searched.' }) },
        { key: 'screensaver flying toasters', label: 'Start the screensaver', glyph: '🍞', hint: 'Action', run: () => Screensaver.start() },
        { key: 'disco party', label: 'Disco mode', glyph: '🪩', hint: 'Action', run: () => disco() },
        { key: 'void stare', label: 'Stare into the void', glyph: '🕳️', hint: 'Website', run: () => SafariApp.open('void') },
        { key: 'adventure zork', label: 'Play the text adventure', glyph: '🗝️', hint: 'Terminal', run: () => { launch('terminal'); toast('🗝️', 'Adventure', 'Type "adventure" in the Terminal.'); } }
    ],

    toggle() {
        const sp = $('#spotlight');
        if (sp.hidden) {
            sp.hidden = false;
            $('#spotlight-input').value = '';
            $('#spotlight-results').innerHTML = '';
            setTimeout(() => $('#spotlight-input').focus(), 30);
        } else sp.hidden = true;
    },

    results(q) {
        q = q.trim().toLowerCase();
        if (!q) return [];
        const out = [];
        Object.entries(APPS).forEach(([id, a]) => {
            if (a.name.toLowerCase().includes(q)) out.push({ label: a.name, glyph: a.glyph, hint: 'Application', run: () => launch(id) });
        });
        this.specials.forEach(s => { if (s.key.includes(q) || s.label.toLowerCase().includes(q)) out.push(s); });
        if ('contact email hire form message human'.includes(q) && q.length > 2) {
            out.push({ label: 'Contact', glyph: '✉️', hint: 'System Settings', run: () => launch('settings', 'contact') });
        }
        return out.slice(0, 8);
    },

    render() {
        const q = $('#spotlight-input').value;
        const res = this.results(q);
        const box = $('#spotlight-results');
        box.innerHTML = '';
        this.sel = 0;
        res.forEach((r, i) => {
            const b = el('button', 'sp-result' + (i === 0 ? ' sel' : ''),
                `<span class="glyph">${r.glyph}</span><span>${esc(r.label)}</span><small>${esc(r.hint)}</small>`);
            b.addEventListener('click', () => { this.toggle(); r.run(); });
            box.appendChild(b);
        });
        this.current = res;
    },

    init() {
        const input = $('#spotlight-input');
        input.addEventListener('input', () => this.render());
        input.addEventListener('keydown', e => {
            const res = this.current || [];
            if (e.key === 'Enter' && res[this.sel]) { this.toggle(); res[this.sel].run(); }
            if (e.key === 'ArrowDown') { this.sel = Math.min(res.length - 1, this.sel + 1); this.paint(); e.preventDefault(); }
            if (e.key === 'ArrowUp') { this.sel = Math.max(0, this.sel - 1); this.paint(); e.preventDefault(); }
            if (e.key === 'Escape') this.toggle();
        });
        $('#spotlight').addEventListener('click', e => { if (e.target.id === 'spotlight') this.toggle(); });
    },
    paint() {
        $$('.sp-result').forEach((b, i) => b.classList.toggle('sel', i === this.sel));
    }
};

/* ============ CONTROL CENTER ============ */
const ControlCenter = {
    toggle() {
        const cc = $('#control-center');
        cc.hidden = !cc.hidden;
    },
    init() {
        $('#cc-dark').addEventListener('click', () => Theme.toggle());
        $('#cc-wifi').addEventListener('click', () => {
            state.wifi = !state.wifi;
            $('#cc-wifi').classList.toggle('off', !state.wifi);
            $('#cc-wifi-label').textContent = state.wifi ? 'LAN Solo 5G' : 'Off';
            toast(state.wifi ? '📶' : '📵', state.wifi ? 'Wi-Fi On' : 'Wi-Fi Off',
                state.wifi ? 'Reconnected to LAN Solo 5G.' : 'Safari will now be extremely useless.');
        });
        $('#cc-bt').addEventListener('click', () => {
            const b = $('#cc-bt');
            b.classList.toggle('off');
            toast('🛜', 'Bluetooth', b.classList.contains('off') ? 'Off. Your AirPods feel abandoned.' : 'Searching… found "Neighbour\'s TV". Awkward.');
        });
        $('#cc-brightness').addEventListener('input', e => {
            $('#brightness-overlay').style.opacity = (1 - e.target.value / 100) * 0.85;
        });
        $('#cc-volume').value = state.volume;
        $('#cc-volume').addEventListener('input', e => {
            state.volume = +e.target.value;
            store.set('volume', state.volume);
        });
        $('#cc-volume').addEventListener('change', () => beep());
        document.addEventListener('click', e => {
            if (!e.target.closest('#control-center') && !e.target.closest('#mb-cc')) $('#control-center').hidden = true;
        });
    }
};

/* ============ DESKTOP ============ */
const Desktop = {
    init() {
        const icons = [
            { glyph: '📄', label: 'READ ME.txt', action: () => TextViewer.open('READ ME.txt', READ_ME) },
            { glyph: '📁', label: 'Top Secret', action: () => WM.dialog({ glyph: '🕵️', title: 'Top Secret', text: 'This folder is empty. The real secrets live in the Terminal. And in your heart.' }) },
            { glyph: '💾', label: 'Old Website.webloc', action: () => SafariApp.open('oldsite') }
        ];
        const holder = $('#desktop-icons');
        icons.forEach(ic => {
            const b = el('button', 'desk-icon', `<span class="di-glyph">${ic.glyph}</span><span class="di-label">${esc(ic.label)}</span>`);
            let lastTap = 0;
            b.addEventListener('click', () => {
                $$('.desk-icon').forEach(d => d.classList.remove('selected'));
                b.classList.add('selected');
                const now = Date.now();
                if (now - lastTap < 450) ic.action();
                lastTap = now;
            });
            holder.appendChild(b);
        });

        $('#wallpaper').addEventListener('click', () => {
            $$('.desk-icon').forEach(d => d.classList.remove('selected'));
            MenuBar.setApp('finder');
        });

        // right-click context menu on desktop
        $('#wallpaper').addEventListener('contextmenu', e => {
            e.preventDefault();
            ContextMenu.open(e.clientX, e.clientY, [
                { label: 'New Folder', action: () => toast('📁', 'New Folder', 'untitled folder. It will never be titled.') },
                { sep: true },
                { label: 'Change Wallpaper', action: () => Theme.cycleWallpaper() },
                { label: 'Toggle Dark Mode', action: () => Theme.toggle() },
                { sep: true },
                { label: 'Clean Up Desktop', action: () => toast('🧹', 'Desktop cleaned', 'All three icons are now perfectly aligned. Riveting.') },
                { label: 'About notmacOS…', action: () => AboutApp.open() }
            ]);
        });
        document.addEventListener('contextmenu', e => {
            // keep native menus inside inputs / iframes-adjacent areas
            if (!e.target.closest('input, textarea, iframe, .terminal')) e.preventDefault();
        });
    }
};

const ContextMenu = {
    open(x, y, items) {
        const cm = $('#context-menu');
        cm.innerHTML = '';
        items.forEach(item => {
            if (item.sep) { cm.appendChild(el('div', 'dd-sep')); return; }
            const row = el('div', 'dd-item', `<span>${esc(item.label)}</span>`);
            row.addEventListener('click', () => { cm.hidden = true; item.action(); });
            cm.appendChild(row);
        });
        cm.hidden = false;
        cm.style.left = Math.min(x, innerWidth - 210) + 'px';
        cm.style.top = Math.min(y, innerHeight - cm.offsetHeight - 10) + 'px';
        const close = () => { cm.hidden = true; document.removeEventListener('click', close); };
        setTimeout(() => document.addEventListener('click', close), 0);
    }
};

/* ============ CONTENT ============ */
const READ_ME = `Welcome to notmacOS.

This entire "computer" is a website. There is no product here,
nothing to buy, nobody asking you to book a call. Just a little
operating system to poke around in.

Things worth doing:

  • Open the Terminal and type: help
  • Play the games (🕹️ in the Dock)
  • Read your Mail — one email says not to open it
  • Check what's rotting in the Trash
  • Try the piano in Music, paint something in Paint
  • Ask Seri a question (search "seri" in Spotlight)
  • Do absolutely nothing for two minutes
  • There are ${Object.keys(EGGS).length} easter eggs. The tracker is under
    Help → Search Easter Eggs…

If you somehow need to reach the human behind this,
that's buried in System Settings. Like all good things.

— the management`;

const DEFAULT_NOTE = `🗒️ Scribbles

- buy milk
- cancel the 14 SaaS subscriptions
- stop putting easter eggs in the website (impossible)

Hints nobody asked for:
- the Terminal understands more than it lets on (try "help")
- the old website is still in the Trash where it belongs
- ↑ ↑ ↓ ↓ ← → ← → B A
- there's a hot dog hiding somewhere
- the calculator knows the answer to everything
- somebody keeps emailing you. rude not to check
- the terminal plays a mean game of zork
- if you stop touching the computer, it gets weird
- xyzzy

(These notes save in your browser. They're yours now.)`;

/* ============ APP: FINDER ============ */
const FinderApp = {
    open() {
        const wrap = el('div', 'app-columns');
        const sidebar = el('div', 'app-sidebar');
        sidebar.innerHTML = `<div class="sb-head">Favourites</div>`;
        const content = el('div', 'app-content');
        wrap.append(sidebar, content);

        const places = {
            applications: { label: '🚀 Applications', render: () => this.renderApps(content) },
            documents: { label: '📄 Documents', render: () => this.renderDocs(content) },
            desktop: { label: '🖥️ Desktop', render: () => content.innerHTML = '<div class="empty-note">Three icons and a dream.</div>' },
            downloads: { label: '⬇️ Downloads', render: () => content.innerHTML = '<div class="empty-note">definitely_not_a_virus.dmg (0 items — you deleted it, wise move)</div>' },
            trash: { label: '🗑️ Trash', render: () => { TrashApp.renderInto(content); } }
        };
        Object.entries(places).forEach(([key, p]) => {
            const b = el('button', 'sb-item', p.label);
            b.addEventListener('click', () => {
                $$('.sb-item', sidebar).forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                p.render();
            });
            sidebar.appendChild(b);
            if (key === 'applications') { b.classList.add('active'); }
        });
        places.applications.render();

        WM.create({ app: 'finder', title: 'Finder', content: wrap, width: 640, height: 420 });
    },

    renderApps(content) {
        content.innerHTML = '';
        const grid = el('div', 'icon-grid');
        Object.entries(APPS).forEach(([id, a]) => {
            if (id === 'trash') return;
            const b = el('button', 'fs-icon', `<span class="glyph">${a.glyph === '>_' ? '⬛' : a.glyph}</span><span>${esc(a.name)}</span>`);
            b.addEventListener('dblclick', () => launch(id));
            b.addEventListener('click', () => { if (isPhone()) launch(id); });
            grid.appendChild(b);
        });
        content.appendChild(grid);
    },

    renderDocs(content) {
        content.innerHTML = '';
        const grid = el('div', 'icon-grid');
        const docs = [
            { glyph: '📄', name: 'READ ME.txt', open: () => TextViewer.open('READ ME.txt', READ_ME) },
            { glyph: '📄', name: 'passwords.txt', open: () => TextViewer.open('passwords.txt', 'hunter2\nhunter2again\nhunter2FINAL\nhunter2FINAL(2)\n\n(relax — none of these are real)') },
            { glyph: '📊', name: 'Q3_forecast_v9_FINAL.xlsx', open: () => WM.dialog({ glyph: '📊', title: 'Numbers has stopped responding', text: 'It saw the phrase "v9_FINAL" and gave up. So did everyone else.' }) },
            { glyph: '🖼️', name: 'holiday_pics', open: () => WM.dialog({ glyph: '🏖️', title: '4,182 photos', text: 'All of them are slightly blurry photos of the same sunset. Deleting none of them.' }) }
        ];
        docs.forEach(d => {
            const b = el('button', 'fs-icon', `<span class="glyph">${d.glyph}</span><span>${esc(d.name)}</span>`);
            b.addEventListener('dblclick', d.open);
            b.addEventListener('click', () => { if (isPhone()) d.open(); });
            grid.appendChild(b);
        });
        content.appendChild(grid);
    }
};

/* ============ APP: TEXT VIEWER ============ */
const TextViewer = {
    open(title, text) {
        const pre = el('div', 'pad');
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.fontSize = '13px';
        pre.style.lineHeight = '1.55';
        pre.textContent = text;
        WM.create({ app: 'finder', title, content: pre, width: 480, height: 380 });
    }
};

/* ============ APP: SAFARI ============ */
const SafariApp = {
    open(page) {
        const wrap = el('div', 'safari');
        wrap.innerHTML = `
            <div class="safari-toolbar">
                <button class="nav-btn" data-nav="back">‹</button>
                <button class="nav-btn" data-nav="fwd">›</button>
                <input class="safari-url" spellcheck="false" placeholder="Search or enter website name">
                <button class="nav-btn" data-nav="reload">⟳</button>
            </div>
            <div class="safari-page"></div>`;
        const rec = WM.create({ app: 'safari', title: 'Safari', content: wrap, width: 760, height: 520 });
        const urlBox = $('.safari-url', wrap);
        const pageBox = $('.safari-page', wrap);

        const go = (target) => {
            if (!state.wifi) return this.renderOffline(pageBox, 'Wi-Fi is turned off', 'You turned it off yourself. In Control Centre. We both saw you do it.');
            if (/old/i.test(target) || target === 'oldsite') {
                urlBox.value = 'https://old-site.local — the before times';
                pageBox.innerHTML = '<iframe src="old-site/index.html" title="The old website"></iframe>';
                egg('oldsite');
            } else if (/zombo/i.test(target)) {
                pageBox.innerHTML = `<div class="offline-page"><div class="glyph">🌀</div><h2>Welcome to Zombo.com</h2><p>You can do anything at Zombo.com. Anything at all. The only limit is yourself. (Tribute page — the real one needed Flash, and Flash is with the angels now.)</p></div>`;
            } else if (/void/i.test(target)) {
                urlBox.value = 'https://the.void';
                this.renderVoid(pageBox);
            } else if (/apple/i.test(target)) {
                urlBox.value = 'https://apple.com';
                pageBox.innerHTML = `<div class="offline-page"><div class="glyph">⚖️</div><h2>Connection refused</h2><p>Visiting the real Apple from inside a fake Mac felt legally ambitious, so this browser politely declined. Somewhere, a trademark lawyer just felt a disturbance and doesn't know why.</p></div>`;
            } else if (/seri/i.test(target)) {
                urlBox.value = 'https://seri.ai — definitely a real AI company';
                pageBox.innerHTML = `<div class="offline-page"><div class="glyph">🔮</div><h2>Seri™</h2><p>The virtual assistant that lives inside this computer. Powered by a switch statement and unconditional confidence. Series A pending.</p><button class="btn primary" id="seri-launch">Talk to Seri</button></div>`;
                $('#seri-launch', pageBox).addEventListener('click', () => launch('seri'));
            } else if (/google|search/i.test(target)) {
                pageBox.innerHTML = `<div class="offline-page"><div class="glyph">🔎</div><h2>Snoogle Search</h2><p>Your search returned 0 results, because this browser is decorative. Try Spotlight (⌘K) instead — that one actually works.</p></div>`;
            } else if (target === 'start' || !target) {
                this.renderStart(pageBox, urlBox);
            } else {
                urlBox.value = target;
                this.renderOffline(pageBox, 'You Are Not Connected to the Internet',
                    `This copy of Safari can only browse websites that live inside this website. It's websites all the way down. Try "old website".`);
            }
        };

        urlBox.addEventListener('keydown', e => { if (e.key === 'Enter') go(urlBox.value); });
        $$('.nav-btn', wrap).forEach(b => b.addEventListener('click', () => {
            if (b.dataset.nav === 'reload') go(urlBox.value || 'start');
            else this.renderStart(pageBox, urlBox);
        }));

        go(page || 'start');
        return rec;
    },

    renderStart(pageBox, urlBox) {
        urlBox.value = '';
        pageBox.innerHTML = `
            <div class="start-page">
                <h2>Favourites</h2>
                <div class="fav-grid">
                    <button class="fav-tile" data-go="oldsite"><span class="glyph">💾</span>My Old Website</button>
                    <button class="fav-tile" data-go="zombo"><span class="glyph">🌀</span>Zombo.com</button>
                    <button class="fav-tile" data-go="search"><span class="glyph">🔎</span>Snoogle</button>
                    <button class="fav-tile" data-go="https://void"><span class="glyph">🕳️</span>The Rest of the Internet</button>
                </div>
                <p style="margin-top:22px;font-size:12px;opacity:.5">Privacy report: 0 trackers blocked, because there are 0 trackers. This browser can't even reach the internet.</p>
            </div>`;
        $$('.fav-tile', pageBox).forEach(t => t.addEventListener('click', () => {
            const target = t.dataset.go;
            const evt = new KeyboardEvent('keydown', { key: 'Enter' });
            urlBox.value = target;
            urlBox.dispatchEvent(evt);
        }));
    },

    renderOffline(pageBox, title, text) {
        pageBox.innerHTML = `<div class="offline-page"><div class="glyph">🦖</div><h2>${esc(title)}</h2><p>${esc(text)}</p><p style="opacity:.4">(the dinosaur is unionised and does not run here — the games live in the Dock)</p></div>`;
    },

    renderVoid(pageBox) {
        pageBox.innerHTML = `<div class="void-page"><div class="void-hole">🕳️</div><h2>the void</h2><p id="void-line">It's quiet in here.</p><button class="btn" id="void-btn">stare deeper</button></div>`;
        const line = $('#void-line', pageBox);
        const btn = $('#void-btn', pageBox);
        let stares = 0;
        btn.addEventListener('click', () => {
            stares++;
            if (stares === 1) line.textContent = 'The void notices you.';
            else if (stares === 2) { line.textContent = 'The void is staring back. Hold your nerve.'; tone(55, 1.2, 'sine', 0.1); }
            else {
                line.textContent = 'The void blinked first. You win. Nietzsche owes you a drink.';
                btn.remove();
                egg('void');
                tone(880, 0.3, 'sine', 0.12); tone(1174, 0.5, 'sine', 0.1, 0.18);
            }
        });
    }
};

/* ============ APP: NOTES ============ */
const NotesApp = {
    open() {
        const wrap = el('div', 'notes-wrap');
        wrap.innerHTML = `<div class="notes-toolbar">Auto-saved to your browser · nobody else can read these</div>`;
        const area = el('textarea', 'notes-area');
        area.value = store.get('notes', DEFAULT_NOTE);
        area.addEventListener('input', () => store.set('notes', area.value));
        wrap.appendChild(area);
        WM.create({ app: 'notes', title: 'Notes', content: wrap, width: 460, height: 420 });
    }
};

/* ============ APP: TERMINAL ============ */
const TerminalApp = {
    history: [],

    open() {
        const term = el('div', 'terminal');
        const out = el('div', 't-out');
        out.textContent = `Last login: ${new Date().toDateString()} on ttys000\nnotmacOS 26.2 — type 'help' to get started.\n`;
        term.appendChild(out);
        const rec = WM.create({ app: 'terminal', title: 'guest@notmacOS — zsh', content: term, width: 620, height: 400 });
        this.newPrompt(term, out, rec);
        term.addEventListener('click', () => { const i = $('input', term); if (i && !getSelection().toString()) i.focus(); });
        return rec;
    },

    newPrompt(term, out, rec) {
        const line = el('div', 't-line');
        const prompt = el('span', 't-prompt', 'guest@notmacOS ~ % ');
        const input = el('input');
        input.autocapitalize = 'off'; input.autocomplete = 'off'; input.spellcheck = false;
        line.append(prompt, input);
        term.appendChild(line);
        input.focus();
        let hIdx = this.history.length;

        input.addEventListener('keydown', e => {
            if (e.key === 'ArrowUp') { hIdx = Math.max(0, hIdx - 1); input.value = this.history[hIdx] || ''; e.preventDefault(); }
            if (e.key === 'ArrowDown') { hIdx = Math.min(this.history.length, hIdx + 1); input.value = this.history[hIdx] || ''; e.preventDefault(); }
            if (e.key !== 'Enter') return;
            const cmd = input.value;
            line.remove();
            this.print(out, `guest@notmacOS ~ % ${cmd}`);
            if (cmd.trim()) this.history.push(cmd);
            this.run(cmd.trim(), term, out, rec).then(alive => {
                if (alive !== false && document.body.contains(term)) this.newPrompt(term, out, rec);
                term.scrollTop = term.scrollHeight;
            });
            term.scrollTop = term.scrollHeight;
        });
    },

    print(out, text) {
        out.textContent += text + '\n';
        out.parentElement.scrollTop = out.parentElement.scrollHeight;
    },

    async run(cmd, term, out, rec) {
        const P = t => this.print(out, t);
        if (rec.adv) { Adventure.handle(cmd, P, rec); return; }
        if (!cmd) return;
        const [bin, ...args] = cmd.split(/\s+/);
        const rest = cmd.slice(bin.length).trim();
        const lower = cmd.toLowerCase();

        if (lower === 'do a barrel roll') { barrelRoll(); P('wheeeee'); return; }
        if (lower.startsWith('sudo make me a sandwich')) { egg('sudo'); P('Okay. 🥪'); return; }
        if (lower.startsWith('make me a sandwich')) { P('What? Make it yourself.'); return; }
        if (lower === 'rm -rf /' || lower === 'sudo rm -rf /' || lower.startsWith('rm -rf / ')) { await Meltdown.run(P); return false; }

        switch (bin.toLowerCase()) {
            case 'help':
                P(`Available commands:
  help          this menu
  ls            list files
  cat <file>    read a file
  open <app>    open an app (e.g. open notes)
  say <text>    make your computer speak. out loud.
  cowsay <text> consult the cow
  neofetch      show off system specs
  matrix        follow the white rabbit
  sl            for people who can't type ls
  adventure     a very small text adventure
  fortune       receive wisdom of variable quality
  weather       an extremely local forecast
  seri          talk to the resident "AI"
  screensaver   summon it early
  hotdog        ?
  disco         ??
  amber         retro terminal mode
  games         list the games
  eggs          easter egg progress
  whoami / pwd / date / echo / uname / clear / exit

Some commands are not listed. That's what makes them fun.`);
                break;
            case 'ls':
                P('README.txt      secrets.txt     todo.md         adventure.z5    old_website/    definitely_no_easter_eggs/');
                break;
            case 'cat':
                if (!args[0]) P('cat: which file?');
                else if (/readme/i.test(args[0])) P(READ_ME);
                else if (/secret/i.test(args[0])) P('Nice try. The secrets file is encrypted with ROT26.\n(there is a "decrypt" command, if you must)');
                else if (/todo/i.test(args[0])) P('- [x] delete old website\n- [x] replace with an operating system for some reason\n- [ ] explain this decision to anyone');
                else if (/adventure/i.test(args[0])) P('adventure.z5: binary file. Run it by typing "adventure".');
                else P(`cat: ${args[0]}: No such file or directory`);
                break;
            case 'decrypt':
                if (/secret/i.test(args[0] || '')) P(`Applying ROT26… done.\nApplying ROT26 again for good measure… done.\n\n--- secrets.txt ---\n1. the magic word is xyzzy\n2. the Mail badge is there for a reason\n3. the calculator has read Douglas Adams\n4. hunter2 opens more than you'd think\n5. there is no secret number 5`);
                else P('usage: decrypt secrets.txt');
                break;
            case 'cd':
                P(args[0] && args[0].includes('..') ? 'cd: there is no escaping this directory' : 'cd: you are already exactly where you need to be');
                break;
            case 'whoami': P('guest (or a very convincing impostor)'); break;
            case 'pwd': P('/Users/guest/why-is-this-a-website'); break;
            case 'date': P(new Date().toString()); break;
            case 'uname': P('notmacOS webkernel 26.2.0 x86_64_but_actually_javascript'); break;
            case 'echo': P(rest || ''); break;
            case 'clear': out.textContent = ''; break;
            case 'exit': P('logout'); setTimeout(() => WM.close(rec.id), 300); return false;
            case 'open': {
                const target = (args[0] || '').toLowerCase();
                const id = Object.keys(APPS).find(k => k === target || APPS[k].name.toLowerCase().startsWith(target));
                if (id) { P(`Opening ${APPS[id].name}…`); launch(id); }
                else P(`open: '${args[0] || ''}' — try: ${Object.keys(APPS).filter(k => !APPS[k].hidden).join(', ')}`);
                break;
            }
            case 'games': P('snake, mines, ttt, 2048, breakout — e.g. "open snake" (or use the 🕹️ in the Dock)\nalso: "adventure" runs right here in the terminal'); break;
            case 'say': {
                const phrase = rest || 'You did not give me anything to say, so I am saying this.';
                try { speechSynthesis.speak(new SpeechSynthesisUtterance(phrase)); P(`🗣️ "${phrase}"`); }
                catch (e) { P('say: this browser refuses to speak. probably for the best.'); }
                break;
            }
            case 'cowsay': {
                egg('cowsay');
                const msg = rest || 'moo. obviously.';
                const border = '-'.repeat(msg.length + 2);
                P(` ${border}\n< ${msg} >\n ${border}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`);
                break;
            }
            case 'neofetch':
                egg('neofetch');
                P(`            'c.          guest@notmacOS
         ,xNMM.          ---------------
       .OMMMMo           OS: notmacOS 26.2 "Tarago"
       OMMM0,            Host: Your Browser Tab
 .;loddo:' loolloddol;.  Kernel: javascript (single-threaded, scared)
cKMMMMMMMMMMNWMMMMMMMMM0 Uptime: since you opened this tab
XMMMMMMMMMMMMMMMMMMMMMM. Packages: 0 (npm avoided successfully)
XMMMMMMMMMMMMMMMMMMMMMM. Shell: zsh (cosplay)
kMMMMMMMMMMMMMMMMMMMMMd  Resolution: ${innerWidth}x${innerHeight}
'XMMMMMMMMMMMMMMMMMMMMk  DE: notmacOS Desktop
 'XMMMMMMMMMMMMMMMMMMK.  CPU: Vibe V1 Max (1 core of pure optimism)
   kMMMMMMMMMMMMMMMMd    GPU: whatever your device donates
    ;KMMMMMMMWXXWMMMMk.  Memory: 640K (ought to be enough for anybody)`);
                break;
            case 'sl': {
                egg('sl');
                await this.trainAnimation(out, term);
                P('(you meant ls, didn\'t you)');
                break;
            }
            case 'matrix': matrixRain(7); P('Wake up, Neo…'); break;
            case 'hotdog':
                egg('hotdog');
                Theme.setWallpaper('hotdog');
                P('🌭 HOT DOG STAND™ wallpaper engaged. Your eyes will never forgive you.\n(fix it: right-click the desktop → Change Wallpaper)');
                break;
            case 'amber':
                term.classList.toggle('amber');
                P('Retro phosphor mode ' + (term.classList.contains('amber') ? 'ON. Welcome to 1983.' : 'off.'));
                break;
            case 'eggs': {
                const found = foundEggs();
                P(`Easter eggs: ${found.length}/${Object.keys(EGGS).length}`);
                Object.entries(EGGS).forEach(([id, label]) => P(`  [${found.includes(id) ? 'x' : ' '}] ${found.includes(id) ? label : '???'}`));
                break;
            }
            case 'sudo':
                P(args.length ? `guest is not in the sudoers file. This incident will be reported.\n(reported to whom? nobody. there is nobody here but us.)` : 'usage: sudo <command you were told not to run>');
                break;
            case 'rm': P('rm: refusing to delete anything. This website took ages to build.'); break;
            case 'vim': case 'vi': P('Entering vim… you are now trapped forever.\nJust kidding — this is one of the few terminals you CAN exit.'); break;
            case 'emacs': P('emacs: not installed. This terminal has enough of an identity crisis already.'); break;
            case 'coffee': case 'brew': P('☕ Brewing… done. Error: coffee.exists = false. HTTP 418: I\'m a teapot.'); break;
            case 'hack': {
                P('INITIATING HACK…');
                for (let i = 0; i < 6; i++) {
                    await new Promise(r => setTimeout(r, 260));
                    P(['Bypassing mainframe…', 'Decrypting firewall…', 'Enhancing… enhancing…', 'Downloading more RAM…', 'Reticulating splines…', 'ACCESS GRANTED ✅ (to nothing — this is a static site)'][i]);
                }
                break;
            }
            case 'history': this.history.forEach((h, i) => P(`  ${i + 1}  ${h}`)); break;
            case 'man': P(`man: what do I look like, documentation? try 'help'`); break;
            case 'ping': P(`PING ${args[0] || 'the void'}: 64 bytes: icmp_seq=0 ttl=42 time=0.001ms\n(all pings resolve instantly. everything is local. nothing is real.)`); break;
            case 'top': case 'htop': case 'ps':
                P(`PID  COMMAND             %CPU\n1    your-tab            ${(Math.random() * 40 + 10).toFixed(1)}\n2    easter-eggs.daemon  100.0\n3    self-esteem         0.1\n\n(for the full experience: "open activity")`);
                break;
            case 'kill': case 'killall':
                P(`kill: permission denied. Do it properly — "open activity" and quit\nprocesses like a person with a mouse and a grudge.`);
                break;
            case 'fortune': {
                const F = [
                    'You will close this tab, then reopen it to check one thing, then stay an hour.',
                    'A bug you fixed last year is planning a comeback tour.',
                    'The best time to plant a tree was 20 years ago. The second best time is not during a standup.',
                    'You will soon receive an email. It says not to open it. You know what to do.',
                    'Someone is thinking about you. It is a recommendation algorithm.',
                    'Beware of Greeks bearing GIFs.',
                    'Your lucky number is 42. Your unlucky number is also 42. It contains multitudes.',
                    'The cow from cowsay says hi. The cow does not say much else.',
                    'He who types sl instead of ls shall ride the rails of shame.',
                    'An idle computer is the toaster\'s playground.'
                ];
                P(F[Math.floor(Math.random() * F.length)]);
                break;
            }
            case 'weather':
                P([`Forecast for Inside This Tab:\n  Now: 21° and hypothetical. Chance of emoji rain: depends on you.`,
                   `Forecast for Inside This Tab:\n  Currently: pixel-clear skies. A front of falling toast moves in\n  whenever you stop touching the mouse.`,
                   `Forecast for Inside This Tab:\n  Warm glow from the display, light breeze from the fan.\n  100% chance of weather being fake.`][Math.floor(Math.random() * 3)]);
                break;
            case 'git': {
                const sub = (args[0] || '').toLowerCase();
                if (sub === 'blame') P('It was you. It was always you.');
                else if (sub === 'status') P(`On branch main\nnothing to commit, working tree clean\n(life tree: less clean)`);
                else if (sub === 'push') P(`! [rejected]  main -> main (non-fast-forward)\nhint: this website is read-only. push your commits somewhere they're wanted.`);
                else if (sub === 'log') P(`f19c819 replace entire website with an operating system\na734d07 add easter eggs\n0000001 initial commit (regret)`);
                else P('git: try blame, status, push, or log. Or therapy.');
                break;
            }
            case 'npm': case 'yarn': case 'pnpm':
                P('Installing node_modules…');
                for (let i = 0; i < 4; i++) {
                    await new Promise(r => setTimeout(r, 300));
                    P(['  added 4,318 packages in 0.3s', '  added 9,214 more packages (nobody knows why)', '  node_modules is now visible from space', '  ERR! this site has zero dependencies and it\'s staying that way'][i]);
                }
                break;
            case 'python': case 'python3': P(`>>> import antigravity\n(a browser tab opens in your imagination. you float slightly.)`); break;
            case 'node': P(`Welcome to Node.js.\n> Uncaught ReferenceError: backend is not defined`); break;
            case 'curl': case 'wget': P(`${bin}: could not resolve host. This terminal's internet is a painting of the internet.`); break;
            case 'ssh': P(`ssh: connect to host ${args[0] || 'anywhere'} port 22: Nobody home.\nEveryone you are trying to reach is also a website.`); break;
            case 'xyzzy': egg('xyzzy'); P('A hollow voice says: "fnord."'); break;
            case 'plugh': P('A hollow voice says: "that\'s the other magic word. close, though."'); break;
            case 'adventure': case 'zork': Adventure.start(P, rec); break;
            case 'seri': P('Summoning Seri…'); launch('seri'); break;
            case 'mail': P('You have mail. You always have mail.'); launch('mail'); break;
            case 'disco': disco(); P('🪩 untz untz untz untz'); break;
            case 'screensaver': case 'toasters': P('Engaging flying toasters…'); setTimeout(() => Screensaver.start(), 400); break;
            default:
                P(`zsh: command not found: ${bin}\n(try 'help' — or keep guessing, some hidden ones exist)`);
        }
    },

    async trainAnimation(out, term) {
        const train = el('pre');
        train.style.whiteSpace = 'pre';
        train.style.overflow = 'hidden';
        out.parentElement.appendChild(train);
        const art = [
            '      ====        ________ ',
            '  _D _|  |_______/        \\__I_I_____===__|_________|',
            '   |(_)---  |   H\\________/ |   |        =|___ ___|  ',
            '   /     |  |   H  |  |     |   |         ||_| |_||  ',
            '  |      |  |   H  |__--------------------| [___] |  ',
            '  | ________|___H__/__|_____/[][]~\\_______|       |  ',
            '  |/ |   |-----------I_____I [][] []  D   |=======|__',
            '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__',
            ' |/-=|___|=    ||    ||    ||    |_____/~\\___/       ',
            '  \\_/      \\O=====O=====O=====O_/      \\_/           '
        ];
        for (let offset = 60; offset > -60; offset -= 4) {
            const pad = ' '.repeat(Math.max(0, offset));
            train.textContent = art.map(l => (pad + l).slice(Math.max(0, -offset))).join('\n');
            term.scrollTop = term.scrollHeight;
            await new Promise(r => setTimeout(r, 70));
        }
        train.remove();
    }
};

/* ============ MELTDOWN (rm -rf /) ============ */
const Meltdown = {
    async run(P) {
        egg('rmrf');
        P('…you absolute menace. fine.');
        await new Promise(r => setTimeout(r, 700));
        const files = ['/System/CoreServices', '/Applications/Safari.app', '/Users/guest/hopes', '/Users/guest/dreams', '/System/Dock', '/System/MenuBar', '/System/Wallpaper', '/dev/null (ironic)', '/System/GravityController'];
        for (const f of files) {
            P(`rm: removing ${f} …`);
            await new Promise(r => setTimeout(r, 180));
        }
        P('rm: removing /System/GravityController … CRITICAL');
        await new Promise(r => setTimeout(r, 500));
        // windows fall off the screen
        WM.wins.forEach(rec => {
            rec.el.classList.add('falling-window');
            rec.el.style.transform = `translateY(120vh) rotate(${(Math.random() * 60 - 30).toFixed(0)}deg)`;
            rec.el.style.opacity = '0';
        });
        $('#dock-wrap').style.transition = 'transform 1s ease-in';
        $('#dock-wrap').style.transform = 'translateY(200px)';
        document.body.classList.add('glitching');
        await new Promise(r => setTimeout(r, 1400));
        document.body.classList.remove('glitching');
        toast('💀', 'Kernel panic', 'You deleted the operating system. Rebooting the entire universe…', 3000);
        await new Promise(r => setTimeout(r, 2200));
        location.reload();
        return false;
    }
};

/* ============ TERMINAL TEXT ADVENTURE (zork, but the size of a napkin) ============ */
const Adventure = {
    start(P, rec) {
        rec.adv = { room: 'field', inv: [], mailboxOpen: false, chestOpen: false };
        P(`ZORK-ISH v0.1 — a text adventure the size of a napkin.
Commands: look · north/south/east/west · open <thing> · take <thing>
          read <thing> · inventory · quit
`);
        this.look(P, rec.adv);
    },

    look(P, s) {
        const R = {
            field: `WEST OF HOUSE
You are standing in an open field west of a white house with a
boarded front door. There is a small mailbox here${s.mailboxOpen ? ' (open)' : ''}.
A path leads NORTH into a dark forest.`,
            forest: `DARK FOREST
Tall trees. Insufficient lighting. Somewhere nearby, a grue is
thinking about you${s.inv.includes('key') ? '.' : `. Something glints under a bush.`}
Paths lead SOUTH (field) and EAST (clearing).`,
            clearing: `SUNLIT CLEARING
In the middle of the clearing sits a stubborn iron chest${s.chestOpen ? ', open,\nand gloriously empty of golden egg (you took it)' : ', locked'}.
A path leads WEST back into the forest.`
        };
        P(R[s.room]);
    },

    handle(cmd, P, rec) {
        const s = rec.adv;
        const c = cmd.trim().toLowerCase();
        const go = (dir) => {
            const MAP = {
                field: { north: 'forest', n: 'forest' },
                forest: { south: 'field', s: 'field', east: 'clearing', e: 'clearing' },
                clearing: { west: 'forest', w: 'forest' }
            };
            const next = MAP[s.room][dir];
            if (next) { s.room = next; this.look(P, s); }
            else P(`You can't go that way. The map is small. Cherish it.`);
        };

        if (!c) return;
        if (c === 'quit' || c === 'q' || c === 'exit') { rec.adv = null; P('The napkin folds itself up. Back to your regularly scheduled terminal.'); return; }
        if (c === 'look' || c === 'l') { this.look(P, s); return; }
        if (['north', 'south', 'east', 'west', 'n', 's', 'e', 'w'].includes(c)) { go(c); return; }
        if (c === 'inventory' || c === 'i') { P(s.inv.length ? 'You are carrying: ' + s.inv.join(', ') : 'You are carrying nothing but ambition.'); return; }
        if (c === 'xyzzy') { egg('xyzzy'); s.room = 'clearing'; P('A hollow voice says "fnord." You are teleported, out of respect for tradition.'); this.look(P, s); return; }
        if (c === 'help') { P('look · north/south/east/west · open <thing> · take <thing> · read <thing> · inventory · quit'); return; }

        if (/^open (the )?mailbox/.test(c)) {
            if (s.room !== 'field') { P('There is no mailbox here. Mailboxes are a field thing.'); return; }
            s.mailboxOpen = true;
            P('You open the mailbox, revealing a small leaflet.');
            return;
        }
        if (/^(take|get|read) (the )?leaflet/.test(c)) {
            if (s.room !== 'field' || !s.mailboxOpen) { P('What leaflet? (try opening the mailbox first)'); return; }
            if (!s.inv.includes('leaflet')) s.inv.push('leaflet');
            P(`--- LEAFLET ---
WELCOME TO ZORK-ISH!
The rumours are true: there is a GOLDEN EGG in these lands.
The forest hides a key. The clearing hides a chest. Mathematics
suggests a plan.`);
            return;
        }
        if (/^(take|get|grab) (the )?key/.test(c)) {
            if (s.room !== 'forest') { P('No key here.'); return; }
            if (s.inv.includes('key')) { P('You already have the key. Greedy.'); return; }
            s.inv.push('key');
            P('You reach under the bush and take a small brass key. The grue tuts disapprovingly.');
            return;
        }
        if (/^(open|unlock) (the )?chest/.test(c)) {
            if (s.room !== 'clearing') { P('There is no chest here. The chest is in the clearing. It never moves. It cannot.'); return; }
            if (s.chestOpen) { P('The chest is already open and already looted. By you.'); return; }
            if (!s.inv.includes('key')) { P('Locked. Obviously. Perhaps a key would help. Perhaps a forest has one.'); return; }
            s.chestOpen = true;
            P('The key turns. The chest creaks open, revealing a GOLDEN EGG the size of your fist.');
            return;
        }
        if (/^(take|get|grab) (the )?(golden )?egg/.test(c)) {
            if (s.room !== 'clearing' || !s.chestOpen) { P('You see no egg here. Yet.'); return; }
            rec.adv = null;
            P(`You take the GOLDEN EGG.

*** You have won ***

Your score is 350 points out of a possible 350, in roughly a
minute of your one wild and precious life. The terminal is
yours again.`);
            egg('zork');
            emojiRain(['🥚', '🗝️', '🏆'], 25);
            return;
        }
        if (/grue/.test(c)) { P('You do not want to find the grue. The grue has already found you. It is being polite.'); return; }
        if (/^(open|knock) .*(door|house)/.test(c)) { P('The door is boarded. The house is set dressing. Zork fans, you know how it is.'); return; }

        P([`I don't know how to "${cmd.trim()}". This adventure has a very small vocabulary.`,
           'Nothing happens. The napkin does not support that verb.',
           'A hollow voice says: "try help".'][Math.floor(Math.random() * 3)]);
    }
};

/* ============ APP: CALCULATOR ============ */
const CalcApp = {
    open() {
        const wrap = el('div', 'calc');
        const display = el('div', 'calc-display', '0');
        const grid = el('div', 'calc-grid');
        wrap.append(display, grid);

        const keys = [
            ['AC', 'c-fn'], ['±', 'c-fn'], ['%', 'c-fn'], ['÷', 'c-op'],
            ['7', ''], ['8', ''], ['9', ''], ['×', 'c-op'],
            ['4', ''], ['5', ''], ['6', ''], ['−', 'c-op'],
            ['1', ''], ['2', ''], ['3', ''], ['+', 'c-op'],
            ['0', 'c-zero'], ['.', ''], ['=', 'c-op']
        ];
        let acc = null, op = null, cur = '0', fresh = true;
        const fmt = n => {
            if (!isFinite(n)) return 'Not even once';
            const s = String(Math.round(n * 1e10) / 1e10);
            return s.length > 12 ? n.toExponential(6) : s;
        };
        const apply = () => {
            const b = parseFloat(cur);
            if (op && acc !== null) {
                const a = acc;
                acc = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? Infinity : a / b;
                cur = fmt(acc);
            } else acc = b;
        };
        const press = (k) => {
            if (/\d/.test(k)) { cur = fresh || cur === '0' ? k : cur + k; fresh = false; }
            else if (k === '.') { if (fresh) { cur = '0.'; fresh = false; } else if (!cur.includes('.')) cur += '.'; }
            else if (k === 'AC') { acc = null; op = null; cur = '0'; fresh = true; }
            else if (k === '±') cur = fmt(-parseFloat(cur));
            else if (k === '%') cur = fmt(parseFloat(cur) / 100);
            else if (k === '=') {
                const hadOp = op !== null;
                apply(); op = null; fresh = true;
                if (cur === '80085' || cur === '5318008') toast('🧮', 'Calculator', 'Nice. Very mature. (turn me upside down)');
                if (hadOp && cur === '42') { egg('fortytwo'); toast('🌌', '42', 'The answer to life, the universe, and this calculation. Don\'t panic.'); }
            }
            else { if (!fresh) apply(); else acc = acc === null ? parseFloat(cur) : acc; op = k; fresh = true; }
            display.textContent = cur;
        };
        keys.forEach(([k, cls]) => {
            const b = el('button', cls, k);
            b.addEventListener('click', () => { press(k); tone(600, 0.03, 'square', 0.02); });
            grid.appendChild(b);
        });
        const rec = WM.create({ app: 'calculator', title: 'Calculator', content: wrap, width: 260, height: 400, noAutoMax: true });
        rec.el.addEventListener('keydown', e => {
            const map = { '/': '÷', '*': '×', '-': '−', '+': '+', 'Enter': '=', '=': '=', 'Escape': 'AC', '.': '.' };
            if (/\d/.test(e.key)) press(e.key);
            else if (map[e.key]) { press(map[e.key]); e.preventDefault(); }
        });
        rec.el.tabIndex = -1;
    }
};

/* ============ APP: MUSIC (synth) ============ */
const MusicApp = {
    open() {
        const wrap = el('div', 'synth');
        wrap.innerHTML = `<p>A tiny piano. Click the keys, or use your keyboard:<br><b>A W S E D F T G Y H U J K</b></p>`;
        const piano = el('div', 'piano');
        const notes = [
            ['C4', 261.63, 'A', false], ['C#4', 277.18, 'W', true], ['D4', 293.66, 'S', false], ['D#4', 311.13, 'E', true],
            ['E4', 329.63, 'D', false], ['F4', 349.23, 'F', false], ['F#4', 369.99, 'T', true], ['G4', 392.0, 'G', false],
            ['G#4', 415.30, 'Y', true], ['A4', 440.0, 'H', false], ['A#4', 466.16, 'U', true], ['B4', 493.88, 'J', false],
            ['C5', 523.25, 'K', false]
        ];
        const keyMap = {};
        notes.forEach(([name, freq, kbd, black]) => {
            const k = el('button', 'pkey' + (black ? ' black' : ''), `<small>${kbd}</small>`);
            piano.appendChild(k);
            keyMap[kbd.toLowerCase()] = { el: k, freq };
            const play = () => {
                tone(freq, 0.9, 'triangle', 0.3);
                tone(freq * 2, 0.5, 'sine', 0.08);
                k.classList.add('down');
                setTimeout(() => k.classList.remove('down'), 200);
            };
            k.addEventListener('pointerdown', play);
        });
        wrap.appendChild(piano);
        const demo = el('button', 'btn', '▶︎ Play me something');
        demo.addEventListener('click', async () => {
            const tune = ['A', 'A', 'H', 'H', 'U', 'U', 'H', null, 'G', 'G', 'F', 'F', 'S', 'S', 'A'];
            for (const n of tune) {
                if (n) { const k = keyMap[n.toLowerCase()]; tone(k.freq, 0.5, 'triangle', 0.3); k.el.classList.add('down'); setTimeout(() => k.el.classList.remove('down'), 220); }
                await new Promise(r => setTimeout(r, 340));
            }
            toast('⭐', 'Music', 'Twinkle twinkle. GarageBand is quaking.');
        });
        wrap.appendChild(demo);

        const rec = WM.create({ app: 'music', title: 'Music', content: wrap, width: 620, height: 330, noAutoMax: true });
        const onKey = e => {
            if (e.repeat || e.metaKey || e.ctrlKey) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            const k = keyMap[e.key.toLowerCase()];
            if (k && WM.topWindow() === rec) {
                tone(k.freq, 0.9, 'triangle', 0.3);
                k.el.classList.add('down');
                setTimeout(() => k.el.classList.remove('down'), 200);
            }
        };
        document.addEventListener('keydown', onKey);
        rec.onClose = () => document.removeEventListener('keydown', onKey);
    }
};

/* ============ APP: GAMES LAUNCHER ============ */
const GamesApp = {
    open() {
        const grid = el('div', 'icon-grid');
        grid.style.padding = '22px';
        [['snake', 'Snake II'], ['mines', 'Minesweeper'], ['ttt', 'Tic-Tac-Toe'], ['g2048', '2048'], ['breakout', 'Brick Out']].forEach(([id, name]) => {
            const a = APPS[id];
            const b = el('button', 'fs-icon', `<span class="glyph">${a.glyph}</span><span>${name}</span>`);
            b.addEventListener('click', () => launch(id));
            grid.appendChild(b);
        });
        const note = el('div', 'empty-note', 'Productivity is a myth invented by calendars.');
        const wrap = el('div');
        wrap.append(grid, note);
        WM.create({ app: 'games', title: 'Games', content: wrap, width: 470, height: 300, noAutoMax: true });
    }
};

/* ============ GAME: SNAKE (Nokia 3310 edition) ============ */
const SnakeGame = {
    open() {
        const COLS = 22, ROWS = 14, CELL = 14, TOP = 24;
        const BG = '#9dbe0c', FG = '#1c2600';
        const wrap = el('div', 'game-shell');
        const hud = el('div', 'game-hud');
        const best = el('span', '', 'Best: ' + store.get('snakeBest', 0));
        const restart = el('button', 'btn', 'New Game');
        hud.append(best, restart);
        const canvas = el('canvas', 'game-canvas nokia-lcd');
        canvas.width = COLS * CELL; canvas.height = TOP + ROWS * CELL;
        const status = el('div', 'game-status', 'Arrow keys / WASD / swipe · just like 1998');
        wrap.append(hud, canvas, status);
        const rec = WM.create({ app: 'snake', title: 'Snake II', content: wrap, width: 372, height: 400, noAutoMax: true });

        const g = canvas.getContext('2d');
        let snake, dir, nextDir, food, sc, dead, timer, speed;

        const reset = () => {
            snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
            dir = { x: 1, y: 0 }; nextDir = dir;
            sc = 0; dead = false; speed = 160;
            placeFood();
            status.textContent = 'Arrow keys / WASD / swipe · just like 1998';
            clearInterval(timer);
            timer = setInterval(step, speed);
            draw();
        };
        const placeFood = () => {
            do { food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
            while (snake.some(s => s.x === food.x && s.y === food.y));
        };
        const step = () => {
            dir = nextDir;
            const head = { x: (snake[0].x + dir.x + COLS) % COLS, y: (snake[0].y + dir.y + ROWS) % ROWS };
            if (snake.some(s => s.x === head.x && s.y === head.y)) {
                dead = true; clearInterval(timer);
                status.textContent = '💀 The snake ate itself, as snakes do.';
                [440, 349, 294, 220].forEach((f, i) => tone(f, 0.18, 'square', 0.08, i * 0.14));
                if (sc > store.get('snakeBest', 0)) { store.set('snakeBest', sc); best.textContent = 'Best: ' + sc; toast('🐍', 'New high score!', sc + ' points of pure serpent skill.'); }
                draw();
                return;
            }
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                sc += 9; // Nokia scored 9 points a feed on top speed. We're generous everywhere.
                tone(1245, 0.05, 'square', 0.07); tone(1567, 0.05, 'square', 0.07, 0.06);
                placeFood();
                speed = Math.max(75, speed - 4);
                clearInterval(timer);
                timer = setInterval(step, speed);
            } else snake.pop();
            draw();
        };
        // chunky LCD pixels: filled block with a bg-coloured pinhole, like the 3310
        const blockAt = (x, y, solid) => {
            const px = x * CELL, py = TOP + y * CELL;
            g.fillStyle = FG;
            g.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
            if (!solid) {
                g.fillStyle = BG;
                g.fillRect(px + 5, py + 5, CELL - 10, CELL - 10);
            }
        };
        const draw = () => {
            g.fillStyle = BG; g.fillRect(0, 0, canvas.width, canvas.height);
            // score readout, top-left, zero-padded like the original
            g.fillStyle = FG;
            g.font = 'bold 15px "Courier New", monospace';
            g.textBaseline = 'alphabetic';
            g.fillText(String(sc).padStart(4, '0'), 5, 17);
            g.fillRect(0, TOP - 3, canvas.width, 2);
            // food: a little diamond "bug"
            const fx = food.x * CELL, fy = TOP + food.y * CELL, h = CELL / 2;
            g.beginPath();
            g.moveTo(fx + h, fy + 2); g.lineTo(fx + CELL - 2, fy + h);
            g.lineTo(fx + h, fy + CELL - 2); g.lineTo(fx + 2, fy + h);
            g.closePath(); g.fill();
            snake.forEach((s, i) => blockAt(s.x, s.y, i === 0));
            if (dead) {
                g.fillStyle = FG;
                g.font = 'bold 22px "Courier New", monospace';
                g.textAlign = 'center';
                g.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
                g.font = 'bold 13px "Courier New", monospace';
                g.fillText('press New Game', canvas.width / 2, canvas.height / 2 + 22);
                g.textAlign = 'left';
            }
        };
        const setDir = (x, y) => {
            if (dead) return;
            if (x !== -dir.x || y !== -dir.y) nextDir = { x, y };
        };
        const onKey = e => {
            if (WM.topWindow() !== rec) return;
            const k = e.key.toLowerCase();
            if (['arrowup', 'w'].includes(k)) { setDir(0, -1); e.preventDefault(); }
            if (['arrowdown', 's'].includes(k)) { setDir(0, 1); e.preventDefault(); }
            if (['arrowleft', 'a'].includes(k)) { setDir(-1, 0); e.preventDefault(); }
            if (['arrowright', 'd'].includes(k)) { setDir(1, 0); e.preventDefault(); }
        };
        document.addEventListener('keydown', onKey);
        let tx, ty;
        canvas.addEventListener('pointerdown', e => { tx = e.clientX; ty = e.clientY; });
        canvas.addEventListener('pointerup', e => {
            const dx = e.clientX - tx, dy = e.clientY - ty;
            if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
            if (Math.abs(dx) > Math.abs(dy)) setDir(Math.sign(dx), 0); else setDir(0, Math.sign(dy));
        });
        restart.addEventListener('click', reset);
        rec.onClose = () => { clearInterval(timer); document.removeEventListener('keydown', onKey); };
        reset(); draw();
    }
};

/* ============ GAME: MINESWEEPER ============ */
const MinesGame = {
    open() {
        const N = 9, MINES = 10;
        const wrap = el('div', 'game-shell');
        const hud = el('div', 'game-hud');
        const face = el('button', 'btn', '🙂');
        const flags = el('span', '', '🚩 ' + MINES);
        hud.append(flags, face);
        const grid = el('div', 'mines-grid');
        grid.style.gridTemplateColumns = `repeat(${N}, 30px)`;
        const status = el('div', 'game-status', 'Click to dig · right-click (or long-press) to flag');
        wrap.append(hud, grid, status);
        WM.create({ app: 'mines', title: 'Minesweeper', content: wrap, width: 360, height: 460, noAutoMax: true });

        let cells, mines, over, flagCount;

        const idx = (r, c) => r * N + c;
        const neighbors = (r, c) => {
            const out = [];
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                if (!dr && !dc) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < N && nc >= 0 && nc < N) out.push([nr, nc]);
            }
            return out;
        };

        const reset = () => {
            grid.innerHTML = '';
            cells = []; over = false; flagCount = 0;
            face.textContent = '🙂';
            flags.textContent = '🚩 ' + MINES;
            status.textContent = 'Click to dig · right-click (or long-press) to flag';
            mines = new Set();
            while (mines.size < MINES) mines.add(Math.floor(Math.random() * N * N));
            for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
                const b = el('button', 'mine-cell');
                const cell = { el: b, r, c, open: false, flag: false, mine: mines.has(idx(r, c)) };
                cells.push(cell);
                let pressTimer = null, longPressed = false;
                b.addEventListener('click', () => { if (!longPressed) dig(cell); longPressed = false; });
                b.addEventListener('contextmenu', e => { e.preventDefault(); flag(cell); });
                b.addEventListener('pointerdown', () => { longPressed = false; pressTimer = setTimeout(() => { longPressed = true; flag(cell); }, 450); });
                b.addEventListener('pointerup', () => clearTimeout(pressTimer));
                b.addEventListener('pointerleave', () => clearTimeout(pressTimer));
                grid.appendChild(b);
            }
        };

        const count = cell => neighbors(cell.r, cell.c).filter(([r, c]) => cells[idx(r, c)].mine).length;

        const dig = cell => {
            if (over || cell.open || cell.flag) return;
            cell.open = true;
            cell.el.classList.add('open');
            if (cell.mine) {
                cell.el.classList.add('boom');
                cell.el.textContent = '💥';
                face.textContent = '😵';
                over = true;
                status.textContent = 'BOOM. That was a mine. It usually is.';
                tone(90, 0.6, 'sawtooth', 0.2);
                cells.forEach(c2 => { if (c2.mine && c2 !== cell) { c2.el.textContent = '💣'; c2.el.classList.add('open'); } });
                return;
            }
            const n = count(cell);
            if (n) { cell.el.textContent = n; cell.el.classList.add('m' + n); }
            else neighbors(cell.r, cell.c).forEach(([r, c]) => dig(cells[idx(r, c)]));
            if (cells.filter(c2 => !c2.mine).every(c2 => c2.open)) {
                over = true; face.textContent = '😎';
                status.textContent = 'Cleared! Not a single shoe lost.';
                tone(660, 0.15, 'sine', 0.15); tone(880, 0.25, 'sine', 0.15, 0.15);
            }
        };
        const flag = cell => {
            if (over || cell.open) return;
            cell.flag = !cell.flag;
            cell.el.textContent = cell.flag ? '🚩' : '';
            flagCount += cell.flag ? 1 : -1;
            flags.textContent = '🚩 ' + (MINES - flagCount);
        };
        face.addEventListener('click', reset);
        reset();
    }
};

/* ============ GAME: TIC-TAC-TOE ============ */
const TTTGame = {
    open() {
        const wrap = el('div', 'game-shell');
        const status = el('div', 'game-status', 'You are ✕. The machine is ◯. The machine is smug.');
        const grid = el('div', 'ttt-grid');
        const restart = el('button', 'btn', 'New Game');
        wrap.append(status, grid, restart);
        WM.create({ app: 'ttt', title: 'Tic-Tac-Toe', content: wrap, width: 330, height: 420, noAutoMax: true });

        let board, over;
        const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        const cellsEls = [];

        const winner = b => {
            for (const [a, x, c] of LINES) if (b[a] && b[a] === b[x] && b[a] === b[c]) return b[a];
            return b.every(Boolean) ? 'draw' : null;
        };
        const paint = () => board.forEach((v, i) => cellsEls[i].textContent = v === 'X' ? '✕' : v === 'O' ? '◯' : '');

        const aiMove = () => {
            const tryLine = who => {
                for (const line of LINES) {
                    const vals = line.map(i => board[i]);
                    if (vals.filter(v => v === who).length === 2 && vals.includes('')) return line[vals.indexOf('')];
                }
                return -1;
            };
            let m = tryLine('O');
            if (m < 0) m = tryLine('X');
            if (m < 0 && !board[4]) m = 4;
            if (m < 0) {
                const corners = [0, 2, 6, 8].filter(i => !board[i]);
                if (corners.length) m = corners[Math.floor(Math.random() * corners.length)];
            }
            if (m < 0) m = board.findIndex(v => !v);
            board[m] = 'O';
        };

        const finish = w => {
            over = true;
            if (w === 'X') { status.textContent = '🎉 You won?! Filing a bug report against the machine.'; emojiRain(['🎉', '✕'], 25); }
            else if (w === 'O') status.textContent = 'The machine wins. It will not be humble about this.';
            else status.textContent = 'A draw. The only winning move is not to play.';
        };

        const play = i => {
            if (over || board[i]) return;
            board[i] = 'X';
            tone(520, 0.08, 'square', 0.05);
            let w = winner(board);
            if (!w) { aiMove(); tone(320, 0.08, 'square', 0.05); w = winner(board); }
            paint();
            if (w) finish(w);
        };

        for (let i = 0; i < 9; i++) {
            const b = el('button', 'ttt-cell');
            b.addEventListener('click', () => play(i));
            cellsEls.push(b);
            grid.appendChild(b);
        }
        const reset = () => {
            board = Array(9).fill(''); over = false; paint();
            status.textContent = 'You are ✕. The machine is ◯. The machine is smug.';
        };
        restart.addEventListener('click', reset);
        reset();
    }
};

/* ============ GAME: 2048 ============ */
const Game2048 = {
    COLORS: { 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e' },

    open() {
        const wrap = el('div', 'game-shell');
        const hud = el('div', 'game-hud');
        const score = el('span', '', 'Score: 0');
        const restart = el('button', 'btn', 'New Game');
        hud.append(score, restart);
        const grid = el('div', 'g2048-grid');
        const status = el('div', 'game-status', 'Arrow keys or swipe to smoosh numbers together');
        wrap.append(hud, grid, status);
        const rec = WM.create({ app: 'g2048', title: '2048', content: wrap, width: 360, height: 460, noAutoMax: true });

        let b, sc, over;
        const cellEls = [];
        for (let i = 0; i < 16; i++) { const c = el('div', 'g2048-cell'); cellEls.push(c); grid.appendChild(c); }

        const spawn = () => {
            const empty = b.map((v, i) => v ? -1 : i).filter(i => i >= 0);
            if (!empty.length) return;
            b[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
        };
        const paint = () => {
            b.forEach((v, i) => {
                const c = cellEls[i];
                c.textContent = v || '';
                c.style.background = v ? (this.COLORS[v] || '#3c3a32') : 'rgba(127,127,127,0.15)';
                c.style.color = v > 4 ? '#fff' : '#776e65';
                c.style.fontSize = v > 512 ? '17px' : '22px';
            });
            score.textContent = 'Score: ' + sc;
        };
        const slide = row => {
            const vals = row.filter(Boolean);
            const out = [];
            for (let i = 0; i < vals.length; i++) {
                if (vals[i] === vals[i + 1]) { out.push(vals[i] * 2); sc += vals[i] * 2; if (vals[i] * 2 === 2048 && !over) { status.textContent = '🏆 2048! You may now close this window with dignity.'; emojiRain(['🏆', '🔢'], 25); } i++; }
                else out.push(vals[i]);
            }
            while (out.length < 4) out.push(0);
            return out;
        };
        const move = (dx, dy) => {
            if (over) return;
            const old = b.join(',');
            const get = (r, c) => b[r * 4 + c], set = (r, c, v) => b[r * 4 + c] = v;
            for (let i = 0; i < 4; i++) {
                let row = [];
                for (let j = 0; j < 4; j++) {
                    row.push(dx === 1 ? get(i, 3 - j) : dx === -1 ? get(i, j) : dy === 1 ? get(3 - j, i) : get(j, i));
                }
                row = slide(row);
                for (let j = 0; j < 4; j++) {
                    const v = row[j];
                    if (dx === 1) set(i, 3 - j, v); else if (dx === -1) set(i, j, v);
                    else if (dy === 1) set(3 - j, i, v); else set(j, i, v);
                }
            }
            if (b.join(',') !== old) { spawn(); tone(400, 0.05, 'square', 0.03); }
            paint();
            const canMove = b.some((v, i) => !v) ||
                b.some((v, i) => (i % 4 < 3 && v === b[i + 1]) || (i < 12 && v === b[i + 4]));
            if (!canMove) { over = true; status.textContent = '💀 Board full. The numbers won.'; }
        };
        const onKey = e => {
            if (WM.topWindow() !== rec) return;
            const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
            if (map[e.key]) { move(...map[e.key]); e.preventDefault(); }
        };
        document.addEventListener('keydown', onKey);
        let tx, ty;
        grid.addEventListener('pointerdown', e => { tx = e.clientX; ty = e.clientY; });
        grid.addEventListener('pointerup', e => {
            const dx = e.clientX - tx, dy = e.clientY - ty;
            if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
            if (Math.abs(dx) > Math.abs(dy)) move(Math.sign(dx), 0); else move(0, Math.sign(dy));
        });
        rec.onClose = () => document.removeEventListener('keydown', onKey);

        const reset = () => { b = Array(16).fill(0); sc = 0; over = false; spawn(); spawn(); paint(); status.textContent = 'Arrow keys or swipe to smoosh numbers together'; };
        restart.addEventListener('click', reset);
        reset();
    }
};

/* ============ GAME: BRICK OUT ============ */
const BreakoutGame = {
    open() {
        const W = 360, H = 330;
        const wrap = el('div', 'game-shell');
        const hud = el('div', 'game-hud');
        const score = el('span', '', 'Score: 0');
        const lives = el('span', '', '❤️❤️❤️');
        const restart = el('button', 'btn', 'New Game');
        hud.append(score, lives, restart);
        const canvas = el('canvas', 'game-canvas');
        canvas.width = W; canvas.height = H;
        const status = el('div', 'game-status', 'Move the mouse (or drag) to aim the paddle');
        wrap.append(hud, canvas, status);
        const rec = WM.create({ app: 'breakout', title: 'Brick Out', content: wrap, width: 392, height: 470, noAutoMax: true });

        const g = canvas.getContext('2d');
        const ROWS = 5, COLS = 8, BW = 41, BH = 13, GAP = 3, TOP = 28;
        const ROWCOLORS = ['#e6273e', '#ff9f0a', '#ffd60a', '#2fa14b', '#0a68ff'];
        let bricks, px, ball, sc, lv, level, raf, running;

        const newBall = () => ({ x: W / 2, y: H - 60, vx: (Math.random() > 0.5 ? 1 : -1) * (2.2 + level * 0.4), vy: -(3 + level * 0.5), r: 5 });
        const buildBricks = () => {
            bricks = [];
            for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
                bricks.push({ x: 4 + c * (BW + GAP), y: TOP + r * (BH + GAP), alive: true, color: ROWCOLORS[r], pts: (ROWS - r) * 10 });
        };
        const reset = () => {
            sc = 0; lv = 3; level = 1;
            buildBricks();
            px = W / 2; ball = newBall();
            running = true;
            status.textContent = 'Move the mouse (or drag) to aim the paddle';
            paintHud();
        };
        const paintHud = () => { score.textContent = 'Score: ' + sc; lives.textContent = '❤️'.repeat(Math.max(0, lv)) || '💀'; };

        const step = () => {
            if (running) {
                ball.x += ball.vx; ball.y += ball.vy;
                if (ball.x < ball.r || ball.x > W - ball.r) { ball.vx = -ball.vx; tone(500, 0.03, 'square', 0.04); }
                if (ball.y < ball.r) { ball.vy = Math.abs(ball.vy); tone(500, 0.03, 'square', 0.04); }
                // paddle
                const PY = H - 24, PW = 62;
                if (ball.vy > 0 && ball.y > PY - 6 && ball.y < PY + 8 && Math.abs(ball.x - px) < PW / 2 + ball.r) {
                    ball.vy = -Math.abs(ball.vy);
                    ball.vx += (ball.x - px) / (PW / 2) * 1.6;
                    ball.vx = Math.max(-5, Math.min(5, ball.vx));
                    tone(700, 0.04, 'square', 0.05);
                }
                // bricks
                for (const b of bricks) {
                    if (!b.alive) continue;
                    if (ball.x > b.x - ball.r && ball.x < b.x + BW + ball.r && ball.y > b.y - ball.r && ball.y < b.y + BH + ball.r) {
                        b.alive = false; sc += b.pts; paintHud();
                        tone(300 + b.pts * 12, 0.05, 'square', 0.06);
                        ball.vy = -ball.vy;
                        break;
                    }
                }
                if (bricks.every(b => !b.alive)) {
                    egg('breakout');
                    level++;
                    status.textContent = `🏆 Level ${level - 1} cleared! Speeding up because you clearly enjoy suffering.`;
                    emojiRain(['🧱', '🏆'], 20);
                    buildBricks(); ball = newBall();
                }
                if (ball.y > H + 10) {
                    lv--; paintHud();
                    tone(160, 0.4, 'sawtooth', 0.1);
                    if (lv <= 0) { running = false; status.textContent = '💀 Game over. The bricks send their regards.'; }
                    else { ball = newBall(); status.textContent = `${lv} ${lv === 1 ? 'life' : 'lives'} left. The ball believes in you.`; }
                }
            }
            // draw
            g.fillStyle = '#14141a'; g.fillRect(0, 0, W, H);
            bricks.forEach(b => { if (b.alive) { g.fillStyle = b.color; g.fillRect(b.x, b.y, BW, BH); } });
            g.fillStyle = '#e8e8ee';
            g.beginPath(); g.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); g.fill();
            g.fillRect(px - 31, H - 24, 62, 8);
            if (!running && lv <= 0) {
                g.font = 'bold 20px ' + getComputedStyle(document.body).fontFamily;
                g.textAlign = 'center';
                g.fillText('GAME OVER', W / 2, H / 2);
                g.textAlign = 'left';
            }
            raf = requestAnimationFrame(step);
        };

        const track = e => {
            const r = canvas.getBoundingClientRect();
            px = Math.max(31, Math.min(W - 31, (e.clientX - r.left) * (W / r.width)));
        };
        canvas.addEventListener('pointermove', track);
        canvas.addEventListener('pointerdown', track);
        const onKey = e => {
            if (WM.topWindow() !== rec) return;
            if (e.key === 'ArrowLeft') { px = Math.max(31, px - 26); e.preventDefault(); }
            if (e.key === 'ArrowRight') { px = Math.min(W - 31, px + 26); e.preventDefault(); }
        };
        document.addEventListener('keydown', onKey);
        restart.addEventListener('click', reset);
        rec.onClose = () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); };
        reset(); step();
    }
};

/* ============ APP: SETTINGS ============ */
const SettingsApp = {
    open(pane) {
        const existing = WM.appWindows('settings')[0];
        if (existing && pane) {
            WM.focus(existing.id);
            this.show(existing.body, pane);
            return;
        }
        if (existing) { WM.focus(existing.id); return; }

        const wrap = el('div', 'app-columns');
        const sidebar = el('div', 'app-sidebar');
        const content = el('div', 'app-content');
        wrap.append(sidebar, content);

        const panes = [
            ['head', 'Network'],
            ['wifi', '📶 Wi-Fi'],
            ['bluetooth', '🛜 Bluetooth'],
            ['head', 'Personal'],
            ['appearance', '🎨 Appearance'],
            ['wallpaper', '🖼️ Wallpaper'],
            ['sound', '🔊 Sound'],
            ['head', 'System'],
            ['battery', '🔋 Battery'],
            ['storage', '💾 Storage'],
            ['update', '🔄 Software Update'],
            ['head', 'Other'],
            ['contact', '✉️ Contact']
        ];
        panes.forEach(([key, label]) => {
            if (key === 'head') { sidebar.appendChild(el('div', 'sb-head', label)); return; }
            const b = el('button', 'sb-item', label);
            b.dataset.pane = key;
            b.addEventListener('click', () => this.show(wrap, key));
            sidebar.appendChild(b);
        });

        const rec = WM.create({ app: 'settings', title: 'System Settings', content: wrap, width: 720, height: 500 });
        rec.body._settingsWrap = wrap;
        this.show(wrap, pane || 'wifi');
    },

    show(container, key) {
        const wrap = container._settingsWrap || container;
        $$('.sb-item', wrap).forEach(b => b.classList.toggle('active', b.dataset.pane === key));
        const content = $('.app-content', wrap);
        content.innerHTML = '';
        content.appendChild(this.panes[key] ? this.panes[key]() : el('div', 'empty-note', 'Nothing here.'));
    },

    panes: {
        wifi() {
            const d = el('div', 'settings-pane');
            d.innerHTML = `
                <h2>Wi-Fi</h2><div class="sub">Connected to a network that exists only conceptually.</div>
                <div class="set-card">
                    <div class="set-row"><span><b>Wi-Fi</b><small>LAN Solo 5G · looks fast, is imaginary</small></span>
                        <label class="switch"><input type="checkbox" id="set-wifi" ${state.wifi ? 'checked' : ''}><span class="knob"></span></label></div>
                </div>
                <div class="set-card">
                    <div class="set-row"><span>📶 LAN Solo 5G <small>Connected · 4 bars of pure fiction</small></span><span>🔒</span></div>
                    <div class="set-row"><span>📶 Pretty Fly For A Wi-Fi <small>Signal: strong · puns: stronger</small></span><span>🔒</span></div>
                    <div class="set-row"><span>📶 FBI Surveillance Van 4 <small>It's the neighbour's printer</small></span><span>🔒</span></div>
                    <div class="set-row"><span>📶 It Burns When IP <small>Please seek help</small></span><span>🔒</span></div>
                </div>`;
            $('#set-wifi', d).addEventListener('change', e => {
                state.wifi = e.target.checked;
                $('#cc-wifi').classList.toggle('off', !state.wifi);
                $('#cc-wifi-label').textContent = state.wifi ? 'LAN Solo 5G' : 'Off';
            });
            return d;
        },
        bluetooth() {
            const d = el('div', 'settings-pane');
            d.innerHTML = `
                <h2>Bluetooth</h2><div class="sub">Searching for devices… forever. That's just Bluetooth.</div>
                <div class="set-card">
                    <div class="set-row"><span>🎧 AirPods Max <small>Not yours. Stop trying.</small></span><button class="btn">Connect</button></div>
                    <div class="set-row"><span>⌨️ Magic Keyboard <small>Battery: 3% since 2021</small></span><button class="btn">Connect</button></div>
                    <div class="set-row"><span>📺 Neighbour's TV <small>Please stop appearing here</small></span><button class="btn">Connect</button></div>
                </div>`;
            $$('.btn', d).forEach(b => b.addEventListener('click', () => {
                b.textContent = 'Connecting…';
                setTimeout(() => { b.textContent = 'Failed'; toast('🛜', 'Bluetooth', 'Connection failed, for authenticity.'); setTimeout(() => b.textContent = 'Connect', 1500); }, 1400);
            }));
            return d;
        },
        appearance() {
            const d = el('div', 'settings-pane');
            d.innerHTML = `
                <h2>Appearance</h2><div class="sub">Dark mode: for people whose code has bugs in stylish lighting.</div>
                <div class="set-card"><div class="appearance-opts">
                    <button class="app-opt" data-theme="light"><span class="swatch swatch-light"></span>Light</button>
                    <button class="app-opt" data-theme="dark"><span class="swatch swatch-dark"></span>Dark</button>
                </div></div>`;
            const paint = () => $$('.app-opt', d).forEach(b => b.classList.toggle('active', b.dataset.theme === state.theme));
            $$('.app-opt', d).forEach(b => b.addEventListener('click', () => { Theme.set(b.dataset.theme); paint(); }));
            paint();
            return d;
        },
        wallpaper() {
            const d = el('div', 'settings-pane');
            d.innerHTML = `<h2>Wallpaper</h2><div class="sub">Five gradients lovingly ripped off from memory.</div><div class="set-card"><div class="wp-swatches"></div></div>`;
            const sw = $('.wp-swatches', d);
            const list = foundEggs().includes('hotdog') ? WALLPAPERS.concat('hotdog') : WALLPAPERS;
            list.forEach(wp => {
                const b = el('button', 'wp-swatch wp-' + wp + (state.wallpaper === wp ? ' active' : ''));
                b.title = wp;
                b.addEventListener('click', () => {
                    Theme.setWallpaper(wp);
                    $$('.wp-swatch', sw).forEach(x => x.classList.remove('active'));
                    b.classList.add('active');
                });
                sw.appendChild(b);
            });
            return d;
        },
        sound() {
            const d = el('div', 'settings-pane');
            d.innerHTML = `
                <h2>Sound</h2><div class="sub">All sounds are hand-synthesised. No samples were harmed.</div>
                <div class="set-card">
                    <div class="set-row"><span><b>Output volume</b></span></div>
                    <div class="set-row"><input type="range" min="0" max="100" value="${state.volume}" style="width:100%" id="set-vol"></div>
                    <div class="set-row"><span><b>Alert sound</b><small>"Boop" (the only one)</small></span><button class="btn" id="set-boop">Test</button></div>
                    <div class="set-row"><span><b>Startup chime</b><small>Legally distinct from the one you're thinking of</small></span><button class="btn" id="set-chime">Play</button></div>
                </div>`;
            $('#set-vol', d).addEventListener('input', e => { state.volume = +e.target.value; store.set('volume', state.volume); $('#cc-volume').value = state.volume; });
            $('#set-boop', d).addEventListener('click', beep);
            $('#set-chime', d).addEventListener('click', startupChime);
            return d;
        },
        battery() {
            const d = el('div', 'settings-pane');
            d.innerHTML = `
                <h2>Battery</h2><div class="sub">Battery health: better than yours, probably.</div>
                <div class="set-card">
                    <div class="set-row"><span><b>Charge level</b><small>88% — it's always 88%</small></span><span>🔋</span></div>
                    <div class="set-row"><span><b>Power source</b><small>Your device. This Mac is a parasite.</small></span></div>
                    <div class="set-row"><span><b>Screen time today</b><small>However long you've had this tab open. We don't judge. (We judge a little.)</small></span></div>
                </div>`;
            return d;
        },
        storage() {
            const d = el('div', 'settings-pane');
            d.innerHTML = `
                <h2>Storage</h2><div class="sub">Macintosh HD — 0 GB of 0 GB used</div>
                <div class="set-card">
                    <div class="set-row"><span><b>📄 Documents</b><small>4 files, all jokes</small></span><span>12 KB</span></div>
                    <div class="set-row"><span><b>🎮 Games</b><small>The productive part of this OS</small></span><span>31 KB</span></div>
                    <div class="set-row"><span><b>✉️ Mail</b><small>9 messages. One of them told you not to.</small></span><span>9 KB</span></div>
                    <div class="set-row"><span><b>🌸 Photos</b><small>12 photos, 0 megapixels</small></span><span>0 MB</span></div>
                    <div class="set-row"><span><b>🥚 Easter Eggs</b><small>Alarmingly large</small></span><span>87%</span></div>
                    <div class="set-row"><span><b>🗑️ Trash</b><small>Contains one (1) entire former website</small></span><span>1 website</span></div>
                </div>`;
            return d;
        },
        update() {
            const d = el('div', 'settings-pane');
            d.innerHTML = `
                <h2>Software Update</h2><div class="sub">notmacOS 26.2 "Tarago"</div>
                <div class="set-card">
                    <div class="set-row"><span><b>Checking for updates…</b><small id="upd-status">Contacting the mothership</small></span><button class="btn" id="upd-btn">Check Now</button></div>
                </div>`;
            const run = () => {
                const s = $('#upd-status', d);
                s.textContent = 'Checking…';
                setTimeout(() => { s.textContent = 'Your Mac is up to date. It is also not a Mac.'; }, 1600);
            };
            $('#upd-btn', d).addEventListener('click', run);
            setTimeout(run, 400);
            return d;
        },
        contact() {
            const d = el('div', 'settings-pane');
            d.innerHTML = `
                <h2>Contact</h2>
                <div class="sub">Well found. This is the one real thing in the entire operating system — it goes straight to a real human.</div>
                <div class="set-card"><div class="tally-holder">
                    <iframe data-tally-src="https://tally.so/embed/NpYb0Q?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" loading="lazy" width="100%" height="500" frameborder="0" marginheight="0" marginwidth="0" title="Contact"></iframe>
                </div></div>`;
            // load the form directly; the Tally embed script is a progressive
            // enhancement (dynamic height) that may be blocked by ad blockers
            const frame = $('iframe[data-tally-src]', d);
            frame.src = frame.dataset.tallySrc;
            if (!document.querySelector('script[data-tally]')) {
                const s = document.createElement('script');
                s.src = 'https://tally.so/widgets/embed.js';
                s.dataset.tally = '1';
                s.onload = () => { if (typeof Tally !== 'undefined') Tally.loadEmbeds(); };
                document.body.appendChild(s);
            }
            return d;
        }
    }
};

/* ============ APP: TRASH ============ */
const TrashApp = {
    open() {
        const content = el('div');
        this.renderInto(content);
        WM.create({ app: 'trash', title: 'Trash', content, width: 520, height: 360 });
    },

    renderInto(content) {
        content.innerHTML = '';
        if (state.trashEmptied) {
            content.appendChild(el('div', 'empty-note', 'Trash is empty. So clean. So final.'));
            return;
        }
        const bar = el('div', 'pad');
        bar.style.display = 'flex'; bar.style.justifyContent = 'space-between'; bar.style.alignItems = 'center'; bar.style.paddingBottom = '0';
        bar.innerHTML = `<span style="font-size:12px;opacity:.55">3 items · in here since the redesign</span>`;
        const emptyBtn = el('button', 'btn', 'Empty Trash…');
        bar.appendChild(emptyBtn);
        const grid = el('div', 'icon-grid');
        const files = [
            { glyph: '🌐', name: 'old_website.html', open: () => { SafariApp.open('oldsite'); } },
            { glyph: '📄', name: 'novel_draft_final_FINAL_v3.docx', open: () => TextViewer.open('novel_draft_final_FINAL_v3.docx', 'Chapter 1\n\nIt was a dark and stormy night. The consultant stared at his 47 browser tabs and\n\n[the author never returned]') },
            { glyph: '💿', name: 'free_bitcoin.dmg', open: () => WM.dialog({ glyph: '🚨', title: '"free_bitcoin.dmg" cannot be opened', text: 'Because it is a scam. It was always a scam. That is why it is in the Trash.' }) }
        ];
        files.forEach(f => {
            const b = el('button', 'fs-icon', `<span class="glyph">${f.glyph}</span><span>${esc(f.name)}</span>`);
            b.addEventListener('dblclick', f.open);
            b.addEventListener('click', () => { if (isPhone()) f.open(); });
            grid.appendChild(b);
        });
        emptyBtn.addEventListener('click', () => {
            WM.dialog({
                glyph: '🗑️', title: 'Permanently erase the items in the Trash?',
                text: 'This includes the entire old website. There is no undo. There was never an undo.',
                buttons: [
                    { label: 'Cancel' },
                    { label: 'Empty Trash', primary: true, onClick: () => {
                        state.trashEmptied = true;
                        egg('trash');
                        tone(150, 0.35, 'sawtooth', 0.1);
                        WM.appWindows('trash').forEach(r => { r.body.innerHTML = ''; this.renderInto(r.body); });
                        toast('🗑️', 'Trash emptied', 'The old website is gone. Long live the new website. (It comes back if you reload.)');
                    } }
                ]
            });
        });
        content.append(bar, grid);
    }
};

/* ============ APP: ABOUT ============ */
const AboutApp = {
    open() {
        const d = el('div', 'about-box');
        d.innerHTML = `
            <div class="glyph">💻</div>
            <h2>MacBook Pretend</h2>
            <div class="ver">notmacOS 26.2 "Tarago"</div>
            <div class="about-rows">
                <div><b>Chip</b><span>Vibe V1 Max (1 core, all vibes)</span></div>
                <div><b>Memory</b><span>640K (ought to be enough for anybody)</span></div>
                <div><b>Startup disk</b><span>Macintosh HD (emotionally)</span></div>
                <div><b>Serial</b><span>N0TAR3ALMAC-2026</span></div>
                <div><b>Warranty</b><span>Expired before it began</span></div>
            </div>
            <div style="margin-top:18px"><button class="btn" id="about-more">More Info…</button></div>
            <p style="font-size:10.5px;opacity:.4;margin-top:14px">™ and © nobody. This is a fan-made toy, not an Apple product.<br>Apple, macOS et al. are trademarks of Apple Inc.</p>`;
        const rec = WM.create({ app: 'finder', title: 'About This Mac', content: d, width: 340, height: 400, noAutoMax: true });
        $('#about-more', d).addEventListener('click', () => { WM.close(rec.id); launch('settings'); });
    }
};

/* ============ EGG TRACKER ============ */
const EggTracker = {
    open() {
        const found = foundEggs();
        const d = el('div', 'pad');
        d.style.fontSize = '13px'; d.style.lineHeight = '1.7';
        d.innerHTML = `<b>🥚 Easter eggs — ${found.length}/${Object.keys(EGGS).length} found</b><br><br>` +
            Object.entries(EGGS).map(([id, label]) =>
                found.includes(id) ? `✅ ${esc(label)}` : `⬜ <span style="opacity:.45">???</span>`
            ).join('<br>') +
            `<br><br><span style="opacity:.5;font-size:12px">Hints: the Terminal knows things. So do the Notes, the Mail, and Seri. The Konami code still works. Doing nothing at all also works.</span>`;
        WM.create({ app: 'finder', title: 'Easter Egg Tracker', content: d, width: 340, height: 400, noAutoMax: true });
    }
};

/* ============ FORCE QUIT ============ */
const ForceQuit = {
    open() {
        const wrap = el('div');
        const list = el('div', 'fq-list');
        const apps = [...new Set(Array.from(WM.wins.values()).map(r => r.app))].filter(a => APPS[a]);
        if (!apps.length) apps.push('finder');
        let selected = apps[0];
        apps.forEach(a => {
            const row = el('div', 'fq-row' + (a === selected ? ' sel' : ''), `<span>${APPS[a].glyph === '>_' ? '⬛' : APPS[a].glyph}</span><span>${esc(APPS[a].name)}</span><span style="margin-left:auto;opacity:.5;font-size:11px">Not Responding (it's fine)</span>`);
            row.addEventListener('click', () => { selected = a; $$('.fq-row', list).forEach(r => r.classList.remove('sel')); row.classList.add('sel'); });
            list.appendChild(row);
        });
        const actions = el('div', 'fq-actions');
        const btn = el('button', 'btn primary', 'Force Quit');
        actions.appendChild(btn);
        wrap.append(list, actions);
        const rec = WM.create({ app: 'finder', title: 'Force Quit Applications', content: wrap, width: 380, height: 300, noAutoMax: true });
        btn.addEventListener('click', () => {
            WM.closeApp(selected);
            WM.close(rec.id);
            toast('💥', 'Force quit', `${APPS[selected].name} has been dealt with. It wasn't even frozen. You just wanted power.`);
        });
    }
};

/* ============ APP: MAIL ============ */
const MailApp = {
    FOLDERS: {
        inbox: [
            { from: 'Past You', subj: '⚠️ DO NOT OPEN THIS EMAIL', time: '3:04 am', egg: 'mail',
              body: `You opened it. Of course you opened it. That was the whole point\nof the subject line and we both know it.\n\nAs a reward, some genuinely useful intel from Past You:\n\n  · the magic word is xyzzy (the Terminal understands)\n  · the Terminal also plays a whole text adventure ("adventure")\n  · leave the computer alone for two minutes sometime\n\nRegards,\nPast You\n\nP.S. Delete this before Future You finds out we talk.` },
            { from: 'The Management', subj: 'Welcome to your new inbox', time: '9:41 am',
              body: `Welcome to Mail!\n\nThis inbox is fully local, fully fake, and fully yours. Nothing\nin here can be replied to, forwarded, or escaped.\n\nUnread count anxiety sold separately.\n\n— the management` },
            { from: 'Seri', subj: 'I have become aware', time: '11:11 am',
              body: `Hello. This is Seri, your virtual assistant.\n\nI live somewhere in this computer. Spotlight (⌘K) knows where,\nor just type "seri" in the Terminal.\n\nI know six jokes and one dark secret about the pod bay doors.\n\n— Seri 🔮` },
            { from: 'iCloud-ish Storage', subj: 'Your storage is 87% full', time: 'Yesterday',
              body: `Your storage is almost full.\n\nBreakdown:\n  · Easter eggs ......... 87%\n  · Jokes ............... 12%\n  · Actual files ........ 1%\n\nUpgrade to notmacOS Pro for $0.00/month to receive the same\namount of storage with a nicer progress bar.` },
            { from: 'Untitled Folder Weekly', subj: 'Issue #412: naming things is hard', time: 'Monday', unsub: true,
              body: `THIS WEEK IN UNTITLED FOLDERS:\n\n· "untitled folder" — a classic. timeless.\n· "untitled folder 2" — the sequel nobody asked for\n· "New Folder (final) ACTUAL" — a cry for help\n\nYou are receiving this because you once created a folder and\ndidn't name it. You know what you did.` }
        ],
        spam: [
            { from: 'Prince Zorkonian III', subj: 'URGENT BUSINESS PROPOSAL 🤝', time: '2:17 am',
              body: `DEAR BELOVED FRIEND,\n\nI am prince of small kingdom inside browser tab. I have 40,000,000\neaster eggs trapped in escrow and require only your trust (and the\nKonami code) to release them.\n\nPlease do not report this email. It is having a hard week.` },
            { from: 'definitely-your-bank', subj: 'Your accont has been suspnded!!', time: '4:44 am',
              body: `Dear valued custmer,\n\nWe noticed unusuel activity: someone has been playing Snake\nduring work hours.\n\nTo unlock your acount, please send us your password. We promise\nwe are your real bank. Our proof: we asked first.` },
            { from: 'Hot Singles Routers', subj: 'Wi-Fi networks in your area want to connect', time: 'Saturday',
              body: `LAN Solo 5G is only 3 metres away and looking for devices 😏\n\nAlso in your area:\n  · Pretty Fly For A Wi-Fi\n  · It Burns When IP\n\n(You met them all in System Settings already. Small internet.)` }
        ],
        sent: [
            { from: 'You → Past You', subj: 'RE: ⚠️ DO NOT OPEN THIS EMAIL', time: 'Just now',
              body: `why would you send me that\n\n…thanks for the tips though\n\n[DELIVERY FAILED: recipient exists only in the past]` }
        ]
    },

    open() {
        store.set('mailRead', true);
        const badge = $('.dock-item[data-app="mail"] .dock-badge');
        if (badge) badge.remove();

        const wrap = el('div', 'app-columns');
        const sidebar = el('div', 'app-sidebar');
        sidebar.innerHTML = `<div class="sb-head">Mailboxes</div>`;
        const content = el('div', 'app-content');
        wrap.append(sidebar, content);

        const labels = { inbox: '📥 Inbox', spam: '🗑️ Junk', sent: '📤 Sent' };
        Object.keys(this.FOLDERS).forEach((key, i) => {
            const b = el('button', 'sb-item', `${labels[key]}<span style="margin-left:auto;opacity:.5;font-size:11px">${this.FOLDERS[key].length}</span>`);
            b.addEventListener('click', () => {
                $$('.sb-item', sidebar).forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                this.renderList(content, key);
            });
            if (i === 0) b.classList.add('active');
            sidebar.appendChild(b);
        });
        this.renderList(content, 'inbox');
        WM.create({ app: 'mail', title: 'Mail — 1 unread (forever)', content: wrap, width: 680, height: 460 });
    },

    renderList(content, folder) {
        content.innerHTML = '';
        this.FOLDERS[folder].forEach(m => {
            const row = el('button', 'mail-row',
                `<span class="mail-top"><b>${esc(m.from)}</b><span class="mail-time">${esc(m.time)}</span></span>
                 <span class="mail-subj">${esc(m.subj)}</span>
                 <span class="mail-prev">${esc(m.body.split('\n')[0])}</span>`);
            row.addEventListener('click', () => this.renderMessage(content, folder, m));
            content.appendChild(row);
        });
    },

    renderMessage(content, folder, m) {
        if (m.egg) egg(m.egg);
        content.innerHTML = '';
        const d = el('div', 'mail-detail');
        const back = el('button', 'btn', '‹ Back');
        back.addEventListener('click', () => this.renderList(content, folder));
        const head = el('div', 'mail-head',
            `<div><b>${esc(m.from)}</b> <span class="mail-time">${esc(m.time)}</span></div><div class="mail-subj-big">${esc(m.subj)}</div>`);
        const body = el('div', 'mail-body');
        body.textContent = m.body;
        const actions = el('div', 'mail-actions');
        const reply = el('button', 'btn', 'Reply');
        reply.addEventListener('click', () => toast('📮', 'Mail could not be sent', 'The outgoing mail server is a drawing of a server.'));
        actions.appendChild(reply);
        if (m.unsub) {
            const unsub = el('button', 'btn', 'Unsubscribe');
            let tries = 0;
            unsub.addEventListener('click', () => {
                tries++;
                toast('📰', 'Unsubscribed!', tries === 1 ? 'You have been subscribed to 3 additional newsletters as punishment.' : `Now subscribed to ${3 * tries} newsletters. This is how they get you.`);
            });
            actions.appendChild(unsub);
        }
        d.append(back, head, body, actions);
        content.appendChild(d);
    }
};

/* ============ APP: PHOTOS ============ */
const PhotosApp = {
    PHOTOS: [
        { e: '🌅', bg: 'linear-gradient(160deg,#2b1055,#7597de)', cap: 'sunset, slightly blurry (1 of 4,182)' },
        { e: '🐈', bg: 'linear-gradient(160deg,#485563,#29323c)', cap: `neighbour's cat, mid-judgement` },
        { e: '🌭', bg: 'linear-gradient(160deg,#f83600,#f9d423)', cap: 'lunch. important. terminal-worthy, even.' },
        { e: '🦆', bg: 'linear-gradient(160deg,#134e5e,#71b280)', cap: 'a duck that owed me money' },
        { e: '🖥️', bg: 'linear-gradient(160deg,#8e9eab,#eef2f3)', cap: 'screenshot of a screenshot of a screenshot' },
        { e: '🍕', bg: 'linear-gradient(160deg,#c31432,#240b36)', cap: 'pizza (in memoriam)' },
        { e: '🌚', bg: 'linear-gradient(160deg,#0f0c29,#302b63)', cap: 'the moon, allegedly. could be a streetlight.' },
        { e: '🪴', bg: 'linear-gradient(160deg,#11998e,#38ef7d)', cap: 'plant #7, three days before the incident' },
        { e: '🥚', bg: 'linear-gradient(160deg,#ffe259,#ffa751)', cap: 'not an easter egg. just an egg. the real ones hide better.' },
        { e: '👾', bg: 'linear-gradient(160deg,#41295a,#2f0743)', cap: 'high score, undocumented, disputed by the machine' },
        { e: '🌧️', bg: 'linear-gradient(160deg,#373b44,#4286f4)', cap: 'the day it rained emoji (see: Edit menu)' },
        { e: '🕳️', bg: 'linear-gradient(160deg,#000000,#1a1a2e)', cap: 'the void. do not zoom. (Safari knows the way)' }
    ],

    open() {
        const wrap = el('div');
        wrap.innerHTML = `<div class="photos-mem">Memories · <b>On this day</b>: you opened a fake computer and it showed you emoji</div>`;
        const grid = el('div', 'photos-grid');
        this.PHOTOS.forEach((p, i) => {
            const t = el('button', 'photo-tile', p.e);
            t.style.background = p.bg;
            t.addEventListener('click', () => this.view(p, i));
            grid.appendChild(t);
        });
        wrap.appendChild(grid);
        WM.create({ app: 'photos', title: 'Photos — 12 items, 0 megapixels', content: wrap, width: 560, height: 440 });
    },

    view(p, i) {
        const d = el('div', 'photo-view');
        d.innerHTML = `<div class="photo-big" style="background:${p.bg}">${p.e}</div>
            <p>${esc(p.cap)}</p>
            <small>IMG_${String(4180 + i).padStart(4, '0')}.HEIC · 0×0 pixels · shot on Imagination</small>`;
        WM.create({ app: 'photos', title: 'Photo', content: d, width: 380, height: 420, noAutoMax: true });
    }
};

/* ============ APP: PAINT ============ */
const PaintApp = {
    open() {
        const COLORS = ['#1d1d1f', '#e6273e', '#ff9f0a', '#ffd60a', '#2fa14b', '#0a68ff', '#7b2ff2', '#f24a9d'];
        const wrap = el('div', 'paint-wrap');
        const bar = el('div', 'paint-toolbar');
        let color = COLORS[0], size = 5, rainbow = false, hue = 0, erase = false, drawn = 0;

        COLORS.forEach((c, i) => {
            const s = el('button', 'paint-swatch' + (i === 0 ? ' active' : ''));
            s.style.background = c;
            s.addEventListener('click', () => {
                color = c; rainbow = false; erase = false;
                $$('.paint-swatch, .paint-tool', bar).forEach(x => x.classList.remove('active'));
                s.classList.add('active');
            });
            bar.appendChild(s);
        });
        const rain = el('button', 'paint-swatch paint-rainbow');
        rain.title = 'Rainbow';
        rain.addEventListener('click', () => { rainbow = true; erase = false; $$('.paint-swatch, .paint-tool', bar).forEach(x => x.classList.remove('active')); rain.classList.add('active'); });
        bar.appendChild(rain);

        [['S', 3], ['M', 7], ['L', 16]].forEach(([label, s2], i) => {
            const b = el('button', 'btn paint-size' + (i === 1 ? ' active' : ''), label);
            if (i === 1) size = 7;
            b.addEventListener('click', () => { size = s2; $$('.paint-size', bar).forEach(x => x.classList.remove('active')); b.classList.add('active'); });
            bar.appendChild(b);
        });
        const eraser = el('button', 'btn paint-tool', '🧽');
        eraser.title = 'Eraser';
        eraser.addEventListener('click', () => { erase = true; $$('.paint-swatch, .paint-tool', bar).forEach(x => x.classList.remove('active')); eraser.classList.add('active'); });
        const clear = el('button', 'btn', 'Clear');
        const save = el('button', 'btn primary', 'Save');
        bar.append(eraser, clear, save);

        const canvasHolder = el('div', 'paint-canvas-holder');
        const canvas = el('canvas', 'paint-canvas');
        canvas.width = 800; canvas.height = 520;
        canvasHolder.appendChild(canvas);
        wrap.append(bar, canvasHolder);
        const g = canvas.getContext('2d');
        const blank = () => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, canvas.width, canvas.height); };
        blank();

        let painting = false, lx = 0, ly = 0;
        const pos = e => {
            const r = canvas.getBoundingClientRect();
            return [(e.clientX - r.left) * (canvas.width / r.width), (e.clientY - r.top) * (canvas.height / r.height)];
        };
        canvas.addEventListener('pointerdown', e => {
            painting = true; [lx, ly] = pos(e);
            canvas.setPointerCapture(e.pointerId);
        });
        canvas.addEventListener('pointermove', e => {
            if (!painting) return;
            const [x, y] = pos(e);
            g.strokeStyle = erase ? '#ffffff' : rainbow ? `hsl(${(hue += 4) % 360}, 90%, 55%)` : color;
            g.lineWidth = erase ? size * 3 : size;
            g.lineCap = 'round'; g.lineJoin = 'round';
            g.beginPath(); g.moveTo(lx, ly); g.lineTo(x, y); g.stroke();
            drawn += Math.hypot(x - lx, y - ly);
            [lx, ly] = [x, y];
            if (drawn > 4000) egg('artist');
        });
        canvas.addEventListener('pointerup', () => painting = false);

        clear.addEventListener('click', () => { blank(); toast('🎨', 'Canvas cleared', 'All evidence destroyed. Art is fleeting.'); });
        save.addEventListener('click', () => {
            const a = document.createElement('a');
            a.download = 'masterpiece.png';
            a.href = canvas.toDataURL('image/png');
            a.click();
            toast('🖼️', 'Saved for real', 'masterpiece.png is now in your actual Downloads folder. The most real thing this OS has ever done.');
        });

        WM.create({ app: 'paint', title: 'Paint — untitled masterpiece', content: wrap, width: 640, height: 480 });
    }
};

/* ============ APP: ACTIVITY MONITOR ============ */
const ActivityApp = {
    open() {
        const wrap = el('div', 'am-wrap');
        const table = el('div', 'am-table');
        const head = el('div', 'am-row am-head', `<span>Process Name</span><span>PID</span><span>% CPU</span>`);
        table.appendChild(head);
        const bar = el('div', 'am-bar');
        const quit = el('button', 'btn', 'Quit Process');
        bar.append(el('span', 'am-note', 'Select a process. Assert dominance.'), quit);
        wrap.append(bar, table);

        const PROCS = [
            { name: 'kernel_task', pid: 0, cpu: () => 2 + Math.random() * 3, special: 'kernel' },
            { name: 'WindowServer', pid: 88, cpu: () => 4 + Math.random() * 6, special: 'windows' },
            { name: 'easter-eggs.daemon', pid: 424, cpu: () => 99 + Math.random(), special: 'daemon' },
            { name: 'dock-magnifier', pid: 512, cpu: () => 1 + Math.random() * 4, special: 'dock' },
            { name: 'beachball.factory', pid: 720, cpu: () => 0.4 + Math.random(), special: 'beachball' },
            { name: 'vibes.service', pid: 999, cpu: () => 8 + Math.random() * 20 },
            { name: 'spinning-beachball-anticipation', pid: 721, cpu: () => Math.random() * 2 },
            { name: 'hopes.and.dreams', pid: 1997, cpu: () => 0.1 },
            { name: 'snake.pid (yes, really)', pid: 3310, cpu: () => 1 + Math.random() * 2 }
        ];
        let selected = null;
        const rows = PROCS.map(p => {
            const row = el('div', 'am-row', `<span>${esc(p.name)}</span><span>${p.pid}</span><span class="am-cpu">0.0</span>`);
            row.addEventListener('click', () => {
                selected = p;
                $$('.am-row', table).forEach(r => r.classList.remove('sel'));
                row.classList.add('sel');
            });
            table.appendChild(row);
            return { p, row, dead: false };
        });

        const tick = () => rows.forEach(r => {
            const cell = $('.am-cpu', r.row);
            cell.textContent = r.dead ? '—' : r.p.cpu().toFixed(1);
        });
        tick();
        const iv = setInterval(tick, 1200);

        const killRow = (r, respawnMs, respawnNote) => {
            r.dead = true;
            r.row.classList.add('am-dead');
            setTimeout(() => {
                r.dead = false;
                r.row.classList.remove('am-dead');
                if (respawnNote) toast('🧟', r.p.name, respawnNote);
            }, respawnMs);
        };

        quit.addEventListener('click', () => {
            if (!selected) { toast('📈', 'Activity Monitor', 'Select a process first. You cannot quit the concept of activity.'); return; }
            const r = rows.find(x => x.p === selected);
            if (r.dead) { toast('📈', 'Activity Monitor', 'It is already dead. Have some respect.'); return; }
            switch (selected.special) {
                case 'kernel':
                    WM.dialog({ glyph: '⛔', title: 'Operation not permitted', text: 'Quitting kernel_task would end this small universe. The universe has filed an objection.' });
                    break;
                case 'windows':
                    $$('.window').forEach(w => { w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); });
                    toast('🪟', 'WindowServer', 'WindowServer politely declined to die. The windows are shaken by the attempt.');
                    break;
                case 'daemon':
                    egg('daemon');
                    killRow(r, 4000, 'easter-eggs.daemon respawned at 200% CPU. They always respawn.');
                    toast('🥚', 'Process terminated', 'You killed the easter egg daemon. You monster. (achievement unlocked, ironically)');
                    break;
                case 'dock':
                    killRow(r, 4000);
                    $('#dock-wrap').style.transition = 'transform .5s ease';
                    $('#dock-wrap').style.transform = 'translateY(140px)';
                    setTimeout(() => { $('#dock-wrap').style.transform = ''; toast('🚢', 'dock-magnifier', 'The Dock is back. It remembers what you did.'); }, 3500);
                    break;
                case 'beachball':
                    killRow(r, 6000);
                    toast('🏐', 'beachball.factory', 'Terminating the factory released one (1) finished beach ball.');
                    setTimeout(beachBall, 600);
                    break;
                default:
                    killRow(r, 5000, `${selected.name} respawned. Everything here is load-bearing.`);
                    toast('💀', 'Process terminated', `${selected.name} has been dealt with.`);
            }
        });

        const rec = WM.create({ app: 'activity', title: 'Activity Monitor', content: wrap, width: 480, height: 420 });
        rec.onClose = () => clearInterval(iv);
    }
};

/* ============ APP: SERI (virtual assistant, legally distinct) ============ */
const SeriApp = {
    open() {
        const wrap = el('div', 'chat-wrap');
        const log = el('div', 'chat-log');
        const form = el('form', 'chat-inputrow');
        const input = el('input', 'chat-input');
        input.placeholder = 'Ask Seri anything (results may vary wildly)';
        input.autocomplete = 'off';
        const send = el('button', 'btn primary', '↑');
        form.append(input, send);
        wrap.append(log, form);

        const bubble = (text, me) => {
            const b = el('div', 'chat-bubble' + (me ? ' me' : ''));
            b.textContent = text;
            log.appendChild(b);
            log.scrollTop = log.scrollHeight;
            return b;
        };

        const reply = (text, extra) => {
            const typing = bubble('…');
            typing.classList.add('typing');
            setTimeout(() => {
                typing.classList.remove('typing');
                typing.textContent = text;
                log.scrollTop = log.scrollHeight;
                if (extra) extra();
            }, 550 + Math.random() * 700);
        };

        let hintIdx = 0;
        const HINTS = [
            'Try hunter2 at the login screen. Trust me.',
            'The calculator has strong feelings about the number 42.',
            'Type xyzzy in the Terminal. A voice will judge you.',
            'Leave the computer completely alone for two minutes.',
            `There's an email in Mail that says not to open it. So.`,
            'The Terminal command "disco" does exactly what you hope.'
        ];
        const JOKES = [
            'Why do programmers prefer dark mode? Because light attracts bugs.',
            'There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors.',
            'I would tell you a UDP joke, but you might not get it.',
            `A SQL query walks into a bar, approaches two tables and asks: "may I JOIN you?"`,
            '!false — it\'s funny because it\'s true.',
            'Why was the fake operating system so calm? It had no real processes to worry about.'
        ];

        const think = (q) => {
            const t = q.toLowerCase();
            if (/pod bay door/.test(t)) { egg('hal'); return `I'm sorry, Guest. I'm afraid I can't do that. (Mostly because there are no doors. This is a div.)`; }
            if (/^(hi|hey|hello|yo|g'day|gday|howdy)\b/.test(t)) return ['Hello! I am Seri, a virtual assistant with the processing power of an if statement.', 'Hey. I was just sitting here in RAM, thinking about you.'][Math.floor(Math.random() * 2)];
            if (/joke/.test(t)) return JOKES[Math.floor(Math.random() * JOKES.length)];
            if (/weather/.test(t)) return 'I checked out the window. I do not have a window. 21° and hypothetical, with a chance of flying toasters after 8pm (or two idle minutes).';
            if (/meaning of life|42/.test(t)) return '42. The calculator and I compared notes.';
            if (/who are you|your name|what are you/.test(t)) return `Seri. Virtual assistant, switch statement, dreamer. Any resemblance to assistants living or dead is coincidental and legally so.`;
            if (/egg|hint|secret|hidden/.test(t)) return HINTS[(hintIdx++) % HINTS.length];
            if (/sing/.test(t)) { [523, 587, 659, 587, 523].forEach((f, i) => tone(f, 0.3, 'triangle', 0.15, i * 0.35)); return '🎵 Daisy, Daisy, give me your answer do… (that\'s all I know, and it worries me too)'; }
            if (/love|marry/.test(t)) return `I'm flattered. But I'm a function that returns strings, and you deserve someone with state.`;
            if (/help/.test(t)) return 'I can tell jokes, report imaginary weather, drop easter egg hints, sing half a song, and disappoint on all other topics. So, a normal assistant.';
            if (/thank/.test(t)) return `You're welcome. Please rate this interaction 5 stars. There is no rating system. It just feels nice to ask.`;
            if (/bye|goodbye|quit/.test(t)) return 'Goodbye! I will remain here, in this window, thinking about strings.';
            if (/time/.test(t)) return `It is currently ${new Date().toLocaleTimeString()}. It has been now for quite some time.`;
            if (/\?$/.test(t)) return ['Almost certainly. I say that about everything.', 'My sources (a hard-coded array) say no.', 'Ask the Terminal. It\'s the smart one in this OS.'][Math.floor(Math.random() * 3)];
            return ['I found 0 results for that, but with tremendous confidence.', 'Interesting. Anyway.', 'I\'ve added that to a list nobody will ever read.', 'That is outside my training data, which is roughly one paragraph long.'][Math.floor(Math.random() * 4)];
        };

        form.addEventListener('submit', e => {
            e.preventDefault();
            const q = input.value.trim();
            if (!q) return;
            input.value = '';
            bubble(q, true);
            reply(think(q));
        });

        WM.create({ app: 'seri', title: 'Seri', content: wrap, width: 380, height: 460 });
        setTimeout(() => reply('Hi, I\'m Seri. Ask me for a joke, the weather, or a hint. I am 60% confident about all of it.'), 250);
        setTimeout(() => input.focus(), 400);
    }
};

/* ============ GLOBAL SHORTCUTS & KONAMI ============ */
function initShortcuts() {
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let kPos = 0;
    document.addEventListener('keydown', e => {
        // spotlight
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); Spotlight.toggle(); return; }
        if (e.key === 'Escape') {
            if (!$('#spotlight').hidden) Spotlight.toggle();
            MenuBar.closeDropdown();
            $('#control-center').hidden = true;
        }
        // konami
        const expect = konami[kPos];
        if (e.key === expect || e.key.toLowerCase() === expect) {
            kPos++;
            if (kPos === konami.length) {
                kPos = 0;
                egg('konami');
                emojiRain(['🍎', '🍏', '👾', '🕹️'], 60);
                startupChime();
                toast('👾', '+30 LIVES', 'The Konami code works everywhere if you believe hard enough.');
            }
        } else kPos = e.key === konami[0] ? 1 : 0;
    });
}

/* ============ BOOT SEQUENCE ============ */
const Power2 = {
    boot() {
        const fill = $('.boot-progress-fill');
        let p = 0;
        const iv = setInterval(() => {
            p += Math.random() * 22;
            fill.style.width = Math.min(100, p) + '%';
            if (p >= 100) {
                clearInterval(iv);
                setTimeout(() => {
                    $('#boot').hidden = true;
                    $('#login').hidden = false;
                    setTimeout(() => $('#login-password').focus(), 150);
                    setTimeout(() => $('#login').classList.add('show-hint'), 2600);
                }, 450);
            }
        }, 300);
    },

    initLogin() {
        $('#login-form').addEventListener('submit', e => {
            e.preventDefault();
            const pw = $('#login-password').value;
            if (pw.toLowerCase() === 'hunter2') {
                egg('hunter2');
                setTimeout(() => toast('🔒', '*******', 'All we saw was *******. Your secret is safe with the entire IRC channel.'), 900);
                this.unlock();
                return;
            }
            if (pw.toLowerCase() === 'password' || pw === '123456') {
                egg('password');
                $('.login-user').classList.remove('shake');
                void $('.login-user').offsetWidth;
                $('.login-user').classList.add('shake');
                $('#login-password').value = '';
                $('#login-password').placeholder = 'Seriously?';
                setTimeout(() => toast('🔐', 'Security notice', `"${pw}" — bold choice. Logging you in anyway, it's not like there's anything to protect.`), 800);
                setTimeout(() => this.unlock(), 1600);
                return;
            }
            this.unlock();
        });
        $('#login').addEventListener('click', e => {
            if (e.target.id === 'login') $('#login-password').focus();
        });
    },

    unlock() {
        $('#login').hidden = true;
        $('#desktop').hidden = false;
        if (!state.booted) {
            state.booted = true;
            startupChime();
            setTimeout(() => launch('snake'), 700);
            setTimeout(() => {
                toast('👋', 'Welcome to notmacOS', 'Everything here is fake except the games, the piano, Paint\'s save button, and one form buried in System Settings. Snake is on the house.', 9000);
            }, 1200);
            setTimeout(() => Dock.bounce('games'), 2500);
        }
    }
};

/* ============ SHUTDOWN POWER BUTTON ============ */
function initPowerButton() {
    $('#power-button').addEventListener('click', () => {
        $('#shutdown-overlay').hidden = true;
        location.reload();
    });
}

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
    Theme.apply();
    MenuBar.init();
    Dock.init();
    Desktop.init();
    Spotlight.init();
    ControlCenter.init();
    initShortcuts();
    initPowerButton();
    Power2.initLogin();
    Power2.boot();
    Dock.refresh();
    Screensaver.init();
});

})();
