// Полёт — the way from the field behind Пацюк's fence to the palace, laid out on the ground where
// it is; the camera flies along it (the script: camera_z from `progress`, camera_h, camera_x).
//
// World: metres; a — to the right of the line of flight, d — ahead of the start.
const { clamp, mix, span, hash } = anim;

// as scene.json has it: the horizon on screen
const HORIZON = 0.5;

// how far the flight goes: progress 1 is camera_z = ROUTE
const ROUTE = 6000;

// ── colour ──────────────────────────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lerp = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
const times = (a, k) => a.map((v) => v * k);
const css = (c, alpha = 1) => `rgba(${c.map((v) => Math.round(clamp(v) * 255)).join(',')},${alpha})`;

// the sky's colours: the night with the moon, the night without it, the dawn
const MOODS = {
  night: { zen: '#040b26', high: '#0d1f52', low: '#2d4680' },
  dark: { zen: '#010207', high: '#02040c', low: '#080d1b' },
  dawn: { zen: '#1a2a62', high: '#5d63a0', low: '#f2a68f' },
};
const MOON_DISC = hex('#f4f2ea');
const HALO = hex('#9db4ec');
const GLOW_DAWN = hex('#ff9d7c');
const WARM = hex('#ffb35c');

// what things are made of
const SNOW = hex('#eef2fa');
const LIME = hex('#d4cfc4');
const WOOD = hex('#3a2f28');
const SHINGLE = hex('#2c2726');
const NEEDLES = hex('#1d2a2a');
const HAY = hex('#9a8a70');
const WILLOW = hex('#7c776f');
const STUCCO = hex('#c9cdb8');
const STONE = hex('#8f8c88');
const ICE = hex('#7f93b8');
const GLASS = hex('#5f7398');

// The sky goes all round (the camera looks around): x 0…e.aspect is the full circle, ahead — the
// way to Петербург, north — in its middle, a screen height a radian.
// The moon: far — a crescent high ahead to the right; near (moon_near 1) — huge, beside the flyers.
// x — how far right of ahead, y — how high (screen heights), r — its radius.
// Its crescent is its disc less a disc offset toward MOON_TURN.
const MOON_FAR = { x: 0.3, y: 0.26, r: 0.075 };
const MOON_NEAR = { x: 0.5, y: 0.14, r: 0.27 };
const MOON_TURN = Math.atan2(-0.75, -0.66);
const HALO_FALL = [[0, 0.36], [0.1, 0.26], [0.2, 0.15], [0.36, 0.07], [0.6, 0.02], [1, 0]];
const GLOW_FALL = [[0, 1], [0.15, 0.6], [0.4, 0.22], [0.75, 0.05], [1, 0]];
const GLOW_AT = 140; // where the winter dawn comes up: south-east, degrees right of ahead (on the way home, ahead left)
// x of what is `dx` right of ahead on the sky going round; and painting there seamlessly: at x, and
// a circle round either way where it reaches past an end
const ahead = (e, dx) => e.aspect / 2 + dx;
function round(g, e, x, reach, paint) {
  for (const k of [-1, 0, 1]) {
    const at = x + k * e.aspect;
    if (at + reach > 0 && at - reach < e.aspect) paint(at);
  }
}
const ramp = (stops, u) => {
  if (u <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (u <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], span(u, stops[i - 1][0], stops[i][0]));
  }
  return stops[stops.length - 1][1];
};

// The light of the moment, from the state.
function env(s) {
  const moon = clamp(s.moon ?? 1);
  const dawn = clamp(s.dawn ?? 0);
  const near = clamp(s.moon_near ?? 0);
  const pick = (k) => lerp(lerp(hex(MOODS.dark[k]), hex(MOODS.night[k]), moon), hex(MOODS.dawn[k]), dawn);
  const E = { moon, dawn, near };
  for (const k of ['zen', 'high', 'low']) E[k] = pick(k);
  E.m = { x: mix(MOON_FAR.x, MOON_NEAR.x, near), y: mix(MOON_FAR.y, MOON_NEAR.y, near), r: mix(MOON_FAR.r, MOON_NEAR.r, near) };
  E.moonVis = moon * (1 - 0.7 * dawn);
  // the moon's glow is the night's: at dawn only the pale crescent stays
  E.haloK = moon * (1 - dawn) * (1 + 0.6 * near);
  E.glow = times(GLOW_DAWN, 0.8 * dawn);
  E.stars = clamp(s.stars ?? 1);
  E.win = 1 - 0.5 * dawn;
  return E;
}

