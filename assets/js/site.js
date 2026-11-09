/* GamaLabs · un solo motor: scroll nativo + un rAF bajo demanda que lee geometría */
(() => {
const d = document, root = d.documentElement;
const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINO = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const ease = t => 1 - Math.pow(1 - t, 3);
const seg = (p, a, b) => clamp((p - a) / (b - a));
const video = $('.hero-video');

/* reveals tipográficos */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .2 });
$$('.lines,.rv').forEach(el => io.observe(el));

/* formulario honesto: compone un correo, no guarda nada */
const form = $('.form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form);
  const body = 'Nombre: ' + f.get('nombre') + '\nCorreo: ' + f.get('correo') + '\n\n' + f.get('idea');
  location.href = 'mailto:hola@gamalabs.ai?subject=' + encodeURIComponent('Propuesta sin costo - ' + f.get('nombre')) + '&body=' + encodeURIComponent(body);
});

/* hoja de precios: botón alterno para tacto y teclado */
const marco = $('.hoja-marco'), verBtn = $('.precio .btn');
const abrir = v => { marco.classList.toggle('abierta', v); verBtn.setAttribute('aria-pressed', v); verBtn.textContent = v ? 'Volver a la linterna' : 'Ver precios completos'; };
verBtn.addEventListener('click', () => abrir(!marco.classList.contains('abierta')));
marco.addEventListener('click', () => { if (!FINO) abrir(true); });

if (RM) { video.removeAttribute('autoplay'); video.pause(); abrir(true); verBtn.hidden = true; $('.precio .lead').textContent = 'Aquí cada división publica su precio.'; return; }
root.classList.add('mo');
/* escenas ancladas: el anclaje solo existe cuando hay motion */
$$('.scene:not(.cierre)>.stage').forEach(st => { st.style.cssText += ';position: sticky;top:0'; });

const hero = $('#nucleo'), hStage = $('.stage', hero), hMedia = $('.hero-media'), hCopy = $('.hero-copy'), vidrio = $('.vidrio'), bruma = $('.bruma');
const chat = $('#mensaje'), phone = $('.phone'), burb = $$('.burbujas li'), est = $$('.estaciones li'), capas = $$('.taller [data-depth]');
const red = $('#destinos'), svg = $('.red-svg svg'), rods = $$('.rod'), nucleo = $('.nucleo'), estados = $$('.estado');
const grads = rods.map((rod, i) => {
  if (i === 0) return $('#h0');
  const g = $('#h0').cloneNode(true), c = rod.style.getPropertyValue('--c');
  g.id = 'h' + i; g.children[3].setAttribute('stop-color', c); g.children[4].setAttribute('stop-color', c);
  $('#h0').parentNode.appendChild(g); return g;
});
const cortina = $('.cortina'), cierre = $('#contacto'), cSvg = $('.cierre-svg');
const viajero = $('.viajero'), barI = $('.bar i'), rail = $('.rail'), railLi = $$('.rail li'), caps = $$('[data-cap]');
const NODOS = [[0, -220], [190.5, -110], [190.5, 110], [0, 220], [-190.5, 110], [-190.5, -110]];
const PARES = [[0, 5], [2, 1], [3, 4]]; // encontrarte · responderte · operación
let W, H, geo = {}, mx = .5, my = .5, tope = 0;

function measure() {
  W = innerWidth; H = hStage.offsetHeight;
  const L = phone.offsetLeft, T = phone.offsetTop, w = phone.offsetWidth, h = phone.offsetHeight;
  const s = Math.max(W / 1920, H / 1080), dw = 1920 * s, dh = 1080 * s, ox = W < 900 ? .62 : .5;
  const coreX = (W - dw) * ox + .66 * dw, coreY = (H - dh) * .5 + .45 * dh;
  const dx = L + w / 2 - coreX, dy = T + h / 2 - coreY;
  geo = { L, T, w, h, dx, dy };
  const ol = burb[0].parentNode; tope = ol.offsetTop + ol.clientHeight - 14;
  burb.forEach(b => { b._t = b.offsetTop; b._h = b.offsetHeight; });
  const ps = phone.style;
  ps.setProperty('--bx', ((W - dw) * ox + dx - L) + 'px'); ps.setProperty('--by', ((H - dh) * .5 + dy - T) + 'px');
  ps.setProperty('--bw', dw + 'px'); ps.setProperty('--bh', dh + 'px');
}
const near = r => r.bottom > -H && r.top < H * 2;
/* parallax por capas: cada capa se mueve segun su data-depth */
const parallax = (el, x, y) => { const k = +el.dataset.depth; el.style.transform = 'translate3d(' + x * k + 'px,' + y * k + 'px,0)'; };

/* progreso de una escena anclada: -rect.top / (alto - viewport) */
function prog(el) { const r = el.getBoundingClientRect(); return [clamp(-r.top / (el.offsetHeight - H)), r]; }

