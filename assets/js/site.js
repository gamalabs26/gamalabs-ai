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
const cNodos = $$('.c-n, .c-t');
form.addEventListener('change', e => {
  if (e.target.name !== 'linea') return;
  const i = [...form.elements.linea].indexOf(e.target) - 1;
  cNodos.forEach((n, k) => n.classList.toggle('apagado', i >= 0 && k % 5 !== i));
});
form.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form);
  const body = 'Nombre: ' + f.get('nombre') + '\nCorreo: ' + f.get('correo') + '\nLínea: ' + f.get('linea') + '\n\n' + f.get('idea');
  location.href = 'mailto:hola@gamalabs.ai?subject=' + encodeURIComponent('Propuesta sin costo - ' + f.get('nombre')) + '&body=' + encodeURIComponent(body);
});

/* hoja de precios: botón alterno para tacto y teclado */
const marco = $('.hoja-marco'), verBtn = $('.precio .btn');
const abrir = v => { marco.classList.toggle('abierta', v); verBtn.setAttribute('aria-pressed', v); verBtn.textContent = v ? 'Volver a la linterna' : 'Ver precios completos'; };
verBtn.addEventListener('click', () => abrir(!marco.classList.contains('abierta')));
marco.addEventListener('click', () => { if (!FINO) abrir(true); });

if (RM) { video.removeAttribute('autoplay'); video.pause(); abrir(true); verBtn.hidden = true; $('.precio .lead').textContent = 'Aquí cada línea publica su precio.'; return; }
root.classList.add('mo');
/* escenas ancladas: el anclaje solo existe cuando hay motion */
$$('.scene:not(.cierre)>.stage').forEach(st => { st.style.cssText += ';position: sticky;top:0'; });

const hero = $('#casa'), hStage = $('.stage', hero), hMedia = $('.hero-media'), hCopy = $('.hero-copy'), vidrio = $('.vidrio'), bruma = $('.bruma');
const lin = $('#lineas'), lStage = $('.stage', lin), svgBox = $('.red-svg'), svg = $('svg', svgBox), rods = $$('.rod'), nucleo = $('.nucleo');
const paneles = $$('.linea'), puertas = $$('.puertas a');
const COL = rods.map(r => r.style.getPropertyValue('--c'));
const grads = rods.map((rod, i) => {
  if (i === 0) return $('#h0');
  const g = $('#h0').cloneNode(true);
  g.id = 'h' + i; g.children[3].setAttribute('stop-color', COL[i]); g.children[4].setAttribute('stop-color', COL[i]);
  $('#h0').parentNode.appendChild(g); return g;
});
const NODOS = [[0, -210], [199.7, -64.9], [123.4, 169.9], [-123.4, 169.9], [-199.7, -64.9]];
const I0 = .06, SL = .15, FIN = I0 + 5 * SL; // intro · cinco líneas, una a la vez · la casa completa
const studio = $('#studio'), carril = $('.carril');
const chat = $('#agents'), phone = $('.phone'), burb = $$('.burbujas li'), est = $$('.estaciones li'), capas = $$('.taller [data-depth]');
const cortina = $('.cortina'), cierre = $('#contacto'), cSvg = $('.cierre-svg');
const barI = $('.bar i'), rail = $('.rail'), railLi = $$('.rail li'), caps = $$('[data-cap]');
let W, H, geo = {}, mx = .5, tope = 0, dist = 0;

function measure() {
  W = innerWidth; H = hStage.offsetHeight;
  /* el núcleo luminoso del video vive al 66% x 45% del cuadro 1920x1080 */
  const s = Math.max(W / 1920, H / 1080), dw = 1920 * s, dh = 1080 * s, ox = W < 900 ? .62 : .5;
  const coreX = (W - dw) * ox + .66 * dw, coreY = (H - dh) * .5 + .45 * dh;
  const bw = svgBox.offsetWidth, nx = svgBox.offsetLeft + bw / 2, ny = svgBox.offsetTop + svgBox.offsetHeight / 2;
  geo = { coreX, coreY, dx: nx - coreX, dy: ny - coreY, R0: Math.hypot(Math.max(coreX, W - coreX), Math.max(coreY, H - coreY)), rN: bw * 34 / 600 };
  const ol = burb[0].parentNode; tope = ol.offsetTop + ol.clientHeight - 14;
  burb.forEach(b => { b._t = b.offsetTop; b._h = b.offsetHeight; });
  dist = Math.max(0, carril.offsetWidth - W);
}
const near = r => r.bottom > -H && r.top < H * 2;
/* parallax por capas: cada capa se mueve segun su data-depth */
const parallax = (el, x, y) => { const k = +el.dataset.depth; el.style.transform = 'translate3d(' + x * k + 'px,' + y * k + 'px,0)'; };

