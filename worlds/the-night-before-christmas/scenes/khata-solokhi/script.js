// The door turns on its hinge as `door` says: shut (0) faces the room, open (1) swung in toward the
// back wall — its angle, `door_turn`, follows `door` as it moves. A knock (`knock` counting up) jolts
// it in its frame: in a little, and it springs back.
const OPEN = 84;
const JOLT = 5;
const shut = () => 180 + OPEN * (scene.get('door') ?? 0);
const turn = () => scene.set('door_turn', shut());
scene.on('change', 'door', turn);
scene.on('move', 'door', turn);
scene.on('change', 'knock', (now, was) => {
  if ((now ?? 0) <= (was ?? 0)) return;
  scene.play([
    [0, 'door_turn', shut() + JOLT, 0.06, 'out'],
    ['+0', 'door_turn', shut(), 0.5, 'spring'],
  ]);
});
turn();

// The moon thrown into the stove (moon_up) floods the hut with its white light while it is in there,
// going up the flue: `flood`, the weight of the light's look, follows moon_up.
const { span } = scene.anim;
const flood = () => {
  const u = scene.get('moon_up') ?? 0;
  scene.set('flood', span(u, 0.36, 0.5) * (1 - span(u, 0.6, 0.95)));
};
scene.on('change', 'moon_up', flood);
scene.on('move', 'moon_up', flood);
flood();

// ── People: a film in beats (module film; notes.md lists them, scenes.md is the contract with the game) ──
// The people are the engine's (elements with "person", the world's cast): <id>_do, _turn, _look, _reach, _with, _on, _still,
// _here; where each is — <id>_a, <id>_d, <id>_e (metres of the world). The hut stands turned (its anchor `room`, facing 148):
// its places are written in its own axes (x along its front wall, z away from it, metres from the floor's middle) and
// turned into the world's here (W, T).
const P = (id) => scene.person(id);
const loop = (motion) => ({ motion, loop: true });
const ROOM = { a: 0.488, d: 3.371, facing: 148 };
const RX = [Math.cos(((180 - ROOM.facing) * Math.PI) / 180), Math.sin(((180 - ROOM.facing) * Math.PI) / 180)];
// a place of the hut [x, z] in the world [across, distance]; a turn in the hut (0 — away from its front wall) in the world's
const W = ([x, z]) => [ROOM.a + x * RX[0] - z * RX[1], ROOM.d + x * RX[1] + z * RX[0]];
const T = (turn) => (((turn - (180 - ROOM.facing)) % 360) + 360) % 360;
// the way from one point of the world to another, in degrees (as <id>_turn)
const toward = ([a, d], [a2, d2]) => ((((Math.atan2(a2 - a, d2 - d) * 180) / Math.PI) % 360) + 360) % 360;

