// Диканька — the street's film in beats (module film; notes.md lists them). The viewer of the world sees the cut `film`:
// the night as the story tells it out on the street — Chub and Kum Panas come out and the moon is gone; lost in the
// blizzard; the carollers with their star under Chub's windows; Vakula with the sacks, his farewell, the sack left.
// The people are the engine's (elements with "person", the world's cast): <id>_do, _turn, _look, _reach, _with, _gait,
// _steps, _here; where each is — <id>_a, <id>_d (metres of the world; the land under them is the scene's relief). Chub
// the man is `chub_kozak` (`chub` is his hut).
const P = (id) => scene.person(id);
const loop = (motion) => ({ motion, loop: true });
// the way from one point to another, in degrees (as <id>_turn)
const toward = ([a, d], [a2, d2]) => ((((Math.atan2(a2 - a, d2 - d) * 180) / Math.PI) % 360) + 360) % 360;

// ── where things are (metres: across, distance) ──
// Chub's door (door#door), before it, his yard, the gate in the fence, the street outside it
const DOOR = [-6.99, 17.0], DOOR_OUT = [-6.4, 16.5], YARD = [-5.7, 15.9], GATE = [-4.85, 15.45], OUT = [-3.7, 15.2];
// up the street, away from us: to the deacon's (the way Chub and Panas go) — and back down it, lost; the turn off to the
// right where Panas goes on alone; the top of the street, where the carollers come from and Vakula goes off to
const UP = [[-2.2, 18.5], [0.2, 26], [1.4, 38]];
const LOST = { chub_kozak: [[-1.0, 30], [-3.0, 18], [-3.3, 11.4]], panas: [[0, 30.6], [-2.1, 18.6], [-2.5, 10.4]] };
const PANAS_ON = [[1.5, 13.5], [5, 17], [9, 23]], CHUB_HOME = [[-3.9, 14.4], GATE, YARD, DOOR_OUT];
const TOP = [1.6, 33];
// the carollers before Chub's windows (chub#window), on the street by the fence, facing them (the star at the front);
// where each comes from up the street
const WINDOW = [-8.56, 15.1];
const SING = { parubok1: [-3.9, 12.0], odarka: [-3.6, 12.9], divchyna1: [-3.3, 13.7], parubok2: [-3.0, 11.1], divchyna2: [-2.7, 12.4],
  divchyna3: [-2.5, 13.4] };
const CAROLLERS = Object.keys(SING);
const COME = (id, i) => [[TOP[0] + (i % 2) * 0.7, TOP[1] + i * 0.6], [-1.2, 19.5 - (i % 3) * 0.8], SING[id]];
// Oksana out of the gate to them; Vakula down the street with the sacks to before her; the sack at his feet; the girls
// dragging it to the gate, walking backwards before it; Vakula off up the street
const OKSANA_AT = [-3.2, 15.6], VAKULA_AT = [-2.0, 14.7], SACK_AT = [-2.5, 15.05];
const VAKULA_COMES = [[5.0, 29.5], [1.0, 20.5], VAKULA_AT], VAKULA_OFF = [[-0.4, 20.5], [1.2, 30], [2.6, 46]];
const SACK_WAY = [SACK_AT, [-4.0, 14.6], GATE, YARD];

// ── the street when nothing has happened yet: the night, the moon up; nobody out ──
const away = (id, [a, d] = TOP) => ({ [`${id}_a`]: a, [`${id}_d`]: d, [`${id}_turn`]: 180, [`${id}_do`]: 'stand', [`${id}_look`]: null,
  [`${id}_reach`]: null, [`${id}_with`]: null, [`${id}_gait`]: null, [`${id}_wear`]: null, [`${id}_here`]: false });
const PEOPLE = ['chub_kozak', 'panas', 'vakula', 'oksana', ...CAROLLERS];
const START = { moon: 1, stars: 1, blizzard: 0, dawn: 0, morning: 0, windows: 1, sack: 0, sack_a: SACK_AT[0], sack_d: SACK_AT[1],
  camera_x: 0, camera_z: 0, camera_yaw: 0, camera_look: 0,
  ...Object.assign({}, ...PEOPLE.map((id) => away(id))) };

// ── the rows' helpers (as in Хата Чуба) ──
const till = (t) => [t, () => {}];
const act = (f, ends) => Object.assign(f, { ends });
const length = (m) => { const c = scene.kit.cast.motions?.[m]; return c ? c.n / c.fps : 0; };
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
// a motion done once where they stand, ending facing `turn`; held at its end after it
const once = (id, motion, turn) => {
  const end = (s) => turn ?? s[`${id}_turn`];
  const f = () => { const s = scene.state; P(id).go(motion, { from: [s[`${id}_a`], s[`${id}_d`]], turn: end(s) }); };
  f.ends = (s) => {
    const off = P(id).startOf(motion, end(s)) ?? { across: 0, distance: 0 };
    return { [`${id}_a`]: s[`${id}_a`] - off.across, [`${id}_d`]: s[`${id}_d`] - off.distance, [`${id}_turn`]: end(s),
      [`${id}_do`]: { motion, loop: false, from: 99 } };
  };
  return f;
};
// someone there now, where they are put — no steps there (they walk again when they next walk), with their keys
const appear = (id, [a, d], keys = {}) => act(() => {
  scene.set(`${id}_steps`, false);
  scene.set(`${id}_a`, a);
  scene.set(`${id}_d`, d);
  for (const [k, v] of Object.entries(keys)) scene.set(`${id}_${k}`, v);
  scene.set(`${id}_here`, true);
}, () => ({ [`${id}_a`]: a, [`${id}_d`]: d, ...Object.fromEntries(Object.entries(keys).map(([k, v]) => [`${id}_${k}`, v])), [`${id}_here`]: true }));

