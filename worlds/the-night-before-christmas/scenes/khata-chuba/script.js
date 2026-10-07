// Хата Чуба — a film in beats (module film; notes.md lists them, scenes.md is the contract with the game). The viewer of
// the world sees the cut `film`: the evening of chapter I as the story tells it. A game plays the beats one at a time,
// its branches and its mini-games among them.
// The people are the engine's (elements with "person", the world's cast): what each does is <id>_do, where each faces
// <id>_turn (degrees: 0 away from us, 90 to the right, 180 toward us), looks <id>_look, reaches <id>_reach, has in
// the hands <id>_with, wears <id>_wear, sits on <id>_on — and where each is their place (<id>_a, <id>_d). The game's
// keys (vakula_pos, mirror_turn, caught, girls, laugh, chub_present) are turned into what they do (below).
const P = (id) => scene.person(id);
const loop = (motion) => ({ motion, loop: true });
const mix = (a, b, u) => a + (b - a) * u;

// The door turns on its hinge as `door` says: shut (0) faces the room, open (1) swung in toward the stove — its angle,
// `door_turn`, follows `door` as it moves.
const turnDoor = () => scene.set('door_turn', 180 + 84 * (scene.get('door') ?? 0));
scene.on('change', 'door', turnDoor);
scene.on('move', 'door', turnDoor);
turnDoor();

// ── where things are (metres: across, distance; the room's in scene.json) ──
// out in the yard before the door; just inside it; the table mirror and where Oksana stands to look into it; the middle
// of the room, in the stove's light, where she admires herself
const YARD = [-0.675, 5.5], IN = [-0.675, 4.15];
const AT_TABLE = [1.35, 3.0], MIRROR = 'mirror#glass', MID = [0.55, 2.35];
// Vakula's way on tiptoe from the door to the bench, behind her back (vakula_pos 0…1 along it): round behind her, past
// the table's corner, to before the bench
const CREEP = [IN, [-0.3, 3.55], [0.9, 3.25], [2.6, 2.95]];
// the bench along the right wall: its seat's top, where Oksana sits on it, and Vakula — as near her as he crept
// (vakula_pos): from the bench's far end by the table to an elbow from her
const SEAT_H = 0.45, SEAT_A = 3.36, O_SEAT = [SEAT_A, 2.6];
const V_SEAT = (pos) => [SEAT_A, O_SEAT[1] + mix(1.05, 0.6, pos ?? 0)];
// where the girls stand in from the cold, before the door (Odarka first); where Oksana meets them
const GIRLS = ['odarka', 'divchyna1', 'divchyna2', 'divchyna3'];
const SPOT = { odarka: [0.15, 3.05], divchyna1: [-0.55, 3.35], divchyna2: [0.6, 3.6], divchyna3: [-0.2, 3.85] };
const MEET = [1.15, 2.55], SHOW = [0.6, 2.75];
// where Vakula, up off the bench, comes to stand before her
const BEFORE = [1.95, 1.7];
// Vakula at the door: to its right, clear of its leaf (it swings in to the left); Chub out in the yard before it, and
// where the shove throws him; inside, in from the cold
const AT_DOOR = [-0.15, 3.95], DOORWAY = [-0.2, 4.4], ASIDE = [0.05, 3.85], CHUB_OUT = [-0.5, 5.05], YARD_FAR = [0.2, 8.5], CHUB_IN = [-0.6, 3.7];

// the way from one point to another, in degrees (as <id>_turn)
const toward = ([a, d], [a2, d2]) => ((((Math.atan2(a2 - a, d2 - d) * 180) / Math.PI) % 360) + 360) % 360;
// a point along a way of points, at u (0…1) of its length
function along(pts, u) {
  const len = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), all = len.reduce((a, b) => a + b, 0);
  let left = Math.max(0, Math.min(1, u)) * all;
  for (let i = 0; i < len.length; i++) {
    if (left <= len[i] || i === len.length - 1) { const k = len[i] ? Math.min(1, left / len[i]) : 0; return [mix(pts[i][0], pts[i + 1][0], k), mix(pts[i][1], pts[i + 1][1], k)]; }
    left -= len[i];
  }
  return pts.at(-1);
}

