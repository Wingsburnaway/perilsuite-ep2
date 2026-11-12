(function () {
  const { MEMBERS, PHASES, VOX, SONGS, LYRICS, STAGE_STATUS, THEMES, ALBUM_SUMMARY, HERO_LINES, PROJECT, SCHEDULE, TEAM, STAGE_OWNERS } = window.PS_DATA;
  const NSTAGES = PHASES.reduce((n, p) => n + p.stages.length, 0);
  const LBL = { done: "Done (confirmed)", unc: "Unknown", tbd: "Unknown" };

  const userKey = "ps-ep2-user";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  let sessionPass = null;
  let phFilter = "pre";
  const st = (stage, song) => {
    const row = (STAGE_STATUS && STAGE_STATUS[song.id]) || {};
    const v = row[stage];
    if (v === "done" || v === true) return "done";
    if (v === "tbd") return "tbd";
    return "unc";
  };
  const countDone = (stage) => SONGS.filter((s) => st(stage, s) === "done").length;
  const mk = (s) => `<span class="mk ${s}" role="img" aria-label="${LBL[s]}" title="${LBL[s]}"></span>`;
  const pct = (song, p) => Math.round(100 * p.stages.filter((x) => st(x, song) === "done").length / p.stages.length);
  const pl = (song, p) => { const v = pct(song, p); return v ? v + "% confirmed · rest unknown" : "Unknown · nothing confirmed yet"; };
  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" }) + " CT";
    } catch { return iso; }
  };
  const memberByName = (name) => MEMBERS.find((m) => m.name === name) || null;
  /* Passwords are compared by SHA-256 of the lowercased input (see data.js / private/login_codes.md). */
  async function sha256Hex(str) {
    const buf = new TextEncoder().encode(str);
    if (window.crypto && crypto.subtle) {
      const h = await crypto.subtle.digest("SHA-256", buf);
      return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    return sha256Fallback(buf);
  }
  function sha256Fallback(bytes) {
    const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const l = bytes.length, n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n);
    m.set(bytes); m[l] = 0x80; const dv = new DataView(m.buffer); dv.setUint32(n - 4, l * 8);
    const r = (x, y) => (x >>> y) | (x << (32 - y)), W = new Uint32Array(64);
    for (let o = 0; o < n; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) { const s0 = r(W[i-15],7)^r(W[i-15],18)^(W[i-15]>>>3), s1 = r(W[i-2],17)^r(W[i-2],19)^(W[i-2]>>>10); W[i] = (W[i-16]+s0+W[i-7]+s1)|0; }
      let [a,b,c,d,e,f,g,h] = H;
      for (let i = 0; i < 64; i++) { const t1 = (h+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+K[i]+W[i])|0, t2 = ((r(a,2)^r(a,13)^r(a,22))+((a&b)^(a&c)^(b&c)))|0; h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0; }
      H = H.map((v, i) => (v + [a,b,c,d,e,f,g,h][i]) | 0);
    }
    return H.map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
  }
  const matchMember = async (raw) => {
    const n = String(raw || "").trim().toLowerCase();
    if (!n) return null;
    const h = await sha256Hex(n);
    return MEMBERS.find((m) => m.hash === h) || null;
  };

  const statusRank = (status) => {
    if (status === "done") return 3;
    if (status === "tbd") return 0;
    if (status === "unc") return 1;
    return 2;
  };
  let sortBy = { key: "n", dir: "asc" };

  const PRE_END = Date.parse((PROJECT && PROJECT.preProEnd) || "2026-12-31T23:59:59-06:00");
  const DRUM = (PROJECT && PROJECT.drumTracking) || {};
  const DRUM_META = `Drum tracking · Date TBA · ${DRUM.window || "late January / early February 2027"} · ${DRUM.venue || "The Orb, Austin, TX"}`;
  const pad2 = (n) => String(n).padStart(2, "0");
  function tickCountdown() {
    const root = $("#countdown");
    const body = $("#cd-body");
    if (!root || !body) return false;
    const extra = `<p class="cd-extra">${esc(DRUM_META)}</p>`;
    const ms = PRE_END - Date.now();
    if (ms <= 0) {
      root.classList.add("is-live");
      body.innerHTML = `<p class="cd-live">Pre-production window has closed</p>${extra}`;
      return false;
    }
    root.classList.remove("is-live");
    const total = Math.floor(ms / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const unit = (n, label) => `<div class="cd-unit"><div class="cd-n">${n}</div><div class="cd-l">${label}</div></div>`;
    body.innerHTML = `<div class="cd-units">${unit(d, "Days")}${unit(pad2(h), "Hours")}${unit(pad2(m), "Minutes")}${unit(pad2(s), "Seconds")}</div><p class="cd-meta">Through the end of 2026</p>${extra}`;
    return true;
  }
  function startCountdown() {
    const run = () => { if (!tickCountdown()) clearInterval(tid); };
    run();
    const tid = setInterval(run, 1000);
  }
  const KEEP_MS = 30 * 24 * 60 * 60 * 1000; // stay signed in 30 days
  function loadUser() {
    try {
      const v = JSON.parse(localStorage.getItem(userKey) || "null");
      if (v && memberByName(v.u) && v.exp > Date.now()) return v.u;
    } catch (e) {}
    localStorage.removeItem(userKey);
    return null;
  }
  function saveUser(u) { localStorage.setItem(userKey, JSON.stringify({ u, exp: Date.now() + KEEP_MS })); }
  let user = loadUser();
  if (user) saveUser(user);

  function gate() {
    const splash = $("#splash");
    const app = $("#app");
    if (user) {
      splash.hidden = true;
      app.hidden = false;
      document.body.classList.remove("locked");
      $("#who").textContent = user;
      const roleEl = $("#who-role");
      const mem = memberByName(user);
      if (roleEl) roleEl.textContent = mem && mem.role ? "· " + mem.role : "";
      return true;
    }
    splash.hidden = false;
    app.hidden = true;
    document.body.classList.add("locked");
    $("#code").focus();
    return false;
  }

  $("#enter").addEventListener("submit", async (e) => {
    e.preventDefault();
    const typed = $("#code").value.trim().toLowerCase();
    const found = await matchMember(typed);
    const err = $("#gate-err");
    if (!found) {
      err.textContent = "That password isn't recognized.";
      $("#code").select();
      return;
    }
    user = found.name;
    sessionPass = typed;
    saveUser(user);
    if (window.PSRates && window.PSRates.canSee(user)) {
      try { await window.PSRates.unlock(user, sessionPass); }
      catch (unlockErr) { /* signed in; rates section will ask again if needed */ }
    }
    err.textContent = "";
    updateHeroCounts();
    paintBreakouts();
    setPh(phFilter);
    gate();
  });
  $("#signout").addEventListener("click", () => {
    localStorage.removeItem(userKey);
    user = null;
    sessionPass = null;
    if (window.PSRates) window.PSRates.lock();
    $("#code").value = "";
    paintBreakouts();
    gate();
  });

  /* ---- views ---- */
  const LEG = `<div class="legend">${mk("done")}<span>Done (confirmed)</span>${mk("unc")}<span>Unknown — not yet reported</span></div>`;

  function sortHeader(key, label, extraClass, extraAttr, extraHtml) {
    const active = sortBy.key === key;
    const aria = active ? (sortBy.dir === "asc" ? "ascending" : "descending") : "none";
    const arr = active ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕";
    return `<th scope="col" class="${extraClass || ""}" ${extraAttr || ""} aria-sort="${aria}"><button type="button" class="sortbtn" data-sort="${esc(key)}">${label}<span class="arr" aria-hidden="true">${arr}</span></button>${extraHtml || ""}</th>`;
  }
  function sortedSongs() {
    const list = SONGS.slice();
    const { key, dir } = sortBy;
    const mul = dir === "asc" ? 1 : -1;
    const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0) * mul;
    list.sort((a, b) => {
      let r = 0;
      if (key === "n") r = cmp(a.n, b.n);
      else if (key.slice(0, 6) === "stage:") {
        r = cmp(statusRank(st(key.slice(6), a)), statusRank(st(key.slice(6), b)));
      }
      return r || (a.n - b.n);
    });
    return list;
  }
  function tableRows() {
    return sortedSongs().map((s) => {
      return `<tr data-song="${esc(s.title.toLowerCase())}"><td class="song"><button type="button" data-goto="${s.id}" aria-label="Open song card: ${esc(s.title)}"><span class="i">${String(s.n).padStart(2, "0")}</span>${esc(s.title)}</button></td>${PHASES.map((p) => p.stages.map((x, i) =>
        `<td data-c="${p.id}" class="${i ? "" : "grp"} ${VOX.has(x) ? "dim" : ""}">${mk(st(x, s))}</td>`
      ).join("")).join("")}</tr>`;
    }).join("");
  }
  function grid() {
    return `<div class="controls" role="search"><label class="sr" for="q">Search songs</label><input id="q" type="search" placeholder="Search songs…" autocomplete="off">
      <span role="group" aria-label="Show phase columns">${["pre", "prod", "post", "all"].map((id) =>
        `<button class="btn" type="button" data-ph="${id}" aria-pressed="${id === "pre"}">${id === "all" ? `All ${NSTAGES} stages →` : PHASES.find((p) => p.id === id).name}</button>`
      ).join(" ")}</span>
      <button class="btn" type="button" id="csv">Download CSV</button>
      <span id="cnt" aria-live="polite"></span></div>
      ${LEG}
      <p id="scrollnote" class="note" hidden>All ${NSTAGES} stages: the table scrolls sideways → song names stay pinned.</p>
      <div class="gridwrap" tabindex="0" role="region" aria-label="Song by stage table">
      <table id="tbl"><caption class="sr">All songs by pipeline stage</caption>
      <thead><tr class="ph"><th class="song"></th>${PHASES.map((p) => `<th colspan="${p.stages.length}" class="${p.id} grp" data-c="${p.id}">${p.name}</th>`).join("")}</tr>
      <tr>${sortHeader("n", "Song", "song")}${PHASES.map((p) => p.stages.map((s, i) =>
        sortHeader("stage:" + s, s, (i ? "" : "grp ") + (VOX.has(s) ? "dim" : ""), `data-c="${p.id}"`, "")
      ).join("")).join("")}</tr></thead>
      <tbody>${tableRows()}</tbody></table></div>`;
  }

  function mediaRow(label, m, extra) {
    if (!m || !m.url) return "";
    return `<li><span>${label}</span><a href="${esc(m.url)}" target="_blank" rel="noopener" download>${esc(m.name)}${extra ? ` <small class="muted">${esc(extra)}</small>` : ""}</a></li>`;
  }
  function dlRow(label, link, found) {
    if (link && link.url) return `<li><span>${label}</span><a href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.label)}</a></li>`;
    if (link && link.file) return `<li><span>${label}</span><span class="muted">On file at ${esc(link.file)}${link.label ? " · " + esc(link.label) : ""} (no public link yet)</span></li>`;
    if (found) return `<li><span>${label}</span><span class="muted">TBD — file found at ${esc(found.file)} (no public link yet)</span></li>`;
    return `<li><span>${label}</span><span class="muted">TBD</span></li>`;
  }

  function lyricsText(s) {
    const fromMap = LYRICS && LYRICS[s.id];
    return String(fromMap != null ? fromMap : (s.lyrics || "")).trim();
  }
  function lyricsBlock(s) {
    const text = lyricsText(s);
    if (!text) return `<div class="lyr-view"><p class="muted lyr-soon">Lyrics coming soon</p></div>`;
    return `<div class="lyr-view"><pre class="ly lyr-text">${esc(text)}</pre></div>`;
  }

  function stageItem(s, x) {
    const status = st(x, s);
    const dim = VOX.has(x) ? "dim" : "";
    return `<li class="${dim}">${mk(status)}${esc(x)}</li>`;
  }


  /* ---------- Audio: one shared engine for card mini players + Playlist ---------- */
  const PLAYLIST = SONGS.filter((s) => s.media && s.media.main && s.media.main.stream);
  const NOAUDIO = SONGS.filter((s) => !(s.media && s.media.main && s.media.main.stream));
  const audio = new Audio();
  audio.preload = "none";
  const durs = {};
  let curId = null;
  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5h4.2v15H6zM13.8 4.5H18v15h-4.2z" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h2.6v14H5zM19.5 5v14L8.6 12z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.4 5H19v14h-2.6zM4.5 5v14L15.4 12z" fill="currentColor"/></svg>'
  };
  const tfmt = (t) => {
    if (!isFinite(t) || t < 0) return "–:––";
    const m = Math.floor(t / 60), sec = Math.floor(t % 60);
    return m + ":" + String(sec).padStart(2, "0");
  };
  const byId = (id) => SONGS.find((s) => s.id === id);
  function playSong(id, fromStart) {
    const s = byId(id);
    if (!s || !s.media.main) return;
    if (curId !== id) {
      curId = id;
      audio.src = s.media.main.stream;
      audio.currentTime = 0;
    } else if (fromStart) audio.currentTime = 0;
    const pr = audio.play();
    if (pr && pr.catch) pr.catch(() => syncAudioUI());
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: s.title, artist: "Peril Suite", album: "EP 2" });
      } catch (e) {}
    }
    syncAudioUI();
  }
  function toggleSong(id) {
    if (curId === id && !audio.paused) { audio.pause(); return; }
    playSong(id);
  }
  function step(dir) {
    if (!PLAYLIST.length) return;
    let i = PLAYLIST.findIndex((s) => s.id === curId);
    if (dir < 0 && curId && audio.currentTime > 3) { audio.currentTime = 0; return; }
    i = i < 0 ? 0 : (i + dir + PLAYLIST.length) % PLAYLIST.length;
    playSong(PLAYLIST[i].id, true);
  }
  function seekFrac(f) {
    if (!curId || !isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(1, f)) * audio.duration;
  }
  function syncAudioUI() {
    const playing = !!curId && !audio.paused && !audio.ended;
    const d = audio.duration, t = audio.currentTime;
    const frac = curId && isFinite(d) && d > 0 ? t / d : 0;
    if (curId && isFinite(d)) durs[curId] = d;
    $$("[data-mini]").forEach((el) => {
      const id = el.dataset.mini, on = id === curId;
      el.classList.toggle("on", on);
      el.classList.toggle("playing", on && playing);
      const b = el.querySelector(".mp-btn");
      if (b) { b.innerHTML = on && playing ? ICON.pause : ICON.play; b.setAttribute("aria-label", (on && playing ? "Pause " : "Play ") + el.dataset.title); }
      const bar = el.querySelector(".mp-bar i");
      if (bar) bar.style.width = (on ? frac * 100 : 0) + "%";
      const tt = el.querySelector(".mp-t");
      if (tt) tt.textContent = on ? tfmt(t) + " / " + tfmt(d) : (durs[id] ? tfmt(durs[id]) : "Original");
    });
    const pl = $("#pl");
    if (!pl) return;
    const s = curId ? byId(curId) : null;
    pl.classList.toggle("playing", playing);
    $("#pl-title").textContent = s ? s.title : "Press play when mixes are on file";
    $("#pl-sub").textContent = s ? `Track ${String(PLAYLIST.indexOf(s) + 1).padStart(2, "0")} of ${PLAYLIST.length} · ${s.media.main.name}` : `${PLAYLIST.length} tracks · originals only · in album order`;
    const tg = $("#pl-toggle");
    tg.innerHTML = playing ? ICON.pause : ICON.play;
    tg.setAttribute("aria-label", playing ? "Pause" : "Play");
    $("#pl-cur").textContent = tfmt(curId ? t : 0);
    $("#pl-dur").textContent = curId ? tfmt(d) : "–:––";
    const r = $("#pl-range");
    if (r && !r.matches(":active")) { r.value = Math.round(frac * 1000); r.style.setProperty("--p", (frac * 100).toFixed(2) + "%"); }
    $$("#pl [data-plrow]").forEach((row) => {
      const on = row.dataset.plrow === curId;
      row.classList.toggle("on", on);
      row.setAttribute("aria-current", on ? "true" : "false");
      const dd = row.querySelector(".d");
      if (dd) dd.innerHTML = on && playing ? '<span class="eq" aria-label="Playing"><i></i><i></i><i></i></span>' : (durs[row.dataset.plrow] ? tfmt(durs[row.dataset.plrow]) : "");
    });
  }
  ["play", "pause", "timeupdate", "loadedmetadata", "durationchange", "emptied"].forEach((ev) => audio.addEventListener(ev, syncAudioUI));
  audio.addEventListener("ended", () => step(1));
  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
      navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
    } catch (e) {}
  }
  function miniPlayer(s) {
    if (!s.media.main) return `<div class="mini none"><span class="mp-x">No streamable original on a shared link yet</span></div>`;
    return `<div class="mini" data-mini="${esc(s.id)}" data-title="${esc(s.title)}">
      <button class="mp-btn" type="button" data-mp="${esc(s.id)}" aria-label="Play ${esc(s.title)}">${ICON.play}</button>
      <div class="mp-bar" data-mpseek="${esc(s.id)}" role="presentation"><i></i></div>
      <span class="mp-t">Original</span></div>`;
  }
  function playlist() {
    const rows = PLAYLIST.map((s, i) => `<li><button type="button" data-plrow="${esc(s.id)}" aria-current="false"><span class="i">${String(i + 1).padStart(2, "0")}</span><span class="t">${esc(s.title)}</span><span class="d"></span></button></li>`).join("");
    const skipped = NOAUDIO.length ? `<p class="note pl-skip">No streamable pre-production mixes are on a shared link yet. Songs that will appear here: ${NOAUDIO.map((s) => esc(s.title)).join(", ")}.</p>` : "";
    return `<div class="pl" id="pl">
      <div class="pl-deck">
        <img class="pl-em" src="assets/brand/monogram.svg" alt="" width="120" height="120">
        <div class="pl-info"><div class="pl-k">EP 2 · now playing</div><div class="pl-title" id="pl-title"></div><div class="pl-sub" id="pl-sub"></div></div>
        <div class="pl-ctrls">
          <button type="button" class="pl-b" data-pl="prev" aria-label="Previous track">${ICON.prev}</button>
          <button type="button" class="pl-b big" id="pl-toggle" data-pl="toggle" aria-label="Play">${ICON.play}</button>
          <button type="button" class="pl-b" data-pl="next" aria-label="Next track">${ICON.next}</button>
        </div>
      </div>
      <div class="pl-seek"><span id="pl-cur">0:00</span><input type="range" id="pl-range" min="0" max="1000" value="0" step="1" aria-label="Seek"><span id="pl-dur">–:––</span></div>
      <ol class="pl-list">${rows}</ol>
      ${skipped}
      <p class="note">When pre-production mixes are on a shared link, they will stream here. Click, instrumental, and session files will live in each song card's Downloads.</p>
    </div>`;
  }

  function card(s) {
    return `<article class="card" id="song-${s.id}" data-song="${esc(s.title.toLowerCase())}">
      <span class="num" aria-hidden="true">${String(s.n).padStart(2, "0")}</span>
      <h3>${esc(s.title)}</h3>
      ${miniPlayer(s)}
      ${PHASES.map((p) => `<div class="barl"><span>${p.name}</span><span>${pct(s, p) ? pct(s, p) + "% confirmed" : "Unknown"}</span></div><div class="bar" role="img" aria-label="${p.name}: ${pl(s, p)}"><i style="width:${pct(s, p)}%"></i></div>`).join("")}
      <details class="brk" data-lyrics="${s.id}"><summary>Lyrics</summary>${lyricsBlock(s)}</details>
      <details class="brk"><summary>Downloads</summary>
        <ul class="dl">
          ${mediaRow("Original", s.media.main, s.media.main && s.media.main.note ? s.media.main.note : "pre-production mix")}
          ${s.media.inst ? mediaRow("Instrumental", s.media.inst) : dlRow("Instrumental", s.instrumental, s.instrumentalFound)}
          ${mediaRow("Click", s.media.click)}
          ${mediaRow("Logic session", s.media.logic, s.media.logic && s.media.logic.mb ? `.logicx folder · zipped · ~${s.media.logic.mb >= 1000 ? (s.media.logic.mb / 1000).toFixed(1) + " GB" : s.media.logic.mb + " MB"}` : ".logicx folder · zipped")}
          ${dlRow("Drum demo", s.drumDemo, s.drumFound)}
        </ul>
      </details>
      <details class="brk" data-pipe="${s.id}"><summary>Pipeline</summary>
        ${PHASES.map((p) => `<div class="ph">${p.name}</div><ul class="stages">${p.stages.map((x) => stageItem(s, x)).join("")}</ul>`).join("")}
      </details>
    </article>`;
  }

  function cards() {
    return `<p class="lead">Open a card for lyrics, downloads (when files are on a shared link), or the pipeline. Bars fill with confirmed work only — empty means unknown, not zero. Status is published with the site.</p>
      <div class="songs" id="cards">${SONGS.map((s) => card(s)).join("")}</div>`;
  }

  function phase(p) {
    const nSongs = SONGS.length;
    const d = p.id === "pre"
      ? "Pre-production runs through the end of 2026, in this order: MIDI Drums, Guitar, Bass, Vocals, Drum Demo. The bass tracked here is the record bass (Twitch exits by year end). Status stays unknown until it is marked done in the published project data."
      : p.id === "prod"
        ? "Drums at The Orb (date TBA, targeting late January / early February 2027), with Jman as drummer. Jman owns drums, including The Orb tracking and the drum-edit stage. Then rhythm guitar, lead guitar, and vocals — rhythm guitar and vocals proposed at AB's studio. Lead Guitars and Aux/Other have no editing phase. Re-amp is 3 hours at Hendyamps after all elements are recorded and edited."
        : "Mixing by Rob Hitchcock, then Atmos mixes (Nick Matzke, at the verified Tom Houck EP rate) and mastering (Chris Henderson; rate TBD). Amounts are in Rates & budget. Status is unknown until it is marked done in the published project data.";
    const confirmedPct = Math.round(100 * SONGS.reduce((n, s) => n + p.stages.filter((x) => st(x, s) === "done").length, 0) / (p.stages.length * nSongs));
    const label = confirmedPct ? confirmedPct + "% confirmed · rest unknown" : "Unknown · nothing confirmed yet";
    return `<div class="two"><div><p class="lead">${p.stages.length} stages × ${nSongs} songs. ${d}</p><ul class="list">${p.stages.map((x) => {
      const n = SONGS.filter((s) => st(x, s) === "done").length;
      const txt = n ? `${n}/${nSongs} confirmed` : "Unknown";
      const owner = (STAGE_OWNERS || {})[x];
      return `<li class="${VOX.has(x) ? "dim" : ""}"><b>${esc(x)}</b>${owner ? `<i class="stage-owner">${esc(owner)}</i>` : ""}<span>${txt}</span></li>`;
    }).join("")}</ul></div>
    <div class="panel"><div class="badge">Confirmed only</div><div class="big ${confirmedPct ? "" : "u"}">${label}</div>
    <div class="bar" style="height:10px;margin-top:14px" role="img" aria-label="${p.name}: ${label}"><i style="width:${confirmedPct}%"></i></div>
    <p class="note" style="margin-top:10px">The bar shows confirmed work, not actual progress.</p></div></div>`;
  }

  function scheduleView() {
    const items = (SCHEDULE || []).map((row) =>
      `<article class="fact"><h3>${esc(row.phase)}</h3><p class="when">${esc(row.when)}</p><p class="where">${esc(row.where)}</p><p>${esc(row.detail)}</p></article>`
    ).join("");
    return `<p class="lead">Production plan as specified for this EP. Dates that have not been booked stay TBA. The Nov 4, 2026 agreement still described a later in-studio bass session; the current plan (agreed by all parties) is that pre-production bass is the record bass so Twitch can leave by year's end.</p>
      <div class="facts">${items}</div>`;
  }

  function rateRows(rows, numericLast) {
    return (rows || []).map((r) => {
      const tot = /remaining|balance/i.test(r.item);
      return `<tr class="${tot ? "tot" : ""}"><td>${esc(r.item)}</td><td>${esc(r.rate || "")}</td><td>${esc(r.qty || "")}</td><td class="n">${esc(r.amount || "")}</td><td class="note-cell">${esc(r.note || "")}</td></tr>`;
    }).join("");
  }
  function ratesTables(R) {
    const notes = (R.sourceNotes || []).map((n) => `<li>${esc(n)}</li>`).join("");
    const studios = (R.studiosOnFile || []).map((strow) =>
      `<tr><td>${esc(strow.studio)}</td><td>${esc(strow.location)}</td><td class="n">${esc(strow.rate)}</td></tr>`
    ).join("");
    return `<p class="lead">Figures below are only those Rob gave for this project or that were found on file. Anything not quoted is marked TBD — no prices were invented. This section is encrypted in the public files and opens only for AB and Rob.</p>
      <ul class="src-notes">${notes}</ul>
      <h4 class="ph">Producer</h4>
      <table class="rate-table"><thead><tr><th>Item</th><th>Rate</th><th>Qty</th><th>Amount</th><th>Notes</th></tr></thead>
      <tbody>${rateRows(R.producer)}</tbody></table>
      <h4 class="ph">Outside / studio</h4>
      <table class="rate-table"><thead><tr><th>Item</th><th>Rate</th><th>Qty</th><th>Amount</th><th>Notes</th></tr></thead>
      <tbody>${rateRows(R.outside)}</tbody></table>
      <h4 class="ph">Studio options on file</h4>
      <p class="note">From the Nov 4, 2026 agreement. Estimates only, subject to change. The Orb (this record's drum room) is listed as TBD.</p>
      <table class="rate-table"><thead><tr><th>Studio</th><th>Location</th><th>Rate</th></tr></thead>
      <tbody>${studios}</tbody></table>`;
  }
  function ratesView() {
    if (!window.PSRates || !window.PSRates.canSee(user)) {
      return `<p class="lead">Rates & budget is only available to AB and Rob.</p>`;
    }
    const cached = window.PSRates.getCached();
    if (cached) return ratesTables(cached);
    return `<p class="lead">This section is encrypted and only opens for AB and Rob. Enter your password to view the figures for the rest of this browser session.</p>
      <form class="rates-unlock" data-rates-unlock>
        <label for="rates-pass">Password</label>
        <input id="rates-pass" name="rates-pass" type="password" autocomplete="current-password" required>
        <button class="btn save" type="submit">Unlock Rates & budget</button>
        <p class="err" data-rates-err role="alert"></p>
      </form>`;
  }

  function teamView() {
    const items = (TEAM || []).map((t) =>
      `<li><b>${esc(t.name)}</b><span class="team-role">${esc(t.role)}</span>${t.detail ? `<span class="team-detail">${esc(t.detail)}</span>` : ""}</li>`
    ).join("");
    return `<p class="lead">Everyone with a login for this site.</p>
      <ul class="team-list">${items}</ul>
      <p class="note">Twitch's pre-production bass is the bass on the record, which lets Twitch leave the project by the end of 2026. Drums will be rigidly quantized so that bass lines up. Jman owns drums on this EP, including tracking at The Orb and the drum-edit stage. AB's studio remains the proposed room for rhythm guitar and vocals.</p>`;
  }

  function ART() {
    return `<p class="lead">The home hero uses Rob's official stage banner — the white spiky gothic PERIL SUITE wordmark on scratched metal, with the band, crowd, and rigging along the bottom. The hourglass crest stays over the official wordmark. Web-optimized crops (under 500 KB) are what the site serves; the 7 MB master stays in <code>assets/brand/ps-banner-stage.png</code> and is not linked from the page. The hourglass logo, wide wordmark, and EP cover files are still pending as separate drops.</p>
    <div class="sw"><div style="background:#0b0b0b;color:#e9e7e2">PAPER #0B0B0B</div><div style="background:#141414;color:#e9e7e2">CHARCOAL #141414</div><div style="background:#8a8a8a;color:#0b0b0b">ASH #8A8A8A</div><div style="background:#e9e7e2;color:#0b0b0b">BONE #E9E7E2</div></div>
    <h4 class="ph">Official art on file</h4>
    <div class="brand-grid">
      <figure class="bfig dark wide"><img src="assets/brand/ps-banner-stage.webp" alt="Peril Suite stage banner: gothic wordmark over a silhouetted band and crowd" width="2000" height="1000"><figcaption><b>Stage banner</b><span>Hero backdrop and official wordmark — assets/brand/ps-banner-stage.webp</span></figcaption></figure>
      <figure class="bfig dark wide"><img src="assets/brand/ps-stage-silhouette.webp" alt="Stage silhouette strip: band, crowd, and rigging" width="2000" height="456"><figcaption><b>Stage silhouette</b><span>Footer and splash bottom motif — assets/brand/ps-stage-silhouette.webp</span></figcaption></figure>
    </div>
    <h4 class="ph">Corner filigree</h4>
    <div class="brand-grid filigree-row">
      <figure class="bfig dark"><img src="assets/brand/ps-filigree-tl.webp" alt="Top-left corner filigree" width="320" height="320"><figcaption><b>Top left</b></figcaption></figure>
      <figure class="bfig dark"><img src="assets/brand/ps-filigree-tr.webp" alt="Top-right corner filigree" width="320" height="320"><figcaption><b>Top right</b></figcaption></figure>
      <figure class="bfig dark"><img src="assets/brand/ps-filigree-bl.webp" alt="Bottom-left corner filigree" width="320" height="320"><figcaption><b>Bottom left</b></figcaption></figure>
      <figure class="bfig dark"><img src="assets/brand/ps-filigree-br.webp" alt="Bottom-right corner filigree" width="320" height="320"><figcaption><b>Bottom right</b></figcaption></figure>
    </div>
    <p class="note">Filigree ornaments appear on the splash (top corners). The official banner already carries them in the hero, and the footer silhouette includes the bottom pair. Still waiting on <code>ps-hourglass.png</code>, <code>ps-wordmark.png</code>, and <code>ps-cover.png</code> as separate files — the splash hourglass and typographic fallback stay in place until those arrive.</p>`;
  }

  const preMeta = () => {
    const n = SONGS.length;
    const pre = PHASES.find((p) => p.id === "pre");
    if (!pre) return "Through end of 2026";
    const done = SONGS.reduce((acc, s) => acc + pre.stages.filter((x) => st(x, s) === "done").length, 0);
    return `${done}/${pre.stages.length * n} confirmed · through Dec 2026`;
  };

  const open = new Set(["all", "songs", "schedule"]);
  const SECS = () => {
    const list = [
      { id: "all", t: "All songs — overview", m: `${SONGS.length} songs · ${NSTAGES} stages`, b: grid },
      { id: "songs", t: "Song cards", m: `${SONGS.length} cards`, b: cards },
      { id: "playlist", t: "Playlist", m: PLAYLIST.length ? `${PLAYLIST.length} tracks` : "No mixes on file yet", b: playlist },
      { id: "schedule", t: "Schedule", m: "Pre-pro through 2026 · drums TBA", b: scheduleView }
    ];
    if (window.PSRates && window.PSRates.canSee(user)) {
      list.push({ id: "rates", t: "Rates & budget", m: "Encrypted · AB and Rob", b: ratesView });
      open.add("rates");
    } else {
      open.delete("rates");
    }
    PHASES.forEach((p) => list.push({ id: p.id, t: p.name, m: p.id === "pre" ? preMeta() : p.id === "prod" ? "Drums TBA · then guitars & vocals" : "Mix · Atmos · Master", b: () => phase(p) }));
    list.push({ id: "team", t: "Team", m: `${MEMBERS.length} members`, b: teamView });
    list.push({ id: "art", t: "Artwork / brand", m: "Stage banner · filigree · silhouette", b: ART });
    return list;
  };

  /* ---------- Lyric cards: lazy faded backgrounds + modal ---------- */
  let bgObs = null;
  function lazyBgs() {
    const els = $$(".card-bg[data-bg]");
    const load = (el) => { const u = el.dataset.bg; el.removeAttribute("data-bg"); const im = new Image(); im.onload = () => { el.style.backgroundImage = `url(${u})`; el.classList.add("in"); }; im.src = u; };
    if (!("IntersectionObserver" in window)) { els.forEach(load); return; }
    if (bgObs) bgObs.disconnect();
    bgObs = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { bgObs.unobserve(en.target); load(en.target); } }), { rootMargin: "300px 0px" });
    els.forEach((el) => bgObs.observe(el));
  }
  let lcDlg = null, lcReturn = null;
  function lyricModal() {
    if (lcDlg) return lcDlg;
    lcDlg = document.createElement("dialog");
    lcDlg.className = "lc-modal";
    lcDlg.setAttribute("aria-label", "Lyric card");
    lcDlg.innerHTML = `<button type="button" class="lc-x" aria-label="Close lyrics">✕</button><div class="lc-wrap"></div>`;
    document.body.append(lcDlg);
    lcDlg.addEventListener("click", (e) => {
      if (e.target.closest(".lc-x") || !e.target.closest(".lc")) lcDlg.close();
    });
    lcDlg.addEventListener("close", () => {
      document.body.classList.remove("lc-lock");
      lcDlg.querySelector(".lc-wrap").innerHTML = "";
      if (lcReturn) { lcReturn.focus({ preventScroll: true }); lcReturn = null; }
    });
    return lcDlg;
  }
  function openLyric(id, from) {
    const d = lyricModal();
    const s = byId(id);
    d.setAttribute("aria-label", (s ? s.title : "Song") + " lyric card");
    d.querySelector(".lc-wrap").innerHTML = window.lyricCardHTML(id, "assets/lyrics/");
    lcReturn = from || null;
    document.body.classList.add("lc-lock");
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    d.scrollTop = 0;
    d.querySelector(".lc-x").focus({ preventScroll: true });
  }

  function paintBreakouts() {
    const secs = SECS();
    const B = $("#breakouts"), T = $("#tiles");
    const num = (i) => String(i + 1).padStart(2, "0");
    B.innerHTML = secs.map((x, i) => `<div class="acc" id="sec-${x.id}"><button class="acc-h" type="button" aria-expanded="false" aria-controls="body-${x.id}" id="h-${x.id}" data-sec="${x.id}"><span class="no">${num(i)}</span><span class="tt">${x.t}</span><span class="ss">${x.m}</span><span class="pm" aria-hidden="true">+</span></button><div class="acc-b" id="body-${x.id}" role="region" aria-labelledby="h-${x.id}" hidden>${x.b()}</div></div>`).join("");
    T.innerHTML = secs.map((x, i) => `<button class="tile" type="button" data-sec="${x.id}" aria-expanded="false" aria-controls="body-${x.id}"><span class="n">${num(i)}</span><span class="t">${x.t}</span><span class="m">${x.m}</span></button>`).join("");
    bindDynamic();
    sync();
    syncAudioUI();
    lazyBgs();
  }

  function sync() {
    SECS().forEach((x) => {
      const o = open.has(x.id);
      const body = document.getElementById("body-" + x.id);
      if (body) body.hidden = !o;
      $$(`[data-sec="${x.id}"]`).forEach((b) => b.setAttribute("aria-expanded", o));
    });
  }
  function toggle(id, force) {
    (force ?? !open.has(id)) ? open.add(id) : open.delete(id);
    sync();
  }
  function setPh(v) {
    phFilter = v;
    $$("[data-ph]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.ph === v));
    $$("#tbl [data-c]").forEach((c) => { c.style.display = (v === "all" || c.dataset.c === v) ? "" : "none"; });
    const note = $("#scrollnote");
    if (note) note.hidden = v !== "all";
    const tbl = $("#tbl");
    if (tbl) tbl.style.minWidth = v === "all" ? "1680px" : "0";
  }
  function filterSongs() {
    const qEl = $("#q");
    if (!qEl) return;
    const q = qEl.value.trim().toLowerCase();
    let n = 0;
    $$("#tbl tbody tr").forEach((r) => { const h = q && !r.dataset.song.includes(q); r.classList.toggle("hide", h); if (!h) n++; });
    $$(".card").forEach((c) => c.classList.toggle("hide", !!q && !c.dataset.song.includes(q)));
    const cnt = $("#cnt");
    if (cnt) cnt.textContent = q ? `${n} of ${SONGS.length} songs` : "";
  }

  function bindDynamic() {
    const q = $("#q");
    if (q) q.addEventListener("input", filterSongs);
  }

  document.addEventListener("click", (e) => {
    const mp = e.target.closest("[data-mp]");
    if (mp) { toggleSong(mp.dataset.mp); return; }
    const ms = e.target.closest("[data-mpseek]");
    if (ms) {
      const r = ms.getBoundingClientRect();
      const f = (e.clientX - r.left) / r.width;
      if (ms.dataset.mpseek !== curId) {
        playSong(ms.dataset.mpseek);
        audio.addEventListener("loadedmetadata", () => seekFrac(f), { once: true });
      } else seekFrac(f);
      return;
    }
    const plb = e.target.closest("[data-pl]");
    if (plb) {
      const a = plb.dataset.pl;
      if (a === "prev") step(-1);
      else if (a === "next") step(1);
      else if (!curId) step(0);
      else audio.paused ? playSong(curId) : audio.pause();
      return;
    }
    const lyb = e.target.closest("[data-lyric]");
    if (lyb) { openLyric(lyb.dataset.lyric, lyb); return; }
    const plr = e.target.closest("[data-plrow]");
    if (plr) { toggleSong(plr.dataset.plrow); return; }
    const s = e.target.closest("[data-sec]");
    if (s) {
      const id = s.dataset.sec;
      toggle(id);
      if (s.classList.contains("tile") && open.has(id)) document.getElementById("sec-" + id).scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const g = e.target.closest("[data-goto]");
    if (g) {
      toggle("songs", true);
      const c = document.getElementById("song-" + g.dataset.goto);
      if (c) {
        if (!c.querySelector("[data-lyric]")) c.querySelectorAll("details").forEach((d, i) => { if (i === 0) d.open = true; });
        c.scrollIntoView({ behavior: "smooth", block: "center" });
        const sm = c.querySelector("[data-lyric]") || c.querySelector("summary");
        if (sm) sm.focus();
      }
      return;
    }
    const sortBtn = e.target.closest("[data-sort]");
    if (sortBtn) {
      const key = sortBtn.dataset.sort;
      if (sortBy.key === key) sortBy.dir = sortBy.dir === "asc" ? "desc" : "asc";
      else { sortBy.key = key; sortBy.dir = key === "n" ? "asc" : "desc"; }
      const tb = $("#tbl tbody");
      if (tb) tb.innerHTML = tableRows();
      const headRow = $("#tbl thead tr:last-child");
      if (headRow) {
        const rebuilt = document.createElement("tr");
        rebuilt.innerHTML = `${sortHeader("n", "Song", "song")}${PHASES.map((p) => p.stages.map((s, i) =>
          sortHeader("stage:" + s, s, (i ? "" : "grp ") + (VOX.has(s) ? "dim" : ""), `data-c="${p.id}"`, "")
        ).join("")).join("")}`;
        headRow.replaceWith(rebuilt);
      }
      setPh(phFilter);
      filterSongs();
      return;
    }
    const p = e.target.closest("[data-ph]");
    if (p) { setPh(p.dataset.ph); return; }
    if (e.target.id === "csv") {
      const rows = [["Song", ...PHASES.flatMap((ph) => ph.stages.map((stName) => ph.name + ": " + stName))]];
      SONGS.forEach((sng) => {
        rows.push([sng.title, ...PHASES.flatMap((ph) => ph.stages.map((x) => LBL[st(x, sng)]))]);
      });
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = "PerilSuite_EP2_status.csv";
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.id !== "pl-range") return;
    const f = e.target.value / 1000;
    e.target.style.setProperty("--p", (f * 100).toFixed(2) + "%");
    seekFrac(f);
  });

  document.addEventListener("submit", async (e) => {
    const unlock = e.target.closest("form[data-rates-unlock]");
    if (unlock) {
      e.preventDefault();
      const typed = (unlock.querySelector("#rates-pass") || {}).value || "";
      const err = unlock.querySelector("[data-rates-err]");
      try {
        await window.PSRates.unlock(user, typed.trim().toLowerCase());
        sessionPass = typed.trim().toLowerCase();
        if (err) err.textContent = "";
        refresh();
      } catch (ex) {
        if (err) err.textContent = "Could not unlock Rates & budget. Check the password and try again.";
      }
      return;
    }
  });

  function updateHeroCounts() {
    const n = SONGS.length;
    const prePhase = PHASES.find((p) => p.id === "pre");
    const preDone = prePhase ? SONGS.reduce((acc, s) => acc + prePhase.stages.filter((x) => st(x, s) === "done").length, 0) : 0;
    const preTotal = prePhase ? prePhase.stages.length * n : 0;
    const elPre = $("#pre-count");
    const elBanner = $("#status-banner");
    if (elPre) elPre.textContent = preDone + "/" + preTotal;
    if (elBanner) elBanner.innerHTML = `PERIL SUITE · EP 2 · <b>PRE-PRO ${preDone}/${preTotal} CONFIRMED</b> · STATUSES AS PUBLISHED`;
  }

  function snapshotUI() {
    const openDetails = $$("details[open]").map((d) => {
      const card = d.closest("[id]");
      const sum = d.querySelector("summary");
      return { card: card && card.id, summary: sum && sum.textContent };
    });
    const q = ($("#q") || {}).value || "";
    return { openDetails, q, ph: phFilter, sortKey: sortBy.key, sortDir: sortBy.dir };
  }

  function restoreUI(snap) {
    if (snap.sortKey) sortBy = { key: snap.sortKey, dir: snap.sortDir || "asc" };
    setPh(snap.ph);
    if (snap.q) {
      const q = $("#q");
      if (q) { q.value = snap.q; filterSongs(); }
    }
    snap.openDetails.forEach(({ card, summary }) => {
      if (!card) return;
      const el = document.getElementById(card);
      if (!el) return;
      el.querySelectorAll("details").forEach((d) => {
        const sum = d.querySelector("summary");
        if (sum && sum.textContent === summary) d.open = true;
      });
    });
  }

  function refresh() {
    const snap = snapshotUI();
    updateHeroCounts();
    paintBreakouts();
    restoreUI(snap);
  }

  if ($("#song-count")) $("#song-count").textContent = String(SONGS.length);
  startCountdown();
  updateHeroCounts();
  paintBreakouts();
  setPh("pre");
  gate();
})();
