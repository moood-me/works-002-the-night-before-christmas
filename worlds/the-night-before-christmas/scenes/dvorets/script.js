// The double doors open away into the rooms beyond as `doors` says: the left leaf turns on its hinge
// from 180 (shut) to 95, the right from 180 to 265 — `doors_l`, `doors_r` follow `doors` as it moves.
const OPEN = 85;
const turn = () => {
  const k = scene.get('doors') ?? 0;
  scene.set('doors_l', 180 - OPEN * k);
  scene.set('doors_r', 180 + OPEN * k);
};
scene.on('change', 'doors', turn);
scene.on('move', 'doors', turn);
turn();

// ── people (the engine's; the world's cast) — a film in beats (module film; notes.md lists them). The viewer of the world
// sees the cut `film`: Vakula brought in with the Zaporozhtsy; the Tsaritsa; the cherevichki. Their keys: <id>_a, <id>_d
// (metres; what they stand on is the scene's relief — the parquet, the dais's steps), _do, _turn, _look, _reach, _with,
// _gait, _steps, _here.
const P = (id) => scene.person(id);
const loop = (motion) => ({ motion, loop: true });
const toward = ([a, d], [a2, d2]) => ((((Math.atan2(a2 - a, d2 - d) * 180) / Math.PI) % 360) + 360) % 360;

// ── where (metres: across, distance) ──
// in past us (a few steps in already as the film starts); Vakula before the painting on the right wall; before the dais,
// where they kneel; through the doors from the rooms, the Tsaritsa to the top of the dais and Potyomkin beside her; where
// Potyomkin hands over the cherevichki
const IN = { zaporozhets1: [-1.0, 3.2], zaporozhets2: [0.2, 2.6], vakula: [1.0, 3.6] };
const KNEEL = { zaporozhets1: [-1.1, 36.2], zaporozhets2: [0.3, 36.4], vakula: [1.7, 36.9] };
const PAINTING = [5.6, 13.0];
const ROOMS = { tsaritsa: [0, 47.5], potemkin: [0.8, 48.2] }, TSARITSA_AT = [0, 41.6], POTEMKIN_AT = [1.7, 42.1];
const GIVE = [0.85, 38.3], TAKE = [1.65, 37.9];

// ── the hall before anyone comes: the candles lit, the doors shut, nobody in it ──
const PEOPLE = ['vakula', 'zaporozhets1', 'zaporozhets2', 'tsaritsa', 'potemkin'];
const away = (id, [a, d]) => ({ [`${id}_a`]: a, [`${id}_d`]: d, [`${id}_turn`]: 0, [`${id}_do`]: 'stand', [`${id}_look`]: null,
  [`${id}_reach`]: null, [`${id}_with`]: null, [`${id}_gait`]: null, [`${id}_here`]: false });
const START = { candles: 1, doors: 0, camera_target: null, camera_shot: 'full', camera_x: 0, camera_z: 0, camera_yaw: 0, camera_look: 0,
  ...away('vakula', IN.vakula), ...away('zaporozhets1', IN.zaporozhets1), ...away('zaporozhets2', IN.zaporozhets2),
  ...away('tsaritsa', ROOMS.tsaritsa), ...away('potemkin', ROOMS.potemkin) };

// ── the rows' helpers (as in Tchub's Hut) ──
const till = (t) => [t, () => {}];
const act = (f, ends) => Object.assign(f, { ends });
function settle(state, rows) {
  const out = { ...state };
  for (const [, k, v] of [...rows].sort((p, q) => p[0] - q[0])) {
    if (typeof k === 'function') Object.assign(out, k.ends?.(out));
    else out[k] = v;
  }
  return out;
}
const walk = (t, id, pts, over, turn, ease = 'inOut') => {
  const f = () => {
    const s = scene.state;
    scene.set(`${id}_steps`, true);
    scene.path([`${id}_a`, `${id}_d`], [[s[`${id}_a`], s[`${id}_d`]], ...pts], { over, ease });
  };
  f.ends = () => ({ [`${id}_a`]: pts.at(-1)[0], [`${id}_d`]: pts.at(-1)[1] });
  return [[t, f], ...(turn != null ? [[t + over, `${id}_turn`, turn]] : [])];
};
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
const appear = (id, [a, d], keys = {}) => act(() => {
  scene.set(`${id}_steps`, false);
  scene.set(`${id}_a`, a);
  scene.set(`${id}_d`, d);
  for (const [k, v] of Object.entries(keys)) scene.set(`${id}_${k}`, v);
  scene.set(`${id}_here`, true);
}, () => ({ [`${id}_a`]: a, [`${id}_d`]: d, ...Object.fromEntries(Object.entries(keys).map(([k, v]) => [`${id}_${k}`, v])), [`${id}_here`]: true }));