// ── the beats ──
const B = {
  // ---- Chapter I. The door opens: Chub and Kum Panas come out into the yard to go to the deacon's. Chub looks up — and
  // the moon goes out of the sky (the devil has stolen it). He throws up his arms; Panas waves it off; they go anyway,
  // out of the gate and up the dark street.
  chub_out: { rows: [
    [0, 'camera_z', 6], [0, 'camera_x', -1.5],
    [0, appear('chub_kozak', DOOR_OUT, { turn: toward(DOOR_OUT, GATE), do: 'stand' })],
    ...walk(0.4, 'chub_kozak', [YARD], 2.0, toward(YARD, OUT)),
    [1.1, appear('panas', DOOR, { turn: toward(DOOR, YARD), do: 'stand' })],
    ...walk(1.3, 'panas', [[-6.15, 16.55]], 1.6, toward(DOOR, OUT)),
    [2.8, 'chub_kozak_look', [-1, 60, 30]],
    [3.4, 'moon', 0, 3, 'inOut'], [3.6, 'panas_look', [-1, 60, 30]],
    [4.0, once('chub_kozak', 'sky_wonder')],
    [7.6, 'chub_kozak_look', 'panas'], [7.8, 'panas_look', 'chub_kozak'],
    [8.0, once('panas', 'wave_off', toward([-6.15, 16.55], YARD))],
    [10.2, 'chub_kozak_look', null], [10.2, 'panas_look', null],
    ...walk(10.4, 'chub_kozak', [GATE, OUT, ...UP], 15),
    ...walk(10.9, 'panas', [YARD, GATE, OUT, ...UP.map(([a, d]) => [a + 0.7, d + 0.6])], 15),
    [12, 'camera_z', 10, 10, 'inOut'], [12, 'camera_x', 0, 10, 'inOut'],
    [24.5, 'chub_kozak_here', false], [25.5, 'panas_here', false],
    till(26),
  ] },
  // ---- The blizzard. Down the street out of the snow-mist, bent against the wind, holding their faces: the two, lost.
  // They stop, look about — where are they? Panas goes on to the right, alone; Chub turns back to his own gate, home.
  lost: { rows: [
    [0, 'camera_z', 7.7], [0, 'camera_x', 2], [0, 'camera_yaw', -8], [1.5, 'camera_yaw', -55, 11, 'inOut'],
    [0, appear('chub_kozak', LOST.chub_kozak[0], { turn: 180, gait: 'blizzard_walk', do: 'stand' })],
    [0, appear('panas', LOST.panas[0], { turn: 180, gait: 'blizzard_walk', do: 'stand' })],
    ...walk(0.2, 'chub_kozak', LOST.chub_kozak.slice(1), 12, 180, 'linear'),
    ...walk(0.5, 'panas', LOST.panas.slice(1), 12, 180, 'linear'),
    [12.6, 'chub_kozak_turn', 260], [12.8, 'chub_kozak_look', [-9, 14, 1.5]],
    [13.0, 'panas_turn', 100], [13.2, 'panas_look', [12, 20, 1.5]],
    [14.8, 'chub_kozak_turn', 100], [14.8, 'chub_kozak_look', 'panas'], [15.0, 'panas_turn', 260], [15.0, 'panas_look', 'chub_kozak'],
    [15.6, once('panas', 'wave_off')],
    [17.6, 'panas_look', null], [17.6, 'chub_kozak_look', null],
    ...walk(17.8, 'panas', PANAS_ON, 9, null, 'linear'),
    ...walk(18.4, 'chub_kozak', CHUB_HOME, 8, toward(DOOR_OUT, DOOR)),
    [18.4, 'camera_yaw', -44, 7, 'inOut'],
    [26.6, 'panas_here', false],
    [26.8, 'chub_kozak_here', false],
    till(27.5),
  ] },
  // ---- The moon is back, the snow has stopped. The carollers come down the street — a lad with the star on its pole in
  // front — and stand under Chub's windows, and sing.
  kolyadka: { rows: [
    [0, 'camera_z', 6], [0, 'camera_x', 3], [0, 'camera_yaw', -6], [3, 'camera_yaw', -42, 9, 'inOut'],
    ...CAROLLERS.flatMap((id, i) => [
      [0, appear(id, COME(id, i)[0], { turn: 180, ...(id === 'parubok1' ? { with: ['zirka'], gait: 'star_walk' } : {}), do: 'stand' })],
      ...walk(0.3 + 0.35 * i, id, COME(id, i).slice(1), 10.5, toward(SING[id], WINDOW)),
      [11.4 + 0.3 * i, `${id}_look`, 'chub#window'],
      [11.6 + 0.3 * i, `${id}_do`, loop('sing')],
    ]),
    [13, 'camera_z', 8.5, 8, 'inOut'],
    till(22),
  ] },
  // ---- Oksana comes out to them. Down the street comes Vakula, bent under a sack, a small one in his other hand; he
  // throws the big one down before her, takes his hat off to her — farewell — and goes off up the street with the small
  // one, fast. They laugh after him; then the girls take the sack by its neck and drag it in at Chub's gate.
  farewell: { after: 'kolyadka', rows: [
    [0, appear('oksana', DOOR_OUT, { turn: toward(DOOR_OUT, GATE), do: 'stand' })],
    ...walk(0.3, 'oksana', [YARD, GATE, OKSANA_AT], 5.5, toward(OKSANA_AT, VAKULA_AT)),
    ...CAROLLERS.map((id, i) => [1.0 + 0.2 * i, `${id}_do`, 'stand']),
    ...CAROLLERS.map((id, i) => [1.2 + 0.2 * i, `${id}_look`, 'oksana']),
    [2.0, appear('vakula', VAKULA_COMES[0], { turn: 200, gait: 'carry_walk', with: ['sack_shoulder', 'sack_small'], do: loop('carry_stand') })],
    ...walk(2.2, 'vakula', VAKULA_COMES.slice(1), 9, toward(VAKULA_AT, OKSANA_AT)),
    ...CAROLLERS.map((id, i) => [6.5 + 0.15 * i, `${id}_look`, 'vakula']),
    [11.4, 'oksana_look', 'vakula'],
    [11.6, 'vakula_look', 'oksana'],
    [11.8, once('vakula', 'put_down')], [13.7, 'vakula_with', ['sack_small']], [13.7, 'sack', 1],
    [13.2, 'oksana_do', loop('laugh_rock')], [13.4, 'odarka_do', loop('laugh')],
    [15.0, once('vakula', 'bow')],
    [17.4, 'oksana_do', 'stand'],
    [18.4, 'vakula_gait', null], [18.4, 'vakula_look', null],
    ...walk(18.5, 'vakula', VAKULA_OFF, 9, null, 'linear'),
    [19.0, 'camera_yaw', -14, 5, 'inOut'], [24.0, 'camera_yaw', -42, 4, 'inOut'],
    ...CAROLLERS.map((id, i) => [19.2 + 0.1 * i, `${id}_do`, i % 2 ? loop('laugh_rock') : 'stand']),
    [19.4, 'oksana_look', 'vakula'],
    [27.5, 'vakula_here', false],
    [23.0, 'odarka_do', 'stand'], [23.0, 'divchyna1_do', 'stand'], [23.0, 'odarka_look', 'sack'], [23.0, 'divchyna1_look', 'sack'],
    ...walk(23.2, 'odarka', [[SACK_AT[0] - 0.4, SACK_AT[1] - 0.35]], 1.6, toward(SACK_AT, SACK_WAY[1]) + 180),
    ...walk(23.2, 'divchyna1', [[SACK_AT[0] - 0.4, SACK_AT[1] + 0.4]], 1.6, toward(SACK_AT, SACK_WAY[1]) + 180),
    [25.0, 'odarka_reach', { r: 'sack#neck', l: 'sack#neck' }], [25.0, 'divchyna1_reach', { r: 'sack#neck', l: 'sack#neck' }],
    [25.2, 'odarka_gait', 'drag_back'], [25.2, 'divchyna1_gait', 'drag_back'],
    [25.4, act(() => scene.path(['sack_a', 'sack_d'], [[scene.get('sack_a'), scene.get('sack_d')], ...SACK_WAY.slice(1)], { over: 8, ease: 'inOut' }),
      () => ({ sack_a: SACK_WAY.at(-1)[0], sack_d: SACK_WAY.at(-1)[1] }))],
    ...walk(25.4, 'odarka', SACK_WAY.slice(1).map(([a, d]) => [a - 0.55, d - 0.3]), 8),
    ...walk(25.4, 'divchyna1', SACK_WAY.slice(1).map(([a, d]) => [a - 0.55, d + 0.3]), 8),
    till(34),
  ] },
};

// ── what each beat begins at: the state after the beats that lead to it ──
const from = (name, make) => Object.defineProperty(B[name], 'from', { get: make, enumerable: true });
from('chub_out', () => START);
// (the moon stolen, the blizzard up)
from('lost', () => ({ ...START, moon: 0, blizzard: 1 }));
from('kolyadka', () => START);
from('farewell', () => settle(START, B.kolyadka.rows));
scene.kit.film.beats(scene, B, { film: ['chub_out', 'lost', 'kolyadka', 'farewell'] });
