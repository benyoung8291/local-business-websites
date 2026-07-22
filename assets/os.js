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
    trash: 'Actually emptied the Trash'
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
    notes:    { name: 'Notes',           glyph: '📝', tile: 'tile-yellow', open: () => NotesApp.open() },
    terminal: { name: 'Terminal',        glyph: '>_', tile: 'tile-dark',   open: () => TerminalApp.open() },
    calculator: { name: 'Calculator',    glyph: '🧮', tile: 'tile-grey',   open: () => CalcApp.open() },
    music:    { name: 'Music',           glyph: '🎹', tile: 'tile-pink',   open: () => MusicApp.open() },
    games:    { name: 'Games',           glyph: '🕹️', tile: 'tile-purple', open: () => GamesApp.open() },
    snake:    { name: 'Snake II',        glyph: '🐍', tile: 'tile-green',  hidden: true, open: () => SnakeGame.open() },
    mines:    { name: 'Minesweeper',     glyph: '💣', tile: 'tile-grey',   hidden: true, open: () => MinesGame.open() },
    ttt:      { name: 'Tic-Tac-Toe',     glyph: '⭕', tile: 'tile-red',    hidden: true, open: () => TTTGame.open() },
    g2048:    { name: '2048',            glyph: '🔢', tile: 'tile-yellow', hidden: true, open: () => Game2048.open() },
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
    order: ['finder', 'safari', 'notes', 'terminal', 'calculator', 'music', 'games', 'settings', '|', 'trash'],

    init() {
        const dock = $('#dock');
        this.order.forEach(id => {
            if (id === '|') { dock.appendChild(el('div', 'dock-sep')); return; }
            const a = APPS[id];
            const b = el('button', 'dock-item');
            b.dataset.app = id;
            b.innerHTML = `<span class="dock-icon ${a.tile}">${a.glyph}</span><span class="dock-dot"></span><span class="dock-tip">${esc(a.name)}</span>`;
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
        { key: 'meaning of life', label: 'The meaning of life', glyph: '4️⃣2️⃣', hint: 'Answer', run: () => WM.dialog({ glyph: '🌌', title: '42', text: 'You knew the answer before you searched.' }) }
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
  • Check what's rotting in the Trash
  • Try the piano in Music
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
  hotdog        ?
  amber         retro terminal mode
  games         list the games
  eggs          easter egg progress
  whoami / pwd / date / echo / uname / clear / exit

Some commands are not listed. That's what makes them fun.`);
                break;
            case 'ls':
                P('README.txt      secrets.txt     todo.md         old_website/    definitely_no_easter_eggs/');
                break;
            case 'cat':
                if (!args[0]) P('cat: which file?');
                else if (/readme/i.test(args[0])) P(READ_ME);
                else if (/secret/i.test(args[0])) P('Nice try. The secrets file is encrypted with ROT26.');
                else if (/todo/i.test(args[0])) P('- [x] delete old website\n- [x] replace with an operating system for some reason\n- [ ] explain this decision to anyone');
                else P(`cat: ${args[0]}: No such file or directory`);
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
            case 'games': P('snake, mines, ttt, 2048 — e.g. "open snake" (or use the 🕹️ in the Dock)'); break;
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
            case 'top': case 'htop': P(`PID  COMMAND      %CPU\n1    your-tab     ${(Math.random() * 40 + 10).toFixed(1)}\n2    easter-eggs  100.0\n3    self-esteem  0.1`); break;
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
            else if (k === '=') { apply(); op = null; fresh = true; if (cur === '80085' || cur === '5318008') toast('🧮', 'Calculator', 'Nice. Very mature. (turn me upside down)'); }
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
        [['snake', 'Snake II'], ['mines', 'Minesweeper'], ['ttt', 'Tic-Tac-Toe'], ['g2048', '2048']].forEach(([id, name]) => {
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
            `<br><br><span style="opacity:.5;font-size:12px">Hints: the Terminal knows things. So do the Notes. So does the Konami code.</span>`;
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
                toast('👋', 'Welcome to notmacOS', 'Everything here is fake except the games, the piano, and one form buried in System Settings. Snake is on the house.', 9000);
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
});

})();