// ── the scene's state when nothing has happened yet: the evening; Oksana at the table, before its mirror; nobody else
// in the hut (Vakula and the girls out in the yard, Chub gone to the deacon's) ──
const away = (id, [a, d] = YARD) => ({ [`${id}_a`]: a, [`${id}_d`]: d, [`${id}_turn`]: 180, [`${id}_do`]: 'stand', [`${id}_look`]: null,
  [`${id}_reach`]: null, [`${id}_with`]: null, [`${id}_on`]: null, [`${id}_still`]: false, [`${id}_gait`]: null, [`${id}_wear`]: null, [`${id}_here`]: false });
const START = {
  lamp: 1, moon: 0, morning: 0, blizzard: 0, door: 0, vakula_pos: 0, mirror_turn: 0, caught: 0, girls: 0, laugh: 0, chub_present: 0, chub_hat: 0,
  camera_target: null, camera_shot: 'full', camera_glide: 1.5, camera_x: 0, camera_z: 0, camera_yaw: 0, camera_look: 0,
  ...away('oksana', AT_TABLE), oksana_here: true, oksana_turn: toward(AT_TABLE, [1.75, 3.85]),
  ...away('vakula'), vakula_gait: 'tiptoe', ...Object.assign({}, ...GIRLS.map((g) => away(g))), ...away('chub', CHUB_OUT),
};

// ── the rows' helpers ──
// a beat lasts till t
const till = (t) => [t, () => {}];
// the state once the rows have played (what the next beat begins at, when the scene opens on it): values, and what a
// row that is a function says it leaves (its `ends(state)`)
function settle(state, rows) {
  const out = { ...state };
  for (const [, k, v] of [...rows].sort((p, q) => p[0] - q[0])) {
    if (typeof k === 'function') Object.assign(out, k.ends?.(out));
    else out[k] = v;
  }
  return out;
}
// they walk (steps) from where they are along points, taking `over` seconds; turned at the end
const walk = (t, id, pts, over, turn, ease = 'inOut') => {
  const f = () => {
    const s = scene.state;
    scene.set(`${id}_steps`, true);
    scene.path([`${id}_a`, `${id}_d`], [[s[`${id}_a`], s[`${id}_d`]], ...pts], { over, ease });
  };
  f.ends = () => ({ [`${id}_a`]: pts.at(-1)[0], [`${id}_d`]: pts.at(-1)[1] });
  return [[t, f], ...(turn != null ? [[t + over, `${id}_turn`, turn]] : [])];
};
// a motion done once, ending facing `turn`: begun where they are — or ending at `to` (a step to where it begins first);
// held at its end after it
const once = (id, motion, turn, to) => {
  const end = (s) => turn ?? s[`${id}_turn`];
  const f = () => {
    const s = scene.state;
    P(id).go(motion, { ...(to ? { to: typeof to === 'function' ? to() : to } : { from: [s[`${id}_a`], s[`${id}_d`]] }), turn: end(s) });
  };
  f.ends = (s) => {
    const dest = typeof to === 'function' ? to(s) : to;
    const off = dest ? { across: 0, distance: 0 } : P(id).startOf(motion, end(s)) ?? { across: 0, distance: 0 };
    const [a, d] = dest ?? [s[`${id}_a`], s[`${id}_d`]];
    return { [`${id}_a`]: a - off.across, [`${id}_d`]: d - off.distance, [`${id}_turn`]: end(s), [`${id}_do`]: { motion, loop: false, from: 99 } };
  };
  return f;
};
// a row doing what f does, leaving what ends(state) says (for the beats' from)
const act = (f, ends) => Object.assign(f, { ends });
// a motion's seconds (the cast's)
const length = (m) => { const c = scene.kit.cast.motions?.[m]; return c ? c.n / c.fps : 0; };
// the turn a motion done once ends facing, for it to begin facing `start` (one that turns them as it goes: thrown down onto
// the back)
const endFacing = (id, motion, start) => start - (P(id).startOf(motion, 0)?.turn ?? 0);
// sat down onto the bench at a seat (seat(state) → [across, distance]): the sitting down done once, ending there; then on
// it — their hips over its top as a pelvis sits — seated as `seated` says
const sitOn = (id, seat, seated) => act(() => {
  const at = seat(scene.state), wait = P(id).go('sit_down', { to: at, turn: 270 }) ?? 0;
  scene.after(wait + length('sit_down'), () => { scene.set(`${id}_on`, [...at, SEAT_H]); scene.set(`${id}_do`, loop(seated)); });
}, (s) => { const [a, d] = seat(s); return { [`${id}_a`]: a, [`${id}_d`]: d, [`${id}_turn`]: 270, [`${id}_on`]: [a, d, SEAT_H], [`${id}_do`]: loop(seated) }; });
// up off the bench: their getting up done once from where they sit
const rise = (id, motion = 'rise') => act(() => { scene.set(`${id}_on`, null); P(id).go(motion, { from: [scene.get(`${id}_a`), scene.get(`${id}_d`)], turn: 270 }); },
  (s) => ({ [`${id}_on`]: null, ...once(id, motion, 270).ends(s) }));

