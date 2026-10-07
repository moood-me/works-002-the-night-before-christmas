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
// where the shove throws him; inside, in from the cold; where Vakula steps back to after the shove, the door wide (Chub
// lying in the snow seen past him)
const AT_DOOR = [-0.15, 3.95], DOORWAY = [-0.2, 4.4], ASIDE = [0.05, 3.85], STAND_BACK = [0.55, 3.7], CHUB_OUT = [-0.5, 5.05], YARD_FAR = [0.2, 8.5], CHUB_IN = [-0.6, 3.7];

// Christmas morning. Chub by the stove, warming himself; Oksana at the window; where Vakula comes in to, and goes down on
// his knees before Chub (near enough for Chub's hands to lift him); where he stands to give her the gift; the threshold
const STOVE_AT = [-0.85, 2.0], CHUB_TURN = 100, WINDOW_AT = [2.05, 3.15], V_IN = [-0.35, 3.45];
const KNEEL_AT = [-0.85 + 0.72 * Math.sin((CHUB_TURN * Math.PI) / 180), 2.0 + 0.72 * Math.cos((CHUB_TURN * Math.PI) / 180)];
const TO_HER = [1.32, 3.05], STEP = [-0.6, 4.3], SOLOKHA_AT = [-0.2, 3.3];
// where the sack is dragged in to; the girls dragging it, walking backwards before it; Oksana by it to untie it
const SACK_AT = [0.3, 3.3], DRAG = { odarka: [0.05, 2.75], divchyna1: [0.55, 2.75] }, UNTIE = [-0.25, 3.0];
// the passer-by out on the road beyond the window (passer 0…1 along it)
const PASS = (u) => [mix(0.8, 6.0, u), 9.5];
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
  sack: 0, sack_a: YARD[0], sack_d: YARD[1], gift: 1, gift_left: 0, passer: 0, solokha_present: 0,
  ...away('dyak'), ...away('solokha'), ...away('passer', PASS(0)),
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

// someone there now, where they are put — moved there as they are, no steps (they walk again when they next walk), with
// their keys `keys` ({turn, do, …})
function appear(id, [a, d], keys = {}) {
  scene.set(`${id}_steps`, false);
  scene.set(`${id}_a`, a);
  scene.set(`${id}_d`, d);
  for (const [k, v] of Object.entries(keys)) scene.set(`${id}_${k}`, v);
  scene.set(`${id}_here`, true);
}