// ── things of the way ───────────────────────────────────────────────────
// Houses, churches, the windmill, the palace are volumes: walls are cards turned their way, roofs
// planes tilted, all standing on their front (scene.json: "on"), so from above their roofs are seen;
// the scene's light lights each by its turn. Firs, стоги, clouds, the fence are cards facing the eye.
// Each is painted flat in its own metres from its anchor, y up negative (a slope: its eave the near
// edge), in its daylight colours.

// windows: { w, h, at: [[x, y]…] } — their middles
const panes = (g, { w, h, at }) => {
  for (const [x, y] of at) g.rect(x - w / 2, y - h / 2, w, h);
};
// a wall `len` long, `h` high, of `mat`, its windows' glass
function wall(g, e, len, h, mat, windows) {
  g.fillStyle = css(mat);
  g.fillRect(-len / 2, -h, len, h);
  if (!windows) return;
  g.beginPath();
  panes(g, windows);
  g.fillStyle = css(GLASS);
  g.fill();
}
// the light in a wall's windows (a card that glows, just before the wall)
function glow(g, e, len, windows) {
  const { win } = env(e.state);
  if (win < 0.01) return;
  g.beginPath();
  panes(g, windows);
  g.fillStyle = css(WARM, win);
  g.fill();
  for (const [x, y] of windows.at) e.light(x, y, windows.w * 1.2, '#ff9a48', 0.7 * win);
}
// a slope of a roof (a cupola, a tier): its eave `near` wide, its top `far` (0: a point), `depth` up it
function slope(g, e, near, far, depth, mat) {
  g.beginPath();
  g.moveTo(-near / 2, depth / 2);
  g.lineTo(near / 2, depth / 2);
  g.lineTo(far / 2, -depth / 2);
  g.lineTo(-far / 2, -depth / 2);
  g.closePath();
  g.fillStyle = css(mat);
  g.fill();
}
// a church's cross (round bars: a card facing the eye), `k` — its scale
function cross(g, e, k) {
  g.fillStyle = css(SHINGLE);
  g.fillRect(-0.075 * k, -2.5 * k, 0.15 * k, 2.5 * k);
  g.fillRect(-0.7 * k, -1.65 * k, 1.4 * k, 0.15 * k);
}
// the windmill's four thin sails, from their hub
function sails(g) {
  g.strokeStyle = css(WOOD);
  g.lineWidth = 0.45;
  g.beginPath();
  for (let k = 0; k < 4; k++) {
    g.moveTo(0, 0);
    g.lineTo(9 * Math.cos(k * 1.571 + 0.4), -9 * Math.sin(k * 1.571 + 0.4));
  }
  g.stroke();
}
// firs in a row, `w` wide: dark tiers of needles under snow
function firs(g, e, n, w, seed) {
  for (let i = 0; i < n; i++) {
    const x = (hash(i, seed) - 0.5) * w;
    const h = 10 + 9 * hash(i, seed + 1);
    tri(g, x, h, 0.24, 0, NEEDLES);
    tri(g, x, h, 0.12, 0.55, SNOW);
  }
}
function tri(g, x, h, k, from, c) {
  g.beginPath();
  g.moveTo(x - k * h, -from * h);
  g.lineTo(x + k * h, -from * h);
  g.lineTo(x, -h);
  g.closePath();
  g.fillStyle = css(c);
  g.fill();
}
// a стог: a dome of hay under a cap of snow
function stog(g, e, s) {
  g.fillStyle = css(HAY);
  g.beginPath();
  g.ellipse(0, 0, 2.3 * s, 3.4 * s, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = css(SNOW);
  g.beginPath();
  g.ellipse(0, -1.6 * s, 1.7 * s, 1.8 * s, 0, Math.PI, 0);
  g.fill();
}
// a wattle fence across the field: a woven band, stakes over it, snow along its top
function fence(g, e, w) {
  g.fillStyle = css(WILLOW);
  g.fillRect(-w / 2, -0.8, w, 0.65);
  g.strokeStyle = css(WOOD);
  g.lineWidth = 0.04;
  g.beginPath();
  for (let x = -w / 2; x <= w / 2; x += 0.45) {
    g.moveTo(x, 0);
    g.lineTo(x, -1.1 - 0.25 * hash(Math.round(x * 10), 6));
  }
  g.stroke();
  g.strokeStyle = css(SNOW);
  g.lineWidth = 0.07;
  g.beginPath();
  g.moveTo(-w / 2, -0.83);
  g.lineTo(w / 2, -0.83);
  g.stroke();
}
// a cloud: a few long soft layers, lit along their tops
function cloud(g, e, w, seed) {
  const lit = hex('#eef2fb');
  const dark = hex('#8d9cc0');
  for (let i = 0; i < 6; i++) {
    const x = (hash(i, seed) - 0.5) * w * 0.5;
    const y = (hash(i, seed + 1) - 0.5) * w * 0.06;
    const r = w * (0.25 + 0.2 * hash(i, seed + 2));
    g.save();
    g.translate(x, y);
    g.scale(1, 0.16 + 0.08 * hash(i, seed + 3));
    const gr = g.createRadialGradient(0, -r * 0.25, 0, 0, 0, r);
    gr.addColorStop(0, css(lit, 0.34));
    gr.addColorStop(0.55, css(lerp(lit, dark, 0.5), 0.2));
    gr.addColorStop(1, css(dark, 0));
    g.fillStyle = gr;
    g.fillRect(-r, -r, 2 * r, 2 * r);
    g.restore();
  }
}

// ── the ground ──────────────────────────────────────────────────────────
// the frozen river the flight follows: its middle (across) and width at distance d
const riverAt = (d) => [150 + 70 * Math.sin(d / 650) + 35 * Math.sin(d / 230 + 1), 45 + 70 * span(d, 5500, 6300)];
// the sled road from Диканька north, along the river's left
const roadAt = (d) => -20 + 40 * Math.sin(d / 900) + 0.02 * d;
// Planes: [across, distance, width, depth]; scene.json has the same. The snow is one plane out to
// the horizon all round; the road (from beyond Диканька) and the river are planes along the way.
const WAY = [-250, 8750];
const ROAD = [600, WAY[1]];
const PLANES = {
  ground: [0, 4250, 1000000, 1000000],
  road: [90, (ROAD[0] + ROAD[1]) / 2, 180, ROAD[1] - ROAD[0]],
  river: [200, (WAY[0] + WAY[1]) / 2, 600, WAY[1] - WAY[0]],
};
// a band along the way (the river), from d0 to d1: its middle f(d), its half-width w(d)
function band(g, f, w, d0, d1) {
  for (let d = d0; d <= d1; d += 10) {
    if (d === d0) g.moveTo(f(d) - w(d), -d);
    else g.lineTo(f(d) - w(d), -d);
  }
  for (let d = d1; d >= d0; d -= 10) g.lineTo(f(d) + w(d), -d);
  g.closePath();
}
const mid = (d) => riverAt(d)[0];
const half = (d) => riverAt(d)[1] / 2;
// a plane's code: in world metres (a, −d), from its own centre
function onPlane(g, id) {
  const [cx, cz, , depth] = PLANES[id];
  g.translate(-cx, cz);
  return [cz - depth / 2 - 20, cz + depth / 2 + 20];
}

// the snow, all one
function ground(g) {
  g.fillStyle = css(SNOW);
  g.fillRect(-1e6, -1e6, 2e6, 2e6);
}
// the sled road north, along the river: a packed track on the snow
function road(g, e) {
  onPlane(g, e.id);
  g.strokeStyle = css(hex('#b7c0d6'));
  g.lineWidth = 5;
  g.beginPath();
  for (let d = ROAD[0]; d <= ROAD[1]; d += 10) {
    if (d === ROAD[0]) g.moveTo(roadAt(d), -d);
    else g.lineTo(roadAt(d), -d);
  }
  g.stroke();
}
// the river: dark ice — a mirror of the sky and all over it (its `reflect`) — edged by the snow
// of its banks
function river(g, e) {
  const [d0, d1] = onPlane(g, e.id);
  g.beginPath();
  band(g, mid, half, d0, d1);
  g.fillStyle = css(ICE);
  g.fill();
  g.strokeStyle = css(SNOW);
  g.lineWidth = 4;
  g.stroke();
}

// ── the sky ─────────────────────────────────────────────────────────────
// the sky above the horizon (below it the land, and the sky mirrored where the ice lets it show)
function sky(g, e) {
  const E = env(e.state);
  const x0 = -0.3;
  const x1 = e.aspect + 0.3;
  const gr = g.createLinearGradient(0, -0.35, 0, HORIZON);
  gr.addColorStop(0, css(E.zen));
  gr.addColorStop(span(0.15, -0.35, HORIZON), css(E.high));
  gr.addColorStop(1, css(E.low));
  g.fillStyle = gr;
  g.fillRect(x0, -0.35, x1 - x0, HORIZON + 0.35);
  if (E.dawn > 0.01) {
    g.save();
    g.beginPath();
    g.rect(x0, -0.35, x1 - x0, HORIZON + 0.35);
    g.clip();
    round(g, e, ahead(e, (GLOW_AT * Math.PI) / 180), 2.6 * 0.75, (x) => {
      g.save();
      g.translate(x, HORIZON);
      g.scale(2.6, 1);
      const glow = g.createRadialGradient(0, 0, 0, 0, 0, 0.75);
      for (const [u, v] of GLOW_FALL) glow.addColorStop(u, css(E.glow, v));
      g.fillStyle = glow;
      g.fillRect(-0.75, -0.75, 1.5, 1.5);
      g.restore();
    });
    g.restore();
  }
}

// stars, all round: the dimmer go first as `stars` falls; at dawn they go out one by one
function stars(g, e) {
  const E = env(e.state);
  const left = E.stars * (1 - E.dawn);
  if (left <= 0.001) return;
  const mx = ahead(e, E.m.x);
  const my = E.m.y;
  const n = Math.round(250 * e.aspect);
  for (let i = 0; i < n; i++) {
    const sx = e.aspect * hash(i, 21);
    const y = -0.35 + (HORIZON + 0.33) * hash(i, 22) ** 1.5;
    const b = hash(i, 23) ** 3;
    const keep = clamp((left - (1 - b) * 0.98) * 40 + 1);
    const nearMoon = 1 - 2.4 * E.haloK * ramp(HALO_FALL, Math.hypot(sx - mx, y - my) / (E.m.r * 10));
    const low = span(y, HORIZON - 0.02, HORIZON - 0.15);
    const alpha = keep * clamp(nearMoon) * low * (0.25 + 0.75 * b);
    if (alpha < 0.02) continue;
    const r = 0.0007 + 0.0018 * b;
    g.fillStyle = css(lerp([0.8, 0.86, 1], [1, 0.95, 0.85], hash(i, 24)), alpha);
    round(g, e, sx, r * 7, (x) => {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      if (b > 0.55) e.light(x, y, r * 7, '#dfe8ff', 0.5 * alpha);
    });
  }
}

// the moon (its point `moon#moon` — where its light comes from): the air it lights, then the
// crescent glowing softly at its edge
function moon(g, e) {
  const E = env(e.state);
  const x = ahead(e, E.m.x);
  const y = E.m.y;
  e.at(x, y, 'moon');
  if (E.moonVis <= 0.001) return;
  const R = E.m.r;
  const ly = y - 0.55 * R * Math.sin(MOON_TURN);
  const reach = R * 10;
  round(g, e, x - 0.55 * R * Math.cos(MOON_TURN), reach, (lx) => {
    const halo = g.createRadialGradient(lx, ly, 0, lx, ly, reach);
    for (const [u, v] of HALO_FALL) halo.addColorStop(u, css(HALO, v * E.haloK));
    g.fillStyle = halo;
    g.fillRect(lx - reach, ly - reach, 2 * reach, 2 * reach);
  });
  const D = 0.4 * R;
  const r = 0.93 * R;
  const al = Math.acos((R * R + D * D - r * r) / (2 * R * D));
  const be = Math.acos((r * r + D * D - R * R) / (2 * r * D));
  const ox = x + D * Math.cos(MOON_TURN);
  const oy = y + D * Math.sin(MOON_TURN);
  g.beginPath();
  g.arc(x, y, R, MOON_TURN + al, MOON_TURN + 2 * Math.PI - al, false);
  g.arc(ox, oy, r, MOON_TURN + Math.PI + be, MOON_TURN + Math.PI - be, true);
  g.closePath();
  g.shadowColor = css(hex('#c9d6ff'), 0.8 * E.haloK);
  g.shadowBlur = ((0.035 + 0.06 * E.near) * E.haloK) / e.px;
  g.fillStyle = css(MOON_DISC, E.moonVis);
  g.fill();
  g.shadowBlur = 0;
}

return {
  ROUTE, LIME, WOOD, SHINGLE, SNOW, STONE, STUCCO,
  wall, glow, slope, cross, sails, firs, stog, fence, cloud, ground, road, river, sky, stars, moon,
};