// the camera: turned toward the bench and the door both (the room's right half), over `over` seconds — or straight, as
// it is at the start, while it frames someone (camera_target: camera_x, camera_yaw go on top of its framing)
const byBench = (t, over = 2) => [[t, 'camera_x', 0.3, over, 'inOut'], [t, 'camera_yaw', 14, over, 'inOut']];
const frontal = (t, over = 1) => [[t, 'camera_x', 0, over, 'inOut'], [t, 'camera_yaw', 0, over, 'inOut']];
// his hat put on: both hands to his head, the hat on it, the hands down
const hatOn = (t) => [[t, 'vakula_reach', { r: 'vakula#head', l: 'vakula#head' }], [t + 0.7, 'vakula_wear', null], [t + 0.7, 'vakula_with', null],
  [t + 0.8, 'vakula_reach', null]];

// ── the game's keys, turned into what the people do ──
// vakula_pos: before she has caught him — his place on the way from the door to the bench (he goes there on tiptoe)
function creep() {
  const s = scene.state;
  if (s.caught || !s.vakula_here || s.vakula_on) return;
  const [a, d] = along(CREEP, s.vakula_pos ?? 0);
  scene.set('vakula_a', a);
  scene.set('vakula_d', d);
}
scene.on('change', 'vakula_pos', creep);
scene.on('move', 'vakula_pos', creep);
// mirror_turn: she turns the little mirror to see the room behind her — her right hand out to the side and back, her eyes
// in it; he freezes in the middle of his step
function mirrorTurn(v) {
  const s = scene.state, k = v ?? 0, f = ((s.oksana_turn ?? 180) * Math.PI) / 180;
  const side = [s.oksana_a + Math.cos(f) * 0.42 - Math.sin(f) * 0.12, s.oksana_d - Math.sin(f) * 0.42 - Math.cos(f) * 0.12, 1.45];
  scene.set('oksana_reach', k > 0.05 ? { r: side } : null);
  scene.set('oksana_look', k > 0.05 ? 'oksana#hand_r' : null);
  scene.set('vakula_still', k > 0.5 && !s.caught);
}
scene.on('change', 'mirror_turn', mirrorTurn);
// girls: as many come in from the cold, one after another (each from the yard to her place), or go out laughing
function girlsTo(n) {
  GIRLS.forEach((g, i) => {
    const s = scene.state, inside = !!s[`${g}_here`], want = i < n;
    if (want && !inside) {
      scene.cut({ [`${g}_a`]: YARD[0], [`${g}_d`]: YARD[1] + 0.3 * i, [`${g}_here`]: true });
      scene.after(0.05, () => scene.path([`${g}_a`, `${g}_d`], [[YARD[0], YARD[1] + 0.3 * i], IN, SPOT[g]], { speed: 1.6 + 0.12 * i, ease: 'out' }));
      scene.after(2.4 + 0.2 * i, () => { P(g).turn(toward(SPOT[g], MEET), 0.5); scene.set(`${g}_do`, i ? loop('sing') : 'shake_snow'); });
      if (!i) scene.after(5.6, () => scene.set(`${g}_do`, loop('sing')));
    } else if (!want && inside) {
      const out = scene.path([`${g}_a`, `${g}_d`], [[s[`${g}_a`], s[`${g}_d`]], IN, [YARD[0], YARD[1] + 0.4]], { speed: 1.7 + 0.1 * i, ease: 'in' });
      scene.after(out, () => scene.set(`${g}_here`, false));
    }
  });
}
scene.on('change', 'girls', (n) => girlsTo(n ?? 0));
// laugh: the girls fall about laughing (each her own way and time), or carol on
function laughing() {
  const on = (scene.get('laugh') ?? 0) > 0.5;
  GIRLS.forEach((g, i) => scene.after(0.15 * i, () => scene.set(`${g}_do`, loop(on ? (i % 2 ? 'laugh' : 'laugh_rock') : 'sing'))));
}
scene.on('change', 'laugh', laughing);
// the girls in, where they stand, as a beat begins with them there
const GIRLS_IN = Object.assign({}, ...GIRLS.map((g) => ({ [`${g}_a`]: SPOT[g][0], [`${g}_d`]: SPOT[g][1], [`${g}_here`]: true,
  [`${g}_turn`]: toward(SPOT[g], MEET), [`${g}_do`]: loop('sing') })));