// out of the sack on the floor: from the hands and knees up onto the feet (crawl_up, done once from there), seen only once
// the motion has them (the first moment of it, going over from standing, in the sack)
function crawlOut(id, at, turn) {
  scene.set(`${id}_steps`, false);
  scene.set(`${id}_wear`, null);
  scene.set(`${id}_a`, at[0]);
  scene.set(`${id}_d`, at[1]);
  const wait = P(id).go('crawl_up', { from: at, turn }) ?? 0;
  scene.after(wait + 0.4, () => scene.set(`${id}_here`, true));
}

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
      appear(g, [YARD[0], YARD[1] + 0.3 * i]);
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
// chub_present: Chub at home by the stove (come in, gone out — at once: the game's cut between beats)
scene.on('change', 'chub_present', (v) => (v ? appear('chub', STOVE_AT, { turn: CHUB_TURN, do: 'stand', wear: null, look: null }) : scene.set('chub_here', false)));
// solokha_present: Solokha in the hut, by Chub
scene.on('change', 'solokha_present', (v) => (v ? appear('solokha', [scene.get('solokha_a'), scene.get('solokha_d')]) : scene.set('solokha_here', false)));
// passer: someone going by on the road out there, seen through the window
function passing(v) {
  const u = v ?? 0, [a, d] = PASS(u);
  scene.set('passer_here', u > 0.001 && u < 0.999);
  scene.set('passer_a', a);
  scene.set('passer_d', d);
  scene.set('passer_turn', 90);
}
scene.on('change', 'passer', passing);
scene.on('move', 'passer', passing);
// what he brings in his hands: the cherevichki, or the box of paints and the letter
const giftOf = (s) => ((s.gift ?? 1) > 1.5 ? ['paintbox'] : ['cherevichki']);
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
    [4.2, 'door', 0.9, 1.0, 'inOut'], ...walk(4.4, 'vakula', [STAND_BACK], 1.2, toward(STAND_BACK, CHUB_OUT)),
    [5.4, 'oksana_reach', null], [5.4, 'oksana_look', 'vakula'],
    till(6.5),
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

  // ---- Night. The carollers with Oksana drag a sack in over the threshold, walking backwards; she unties it — out of it
  // crawls Chub («Батько?!» — «Тьфу! С праздником, дочка»), and the deacon after him, who slips off out of the door; the
  // girls fall about laughing
  sack: { rows: [
    [0.2, 'door', 1, 0.8, 'out'],
    ...['odarka', 'divchyna1'].flatMap((g, i) => [
      [0.3, `${g}_gait`, 'drag_back'], [0.3, `${g}_reach`, { r: 'sack#neck', l: 'sack#neck' }],
      ...walk(0.4 + 0.15 * i, g, [IN, DRAG[g]], 4.2, 0, 'inOut')]),
    [0.4, (() => { const f = () => scene.path(['sack_a', 'sack_d'], [[scene.get('sack_a'), scene.get('sack_d')], [IN[0], IN[1] + 0.5], SACK_AT], { over: 4.3, ease: 'inOut' });
      f.ends = () => ({ sack_a: SACK_AT[0], sack_d: SACK_AT[1] }); return f; })()],
    [2.0, act(() => appear('oksana', YARD), () => ({ oksana_here: true }))], ...walk(2.2, 'oksana', [IN, UNTIE], 3.0, toward(UNTIE, SACK_AT)),
    [4.8, 'odarka_reach', null], [4.8, 'divchyna1_reach', null], [4.8, 'odarka_gait', null], [4.8, 'divchyna1_gait', null],
    ...walk(5.0, 'odarka', [[-0.75, 2.95]], 1.4, toward([-0.75, 2.95], SACK_AT)), ...walk(5.2, 'divchyna1', [[1.15, 2.9]], 1.4, toward([1.15, 2.9], SACK_AT)),
    [6.4, 'odarka_look', 'sack'], [6.6, 'divchyna1_look', 'sack'],
    [5.0, 'door', 0, 1.4, 'in'],
    [5.6, 'oksana_look', 'sack#neck'], [5.6, 'oksana_do', 'put_down'],
    [7.6, 'sack', 2],
    [7.6, act(() => crawlOut('chub', SACK_AT, 200),
      (s) => ({ chub_here: true, chub_wear: null, ...once('chub', 'crawl_up', 200).ends({ ...s, chub_a: SACK_AT[0], chub_d: SACK_AT[1] }) }))],
    [8.4, 'oksana_look', 'chub'], [8.6, 'oksana_do', loop('akimbo')],
    [9.0, act(() => crawlOut('dyak', [SACK_AT[0] + 0.15, SACK_AT[1] + 0.2], 330),
      (s) => ({ dyak_here: true, ...once('dyak', 'crawl_up', 330).ends({ ...s, dyak_a: SACK_AT[0] + 0.15, dyak_d: SACK_AT[1] + 0.2 }) }))],
    [10.2, 'laugh', 1], [10.2, 'girls', 2],
    [11.4, 'chub_look', 'oksana'], [11.6, 'chub_do', 'shake_snow'],
    [12.4, 'door', 1, 0.8, 'out'], [12.6, 'dyak_gait', 'tiptoe'], ...walk(12.6, 'dyak', [CHUB_OUT, YARD_FAR], 2.6, null, 'in'),
    [15.2, 'dyak_here', false], [15.0, 'door', 0, 1.2, 'in'],
    till(16),
  ] },
  // ---- Christmas morning. Oksana alone at the window, all in frost. The game's: frost, peep (her breath thaws a hole),
  // passer (someone goes by out there)
  window: { rows: [
    [0, 'oksana_look', 'frost#peep'],
    till(3),
  ] },
  // ---- A girl looks in at the door — «Кузнец, говорят, утопился!» — and is gone; Oksana does not turn
  rumor: { after: 'window', rows: [
    [0, 'divchyna2_here', true], [0, 'divchyna2_a', -0.32], [0, 'divchyna2_d', 5.1], [0, 'divchyna2_turn', 190], [0, 'divchyna2_look', 'oksana'],
    [0.2, 'door', 0.65, 0.6, 'out'],
    [2.8, 'door', 0, 0.8, 'in'], [3.4, 'divchyna2_here', false],
    till(4),
  ] },
  // ---- Vakula comes in: a new hat, a new sash, the gift in his hands (gift 1 — the cherevichki, 2 — the letter and the box of
  // paints); Chub by the stove, Oksana at the window
  enter: { after: ['window', 'rumor'], rows: [
    [0, 'chub_present', 1],
    [0, 'vakula_here', true], [0, 'vakula_wear', scene.kit.cast.characters.vakula_feast], [0, 'vakula_gait', null],
    [0, act(() => scene.set('vakula_with', giftOf(scene.state)), (s) => ({ vakula_with: giftOf(s) }))],
    [0.3, 'door', 1, 0.9, 'out'],
    ...walk(0.6, 'vakula', [IN, V_IN], 2.6, toward(V_IN, WINDOW_AT)),
    [3.6, 'door', 0, 1.4, 'in'],
    [2.6, 'chub_look', 'vakula'], [3.2, 'oksana_turn', toward(WINDOW_AT, V_IN)], [3.4, 'oksana_look', 'vakula'],
    [3.6, 'vakula_look', 'oksana'], [5.6, 'vakula_look', 'chub'],
    till(8),
  ] },
  // ---- He goes down on his knees before Chub and holds out the whip — «Не гневись, батько: бей, сколько душа пожелает»
  bow: { after: 'enter', rows: [
    [0, 'vakula_with', ['nagaika']],
    [0.2, once('vakula', 'kneel_down', toward(KNEEL_AT, STOVE_AT), KNEEL_AT)],
    [0.4, 'chub_turn', toward(STOVE_AT, KNEEL_AT)],
    [4.4, 'vakula_do', loop('kneel_offer')], [4.4, 'vakula_look', 'chub'],
    [4.0, 'chub_look', 'vakula'], [4.2, 'oksana_look', 'vakula'],
    till(7),
  ] },
  // ---- Chub laughs, lifts him off his knees and claps him on the shoulder — «Засылай сватов!»
  chub_yes: { after: 'bow', rows: [
    [0, 'chub_do', loop('laugh_rock')],
    [1.6, 'chub_do', 'lift_up'],
    [2.2, 'vakula_with', null], [2.2, once('vakula', 'stand_up')],
    [4.4, 'chub_do', 'clap_shoulder'], [4.6, 'chub_reach', { r: 'vakula#shoulder_l' }],
    [5.8, 'chub_reach', null], [5.8, 'chub_do', loop('laugh')],
    [5.2, 'vakula_look', 'oksana'],
    till(7),
  ] },
  // ---- Chub waves him off and turns away to the stove
  chub_grumble: { after: 'bow', rows: [
    [0, 'chub_do', 'wave_off'],
    [1.6, 'chub_turn', 270], [1.6, 'chub_look', null],
    [2.4, 'vakula_look', 'oksana'],
    till(4),
  ] },
  // ---- Past Chub to her, the gift held out to her
  to_her: { after: ['enter', 'chub_yes'], rows: [
    [0, 'chub_look', 'vakula'],
    [0, act(() => scene.set('vakula_with', giftOf(scene.state)), (s) => ({ vakula_with: giftOf(s) }))],
    ...walk(0.3, 'vakula', [[0.5, 2.7], TO_HER], 2.6, toward(TO_HER, WINDOW_AT)),
    [2.4, 'oksana_turn', toward(WINDOW_AT, TO_HER)], [2.6, 'oksana_look', 'vakula'], [2.8, 'vakula_look', 'oksana'],
    [3.2, 'vakula_reach', { r: [1.66, 3.02, 1.05], l: [1.66, 3.16, 1.05] }],
    till(6),
  ] },
  // ---- Close, Oksana: «Нет! Мне не нужно черевиков… Я и без черевиков…» — and she throws her arms round his neck
  no_need: { after: 'to_her', rows: [
    [0, 'camera_target', 'oksana'], [0, 'camera_shot', 'medium'], ...frontal(0),
    [0.2, 'oksana_do', 'refuse'], [2.0, 'vakula_reach', null],
    [4.0, 'camera_target', null],
    ...walk(4.2, 'oksana', [[1.72, 3.12]], 0.8, toward([1.72, 3.12], TO_HER)),
    [5.0, 'oksana_do', loop('hug')], [5.0, 'oksana_reach', { r: 'vakula#shoulder_l', l: 'vakula#shoulder_r' }],
    till(8),
  ] },
  // ---- She takes them, turns them in her hands, nods
  word: { after: 'to_her', rows: [
    [0.6, 'vakula_with', null], [0.6, 'vakula_reach', null], [0.6, act(() => scene.set('oksana_with', giftOf(scene.state)), (s) => ({ oksana_with: giftOf(s) }))],
    [0.8, 'oksana_do', loop('examine')], [0.8, 'oksana_look', 'oksana#hands'],
    [3.6, 'oksana_look', 'vakula'], [4.2, 'oksana_look', [TO_HER[0], TO_HER[1], 0.6]], [4.7, 'oksana_look', 'vakula'],
    till(6),
  ] },
  // ---- He sets the gift down on the threshold, straightens, and goes
  threshold: { after: 'enter', rows: [
    ...walk(0.2, 'vakula', [STEP], 1.4, 0),
    [1.8, 'vakula_do', 'put_down'],
    [3.0, 'vakula_with', null], [3.0, 'gift_left', 1],
    [3.9, 'oksana_look', 'gift_step'],
    [4.4, 'door', 1, 0.9, 'out'],
    ...walk(4.8, 'vakula', [CHUB_OUT, YARD_FAR], 2.0, null, 'in'), [6.8, 'vakula_here', false],
    [6.6, 'door', 0, 1.2, 'in'],
    till(7.4),
  ] },
  // ---- Oksana alone: she takes the cherevichki up off the threshold, puts them on, and goes back to the window in them
  try_on: { after: 'threshold', rows: [
    [0, 'chub_present', 0],
    ...walk(0.2, 'oksana', [MID, [STEP[0] + 0.15, STEP[1] - 0.45]], 3.0, 0),
    [3.3, 'oksana_do', 'put_down'], [4.3, 'gift_left', 0], [4.3, 'oksana_with', ['cherevichki']],
    ...walk(5.6, 'oksana', [MID], 2.0, 200),
    [7.7, 'oksana_do', 'try_on'], [7.7, 'oksana_look', 'oksana#feet'],
    [9.4, 'oksana_with', null], [9.4, 'oksana_wear', { ...scene.kit.cast.characters.oksana, parts: ['namysto', 'gold_shoes'] }],
    [13.6, 'oksana_look', null], ...walk(13.8, 'oksana', [WINDOW_AT], 2.2, 0),
    till(16.5),
  ] },
  // ---- The doors open: Solokha comes in. Chub twirls his moustache, goes to her and takes her arm
  two_weddings: { after: ['chub_yes', 'word', 'no_need'], rows: [
    [0.2, 'door', 1, 0.8, 'out'],
    [0.3, act(() => appear('solokha', YARD), () => ({ solokha_here: true }))],
    ...walk(0.5, 'solokha', [IN, SOLOKHA_AT], 2.4, 150),
    [3.4, 'door', 0, 1.2, 'in'],
    [2.0, 'chub_look', 'solokha'], [2.4, 'chub_do', 'mustache'],
    ...walk(4.6, 'chub', [[-0.55, 3.1]], 1.2, toward([-0.55, 3.1], SOLOKHA_AT)),
    [5.8, 'chub_reach', { r: 'solokha#hand_l' }], [5.8, 'solokha_look', 'chub'], [6.0, 'solokha_present', 1],
    [3.0, 'oksana_look', 'solokha'], [3.2, 'vakula_look', 'solokha'],
    till(8),
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
// night, chapter II's end: the girls and Oksana out with the sack, Chub and the deacon in it
const NIGHT = { ...START, ...away('oksana'),
  odarka_here: true, odarka_a: YARD[0] - 0.25, odarka_d: YARD[1], odarka_turn: 0, divchyna1_here: true, divchyna1_a: YARD[0] + 0.25,
  divchyna1_d: YARD[1], divchyna1_turn: 0, sack: 1, sack_a: YARD[0], sack_d: YARD[1] + 0.7, girls: 2, blizzard: 0, moon: 1, chub_hat: 0 };
from('sack', () => NIGHT);
// Christmas morning: the lamp out, the frost on the window; Oksana alone at it
const MORNING = { ...START, morning: 1, lamp: 0, moon: 0, frost: 0.9, ...away('oksana', WINDOW_AT), oksana_here: true, oksana_turn: 0,
  oksana_look: 'frost#peep', mirror_turn: 0, caught: 1, gift: scene.get('gift') ?? 1 };
from('window', () => MORNING);
from('rumor', () => settle(MORNING, B.window.rows));
from('enter', () => ({ ...settle(MORNING, B.window.rows), chub_present: 0 }));
// (Chub by the stove: chub_present's listener puts him there — in a from, his own keys)
const AT_STOVE = { chub_here: true, chub_a: STOVE_AT[0], chub_d: STOVE_AT[1], chub_turn: CHUB_TURN, chub_do: 'stand', chub_wear: null };
const ENTERED = () => ({ ...settle(B.enter.from, B.enter.rows), ...AT_STOVE, chub_look: 'vakula', gift: scene.get('gift') ?? 1 });
for (const n of ['bow', 'to_her', 'threshold']) from(n, ENTERED);
for (const n of ['chub_yes', 'chub_grumble']) from(n, () => settle(B.bow.from, B.bow.rows));
for (const n of ['no_need', 'word']) from(n, () => settle(B.to_her.from, B.to_her.rows));
from('try_on', () => settle(B.threshold.from, B.threshold.rows));
from('two_weddings', () => settle(B.chub_yes.from, B.chub_yes.rows));
scene.kit.film.beats(scene, B, { film: ['mirror', 'creep', 'caught', 'bench', 'girls', 'shoes', 'whim', 'vow', 'knock', 'let_in', 'leave',
  'sack', 'window', 'rumor', 'enter', 'bow', 'chub_yes', 'to_her', 'word', 'two_weddings'] });