/* 2 · protagonista: seis destinos */
function fRed() {
  const r = red.getBoundingClientRect(); if (!near(r)) return;
  const p = clamp(-r.top / (red.offsetHeight - H)), k = seg(p, .06, .8);
  svg.style.transform = 'rotateY(' + (-16 + 32 * k).toFixed(2) + 'deg) rotateX(' + (8 - 10 * k).toFixed(2) + 'deg)';
  const q = k * 3, s = p < .06 ? -1 : Math.min(2, Math.floor(q)), u = q - Math.max(s, 0);
  rods.forEach((rod, i) => {
    const e = PARES.findIndex(par => par.includes(i));
    let t = e < s || p >= .8 ? 1 : e === s ? seg(u, 0, .55) : 0;
    haz(i, t);
    rod.classList.toggle('on', e === s && t > .72 && p < .8);
    rod.classList.toggle('ya', (e < s && p < .8) || p >= .8);
  });
  estados.forEach((el, i) => el.classList.toggle('on', i === s && p < .84));
  red.style.setProperty('--ho', 1 - seg(p, .8, .86));
  svg.style.setProperty('--hl', .5 + .5 * seg(p, .74, .82)); svg.style.setProperty('--hs', 1 + .6 * seg(p, .74, .84));
  const z = seg(p, .84, 1), c = z * z * (3 - 2 * z), n = nucleo.getBoundingClientRect(), st = red.querySelector('.stage');
  const cx = n.left + n.width / 2, cy = n.top + n.height / 2;
  st.style.setProperty('--cx', cx + 'px'); st.style.setProperty('--cy', cy + 'px');
  st.style.setProperty('--r', (c * Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.02).toFixed(1) + 'px');
  rail.classList.toggle('claro', c > .6);
}
/* haz de luz por cada rayo: ventana de un linearGradient userSpaceOnUse */
function haz(i, t) {
  const g = grads[i], [x, y] = NODOS[i], head = t * 1.4, tail = head - .45;
  g.setAttribute('x1', x * tail); g.setAttribute('y1', y * tail); g.setAttribute('x2', x * head); g.setAttribute('y2', y * head);
  rods[i].style.setProperty('--b', t <= 0 || t >= 1 ? 0 : 1);
}

/* 0 · hero: el texto se va y el video se recorta al marco del teléfono */
function fHero() {
  const [p, r] = prog(hero); if (!near(r)) return;
  const e = ease(p), { L, T, w, h, dx, dy } = geo;
  parallax(hCopy, 0, -e * 240);
  hCopy.style.opacity = vidrio.style.opacity = 1 - seg(p, 0, .45);
  parallax(bruma, (mx - .5) * -40, -e * 240);
  hMedia.style.clipPath = 'inset(' + T * e + 'px ' + (W - L - w) * e + 'px ' + (H - T - h) * e + 'px ' + L * e + 'px round ' + 34 * e + 'px)';
  video.style.transform = 'translate3d(' + dx * e + 'px,' + dy * e + 'px,0)';
}

/* motor de estaciones (train-doors): cerrado .15 · abre .30 · pausa .40 · cierra .15 */
function scrubStation(t, ultima) {
  if (t < .15) return 0;
  if (t < .45) return ease((t - .15) / .3);
  if (t < .85 || ultima) return 1;
  return 1 - ease((t - .85) / .15);
}

/* 1 · un mensaje: tres estaciones ancladas */
function fChat() {
  const [p, r] = prog(chat); if (!near(r)) return;
  const pin = r.top <= 0;
  chat.classList.toggle('pin', pin); hero.classList.toggle('fuera', pin && r.bottom > 0);
  const i0 = ease(seg(p, 0, .1));
  chat.style.setProperty('--pp', 1 - i0); chat.style.setProperty('--ui', i0); chat.style.setProperty('--t', i0);
  capas.forEach(el => parallax(el, (mx - .5) * -90, (p - .5) * -260));
  const fin = ease(seg(p, .88, 1)), vis = new Map();
  let fondo = 0;
  est.forEach((el, s) => {
    const t = seg(p, .1 + s * .26, .36 + s * .26), door = scrubStation(t, s === 2);
    el.style.opacity = door;
    el.style.transform = 'translateX(' + ((1 - door) * (t < .5 ? 60 : -60)) + 'px)';
    const grupo = burb.filter(b => +b.dataset.st === s);
    grupo.forEach((b, j) => {
      const v = ease(seg(t, .15 + j * .3 / grupo.length, .15 + (j + 1) * .3 / grupo.length));
      vis.set(b, v); if (v > 0) fondo = Math.max(fondo, b._t + b._h * v);
    });
  });
  /* como un chat real: si ya no caben, las burbujas viejas suben */
  const sube = Math.max(0, fondo - tope);
  burb.forEach(b => {
    const v = vis.get(b), out = b.classList.contains('out'), last = b.classList.contains('ultima');
    b.style.opacity = last ? v * (1 - fin) : v;
    b.style.transform = 'translate(' + ((1 - v) * (out ? 30 : -30)) + 'px,' + -sube + 'px) scale(' + (last ? 1 - .85 * fin : .96 + .04 * v) + ')';
  });
  return fin;
}