const GIRLS_OUT = Object.assign({}, ...GIRLS.map((g) => away(g)));

// ── the beats ──
const B = {
  // ---- The evening. Oksana alone at the table before its little mirror; she takes it up, steps into the stove's light,
  // turns about with it, sets her ribbons right — «Лгут люди, я совсем не хороша…»; close, her face; then she laughs —
  // «Нет, хороша я!»
  mirror: { rows: [
    [0.4, 'oksana_reach', { r: MIRROR }],
    [1.3, 'oksana_with', ['mirror']], [1.3, 'oksana_reach', null],
    ...walk(1.6, 'oksana', [MID], 2.2, 235),
    [3.4, 'oksana_do', loop('mirror')],
    [4.2, 'camera_target', 'oksana'], [4.2, 'camera_shot', 'medium'],
    [8.6, 'oksana_do', 'giggle'],
    [9.4, 'camera_target', null], [9.4, 'camera_shot', 'full'],
    [10.6, 'oksana_do', loop('mirror')],
    till(12),
  ] },
  // ---- Vakula at the door: it opens, he slips in on tiptoe and pulls it to behind him; a few steps on behind her back.
  // Then the game's: vakula_pos (on along the way to the bench), mirror_turn (she looks into the room behind her: he
  // freezes), caught
  creep: { after: 'mirror', rows: [
    [0, 'vakula_here', true], [0, 'vakula_gait', 'tiptoe'],
    [0.2, 'door', 1, 1.2, 'out'],
    ...walk(0.8, 'vakula', [IN], 1.6, null, 'out'),
    [2.8, 'door', 0, 1.4, 'in'],
    [3.4, 'vakula_pos', 0.22, 2.4, 'inOut'],
    till(6.2),
  ] },
  // ---- She sees him in the mirror, turns round and sets her hands on her hips — «Зачем ты пришёл?»
  caught: { after: 'creep', rows: [
    [0, 'caught', 1], [0, 'mirror_turn', 0.8, 0.4],
    [0.6, 'vakula_still', false], [0.6, 'vakula_do', 'stand'], [0.6, 'vakula_gait', null],
    [1.0, 'mirror_turn', 0, 0.3],
    [1.1, act(() => P('oksana').turn(toward(MID, [scene.get('vakula_a'), scene.get('vakula_d')]), 0.6), (s) => ({ oksana_turn: toward(MID, [s.vakula_a, s.vakula_d]) }))],
    [1.3, 'oksana_do', loop('akimbo')], [1.3, 'oksana_look', 'vakula'],
    [1.6, 'vakula_look', 'oksana'],
    till(5.0),
  ] },
  // ---- On the bench: she goes and sits, he follows and sits as near as he crept (vakula_pos), his hat off and in his
  // hands; she teases, he kneads the hat
  bench: { after: 'caught', rows: [
    [0, 'oksana_look', null], [0, 'oksana_do', 'stand'],
    ...byBench(0, 4),
    [0.2, sitOn('oksana', () => O_SEAT, 'sit_tease')],
    [1.0, 'vakula_look', null],
    [1.4, sitOn('vakula', (s) => V_SEAT(s.vakula_pos), 'cap_seated')],
    [5.0, 'oksana_look', 'vakula'],
    [5.6, 'vakula_wear', { hat: 'none' }], [5.6, 'vakula_with', ['hat_hands']],
    [6.2, 'vakula_look', [SEAT_A - 0.8, V_SEAT(0.5)[1], 0.2]],
    till(8.0),
  ] },
  // ---- The door flies open: four girls tumble in from the frost, snow on them, carolling, Odarka in front. Oksana is up off
  // the bench and goes to meet them; Vakula stays where he sits
  girls: { after: 'bench', rows: [
    [0, 'blizzard', 0.35, 2],
    [0.2, 'door', 1, 0.7, 'out'],
    [0.5, 'girls', 1], [0.85, 'girls', 2], [1.2, 'girls', 3], [1.55, 'girls', 4],
    [0.9, 'oksana_look', 'odarka'],
    [1.2, rise('oksana', 'jump_up')],
    ...walk(2.6, 'oksana', [MEET], 1.6, toward(MEET, SPOT.odarka)),
    [1.4, 'vakula_look', 'odarka'],
    [4.4, 'door', 0, 1.6, 'in'],
    [6.0, 'oksana_do', loop('akimbo')],
    till(10),
  ] },
  // ---- Close: Odarka's new cherevichki, red, with gold — «Ах, какие хорошие! И с золотом!»
  shoes: { after: 'girls', rows: [
    [0, 'odarka_do', 'stand'], ...walk(0, 'odarka', [SHOW], 1.0, toward(SHOW, MEET)),
    [0.6, 'camera_target', 'odarka'], [0.6, 'camera_shot', 'full'], [0.6, 'camera_glide', 1.0], [0.6, 'camera_look', 0.25, 1.0, 'inOut'], ...frontal(0.6),
    [0.4, 'oksana_look', 'odarka#feet'], [0.4, 'oksana_do', 'stand'],
    [0.9, 'odarka_look', 'odarka#feet'],
    [3.4, 'odarka_look', 'oksana'],
    till(4),
  ] },
  // ---- Vakula is up — «Я тебе достану такие…»; close, Oksana: «Принесёшь черевички, которые носит царица…»; then the
  // girls burst out laughing
  whim: { after: 'shoes', rows: [
    [0, 'camera_target', null], [0, 'camera_glide', 1.5], [0, 'camera_look', 0, 1.5, 'inOut'], ...byBench(0), [0, 'oksana_look', null],
    [0.2, rise('vakula')],
    ...walk(2.0, 'vakula', [BEFORE], 1.4, toward(BEFORE, MEET)), [2.0, 'vakula_look', 'oksana'],
    [2.4, 'camera_target', 'oksana'], [2.4, 'camera_shot', 'medium'], ...frontal(2.4),
    [2.6, 'oksana_turn', toward(MEET, BEFORE)],
    [2.4, 'oksana_look', 'vakula'], [2.4, 'oksana_do', loop('akimbo')],
    [6.4, 'camera_target', null], ...byBench(6.4),
    [6.4, 'laugh', 1],
    till(8),
  ] },
  // ---- «Принесу»: Vakula's fist to his chest; the laughter louder; Oksana looks down on him
  vow: { after: 'whim', rows: [
    [0, 'vakula_do', 'vow'],
    [1.2, 'oksana_do', loop('proud')],
    [2.4, 'laugh', 0, 0], [2.5, 'laugh', 1],
    till(5),
  ] },
  // ---- «Прощай, Оксана! Дурачь кого хочешь»: he puts his hat on and goes to the door; the laughing stops; Oksana, near
  // us, looking after him
  proud: { after: 'whim', rows: [
    ...hatOn(0.3),
    ...walk(1.4, 'vakula', [AT_DOOR], 2.6, 0),
    [1.8, 'laugh', 0], ...GIRLS.map((g, i) => [2.2 + 0.2 * i, `${g}_do`, 'stand']),
    ...GIRLS.map((g, i) => [2.4 + 0.25 * i, `${g}_look`, 'vakula']),
    [2.6, 'oksana_do', 'stand'], [2.6, 'oksana_look', 'vakula'],
    till(7),
  ] },
  // ---- The girls run out to carol on; Oksana back on the bench; Vakula at the door (his hat on) — a knock, three
  // times: the door shakes. Outside, the blizzard
  knock: { after: ['vow', 'proud'], rows: [
    [0, 'camera_target', null], ...byBench(0),
    ...GIRLS.map((g) => [0, `${g}_look`, null]),
    [0, 'laugh', 1], [0.1, 'door', 1, 0.7, 'out'], [0.3, 'girls', 0], [3.6, 'door', 0, 1.2, 'in'],
    [0.2, 'blizzard', 0.9, 4],
    [0.4, 'oksana_look', null], [0.4, 'oksana_do', 'stand'], [0.8, sitOn('oksana', () => O_SEAT, 'sit_tease')],
    ...hatOn(0.6),
    ...walk(1.4, 'vakula', [AT_DOOR], 2.2, 0),
    [6.0, 'vakula_look', 'door#handle'],
    ...[6.4, 7.0, 7.6].flatMap((t) => [[t, 'door', 0.035, 0.08, 'out'], [t + 0.12, 'door', 0, 0.2, 'in']]),
    [7.0, 'oksana_look', 'door'],
    till(9),
  ] },
  // ---- He opens the door into the blizzard — a dark figure — and shoves it off the step: it goes down in the drift, its
  // hat flying off apart from it. Oksana snorts with laughter
  shove: { after: 'knock', rows: [
    [0, 'chub_here', true], [0, 'chub_a', CHUB_OUT[0]], [0, 'chub_d', CHUB_OUT[1]], [0, 'chub_turn', 180],
    [0, 'vakula_turn', 330], [0.2, 'vakula_do', 'door_open'], [0.6, 'door', 0.55, 0.8, 'out'],
    ...walk(1.5, 'vakula', [DOORWAY], 0.6, toward(DOORWAY, CHUB_OUT)), [1.6, 'vakula_look', 'chub'],
    [2.1, 'vakula_do', 'shove'],
    [3.5, act(() => once('chub', 'fall_back', endFacing('chub', 'fall_back', 180))(), (s) => once('chub', 'fall_back', endFacing('chub', 'fall_back', 180)).ends(s))], [3.6, 'chub_wear', { hat: 'none' }], [3.6, 'chub_hat', 1],
    [3.8, 'oksana_reach', { r: 'oksana#head' }], [3.8, 'oksana_look', [O_SEAT[0] - 0.6, O_SEAT[1], 0.1]],
    [5.4, 'oksana_reach', null], [5.4, 'oksana_look', 'vakula'],
    till(6),
  ] },
  // ---- He opens it: Chub, all snow, comes in. Oksana is up — «Батько!» — Vakula bows; Chub looks at the one, at the other —
  // «Сидите, сидите» — and goes out again into the night
  let_in: { after: 'knock', rows: [
    [0, 'chub_here', true], [0, 'chub_a', CHUB_OUT[0]], [0, 'chub_d', CHUB_OUT[1]], [0, 'chub_turn', 180],
    [0, 'vakula_turn', 330], [0.2, 'vakula_do', 'door_open'], [0.6, 'door', 1, 1.2, 'out'],
    ...walk(2.2, 'vakula', [ASIDE], 1.0, toward(ASIDE, CHUB_IN)),
    [2.6, 'chub_gait', 'waddle'], ...walk(2.6, 'chub', [CHUB_IN], 1.8, 160),
    [4.4, 'chub_do', 'shake_snow'],
    [3.6, rise('oksana', 'jump_up')], [4.2, 'oksana_look', 'chub'],
    [4.6, 'vakula_do', 'bow'],
    [5.6, 'chub_look', 'vakula'], [6.8, 'chub_look', 'oksana'],
    [7.8, 'chub_do', 'wave_off'], [8.2, 'chub_look', null],
    [8.8, 'chub_turn', 0], ...walk(9.4, 'chub', [CHUB_OUT, YARD_FAR], 2.6, null, 'in'), [12.0, 'chub_here', false],
    [11.6, 'door', 0, 1.4, 'in'],
    [9.0, 'vakula_look', 'oksana'], [9.4, 'oksana_look', 'vakula'],
    till(13),
  ] },
  // ---- Vakula goes out into the blizzard after him; the door shuts
  leave: { after: ['shove', 'let_in'], rows: [
    [0, 'chub_here', false], [0, 'vakula_look', null],
    ...walk(0, 'vakula', [DOORWAY], 1.0, 0),
    [0.6, 'door', 1, 0.8, 'out'],
    ...walk(1.2, 'vakula', [CHUB_OUT, YARD_FAR], 2.0, null, 'in'), [3.2, 'vakula_here', false],
    [2.8, 'door', 0, 1.2, 'in'], [2.6, 'oksana_look', 'door'],
    till(4.4),
  ] },
};