// ── where things are (the hut's metres: lib.js AT, scene.json) ──
// before the stove's mouth, where Solokha comes out of it; where the devil tumbles out from; where they stand after
const MOUTH = W([0.45, -0.35]), CHUTE = W([0.75, 0.25]), BY_STOVE = W([0.15, -0.55]), DEVIL_AT = W([0.75, -0.75]);
// the three sacks, and before each (toward the eye: who works at it stands there), and behind (who goes into it is there,
// the sack before him)
const SACK = [null, [-0.55, 0], [-1, 0.5], [-0.7, 1.2]];
const EYE = [-2.2, -2.6];
const away = (n, k) => { const [x, z] = SACK[n], dx = x - EYE[0], dz = z - EYE[1], l = Math.hypot(dx, dz); return W([x + (dx / l) * k, z + (dz / l) * k]); };
const AT_SACK = (n) => away(n, -0.55), IN_SACK = (n) => away(n, 0.12);
const BESIDE = (n) => { const [x, z] = SACK[n], dx = x - EYE[0], dz = z - EYE[1], l = Math.hypot(dx, dz); return W([x + (dz / l) * 0.5 - (dx / l) * 0.15, z - (dx / l) * 0.5 - (dz / l) * 0.15]); };
// the bench along the left wall (its seat 0.45 m), the table before it; the stool across from it (0.42 m)
const SEAT = { golova: W([-2.85, 0.2]), chub: W([-2.85, 0.75]), vakula: W([-2.85, 1.4]) }, BENCH_H = 0.45, FACING_BENCH = T(90);
const STOOL = W([-1.45, 0.75]), STOOL_H = 0.42, FACING_STOOL = T(270);
// the dyak, standing by the table's far end, his neck out to her; the door in the right wall: inside it, out in the yard
const DYAK_AT = W([-1.85, 1.75]), IN = W([2.3, 0.75]), OUT = W([3.75, 0.75]), YARD_FAR = W([6, -1]);
// the guests by their names in the sacks (lib.js WHO, in1…in3)
const NAME = { chort: 'devil', golova: 'head', dyak: 'dyak', chub: 'chub' }, WHO = [null, 'chort', 'golova', 'dyak', 'chub'];
const HOME = { chort: [DEVIL_AT, T(220)], golova: [SEAT.golova, FACING_BENCH], dyak: [DYAK_AT, toward(DYAK_AT, BY_STOVE)], chub: [SEAT.chub, FACING_BENCH] };

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
const walk = (t, id, pts, over, turn, ease = 'inOut') => {
  const f = () => {
    const s = scene.state;
    scene.set(`${id}_steps`, true);
    scene.path([`${id}_a`, `${id}_d`], [[s[`${id}_a`], s[`${id}_d`]], ...pts], { over, ease });
  };
  f.ends = () => ({ [`${id}_a`]: pts.at(-1)[0], [`${id}_d`]: pts.at(-1)[1] });
  return [[t, f], ...(turn != null ? [[t + over, `${id}_turn`, turn]] : [])];
};
// a motion done once, ending facing `turn` (or beginning facing `start`: one that turns them), begun where they are — or
// ending at `to`
const once = (id, motion, turn, to, start) => {
  const end = (s) => (start != null ? start - (P(id).startOf(motion, 0)?.turn ?? 0) : turn ?? s[`${id}_turn`]);
  const f = () => { const s = scene.state; P(id).go(motion, { ...(to ? { to } : { from: [s[`${id}_a`], s[`${id}_d`]] }), turn: end(s) }); };
  f.ends = (s) => {
    const off = to ? { across: 0, distance: 0 } : P(id).startOf(motion, end(s)) ?? { across: 0, distance: 0 };
    const [a, d] = to ?? [s[`${id}_a`], s[`${id}_d`]];
    return { [`${id}_a`]: a - off.across, [`${id}_d`]: d - off.distance, [`${id}_turn`]: end(s), [`${id}_do`]: { motion, loop: false, from: 99 } };
  };
  return f;
};
// someone there now, where they are put — moved as they are, no steps — with their keys
function appear(id, [a, d], keys = {}) {
  scene.set(`${id}_steps`, false);
  scene.set(`${id}_a`, a);
  scene.set(`${id}_d`, d);
  for (const [k, v] of Object.entries(keys)) scene.set(`${id}_${k}`, v);
  scene.set(`${id}_here`, true);
}
// sat down onto a seat (the bench, the stool: its height): the sitting down done once onto it, then on it
const sitOn = (id, at, h, turn, seated) => act(() => {
  const wait = P(id).go('sit_down', { to: at, turn }) ?? 0;
  scene.after(wait + length('sit_down'), () => { scene.set(`${id}_on`, [...at, h]); scene.set(`${id}_do`, loop(seated)); });
}, () => ({ [`${id}_a`]: at[0], [`${id}_d`]: at[1], [`${id}_turn`]: turn, [`${id}_on`]: [...at, h], [`${id}_do`]: loop(seated) }));
const rise = (id, motion = 'rise') => act(() => { scene.set(`${id}_on`, null); P(id).go(motion, { from: [scene.get(`${id}_a`), scene.get(`${id}_d`)], turn: scene.get(`${id}_turn`) }); },
  (s) => ({ [`${id}_on`]: null, ...once(id, motion, s[`${id}_turn`]).ends(s) }));