/* match por posición: la última burbuja se vuelve pulso y entra al núcleo */
function fViajero(fin) {
  const rr = red.getBoundingClientRect(), vs = viajero.style;
  const abajo = [W / 2, H * .94];
  let x, y, o = 0;
  if (rr.top > 0 && rr.top < H) {
    const n = nucleo.getBoundingClientRect(), g = ease(1 - rr.top / H);
    x = abajo[0] + (n.left + n.width / 2 - abajo[0]) * g; y = abajo[1] + (n.top + n.height / 2 - abajo[1]) * g; o = 1;
  } else if (rr.top >= H && fin > 0) {
    const b = burb[burb.length - 1].getBoundingClientRect();
    x = b.left + b.width / 2 + (abajo[0] - b.left - b.width / 2) * fin; y = b.top + b.height / 2 + (abajo[1] - b.top - b.height / 2) * fin; o = fin;
  } else if (rr.top <= 0) {
    const p = -rr.top / (red.offsetHeight - H), n = nucleo.getBoundingClientRect();
    x = n.left + n.width / 2; y = n.top + n.height / 2; o = 1 - seg(p, 0, .05);
  }
  vs.opacity = o;
  if (o > 0) vs.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
}

function fOtros() {
  /* la cortina sube desde que asoma, no desde que se ancla: sin pantalla vacia */
  let r = cortina.getBoundingClientRect(); if (near(r)) cortina.style.setProperty('--k', ease(clamp((H - r.top) / cortina.offsetHeight)));
  r = cierre.getBoundingClientRect();
  if (near(r)) cSvg.style.setProperty('--k', (1 - .86 * ease(clamp((H - r.top) / (H * .9)))).toFixed(3));
  const max = root.scrollHeight - innerHeight;
  barI.parentNode.style.setProperty('--p', max > 0 ? scrollY / max : 0);
  let act = 0;
  caps.forEach((c, i) => { if (c.getBoundingClientRect().top < innerHeight * .5) act = i; });
  railLi.forEach((li, i) => { li.classList.toggle('on', i === act); li.firstChild.toggleAttribute('aria-current', i === act); });
  if (act >= 3 && act <= 5) rail.classList.add('claro'); else if (act > 5 || act < 2) rail.classList.remove('claro');
  /* en tacto la linterna la mueve el scroll: barre la hoja de arriba abajo */
  r = marco.getBoundingClientRect();
  if (!FINO && near(r)) { stx = r.width / 2; sty = H * .5 - r.top; if (sx === null) { sx = stx; sy = sty; } }
}

/* video: solo corre si se ve */
let heroVis = true;
new IntersectionObserver(es => { heroVis = es[0].isIntersecting; syncVideo(); }).observe(hero);
function syncVideo() {
  const ok = heroVis && !hero.classList.contains('fuera') && !d.hidden;
  if (ok && video.paused) video.play().catch(() => {});
  else if (!ok && !video.paused) video.pause();
}
d.addEventListener('visibilitychange', syncVideo);
addEventListener('pagehide', () => video.pause());

/* cursor-señal con lerp, imán y linterna (solo puntero fino para el cursor) */
const senal = $('.senal');
const lerp = (a, b, k) => a + (b - a) * k;
let seguir = null, tx = -99, ty = -99, cx = -99, cy = -99, sx = null, sy = null, stx = 0, sty = -400;
if (FINO) {
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; mx = tx / W; my = ty / innerHeight; senal.classList.add('vivo'); kick(); }, { passive: true });
  /* el punto sigue al cursor con retraso (lerp); devuelve si aun no llega */
  seguir = () => {
    cx = lerp(cx < -90 ? tx : cx, tx, .18); cy = lerp(cy < -90 ? ty : cy, ty, .18);
    senal.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    return Math.abs(cx - tx) + Math.abs(cy - ty) > .4;
  };
  d.addEventListener('mouseover', e => senal.classList.toggle('sobre', !!e.target.closest('a,button,summary,input,textarea')));
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = 'translate3d(' + (e.clientX - r.left - r.width / 2) * .22 + 'px,' + (e.clientY - r.top - r.height / 2) * .32 + 'px,0)'; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}
marco.addEventListener('pointermove', e => { const r = marco.getBoundingClientRect(); stx = e.clientX - r.left; sty = e.clientY - r.top; if (sx === null) { sx = stx; sy = sty - 120; } kick(); });
marco.addEventListener('pointerleave', () => { sty = -400; kick(); });

let pend = false;
function kick() { if (!pend) { pend = true; requestAnimationFrame(frame); } }
function frame() {
  pend = false;
  fHero(); const fin = fChat() || 0; fRed(); fViajero(fin); fOtros(); syncVideo();
  let again = false;
  if (seguir && tx > -99) again = seguir();
  if (sx !== null) {
    sx = lerp(sx, stx, .1); sy = lerp(sy, sty, .1);
    marco.style.setProperty('--mx', sx.toFixed(1) + 'px'); marco.style.setProperty('--my', sy.toFixed(1) + 'px');
    if (Math.abs(sx - stx) + Math.abs(sy - sty) > .4) again = true;
  }
  if (again) kick();
}
addEventListener('scroll', kick, { passive: true });
addEventListener('resize', () => { measure(); kick(); });
measure(); kick();
})();