/* progreso de una escena anclada: -rect.top / (alto - viewport) */
function prog(el) { const r = el.getBoundingClientRect(); return [clamp(-r.top / (el.offsetHeight - H)), r]; }

/* 0 · la casa: el video se condensa en un círculo que aterriza en el núcleo de las líneas */
function fHero() {
  const [p, r] = prog(hero); if (!near(r)) return;
  const e = ease(p), g = geo;
  parallax(hCopy, 0, -e * 240);
  hCopy.style.opacity = vidrio.style.opacity = 1 - seg(p, 0, .45);
  parallax(bruma, (mx - .5) * -40, -e * 240);
  const rad = g.R0 + (g.rN - g.R0) * e;
  hMedia.style.clipPath = 'circle(' + rad.toFixed(1) + 'px at ' + (g.coreX + g.dx * e).toFixed(1) + 'px ' + (g.coreY + g.dy * e).toFixed(1) + 'px)';
  video.style.transform = 'translate3d(' + g.dx * e + 'px,' + g.dy * e + 'px,0)';
}

/* 1 · protagonista: cinco líneas, una a la vez. El rayo anterior se apaga antes de que prenda el siguiente */
function fLineas() {
  const r = lin.getBoundingClientRect(); if (!near(r)) return;
  const pin = r.top <= 0;
  lin.classList.toggle('pin', pin); hero.classList.toggle('fuera', pin && r.bottom > 0);
  /* antes de anclar, el pentágono ya se asoma para recibir el círculo del video */
  const as = pin ? 1 : seg(1 - r.top / (hero.offsetHeight - H), .45, .95);
  lin.classList.toggle('asoma', !pin && as > 0); lin.style.setProperty('--as', as.toFixed(3));
  const p = clamp(-r.top / (lin.offsetHeight - H)), todo = p >= FIN;
  svg.style.transform = 'rotateY(' + (-12 + 24 * p).toFixed(2) + 'deg) rotateX(' + (6 - 8 * p).toFixed(2) + 'deg)';
  const s = p < I0 || todo ? -1 : Math.min(4, Math.floor((p - I0) / SL)), u = s < 0 ? 0 : (p - I0 - s * SL) / SL;
  rods.forEach((rod, i) => {
    haz(i, i === s ? seg(u, 0, .3) : 0);
    rod.classList.toggle('on', (i === s && u > .22 && u < .9) || todo);
  });
  paneles.forEach((el, i) => el.classList.toggle('on', i === s && u > .18 && u < .92));
  puertas.forEach((a, i) => a.classList.toggle('on', i === s));
  if (s >= 0) lStage.style.setProperty('--tc', COL[s]);
  lStage.style.setProperty('--to', s >= 0 && u < .9 ? 1 : 0);
  lin.style.setProperty('--ho', 1 - seg(p, .87, .91));
  svg.style.setProperty('--hl', .5 + .5 * seg(p, FIN - .02, FIN + .04)); svg.style.setProperty('--hs', 1 + .6 * seg(p, FIN - .02, FIN + .06));
  /* corte de luz: el papel nace en el núcleo */
  const z = seg(p, .87, 1), c = z * z * (3 - 2 * z), n = nucleo.getBoundingClientRect();
  const cx = n.left + n.width / 2, cy = n.top + n.height / 2;
  lStage.style.setProperty('--cx', cx + 'px'); lStage.style.setProperty('--cy', cy + 'px');
  lStage.style.setProperty('--r', (c * Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.02).toFixed(1) + 'px');
  rail.classList.toggle('claro', c > .6);
}
/* haz de luz por cada rayo: ventana de un linearGradient userSpaceOnUse */
function haz(i, t) {
  const g = grads[i], [x, y] = NODOS[i], head = t * 1.4, tail = head - .45;
  g.setAttribute('x1', x * tail); g.setAttribute('y1', y * tail); g.setAttribute('x2', x * head); g.setAttribute('y2', y * head);
  rods[i].style.setProperty('--b', t <= 0 || t >= 1 ? 0 : 1);
}
/* puertas: cada línea se puede abrir directo, sin pasar por las otras */
$$('[data-ir]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const top = lin.getBoundingClientRect().top + scrollY;
  scrollTo({ top: top + (lin.offsetHeight - H) * (I0 + SL * (+a.dataset.ir + .5)), behavior: 'smooth' });
}));

