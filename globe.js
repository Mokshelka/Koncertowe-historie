// =====================================================
//  GLOBUS – obracająca się kula z pinezkami miast
// =====================================================
// Wymaga: d3 i topojson-client (ładowane w index.html).
// Miasta bierze z dane.js, kolory z motywu (zmienne CSS).
// Udostępnia: Koncertownik.globus.start() i .lecDo('Kraków')

Koncertownik.globus = { start() {
  const canvas = document.getElementById('globe');
  if (!canvas || !window.d3 || !window.topojson) return;

  const cities = Koncertownik.dane.miasta;

  // --- Kolory z motywu ---
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = {
    oceanInner: css('--globus-ocean') || '#2a0f4f',
    oceanOuter: '#0d0620',
    land:       css('--globus-lad') || '#6d28d9',
    border:     'rgba(233, 213, 255, 0.55)',
    graticule:  'rgba(216, 180, 254, 0.12)',
    rim:        css('--akcent-jasny') || '#c084fc',
    pin:        css('--akcent2') || '#f0abfc',
    pinCore:    '#ffffff'
  };

  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('globeTooltip');
  const projection = d3.geoOrthographic().clipAngle(90);
  const path = d3.geoPath(projection, ctx);
  const graticule = d3.geoGraticule10();
  const sphere = { type: 'Sphere' };

  // --- Stan animacji ---
  let land = null, borders = null;
  let size = 0, dpr = 1;
  let rotation = [-15, -35, 0];        // startowo widać Europę
  const tilt = -35;
  const speed = 0.012;                 // stopnie na milisekundę
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = false, dragging = false, resumeTimer = null, flyTo = null;
  let last = performance.now();
  let hovered = null;
  let zoom = 1, targetZoom = 1;

  function resize() {
    size = Math.round(canvas.getBoundingClientRect().width);
    dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    projection.translate([size / 2, size / 2]);
    draw();
  }

  function isVisible(coords) {
    const center = projection.invert([size / 2, size / 2]);
    return d3.geoDistance(coords, center) < Math.PI / 2 - 0.05;
  }

  // --- Rysowanie ---
  function draw() {
    if (!size) return;
    projection.rotate(rotation).scale((size / 2 - 4) * zoom);
    const r = projection.scale();
    const cx = size / 2, cy = size / 2;
    ctx.clearRect(0, 0, size, size);

    // Ocean z gradientem (efekt 3D)
    const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
    g.addColorStop(0, C.oceanInner);
    g.addColorStop(1, C.oceanOuter);
    ctx.beginPath(); path(sphere); ctx.fillStyle = g; ctx.fill();

    ctx.beginPath(); path(graticule);
    ctx.strokeStyle = C.graticule; ctx.lineWidth = 0.6; ctx.stroke();

    if (land) {
      ctx.beginPath(); path(land); ctx.fillStyle = C.land; ctx.fill();
      ctx.beginPath(); path(borders);
      ctx.strokeStyle = C.border; ctx.lineWidth = 0.5; ctx.stroke();
    }

    // Cień
    const s = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.6, cx, cy, r * 1.05);
    s.addColorStop(0, 'rgba(0,0,0,0)');
    s.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.beginPath(); path(sphere); ctx.fillStyle = s; ctx.fill();

    // Obwódka
    ctx.beginPath(); path(sphere);
    ctx.strokeStyle = C.rim; ctx.lineWidth = 2; ctx.stroke();

    cities.forEach(drawPin);
  }

  function drawPin(c, i) {
    if (!isVisible(c.wsp)) return;
    const [x, y] = projection(c.wsp);
    const active = hovered === c;
    const pulse = reduceMotion ? 0 : (Math.sin(performance.now() / 400 + i) + 1) / 2;

    // Pulsująca poświata
    ctx.beginPath();
    ctx.arc(x, y, 4 + pulse * 5, 0, 2 * Math.PI);
    ctx.globalAlpha = 0.35 - pulse * 0.25;
    ctx.fillStyle = C.pin; ctx.fill();
    ctx.globalAlpha = 1;

    // Szpilka – czubek dokładnie w punkcie miasta
    const h = active ? 14 : 11, w = active ? 5 : 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - w * 0.4, y - h * 0.45, x - w, y - h * 0.6, x - w, y - h * 0.8);
    ctx.arc(x, y - h * 0.8, w, Math.PI, 0);
    ctx.bezierCurveTo(x + w, y - h * 0.6, x + w * 0.4, y - h * 0.45, x, y);
    ctx.fillStyle = C.pin;
    ctx.shadowColor = C.pin; ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y - h * 0.8, w * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = C.pinCore; ctx.fill();
  }

  // --- Animacja ---
  function frame(now) {
    const dt = Math.min(now - last, 50);
    last = now;
    if (flyTo) {
      const k = Math.min((now - flyTo.start) / flyTo.duration, 1);
      rotation = flyTo.interp(d3.easeCubicInOut(k));
      if (k === 1) flyTo = null;
    }
    zoom += (targetZoom - zoom) * Math.min(dt / 250, 1);
    if (!flyTo && !paused && !dragging && !reduceMotion) {
      const lat = rotation[1] + (tilt - rotation[1]) * Math.min(dt / 600, 1);
      rotation = [rotation[0] + speed * dt, lat, 0];
    }
    draw();
    requestAnimationFrame(frame);
  }

  function pauseFor(ms) {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { paused = false; targetZoom = 1; }, ms);
  }

  // --- Obracanie przeciągnięciem (mysz i palec) ---
  let start = null;
  canvas.addEventListener('pointerdown', e => {
    dragging = true; flyTo = null;
    start = { x: e.clientX, y: e.clientY, rot: rotation.slice() };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (dragging && start) {
      const k = 180 / size / zoom;
      rotation = [
        start.rot[0] + (e.clientX - start.x) * k,
        Math.max(-80, Math.min(80, start.rot[1] - (e.clientY - start.y) * k)),
        0
      ];
    }
    updateHover(e);
  });
  const endDrag = () => { if (dragging) { dragging = false; pauseFor(2500); } };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => { hovered = null; hideTooltip(); });

  // --- Podpis miasta ---
  function updateHover(e) {
    const box = canvas.getBoundingClientRect();
    const mx = e.clientX - box.left, my = e.clientY - box.top;
    let best = null, bestD = 14;
    cities.forEach(c => {
      if (!isVisible(c.wsp)) return;
      const [x, y] = projection(c.wsp);
      const d = Math.hypot(mx - x, my - (y - 8));
      if (d < bestD) { bestD = d; best = c; }
    });
    hovered = best;
    if (best) {
      const [x, y] = projection(best.wsp);
      showTooltip(best.nazwa, x, y - 18);
    } else hideTooltip();
  }
  function showTooltip(text, x, y) {
    if (!tooltip) return;
    tooltip.textContent = text;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.classList.add('visible');
  }
  function hideTooltip() { if (tooltip) tooltip.classList.remove('visible'); }

  // --- Lot do miasta (wywoływany np. z plakietek) ---
  function lecDo(nazwa) {
    const c = cities.find(x => x.nazwa === nazwa);
    if (!c) return;
    const from = rotation.slice();
    const target = [-c.wsp[0], -c.wsp[1] + 8, 0];
    target[0] = from[0] + (((target[0] - from[0]) % 360 + 540) % 360 - 180); // najkrótsza droga
    flyTo = { start: performance.now(), duration: 1200, interp: d3.interpolate(from, target) };
    hovered = c;
    targetZoom = 3.2;
    pauseFor(6000);
    setTimeout(() => {
      const [x, y] = projection(c.wsp);
      showTooltip(c.nazwa, x, y - 18);
      setTimeout(() => { if (hovered === c) { hovered = null; hideTooltip(); } }, 2500);
    }, 1250);
  }
  Koncertownik.globus.lecDo = lecDo;

  // --- Mapa świata (granice krajów) ---
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
    .then(r => r.json())
    .then(world => {
      land = topojson.feature(world, world.objects.land);
      borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
    })
    .catch(() => { /* bez mapy globus nadal się kręci */ });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
} };