// ── what each beat begins at: the state after the beats that lead to it — worked out as it begins (where a motion done
// once takes someone is the motion's: the people know it once they are here) ──
const chain = (start, ...names) => names.reduce((st, n) => settle(st, B[n].rows), start);
const from = (name, make) => Object.defineProperty(B[name], 'from', { get: make, enumerable: true });
from('mirror', () => START);
from('creep', () => chain(START, 'mirror'));
from('caught', () => chain(START, 'mirror', 'creep'));
from('bench', () => chain(START, 'mirror', 'creep', 'caught'));
// (the girls come in by their key: girlsTo — after `girls`, they are in their places)
const BENCH = () => chain(START, 'mirror', 'creep', 'caught', 'bench');
from('girls', BENCH);
from('shoes', () => ({ ...settle(BENCH(), B.girls.rows), ...GIRLS_IN, odarka_do: loop('sing') }));
from('whim', () => settle(B.shoes.from, B.shoes.rows));
for (const n of ['vow', 'proud']) from(n, () => settle(B.whim.from, B.whim.rows));
from('knock', () => settle(B.vow.from, B.vow.rows));
for (const n of ['shove', 'let_in']) from(n, () => ({ ...settle(B.knock.from, B.knock.rows), ...GIRLS_OUT }));
from('leave', () => settle(B.let_in.from, B.let_in.rows));
scene.kit.film.beats(scene, B, { film: ['mirror', 'creep', 'caught', 'bench', 'girls', 'shoes', 'whim', 'vow', 'knock', 'let_in', 'leave'] });