// out of a sack (crawl_up, done once from behind it), seen once the motion has them
function crawlOut(id, at, turn) {
  scene.set(`${id}_steps`, false);
  scene.set(`${id}_e`, 0);
  scene.set(`${id}_a`, at[0]);
  scene.set(`${id}_d`, at[1]);
  const wait = P(id).go('crawl_up', { from: at, turn }) ?? 0;
  scene.after(wait + 0.4, () => scene.set(`${id}_here`, true));
}

// ── the game's keys, turned into what the people do ──
// who, stuff, in1…in3, <guest>_present: who is in which sack (not there); who is being stuffed into one (huddled in its
// open neck, behind it, going down into it as `stuff` grows, Solokha beside it pushing him down); the rest, if present —
// where they stay in the hut
// (into a sack: huddled down into its open neck as `stuff` goes, by SINK a stuff; past IN_AT the sack has all of him)
const SINK = 0.7, IN_AT = 0.6;
const sackOf = (s, g) => [1, 2, 3].find((n) => String(s[`in${n}`] ?? '').split('+').includes(NAME[g])) ?? 0;
function hiding() {
  const s = scene.state, going = WHO[s.who ?? 0], stuff = Math.max(0, Math.min(1, s.stuff ?? 1));
  for (const g of ['chort', 'golova', 'dyak', 'chub']) {
    const n = sackOf(s, g), names = n ? String(s[`in${n}`]).split('+') : [];
    if (n && g === going && names.at(-1) === NAME[g] && stuff < 1) {
      const [a, d] = IN_SACK(n);
      scene.set(`${g}_steps`, false);
      scene.set(`${g}_a`, a);
      scene.set(`${g}_d`, d);
      scene.set(`${g}_e`, -Math.min(stuff, IN_AT) * SINK);
      scene.set(`${g}_on`, null);
      scene.set(`${g}_do`, loop('huddle'));
      scene.set(`${g}_turn`, toward([a, d], W(EYE)));
      scene.set(`${g}_here`, stuff < IN_AT);
      const [ba, bd] = BESIDE(n);
      scene.set('solokha_on', null);
      scene.set('solokha_still', false);
      scene.set('solokha_do', 'stand');
      scene.set('solokha_a', ba);
      scene.set('solokha_d', bd);
      scene.set('solokha_turn', toward([ba, bd], [a, d]));
      scene.set('solokha_reach', { r: `${g}#head`, l: `${g}#shoulder_r` });
    } else if (n) {
      scene.set(`${g}_here`, false);
      scene.set(`${g}_e`, 0);
    }
  }
  if (!going || stuff >= 1) scene.set('solokha_reach', null);
}
for (const k of ['who', 'stuff', 'in1', 'in2', 'in3']) { scene.on('change', k, hiding); scene.on('move', k, hiding); }
// <guest>_present: in the hut, where they stay (sat at the table, the dyak by it) — come in at once (a game's cut between
// beats); 0 — gone (or in a sack)
const present = (g, v) => {
  if (!v) { scene.set(`${g}_here`, false); return; }
  if (sackOf(scene.state, g)) return;
  const [at, turn] = HOME[g], seat = SEAT[g];
  appear(g, at, { turn, e: 0, on: seat ? [...seat, BENCH_H] : null, do: seat ? loop(g === 'golova' ? 'belly_seated' : 'talk_table') : 'stand' });
};
for (const [k, g] of [['head_present', 'golova'], ['dyak_present', 'dyak'], ['chub_present', 'chub']]) scene.on('change', k, (v) => present(g, v));
scene.on('change', 'vakula_present', (v) => (v ? appear('vakula', W([1.6, 0.3]), { turn: toward(W([1.6, 0.3]), AT_SACK(2)) }) : scene.set('vakula_here', false)));
// moon_held, moon_hand, heat, moon_up: the moon in Solokha's hands — in one or the other (between: in the air); hot — she
// tosses it from hand to hand, blowing on her fingers; thrown into the stove's mouth
function moonInHands() {
  const s = scene.state, held = (s.moon_held ?? 0) > 0.5 && (s.moon_up ?? 0) < 0.05, h = s.moon_hand ?? 1;
  scene.set('solokha_with', held ? (h > 0.35 ? ['moon'] : h < -0.35 ? ['moon_l'] : null) : null);
  if (held) scene.set('solokha_do', (s.heat ?? 0) > 0.4 ? loop('juggle') : 'stand');
  if (held) scene.set('solokha_look', 'solokha#hands');
}
for (const k of ['moon_held', 'moon_hand', 'heat']) { scene.on('change', k, moonInHands); scene.on('move', k, moonInHands); }
scene.on('change', 'moon_up', (v, was) => {
  if ((v ?? 0) > 0 && !(was > 0)) { P('solokha').turn(toward([scene.get('solokha_a'), scene.get('solokha_d')], MOUTH), 0.3); scene.set('solokha_do', 'throw'); scene.set('solokha_look', 'stove#mouth'); }
  moonInHands();
});
// lift, which: Vakula at sack `which`; past a little — he heaves it up onto his shoulder (lift_sack, once), and holds it
// there (carry_stand); let go of — he puts it down again
function lifting() {
  const s = scene.state, n = s.which ?? 1, k = s.lift ?? 0, carried = String(s.carried ?? '').split('+').filter(Boolean);
  const up = carried.includes(String(n));
  if (k > 0.2 && !up) {
    scene.set('carried', [...carried, String(n)].join('+'));
    P('vakula').go('lift_sack', { from: AT_SACK(n), turn: toward(AT_SACK(n), W(SACK[n])) });
    scene.after(length('lift_sack') * 0.6, () => scene.set('vakula_with', ['sack_shoulder']));
    scene.after(length('lift_sack'), () => scene.set('vakula_do', loop('carry_stand')));
  } else if (k < 0.1 && up) {
    scene.set('vakula_do', 'put_down');
    scene.after(1.2, () => { scene.set('vakula_with', null); scene.set('carried', carried.filter((c) => c !== String(n)).join('+')); });
  }
}
scene.on('change', 'lift', lifting);
scene.on('move', 'lift', lifting);