// ── the beats ──
const B = {
  // ---- In past us come the two Zaporozhtsy and Vakula among them, looking up at the chandeliers. The Zaporozhtsy go
  // on up the hall to before the dais; Vakula stops before the painting — the mother with the child — and stands lost.
  zala: { rows: [
    [0, 'camera_z', 8, 14, 'inOut'],
    ...['zaporozhets1', 'zaporozhets2', 'vakula'].map((id) => [0, appear(id, IN[id], { turn: 0, do: 'stand' })]),
    ...walk(0.2, 'zaporozhets1', [[-1.2, 12], KNEEL.zaporozhets1], 17, 0),
    ...walk(0.5, 'zaporozhets2', [[0.4, 12], KNEEL.zaporozhets2], 17, 0),
    ...walk(0.8, 'vakula', [[1.6, 8], PAINTING], 8, 90),
    [2.0, 'vakula_look', 'chandeliers#c1'], [2.6, 'zaporozhets2_look', 'chandeliers#c1'],
    [5.0, 'vakula_look', 'mirrors#m2'], [6.0, 'zaporozhets1_look', 'chandeliers#c2'],
    [8.6, 'vakula_look', 'painting#canvas'], [9.0, 'zaporozhets2_look', null], [10.0, 'zaporozhets1_look', null],
    [9.0, 'camera_x', 1.5, 4, 'inOut'], [9.0, 'camera_yaw', 30, 4, 'inOut'],
    till(18),
  ] },
  // ---- The doors open: the Tsaritsa comes in from the lit rooms with Potyomkin, to the top of the dais. The Zaporozhtsy
  // go down on their faces; Vakula hurries from the painting to them and kneels.
  tsaritsa: { rows: [
    [0, 'camera_z', 30, 6, 'inOut'], [0, 'camera_x', 0, 6, 'inOut'], [0, 'camera_yaw', 0, 3, 'inOut'],
    [0.5, 'doors', 1, 3, 'inOut'],
    [2.0, appear('tsaritsa', ROOMS.tsaritsa, { turn: 180, do: 'stand' })], [2.4, appear('potemkin', ROOMS.potemkin, { turn: 180, do: 'stand' })],
    ...walk(2.2, 'tsaritsa', [TSARITSA_AT], 6, 180),
    ...walk(2.6, 'potemkin', [POTEMKIN_AT], 6, 200),
    [3.0, 'zaporozhets1_look', 'tsaritsa'], [3.2, 'zaporozhets2_look', 'tsaritsa'], [1.0, 'vakula_look', 'tsaritsa'],
    ...walk(1.4, 'vakula', [[2.6, 24], KNEEL.vakula], 8, 0),
    [8.6, 'zaporozhets1_look', null], [8.6, once('zaporozhets1', 'prostrate', 0)],
    [8.9, 'zaporozhets2_look', null], [8.9, once('zaporozhets2', 'prostrate', 0)],
    [9.6, once('vakula', 'kneel_down', 0)], [9.8, 'tsaritsa_look', 'vakula'], [10.4, 'potemkin_do', loop('proud')],
    till(14),
  ] },
  // ---- Vakula on his knees asks for her cherevichki. She smiles, says a word with her hand; Potyomkin brings a pair from
  // the rooms and hands them down to him. Vakula up, the shoes in his hands — he looks at them, bows to her; the
  // Zaporozhtsy up off their faces.
  cherevichki: { after: 'tsaritsa', rows: [
    [0, 'camera_z', 32.5, 4, 'inOut'], [0, 'camera_x', 1.2, 4, 'inOut'],
    [3.0, 'camera_target', 'tsaritsa'], [3.0, 'camera_shot', 'full'], [3.0, 'camera_x', 0, 1.5, 'inOut'], [3.0, 'camera_z', 0, 1.5, 'inOut'],
    [9.4, 'camera_target', null], [9.4, 'camera_x', 3.5, 1.5, 'inOut'], [9.4, 'camera_z', 32.5, 1.5, 'inOut'], [9.4, 'camera_yaw', -22, 1.5, 'inOut'],
    [0, 'vakula_look', 'tsaritsa'], [0.4, 'vakula_do', loop('kneel_offer')],
    [3.4, once('tsaritsa', 'giggle', 180)],
    [5.2, once('tsaritsa', 'gracious', 180)], [5.4, 'potemkin_look', 'tsaritsa'], [6.0, 'potemkin_do', 'stand'],
    ...walk(6.6, 'potemkin', [[0.8, 44.6], ROOMS.potemkin], 4, null),
    [10.6, 'potemkin_with', ['cherevichki_r']],
    ...walk(11.0, 'potemkin', [[0.9, 44.6], [1.0, 40.6], GIVE], 6, toward(GIVE, TAKE)),
    [11.0, 'potemkin_look', null], [11.4, 'vakula_look', 'potemkin'],
    [14.0, once('vakula', 'stand_up', 0)],
    ...walk(16.6, 'vakula', [TAKE], 1.4, toward(TAKE, GIVE)),
    [17.2, 'potemkin_reach', { r: 'vakula#hands' }], [17.6, 'vakula_reach', { r: 'potemkin#hand_r', l: 'potemkin#hand_r' }],
    [18.6, 'potemkin_with', null], [18.6, 'vakula_with', ['cherevichki']], [18.7, 'vakula_reach', null], [18.8, 'potemkin_reach', null],
    [18.8, 'vakula_look', 'vakula#hands'], [18.9, 'vakula_do', loop('examine')],
    ...walk(19.4, 'potemkin', [POTEMKIN_AT], 3, 200),
    [21.0, once('zaporozhets1', 'bow_up', 0)], [21.3, once('zaporozhets2', 'bow_up', 0)],
    [22.6, 'vakula_turn', 0], [23.0, 'vakula_look', 'tsaritsa'], [23.4, once('vakula', 'bow', 0)],
    [25.2, once('zaporozhets1', 'stand_up', 0)], [25.6, once('zaporozhets2', 'stand_up', 0)],
    [24.0, once('tsaritsa', 'giggle', 180)],
    till(29),
  ] },
};

// ── what each beat begins at ──
const from = (name, make) => Object.defineProperty(B[name], 'from', { get: make, enumerable: true });
from('zala', () => START);
from('tsaritsa', () => settle(START, B.zala.rows));
from('cherevichki', () => settle(B.tsaritsa.from, B.tsaritsa.rows));
scene.kit.film.beats(scene, B, { film: ['zala', 'tsaritsa', 'cherevichki'] });