/* 3 · las páginas de GamaStudio: carril horizontal anclado */
function fStudio() {
  const [p, r] = prog(studio); if (!near(r)) return;
  carril.style.transform = 'translate3d(' + (-seg(p, .04, .96) * dist).toFixed(1) + 'px,0,0)';
}
/* con teclado, la tarjeta enfocada se trae al cuadro moviendo el scroll vertical */
carril.addEventListener('focusin', e => {
  const a = e.target.closest('.sitio'); if (!a || !dist) return;
  carril.parentNode.scrollLeft = 0;
  const q = clamp((a.offsetLeft - W * .2) / dist), top = studio.getBoundingClientRect().top + scrollY;
  scrollTo({ top: top + (studio.offsetHeight - H) * (.04 + .92 * q) });
});

/* motor de estaciones (train-doors): cerrado .15 · abre .30 · pausa .40 · cierra .15 */
function scrubStation(t, ultima) {
  if (t < .15) return 0;
  if (t < .45) return ease((t - .15) / .3);
  if (t < .85 || ultima) return 1;
  return 1 - ease((t - .85) / .15);
}

/* 6 · GamaAgents de cerca: entra por su cuenta y luego tres estaciones ancladas */
function fChat() {
  const [p, r] = prog(chat); if (!near(r)) return;
  const en = ease(clamp(1 - r.top / H));
  chat.style.setProperty('--ui', en); chat.style.setProperty('--t', en);
  phone.style.transform = 'translate3d(0,' + ((1 - en) * 70).toFixed(1) + 'px,0) scale(' + (.92 + .08 * en).toFixed(3) + ')';
  capas.forEach(el => parallax(el, (mx - .5) * -90, (p - .5) * -260));
  const vis = new Map();
  let fondo = 0;
  est.forEach((el, s) => {
    const t = seg(p, .06 + s * .28, .34 + s * .28), door = scrubStation(t, s === 2);
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
    const v = vis.get(b), out = b.classList.contains('out');
    b.style.opacity = v;
    b.style.transform = 'translate(' + ((1 - v) * (out ? 30 : -30)) + 'px,' + -sube + 'px) scale(' + (.96 + .04 * v) + ')';
  });
}

function fOtros() {
  /* la cortina sube desde que asoma, no desde que se ancla: sin pantalla vacia */
  let r = cortina.getBoundingClientRect(); if (near(r)) cortina.style.setProperty('--k', ease(clamp((H - r.top) / cortina.offsetHeight)));
  r = cierre.getBoundingClientRect();
  if (near(r)) cSvg.style.setProperty('--k', (1 + .3 * (1 - ease(clamp((H - r.top) / (H * .9))))).toFixed(3));
  const max = root.scrollHeight - innerHeight;
  barI.parentNode.style.setProperty('--p', max > 0 ? scrollY / max : 0);
  let act = 0;
  caps.forEach((c, i) => { if (c.getBoundingClientRect().top < innerHeight * .5) act = i; });
  railLi.forEach((li, i) => { li.classList.toggle('on', i === act); li.firstChild.toggleAttribute('aria-current', i === act); });
  if (act >= 2 && act <= 5) rail.classList.add('claro'); else if (act > 5 || act < 1) rail.classList.remove('claro');
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
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; mx = tx / W; senal.classList.add('vivo'); kick(); }, { passive: true });
  /* el punto sigue al cursor con retraso (lerp); devuelve si aun no llega */
  seguir = () => {
    cx = lerp(cx < -90 ? tx : cx, tx, .18); cy = lerp(cy < -90 ? ty : cy, ty, .18);
    senal.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    return Math.abs(cx - tx) + Math.abs(cy - ty) > .4;
  };
  d.addEventListener('mouseover', e => senal.classList.toggle('sobre', !!e.target.closest('a,button,summary,input,textarea,select')));
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
  fHero(); fLineas(); fStudio(); fChat(); fOtros(); syncVideo();
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
addEventListener('load', () => { measure(); kick(); });
measure(); kick();
})();