// the camera: turned to the bench and the table at the left wall (who sits there); back as it starts
const byTable = (t, over = 2) => [[t, 'camera_yaw', -18, over, 'inOut']];
const straight = (t, over = 2) => [[t, 'camera_yaw', 0, over, 'inOut']];
// a point `k` metres from a toward b; `k` metres ahead of a point, facing `turn`
const towardBy = ([a, d], [a2, d2], k) => { const l = Math.hypot(a2 - a, d2 - d) || 1; return [a + ((a2 - a) / l) * k, d + ((d2 - d) / l) * k]; };
const ahead = ([a, d], turn, k) => [a + k * Math.sin((turn * Math.PI) / 180), d + k * Math.cos((turn * Math.PI) / 180)];
// where the devil stands before her to kiss her hand
const BEFORE_HER = () => ahead(MOUTH, T(230), 0.62);
// the guests not hidden now, the one who came last first (the order they come in: the devil, the head, the deacon, Chub)
const ORDER = ['chub', 'dyak', 'golova', 'chort'];
const meeting = (s = scene.state) => ORDER.filter((g) => s[`${g}_here`] && !sackOf(s, g)).slice(0, 2);
// turned to another, a bow
function bowTo(g, h) {
  if (!g || !h) return;
  scene.set(`${g}_still`, false);
  P(g).turn(toward([scene.get(`${g}_a`), scene.get(`${g}_d`)], [scene.get(`${h}_a`), scene.get(`${h}_d`)]), 0.5);
  scene.after(0.5, () => scene.set(`${g}_do`, 'bow'));
}
// the canonical hiding (the story's: the devil into the first sack, the head into the second, the deacon into the third,
// Chub into the deacon's): who is hidden now, and where
const STASH = { chort: 1, golova: 2, dyak: 3, chub: 3 };
const nextHidden = (s) => meeting(s)[0];
const stashed = (s) => {
  const g = nextHidden(s);
  if (!g) return {};
  const n = STASH[g], before = String(s[`in${n}`] ?? '');
  return { g, n, who: WHO.indexOf(g), names: before ? `${before}+${NAME[g]}` : NAME[g] };
};
// all out of the sacks: who is in each crawls out from behind it, they stand a moment, then go out of the door one after
// another, past Solokha; the sacks empty
function untieAll() {
  const s = scene.state, out = [];
  scene.set('vakula_do', 'put_down');
  [1, 2, 3].forEach((n) => String(s[`in${n}`] ?? '').split('+').filter(Boolean).forEach((name, i) => {
    const g = Object.keys(NAME).find((k) => NAME[k] === name);
    if (!g || g === 'chort') return;
    out.push(g);
    const t = 1.2 + 1.4 * out.length;
    scene.after(t - 0.2, () => scene.set(`in${n}`, String(scene.get(`in${n}`) ?? '').split('+').filter((x) => x !== name).join('+')));
    scene.after(t, () => crawlOut(g, away(n, 0.12 + 0.3 * i), toward(IN_SACK(n), W(EYE))));
  }));
  out.forEach((g, i) => {
    scene.after(7 + 0.9 * i, () => { scene.set(`${g}_look`, 'door'); scene.set(`${g}_gait`, g === 'dyak' ? 'tiptoe' : null); });
    scene.after(7.4 + 0.9 * i, () => { scene.set(`${g}_steps`, true); scene.path([`${g}_a`, `${g}_d`], [[scene.get(`${g}_a`), scene.get(`${g}_d`)], W([1.2, -0.6]), IN, OUT], { over: 3.2, ease: 'inOut' }); });
    scene.after(10.8 + 0.9 * i, () => scene.set(`${g}_here`, false));
  });
  scene.after(6.8, () => scene.set('door', 1, 0.9, 'out'));
  scene.after(13.2, () => scene.set('door', 0, 1.2, 'in'));
  scene.after(4, () => scene.set('vakula_look', out[0] ?? null));
}
const untieEnds = (s) => ({ in1: String(s.in1 ?? '').split('+').includes('devil') ? 'devil' : '', in2: '', in3: '',
  ...Object.assign({}, ...['golova', 'dyak', 'chub'].map((g) => ({ [`${g}_here`]: false, [`${g}_e`]: 0 }))), carried: '' });

// ── the scene's state when nothing has happened yet: the night, the hut empty, the lamp lit ──
const gone = (id, at = OUT) => ({ [`${id}_a`]: at[0], [`${id}_d`]: at[1], [`${id}_e`]: 0, [`${id}_turn`]: 180, [`${id}_do`]: 'stand', [`${id}_look`]: null,
  [`${id}_reach`]: null, [`${id}_with`]: null, [`${id}_on`]: null, [`${id}_still`]: false, [`${id}_gait`]: null, [`${id}_here`]: false });
const START = {
  lamp: 1, moon: 0, blizzard: 0.6, door: 0, knock: 0, soot: 0, who: 0, stuff: 1, in1: '', in2: '', in3: '', moon_floor: 0, moon_held: 0, moon_up: 0,
  moon_hand: 1, heat: 0, which: 1, wriggle: 0, sneeze: 0, lift: 0, carried: '', head_present: 0, dyak_present: 0, chub_present: 0, vakula_present: 0,
  camera_target: null, camera_shot: 'full', camera_yaw: 0,
  ...gone('solokha', MOUTH), ...gone('chort', CHUTE), ...gone('golova'), ...gone('dyak'), ...gone('chub'), ...gone('vakula'),
};

// ── the beats ──
const B = {
  // ---- Night. Out of the stove's mouth, in a cloud of soot, Solokha; she brushes herself down; after her, head over heels,
  // the devil, who sneezes
  chimney: { rows: [
    [0.3, 'soot', 0.3, 0.5, 'out'],
    [0.6, act(() => appear('solokha', MOUTH, { turn: T(230) }), () => ({ solokha_here: true, solokha_a: MOUTH[0], solokha_d: MOUTH[1], solokha_turn: T(230) }))],
    [1.0, 'soot', 1, 6, 'linear'],
    [1.8, 'solokha_do', 'shake_snow'],
    [3.0, act(() => { appear('chort', CHUTE, { turn: T(180) }); P('chort').go('roll', { from: CHUTE, turn: T(180) }); },
      (s) => ({ chort_here: true, ...once('chort', 'roll', T(180)).ends({ ...s, chort_a: CHUTE[0], chort_d: CHUTE[1] }) }))],
    [4.4, 'solokha_look', 'chort'],
    [6.8, 'chort_do', 'sneeze'],
    [8.0, 'chort_look', 'solokha'],
    [8.6, 'solokha_do', loop('laugh')],
    till(10),
  ] },
  // ---- The devil kisses her hand «с такими ужимками, как заседатель у попадьи», bows and scrapes; she laughs and flicks
  // him on the snout
  court: { after: 'chimney', rows: [
    [0, 'solokha_do', 'stand'],
    ...walk(0.2, 'chort', [BEFORE_HER()], 1.0, toward(BEFORE_HER(), MOUTH)),
    [0.6, 'solokha_turn', toward(MOUTH, BEFORE_HER())],
    [1.2, 'solokha_reach', { r: [...towardBy(MOUTH, BEFORE_HER(), 0.35), 1.0] }],
    [1.3, 'chort_do', 'kiss_hand'], [1.3, 'chort_look', 'solokha#hand_r'],
    [5.0, 'solokha_reach', null], [5.0, 'solokha_do', loop('laugh')],
    [6.0, 'solokha_reach', { r: 'chort#head' }], [6.4, 'solokha_reach', null],
    [6.0, 'chort_look', 'solokha'],
    till(8),
  ] },
  // ---- A knock: they freeze where they are, as they are, and look at the door; it shakes in its frame
  knock: { after: ['court', 'guest_head', 'guest_dyak', 'seen', 'talk'], rows: [
    [0, 'knock', 0], [0.05, 'knock', 1], ...straight(0, 1.2), [0.6, 'knock', 2], [1.2, 'knock', 3],
    [0.15, act(() => ['solokha', ...ORDER].forEach((g) => scene.get(`${g}_here`) && (scene.set(`${g}_still`, true), scene.set(`${g}_look`, 'door'))), () => ({}))],
    till(2),
  ] },
  // ---- The game's «Мешки»: who goes into which sack (who, stuff, in1…in3), the door (door) — Solokha at the sacks
  hide: { after: 'knock', rows: [
    [0, act(() => ['solokha', ...ORDER].forEach((g) => scene.set(`${g}_still`, false)), (s) => Object.assign({}, ...['solokha', ...ORDER].map((g) => ({ [`${g}_still`]: false }))))],
    [0.2, 'solokha_look', 'sack1'], [0.3, 'chort_look', 'solokha'],
    till(1),
  ] },
  // ---- (the world's own cut — the game plays «Мешки» itself) The last to come is hidden as the story hides them: Solokha
  // stuffs him into his sack, all of him, and ties it
  stuffed: { after: ['hide', 'knock'], rows: [
    [0, act(() => { const h = stashed(scene.state); if (!h.g) return; scene.set(`${h.g}_look`, null); scene.set(`${h.g}_on`, null); scene.set('stuff', 0);
      scene.set(`in${h.n}`, h.names); scene.set('who', h.who); scene.set('stuff', 1, 2.6, 'inOut'); scene.after(2.8, () => scene.set('who', 0)); },
      (s) => { const h = stashed(s); if (!h.g) return {}; const [ba, bd] = BESIDE(h.n);
        return { [`in${h.n}`]: h.names, who: 0, stuff: 1, [`${h.g}_here`]: false, [`${h.g}_e`]: 0, [`${h.g}_on`]: null, solokha_reach: null, solokha_on: null,
          solokha_do: 'stand', solokha_still: false, solokha_a: ba, solokha_d: bd }; })],
    till(3.4),
  ] },
  // ---- The moon rolls out of the devil's pocket (the game's moon_floor, moon_held, moon_hand, heat, moon_up)
  moon_out: { after: 'hide', rows: [
    [0, 'solokha_look', 'moon_in#moon'],
    till(1),
  ] },
  // ---- In comes the head: fat, a kozhukh, a big hat; he knocks the snow off, sits down at the table, strokes his belly —
  // «Ох, Солоха, какая метель!»
  guest_head: { after: ['hide', 'moon_out', 'stuffed'], rows: [
    [0, 'door', 1, 0.9, 'out'],
    [0.2, act(() => appear('golova', OUT, { turn: toward(OUT, IN), gait: 'waddle', on: null, e: 0 }), () => ({ golova_here: true }))],
    ...walk(0.4, 'golova', [IN], 1.8, toward(IN, BY_STOVE)),
    [2.4, 'golova_do', 'shake_snow'], [2.2, 'door', 0, 1.4, 'in'],
    [2.2, 'solokha_look', 'golova'],
    [4.6, sitOn('golova', SEAT.golova, BENCH_H, FACING_BENCH, 'belly_seated')], ...byTable(4.0, 2.5),
    [6.5, 'golova_look', 'solokha'],
    till(9.5),
  ] },
  // ---- In comes the deacon: long, thin, in a long kaftan; he coughs into his fist and stretches his neck out to her —
  // «А что это у вас, несравненная Солоха?»
  guest_dyak: { after: ['hide', 'moon_out', 'stuffed'], rows: [
    [0, 'door', 1, 0.9, 'out'],
    [0.2, act(() => appear('dyak', OUT, { turn: toward(OUT, IN), on: null, e: 0 }), () => ({ dyak_here: true }))],
    ...walk(0.4, 'dyak', [IN, W([0.6, -0.4])], 2.6, null),
    [2.6, 'door', 0, 1.4, 'in'],
    [3.0, act(() => P('dyak').turn(toward(W([0.6, -0.4]), [scene.get('solokha_a'), scene.get('solokha_d')]), 0.6), (s) => ({ dyak_turn: toward(W([0.6, -0.4]), [s.solokha_a, s.solokha_d]) }))],
    [3.4, 'dyak_do', 'cough'], [3.4, 'dyak_look', 'solokha'], [2.4, 'solokha_look', 'dyak'],
    till(8),
  ] },
  // ---- In comes Chub, snow on his moustaches; down he sits, heavily, at the table
  guest_chub: { after: ['hide', 'moon_out', 'stuffed'], rows: [
    [0, 'door', 1, 0.9, 'out'],
    [0.2, act(() => appear('chub', OUT, { turn: toward(OUT, IN), gait: 'waddle', on: null, e: 0 }), () => ({ chub_here: true }))],
    ...walk(0.4, 'chub', [IN], 1.8, null),
    [2.2, 'door', 0, 1.4, 'in'], [2.2, 'solokha_look', 'chub'],
    [2.6, 'chub_do', 'shake_snow'],
    [4.8, sitOn('chub', SEAT.chub, BENCH_H, FACING_BENCH, 'talk_table')], ...byTable(4.2, 2.5),
    [7.6, 'chub_look', 'solokha'],
    till(9.5),
  ] },
  // ---- The one who came in sees the one not hidden: both stand stock still — and bow to each other; Solokha smiles
  seen: { after: ['guest_head', 'guest_dyak', 'guest_chub'], rows: [
    [0, act(() => meeting().forEach((g) => { scene.set(`${g}_on`, null); scene.set(`${g}_still`, true); }), (s) => Object.assign({}, ...meeting(s).map((g) => ({ [`${g}_on`]: null }))))],
    [1.2, act(() => { const [a, b] = meeting(); bowTo(a, b); bowTo(b, a); }, () => ({}))],
    [2.2, 'solokha_do', loop('laugh')],
    till(5.5),
  ] },
  // ---- Chub at the table, Solokha on the stool across from him — «Твой кузнец к моей Оксане повадился…»
  talk: { after: ['guest_chub', 'seen'], rows: [
    [0, 'solokha_look', null], [0, 'solokha_do', 'stand'], [0, 'solokha_reach', null],
    [0.3, sitOn('solokha', STOOL, STOOL_H, FACING_STOOL, 'sit_tease')], ...byTable(0),
    [4.0, 'solokha_look', 'chub'], [4.0, 'chub_look', 'solokha'],
    till(5),
  ] },
  // ---- In comes Vakula, scowling; sits down, gets up again, looks at the sacks — «Мать нанесла мешков — уберу к празднику»
  vakula_in: { after: ['hide', 'stuffed', 'talk'], rows: [
    [0, 'door', 1, 0.9, 'out'], [0, 'solokha_on', null], [0, 'solokha_reach', null], [0, 'solokha_do', 'stand'],
    ...walk(0.4, 'solokha', [BY_STOVE], 1.6, toward(BY_STOVE, IN)), [1.2, 'solokha_look', 'vakula'],
    [0.2, act(() => appear('vakula', OUT, { turn: toward(OUT, IN) }), () => ({ vakula_here: true }))],
    ...walk(0.4, 'vakula', [IN], 1.6, null),
    [2.0, 'door', 0, 1.4, 'in'],
    [2.2, sitOn('vakula', STOOL, STOOL_H, T(150), 'cap_seated')],
    [8.6, rise('vakula', 'jump_up')],
    [9.8, 'vakula_look', 'sack2'],
    till(11),
  ] },
  // ---- The game's «Тяжело»: lift (which sack to his shoulder), wriggle, sneeze
  lift: { after: 'vakula_in', rows: [
    ...walk(0, 'vakula', [AT_SACK(2)], 1.4, toward(AT_SACK(2), W(SACK[2]))),
    [1.0, 'vakula_look', 'sack2'],
    till(1.6),
  ] },
  // ---- He unties the sacks: out of one Chub and the deacon, out of the other the head; silence; one after another they go
  // out of the door, past Solokha — «Ты, кузнец, ничего не видел»
  untie: { after: ['lift', 'vakula_in'], rows: [
    [0, act(untieAll, (s) => untieEnds(s))],
    till(14),
  ] },
  // ---- He heaves the sacks onto his shoulders and goes out with them
  carry: { after: ['lift', 'vakula_in'], rows: [
    ...walk(0, 'vakula', [AT_SACK(1)], 1.0, toward(AT_SACK(1), W(SACK[1]))),
    [1.0, 'vakula_do', 'lift_sack'], [2.6, 'carried', '1+2+3'], [2.6, 'vakula_with', ['sack_shoulder', 'sack_small']],
    [3.6, 'vakula_gait', 'carry_walk'], [3.4, 'door', 1, 0.9, 'out'],
    ...walk(3.6, 'vakula', [IN, OUT, YARD_FAR], 3.4, null, 'in'),
    [7.0, 'vakula_here', false], [6.4, 'door', 0, 1.2, 'in'],
    till(7.4),
  ] },
};

// ── what each beat begins at: the state after the beats that lead to it (the canonical way there) ──
const chain = (start, ...names) => names.reduce((st, n) => settle(st, B[n].rows), start);
const from = (name, make) => Object.defineProperty(B[name], 'from', { get: make, enumerable: true });
const WAY = ['chimney', 'court', 'knock', 'hide', 'stuffed', 'guest_head', 'knock', 'hide', 'stuffed', 'guest_dyak', 'knock', 'hide', 'stuffed',
  'guest_chub', 'talk', 'knock', 'hide', 'stuffed', 'vakula_in', 'lift', 'carry'];
// (the state where `name` first comes on that way)
const upTo = (name) => chain(START, ...WAY.slice(0, WAY.indexOf(name)));
for (const n of ['chimney', 'court', 'knock', 'hide', 'stuffed', 'guest_head', 'guest_dyak', 'guest_chub', 'talk', 'vakula_in', 'lift', 'carry']) from(n, () => upTo(n));
from('moon_out', () => upTo('guest_head'));
from('seen', () => ({ ...upTo('guest_dyak'), ...settle(upTo('guest_dyak'), B.guest_dyak.rows), in2: '', golova_here: true,
  ...(() => { const [at, turn] = HOME.golova; return { golova_a: at[0], golova_d: at[1], golova_turn: turn, golova_on: [...SEAT.golova, BENCH_H], golova_do: loop('belly_seated') }; })() }));
from('untie', () => upTo('lift'));
scene.kit.film.beats(scene, B, { film: WAY });
