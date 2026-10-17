// The people of "The Night Before Christmas" as people in a scene (the engine's people.js: an element with "person"): who
// they are — figures of shapes in this world's style, faceted like its huts and lit by its light (the lamp, the stove,
// the moon on the snow) — and how they move: the motions in cast.data.json (Kimodo's, put there with put_motion).
// cast.md says who is who and what each motion is.
const c4 = (h, a = 1) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255, a];
const FLEECE = c4('#e8dfcf'), BRASS = c4('#b08a3e'), SILVER = c4('#c9d2dc'), GOLD = c4('#d9a93a');
const m_ = F => F.fit.h / 1.76;

// a ring round the trunk between the pelvis and the waist (a belt, a sash): its sections' centre, sides, half-widths
function sash(F, color, off = 1.16, wide = 0.035) {
  const V = MooodShapes.V;
  const trunk = F.trunk(off), u = F.up('Hips');
  const mid = (a, b, k) => a.map((v, i) => (typeof v === 'number' ? v + (b[i] - v) * k : V.mix(v, b[i], k)));
  const s = mid(trunk[1], trunk[2], 0.55), n = 24;
  const ring = dy => F.ringOf([V.add(s[0], V.mul(u, dy * m_(F))), s[1], s[2], s[3], s[4]], n, 2.4);
  F.rings([ring(-wide), ring(wide)], color, null, null);
}
// a fleece collar round the neck, lying on the shoulders (a sheepskin coat's)
function collar(F, color = FLEECE) {
  const V = MooodShapes.V;
  const k = F.k, uc = F.up('Chest'), c = V.add(F.P('Neck1'), V.mul(uc, -0.01 * F.fit.h)), sd = F.side('Chest'), fc = F.fwd('Chest');
  F.ball(c, [sd, uc, fc], [0.115 * k, 0.04 * k, 0.085 * k], color, F.sides);
}
// a hat as a squat cylinder on the crown: its middle up from the head's centre, its half-height, its radius, its top's
// colour (a lambskin hat's cloth top)
function tallHat(F, rise, half, rad, top) {
  const V = MooodShapes.V;
  const { at, axes: [hs, hu, hf], r } = F.head, tilt = V.unit(V.add(hu, V.mul(hf, -0.12))), ax = [hs, tilt, V.cross(hs, tilt)];
  const c = V.add(at, V.mul(tilt, r * rise));
  F.ball(c, ax, [r * rad, r * half, r * rad * 0.96], F.colors.hat, F.head.sides, 3.2);
  if (top) F.ball(V.add(c, V.mul(tilt, r * half * 0.86)), ax, [r * rad * 0.8, r * 0.08, r * rad * 0.78], top, F.head.sides, 2);
}
// a kerchief over the hair, tied under the chin (girls in the frost) — or at the nape (a married woman's over her cap)
function kerchief(F, chin) {
  const V = MooodShapes.V;
  const { at, axes, egg, r, out, sides, square } = F.head, [hs, hu, hf] = axes;
  F.cap(at, axes, egg.map(e => e * r * out * 1.1), [0, 0.6, -0.8], chin ? -0.62 : -0.1, F.colors.hat, sides, square);
  const knot = chin ? V.add(at, V.add(V.mul(hu, -r * 0.98), V.mul(hf, r * 0.32))) : V.add(at, V.add(V.mul(hu, -r * 0.4), V.mul(hf, -r * 1.02)));
  F.ball(knot, axes, [r * 0.2, r * 0.15, r * 0.14], F.colors.hat, 8);
  // (its corner down the back)
  const back = V.add(at, V.add(V.mul(hu, -r * 0.2), V.mul(hf, -r * 1.0)));
  F.tube([back, F.clear(V.add(back, V.mul(F.up('Chest'), -r * 1.5)), -1, r * 0.25)], [[0, r * 0.55], [1, r * 0.05]], [[0, F.colors.hat]], 6, hs, 0.25);
}
// a thing held between the hands, its middle between them a little before the palms, turned square to the chest
function between(F, toward = 0.04) {
  const V = MooodShapes.V;
  const l = F.P('LeftHand'), r = F.P('RightHand'), mid = V.add(V.mix(l, r, 0.5), V.mul(F.fwd('Chest'), toward * m_(F)));
  const across = V.unit(V.sub(l, r)), up0 = F.up('Chest'), up = V.unit(V.sub(up0, V.mul(across, V.dot(up0, across))));
  return { mid, axes: [across, up, V.cross(across, up)] };
}
// a small shoe (a slipper: red morocco, its heel and its toe), lying along `along` with its sole down `down`
function shoe(F, at, along, down, red, trim) {
  const V = MooodShapes.V;
  const m = m_(F), side = V.unit(V.cross(down, along)), axes = [side, V.mul(down, -1), along];
  F.ball(V.add(at, V.mul(along, 0.03 * m)), axes, [0.035 * m, 0.03 * m, 0.105 * m], red, 10);
  F.ball(V.add(at, V.add(V.mul(along, -0.05 * m), V.mul(down, -0.035 * m))), axes, [0.034 * m, 0.04 * m, 0.04 * m], red, 8);
  F.ball(V.add(at, V.add(V.mul(along, -0.075 * m), V.mul(down, 0.035 * m))), axes, [0.018 * m, 0.03 * m, 0.018 * m], trim, 6);
  F.ball(V.add(at, V.add(V.mul(along, 0.0 * m), V.mul(down, -0.022 * m))), axes, [0.03 * m, 0.008 * m, 0.03 * m], trim, 8);
}
// a sack of coal: a soft lump with a gathered neck, `size` (1 a man's big sack), along its axes
function sack(F, c, axes, size, color = c4('#8a7a5c')) {
  const V = MooodShapes.V;
  const m = m_(F) * size, [x, y, z] = axes;
  F.ball(c, axes, [0.24 * m, 0.33 * m, 0.2 * m], color, 9);
  F.ball(V.add(c, V.mul(y, 0.33 * m)), axes, [0.07 * m, 0.08 * m, 0.06 * m], color, 7);
  F.ball(V.add(c, V.mul(y, 0.42 * m)), axes, [0.1 * m, 0.04 * m, 0.08 * m], color, 7);
}

// an order's ribbon worn across the chest from the right shoulder to the left hip, a star of the order on the left breast;
// `over` — how far out it lies from the trunk (over a bodice: further)
function ribbon(F, color, over = 0.04) {
  const V = MooodShapes.V;
  const m = m_(F), fc = F.fwd('Chest'), sd = F.side('Chest'), out = (p) => F.clear(p, 1, over * m);
  const a = out(V.add(F.P('RightArm'), [0, 0.03 * m, 0])), b = out(F.P('Chest')), c = out(V.add(V.mix(F.P('LeftUpLeg'), F.P('Hips'), 0.3), [0, 0.08 * m, 0]));
  F.tube([a, b, c], [[0, 0.035 * m], [2, 0.035 * m]], [[0, color]], 4, sd, 0.15);
  const st = out(V.add(V.mix(F.P('Chest'), F.P('LeftArm'), 0.5), [0, -0.05 * m, 0]));
  F.ball(st, [sd, F.up('Chest'), fc], [0.045 * m, 0.045 * m, 0.01 * m], SILVER, 8);
}

// the moon on a palm (side: 'Right' | 'Left')
function moonIn(F, side) {
  const V = MooodShapes.V;
  const m = m_(F), h = V.mix(F.P(`${side}Hand`), F.P(`${side}HandMiddle1`), 0.6), n = F.fwd('Chest'), x = F.side('Chest');
  F.ball(V.add(h, V.mul(F.up(`${side}Hand`), 0.05 * m)), [x, [0, 1, 0], n], [0.11 * m, 0.11 * m, 0.03 * m], c4('#fff3c8', 0), 14);
}

return {
  ...data,
  characters: {
    // Vakula, the smith: about twenty-five, broad and strong; a sheepskin coat, a red sash, wide dark
    // trousers in boots, a tall black lambskin hat (its top red cloth), black moustaches
    vakula: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'sheepskin', hair: 'short', hat: 'lambskin_hat', parts: ['moustache'],
      body: { height: 1.05, shoulders: 1.1, thick: 1.1 },
      colors: { skin: '#c99878', hair: '#1c1714', top: '#e9e2d4', bottom: '#2e3550', shoes: '#1e1816', garment: '#8c5e36',
        hat: '#1d1a1c', accent: '#b5262b', crown: '#a8232b' } },
    // …and on Christmas morning, back from Petersburg: a new grey lambskin hat with a gold-braided top, a new red sash
    // (worn over vakula: wear — the same man)
    vakula_feast: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'sheepskin', hair: 'short', hat: 'lambskin_hat', parts: ['moustache'],
      body: { height: 1.05, shoulders: 1.1, thick: 1.1 },
      colors: { skin: '#c99878', hair: '#1c1714', top: '#f1ebe0', bottom: '#2a3a6a', shoes: '#1e1816', garment: '#a07040',
        hat: '#6a6a72', accent: '#d42e2e', crown: '#d9a93a' } },
    // Oksana, seventeen: black brows, a braid with ribbons, coral beads, an embroidered shirt, a checked wrap
    // skirt and a red sleeveless jacket over the shirt, red boots
    oksana: { kind: 'shapes', style: 'dikanka', who: 'woman', garment: 'wrap_skirt', hair: 'braid', parts: ['beads'],
      body: { height: 0.92, shoulders: 0.88, hips: 1.04, thick: 0.84, head: 1.02 },
      colors: { skin: '#e2b896', hair: '#17110e', top: '#f1ebe0', garment: '#7c1f2b', vest: '#a32c2a', shoes: '#9b2420',
        accent: '#d23c2f', ribbon: '#2f6d3a', ribbon2: '#e0b13a' } },
    // Soloha, the widow, over forty, stately, rosy: a married woman's cap under a kerchief, a dark wrap skirt, a
    // warm sleeveless jacket
    solokha: { kind: 'shapes', style: 'dikanka', who: 'woman', garment: 'wrap_skirt', hair: 'bun', hat: 'married_cap', parts: ['beads'],
      body: { height: 0.94, shoulders: 0.95, hips: 1.14, thick: 1.06 },
      colors: { skin: '#dba582', hair: '#2a1d16', top: '#eee6d8', garment: '#3d2a44', vest: '#6a3b25', shoes: '#2a1e1a',
        hat: '#b23a2c', accent: '#c33b2c' } },
    // Tchub, the old Cossack: heavy, slow, droopy grey moustaches, an enormous hat, a long sheepskin coat, a sash
    chub: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'sheepskin', hair: 'short', hat: 'big_hat', parts: ['long_moustache'],
      body: { height: 1.0, shoulders: 1.12, thick: 1.25, hips: 1.12 },
      colors: { skin: '#c48f72', hair: '#a9a39a', top: '#e6ddcc', bottom: '#3a3240', shoes: '#211a17', garment: '#8a6440',
        hat: '#2a2524', accent: '#2f5f8a', crown: '#2f5f8a' } },
    // Panas, Tchub's crony: smaller than Tchub, a sheepskin coat, a hat, a pipe
    panas: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'sheepskin', hair: 'short', hat: 'lambskin_hat', parts: ['moustache', 'pipe'],
      body: { height: 0.94, shoulders: 1.0, thick: 1.12 },
      colors: { skin: '#c4927a', hair: '#5a4a3c', top: '#e4dccb', bottom: '#33303a', shoes: '#211a17', garment: '#7c6644',
        hat: '#3a3330', accent: '#7a2a2a', crown: '#7a2a2a' } },
    // the mayor: fat, important, a big hat, a fine sheepskin coat, a blue sash
    mayor: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'sheepskin', hair: 'short', hat: 'big_hat', parts: ['moustache'],
      body: { height: 0.98, shoulders: 1.14, thick: 1.45, hips: 1.2 },
      colors: { skin: '#cf977c', hair: '#3a2e26', top: '#e6ddcc', bottom: '#4a2a2a', shoes: '#211a17', garment: '#5d3e28',
        hat: '#1f1c1c', accent: '#2c4f8a', crown: '#7a1f24' } },
    // the sacristan: long and lean, a long dark kaftan to the ankles, a thin plait of hair, bare-headed indoors
    sacristan: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'kaftan', hair: 'pigtail',
      body: { height: 1.09, shoulders: 0.88, thick: 0.74, neck: 1.25 },
      colors: { skin: '#d2ad92', hair: '#6a5a48', top: '#d9d0c0', bottom: '#2a2626', shoes: '#1b1717', garment: '#2c2a30' } },
    // the girls who go carolling: Odarka in front (her new red slippers with gold), and three more — short sheepskin
    // coats, kerchiefs, wrap skirts, boots
    odarka: { kind: 'shapes', style: 'dikanka', who: 'woman', garment: 'short_sheepskin', hair: 'braid', hat: 'kerchief', parts: ['gold_shoes'],
      body: { height: 0.9, shoulders: 0.86, thick: 0.86 },
      colors: { skin: '#e0b494', hair: '#3a2416', top: '#efe8dc', skirt: '#2d4a7a', garment: '#9a6a3e', shoes: '#c4232a',
        hat: '#c8352c', accent: '#c8352c', ribbon: '#e2b13c', ribbon2: '#2f6d3a' } },
    girl1: { kind: 'shapes', style: 'dikanka', who: 'woman', garment: 'short_sheepskin', hair: 'braid', hat: 'kerchief',
      body: { height: 0.88, shoulders: 0.86, thick: 0.84 },
      colors: { skin: '#dcae8e', hair: '#2a1c14', top: '#efe8dc', skirt: '#6e2430', garment: '#7e5634', shoes: '#2a1e1a',
        hat: '#2f6a8a', accent: '#2f6a8a', ribbon: '#c8352c', ribbon2: '#e2b13c' } },
    girl2: { kind: 'shapes', style: 'dikanka', who: 'woman', garment: 'short_sheepskin', hair: 'braid', hat: 'kerchief',
      body: { height: 0.91, shoulders: 0.84, thick: 0.82 },
      colors: { skin: '#e4b896', hair: '#5a3a22', top: '#efe8dc', skirt: '#2f3a2a', garment: '#a87a48', shoes: '#2a1e1a',
        hat: '#d9a43a', accent: '#d9a43a', ribbon: '#2f6a8a', ribbon2: '#c8352c' } },
    girl3: { kind: 'shapes', style: 'dikanka', who: 'woman', garment: 'short_sheepskin', hair: 'braid', hat: 'kerchief',
      body: { height: 0.87, shoulders: 0.88, thick: 0.88 },
      colors: { skin: '#dcae8e', hair: '#1a1410', top: '#efe8dc', skirt: '#5a2a4a', garment: '#6e4a2e', shoes: '#2a1e1a',
        hat: '#8a2a5a', accent: '#8a2a5a', ribbon: '#e2b13c', ribbon2: '#2f6d3a' } },
    // the lads who go carolling: short of Vakula, sheepskin coats, sashes, hats — one carries the star
    lad1: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'sheepskin', hair: 'short', hat: 'lambskin_hat', parts: ['moustache'],
      body: { height: 1.0, shoulders: 1.0, thick: 0.96 },
      colors: { skin: '#d2a07e', hair: '#3a2a1e', top: '#ece4d6', bottom: '#3a2e2a', shoes: '#1e1816', garment: '#9a7448',
        hat: '#2a2422', accent: '#2f6d3a', crown: '#2f6d3a' } },
    lad2: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'sheepskin', hair: 'short', hat: 'lambskin_hat',
      body: { height: 0.97, shoulders: 0.96, thick: 0.9 },
      colors: { skin: '#d8aa88', hair: '#6a4a2e', top: '#ece4d6', bottom: '#2a3048', shoes: '#1e1816', garment: '#6a5038',
        hat: '#4a3a32', accent: '#c8352c', crown: '#c8352c' } },
    // in Petersburg. The Tsaritsa: stately, powdered hair high in a bun, a small diamond crown, a silver-white gown to the
    // floor, an ermine collar, the blue ribbon of St Andrew across her
    tsaritsa: { kind: 'shapes', style: 'dikanka', who: 'woman', garment: 'gown', hair: 'bun', parts: ['diadem'],
      body: { height: 0.97, shoulders: 0.92, hips: 1.12, thick: 1.06 },
      colors: { skin: '#ead0bc', hair: '#b9b4ac', top: '#efe9df', garment: '#e6dfd2', shoes: '#c9b98a', accent: '#2f5aa8' } },
    // Potyomkin: tall, a green uniform coat with red facings, the ribbon and the star, powdered hair
    potemkin: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'uniform', hair: 'short',
      body: { height: 1.1, shoulders: 1.08, thick: 1.08 },
      colors: { skin: '#dcb59c', hair: '#d8d4cc', top: '#ece6da', bottom: '#ece6da', shoes: '#1b1717', garment: '#2e4a36', accent: '#2f5aa8' } },
    // the Zaporozhtsy who bring Vakula: long red coats, sashes, shaved heads with a forelock, long
    // moustaches
    zaporozhets1: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'long_coat', hair: 'none', parts: ['forelock', 'long_moustache'],
      body: { height: 1.04, shoulders: 1.12, thick: 1.15 },
      colors: { skin: '#c4906e', hair: '#2a221c', top: '#e8e0d0', bottom: '#2c3c78', shoes: '#7a2a22', garment: '#a82a2c', accent: '#d9a93a' } },
    zaporozhets2: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'long_coat', hair: 'none', parts: ['forelock', 'long_moustache'],
      body: { height: 1.0, shoulders: 1.06, thick: 1.3, hips: 1.1 },
      colors: { skin: '#c99878', hair: '#7a6a5a', top: '#e8e0d0', bottom: '#6a2a2a', shoes: '#2a221c', garment: '#2c4a7a', accent: '#c8352c' } },
    // the devil: small and black, "at first it looked like a regular German" — a narrow restless snout ending in a pig's patch, a goat's
    // beard, little horns, thin legs, a long tail like the tails of a uniform coat
    devil: { kind: 'shapes', style: 'dikanka', who: 'man', garment: 'none', hair: 'none', parts: ['horns', 'snout', 'goatee', 'tail'],
      body: { height: 0.78, head: 1.12, shoulders: 0.82, thick: 0.72, legs: 1.04, arms: 1.06 },
      colors: { skin: '#24201f', hair: '#141212', top: '#24201f', bottom: '#24201f', shoes: '#141110', snout: '#b0706a', horn: '#d8cdb6' } },
  },
  shapes: {
    // the world's style: the engine's faceted figures, no lines, their colours under the scene's light — as the huts are
    styles: { dikanka: { from: 'geometry', name: 'Dikanka', paint: 'lit', line: 0, face: 'simple', ground: 'night', square: 2, sides: 7 } },
    garments: {
      // a sheepskin coat to the shins, its sleeves of it, a fleece collar, a sash at the waist
      sheepskin: { name: 'sheepskin coat', hang: [{ to: 1.45, from: 'shoulders', flare: 0.36 }], sleeves: 'garment',
        draw: F => { collar(F); sash(F, F.colors.accent, 1.3); } },
      // a short sheepskin coat to mid-thigh over a wrap skirt to the ankles (the girls in the frost)
      short_sheepskin: { name: 'short sheepskin and wrap skirt', hang: [{ to: 1.85, from: 'waist', flare: 0.4, off: 0.96, color: 'skirt' }, { to: 0.62, from: 'shoulders', flare: 0.22, folds: false }],
        sleeves: 'garment', bare: true, draw: F => collar(F) },
      // a wrap skirt to the ankles and a sleeveless jacket over the embroidered shirt: the shirt's sleeves white
      wrap_skirt: { name: 'wrap skirt and sleeveless vest', hang: [{ to: 1.85, from: 'waist', flare: 0.38, off: 0.96 }, { to: 0.18, from: 'shoulders', flare: 0.12, color: 'vest', folds: false }],
        bare: true, draw: F => sash(F, F.colors.accent, 1.08, 0.025) },
      // the Tsaritsa's gown: a skirt wide to the floor, a fitted bodice, an ermine collar, the ribbon
      gown: { name: 'the Tsaritsa\'s gown', hang: [{ to: 2.05, from: 'waist', flare: 0.85, off: 0.94 }], bare: true, bodice: true,
        draw: F => { collar(F, c4('#f4f1ea')); ribbon(F, F.colors.accent, 0.08); } },
      // a uniform coat to the knees, its skirts flaring a little, the ribbon and the star
      uniform: { name: 'uniform coat', hang: [{ to: 1.15, from: 'shoulders', flare: 0.2 }], sleeves: 'garment',
        draw: F => ribbon(F, F.colors.accent) },
      // a Zaporozhets's long coat to the shins, its sleeves of it, a wide sash
      long_coat: { name: 'long_coat', hang: [{ to: 1.5, from: 'shoulders', flare: 0.28 }], sleeves: 'garment',
        draw: F => sash(F, F.colors.accent, 1.3, 0.045) },
      // the sacristan's long kaftan: from the shoulders to the ankles, narrow, its sleeves of it
      kaftan: { name: 'kaftan', hang: [{ to: 1.85, from: 'shoulders', flare: 0.16 }], sleeves: 'garment' },
    },
    hair: {
      // a braid down the back, ribbons tied at its end
      braid: { name: 'braid with ribbons', draw: F => {
        const V = MooodShapes.V;
        const { at, axes: [hs, hu, hf], egg, r, out, sides, square } = F.head, h = F.fit.h, fc = F.fwd('Chest');
        F.cap(at, [hs, hu, hf], egg.map(e => e * r * out), [0, 0.62, -0.78], -0.12, F.colors.hair, sides, square);
        const tie = V.add(at, V.add(V.mul(hf, -r * 0.9), V.mul(hu, -r * 0.35)));
        const mid = F.clear(F.swing('braid1', V.add(tie, V.add([0, -0.16 * h, 0], V.mul(fc, -0.03 * F.k))), 150), -1, r * 0.2);
        const end = F.clear(F.swing('braid2', V.add(mid, [0, -0.15 * h, 0]), 80), -1, r * 0.2);
        F.tube([tie, mid, end], [[0, r * 0.3], [1, r * 0.24], [2, r * 0.14]], [[0, F.colors.hair]], 6, hs, 0.8);
        // (ribbons from the braid's end, hanging)
        for (const [i, c] of [[0, 'ribbon'], [1, 'ribbon2'], [2, 'accent']]) {
          const from = V.add(end, V.mul(hs, (i - 1) * r * 0.12)), to = F.clear(F.swing(`ribbon${i}`, V.add(from, [0, -0.07 * h, 0]), 60 + 15 * i), -1, r * 0.15);
          F.tube([from, to], [[0, r * 0.08], [1, r * 0.07]], [[0, F.colors[c] ?? F.colors.accent]], 4, hs, 0.25);
        }
      } },
      // the sacristan's: a thin plait at the nape
      pigtail: { name: 'thin plait', draw: F => {
        const V = MooodShapes.V;
        const { at, axes: [hs, hu, hf], egg, r, out, sides, square } = F.head;
        F.cap(at, [hs, hu, hf], egg.map(e => e * r * out), [0, 0.5, -0.86], 0.05, F.colors.hair, sides, square);
        const tie = V.add(at, V.add(V.mul(hf, -r * 0.92), V.mul(hu, -r * 0.45))), end = F.clear(F.swing('pigtail', V.add(tie, [0, -0.11 * F.fit.h, 0]), 90), -1, r * 0.12);
        F.tube([tie, end], [[0, r * 0.14], [1, r * 0.08]], [[0, F.colors.hair]], 5, hs);
      } },
    },
    hats: {
      // a tall lambskin hat, a cloth top
      lambskin_hat: { name: 'lambskin hat', draw: F => tallHat(F, 1.2, 0.62, 1.04, F.colors.crown) },
      // Tchub's and the mayor's: enormous
      big_hat: { name: 'enormous hat', draw: F => tallHat(F, 1.3, 0.75, 1.2, F.colors.crown) },
      // a married woman's cap under a kerchief tied at the nape
      married_cap: { name: 'married woman\'s cap and kerchief', draw: F => kerchief(F, false) },
      // a kerchief tied under the chin
      kerchief: { name: 'kerchief', draw: F => kerchief(F, true) },
    },
    parts: {
      // a Zaporozhets's forelock from the crown of the shaved head, curled down behind the left ear
      forelock: { name: 'forelock', draw: F => {
        const V = MooodShapes.V;
        const { axes, r, on } = F.head, [hs] = axes;
        F.tube([on([0, 1, 0.1], 1.0), on([-0.45, 0.85, -0.1], 1.04), on([-0.85, 0.2, -0.2], 1.05), on([-0.9, -0.35, -0.1], 1.04)],
          [[0, r * 0.13], [2, r * 0.09], [3, r * 0.04]], [[0, F.colors.hair]], 5, hs);
      } },
      // the Tsaritsa's small crown: a gold band and a cap of jewels on top of the head
      diadem: { name: 'small crown', draw: F => {
        const V = MooodShapes.V;
        const { at, axes: [hs, hu, hf], r } = F.head, ax = [hs, hu, hf], c = V.add(at, V.mul(hu, r * 1.12));
        F.ball(c, ax, [r * 0.42, r * 0.12, r * 0.38], GOLD, 10);
        F.ball(V.add(c, V.mul(hu, r * 0.16)), ax, [r * 0.3, r * 0.2, r * 0.28], SILVER, 8);
        F.ball(V.add(c, V.mul(hu, r * 0.4)), ax, [r * 0.06, r * 0.08, r * 0.06], GOLD, 6);
      } },
      // moustaches hanging down past the mouth's corners (Cossack's)
      moustache: { name: 'moustache', draw: F => {
        const V = MooodShapes.V;
        const { axes, r, on } = F.head, [hs, hu] = axes;
        for (const s of [-1, 1]) F.tube([on([s * 0.08, -0.34, 1], 1.02), on([s * 0.38, -0.42, 0.9], 1.04), on([s * 0.46, -0.75, 0.8], 1.02)],
          [[0, r * 0.1], [1, r * 0.09], [2, r * 0.03]], [[0, F.colors.hair]], 5, hu);
      } },
      long_moustache: { name: 'drooping moustache', draw: F => {
        const V = MooodShapes.V;
        const { axes, r, on } = F.head, [, hu] = axes;
        for (const s of [-1, 1]) F.tube([on([s * 0.08, -0.34, 1], 1.02), on([s * 0.42, -0.45, 0.88], 1.05), on([s * 0.5, -1.05, 0.7], 1.03)],
          [[0, r * 0.13], [1, r * 0.11], [2, r * 0.04]], [[0, F.colors.hair]], 5, hu);
      } },
      // coral beads in strings round the neck, lying on the chest
      beads: { name: 'coral beads', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F), k = F.k, uc = F.up('Chest'), fc = F.fwd('Chest'), sd = F.side('Chest'), neck = F.P('Neck1'), red = c4('#c2272d');
        for (const [row, drop] of [[0, 0.03], [1, 0.055], [2, 0.08]]) for (let i = 0; i <= 8; i++) {
          const a = (i / 8 - 0.5) * 2.4, p = V.add(neck, V.add(V.add(V.mul(sd, Math.sin(a) * 0.075 * k), V.mul(fc, Math.cos(a) * 0.06 * k + 0.02 * k)), V.mul(uc, -drop * m - Math.cos(a) * 0.02 * m)));
          F.ball(F.clear(p, 1, 0.012 * m), [sd, uc, fc], [0.011 * m, 0.011 * m, 0.011 * m], row === 1 ? c4('#e0b13a') : red, 5);
        }
      } },
      // Panas's pipe, in the corner of his mouth, its bowl down by the chin
      pipe: { name: 'pipe', draw: F => {
        const V = MooodShapes.V;
        const { axes, r, on } = F.head, [hs, hu, hf] = axes, a = on([0.2, -0.45, 0.95], 1.0), b = V.add(a, V.add(V.mul(hf, r * 0.9), V.mul(hu, -r * 0.25)));
        F.bar(a, b, r * 0.04, r * 0.04, [[0, c4('#3a2a1e')]], 5, hs);
        F.ball(V.add(b, V.mul(hu, r * 0.12)), axes, [r * 0.13, r * 0.18, r * 0.13], c4('#5a3a22'), 7);
      } },
      // the devil's: little horns out of the brow, curving back
      horns: { name: 'little horns', draw: F => {
        const V = MooodShapes.V;
        const { axes, r, on } = F.head, [hs, hu, hf] = axes, horn = F.colors.horn ?? F.colors.hair;
        for (const s of [-1, 1]) {
          const a = on([s * 0.42, 0.7, 0.45], 0.92), b = V.add(a, V.add(V.add(V.mul(hu, r * 0.5), V.mul(hs, s * r * 0.18)), V.mul(hf, -r * 0.05)));
          F.tube([a, b, V.add(b, V.add(V.mul(hu, r * 0.18), V.mul(hf, -r * 0.22)))], [[0, r * 0.15], [1, r * 0.08], [2, 0]], [[0, horn]], 5, hs);
        }
      } },
      // …a narrow snout forward, its end a pig's patch
      snout: { name: 'snout with a pig\'s patch', draw: F => {
        const V = MooodShapes.V;
        const { at, axes, r, on } = F.head, [hs, hu, hf] = axes, a = on([0, -0.15, 1], 0.7), b = V.add(a, V.add(V.mul(hf, r * 0.55), V.mul(hu, -r * 0.08)));
        F.tube([a, b], [[0, r * 0.36], [1, r * 0.22]], [[0, F.colors.skin]], 7, hs);
        F.ball(V.add(b, V.mul(hf, r * 0.02)), [hs, hu, hf], [r * 0.24, r * 0.2, r * 0.07], F.colors.snout ?? F.colors.skin, 8);
      } },
      // …a goat's beard under the chin
      goatee: { name: 'goat\'s beard', draw: F => {
        const V = MooodShapes.V;
        const { axes, r, on } = F.head, [hs, hu, hf] = axes, a = on([0, -0.85, 0.5], 0.95);
        F.tube([a, V.add(a, V.add(V.mul(hu, -r * 0.5), V.mul(hf, r * 0.15)))], [[0, r * 0.13], [1, 0]], [[0, F.colors.hair]], 5, hs);
      } },
      // …a long tail from under the back, swinging behind as he goes, a tuft at its end
      tail: { name: 'tail', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F), base = V.add(F.P('Hips'), V.add(V.mul(F.fwd('Hips'), -0.1 * F.k), V.mul(F.up('Hips'), -0.02 * m)));
        const back = V.mul(F.fwd('Hips'), -1);
        const a = F.swing('tail1', V.add(base, V.add(V.mul(back, 0.2 * m), [0, -0.18 * m, 0])), 90);
        const b = F.swing('tail2', V.add(a, V.add(V.mul(back, 0.18 * m), [0, -0.12 * m, 0])), 50);
        const c = F.swing('tail3', V.add(b, V.add(V.mul(back, 0.12 * m), [0, 0.04 * m, 0])), 30);
        F.tube([base, a, b, c], [[0, 0.022 * m], [2, 0.012 * m], [3, 0.008 * m]], [[0, F.colors.skin]], 5, F.side('Hips'));
        F.ball(c, [F.side('Hips'), [0, 1, 0], back], [0.03 * m, 0.045 * m, 0.03 * m], F.colors.hair, 6);
      } },
      // Odarka's new slippers: gold at the ankle and on the toe of the red boots
      gold_shoes: { name: 'slippers with gold', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F);
        for (const s of ['Left', 'Right']) {
          const ankle = F.P(`${s}Foot`), toe = V.mix(F.P(`${s}ToeBase`), F.P(`${s}ToeEnd`), 0.4), axes = [F.side(`${s}Foot`), F.up(`${s}Foot`), F.fwd(`${s}Foot`)];
          F.ball(V.add(ankle, V.mul(axes[1], 0.035 * m)), axes, [0.05 * m, 0.016 * m, 0.055 * m], GOLD, 8);
          F.ball(toe, axes, [0.03 * m, 0.02 * m, 0.03 * m], GOLD, 6);
        }
      } },
      // ── things in hands (a person's <id>_with) ──
      // a small mirror in a brass frame, held up by its handle in the right fist, its glass to the eyes
      mirror: { name: 'little mirror', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F), grip = V.mix(F.P('RightHand'), F.P('RightHandMiddle1'), 0.7), head = F.P('Head');
        const c = V.add(grip, [0, 0.12 * m, 0]), n = V.unit(V.sub(head, c)), x = V.unit(V.cross([0, 1, 0], n)), y = V.cross(n, x);
        F.bar(V.add(grip, [0, -0.03 * m, 0]), c, 0.012 * m, 0.012 * m, [[0, BRASS]], 6, x);
        F.ball(c, [x, y, n], [0.07 * m, 0.09 * m, 0.012 * m], BRASS, 12);
        F.ball(V.add(c, V.mul(n, 0.007 * m)), [x, y, n], [0.058 * m, 0.077 * m, 0.008 * m], SILVER, 12);
      } },
      // his hat in his hands, before him (kneaded: the hat off his head — wear {hat: 'none'})
      hat_hands: { name: 'hat in the hands', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F), { mid, axes } = between(F, 0.03);
        F.ball(mid, axes, [0.1 * m, 0.08 * m, 0.09 * m], F.colors.hat, 8, 3);
      } },
      // the slippers: a pair of red shoes with gold, held up in both hands
      slippers: { name: 'slippers', draw: F => {
        const V = MooodShapes.V;
        const red = c4('#c42a2a');
        for (const s of ['Left', 'Right']) {
          const h = V.mix(F.P(`${s}Hand`), F.P(`${s}HandMiddle1`), 0.6), along = F.fwd(`${s}Hand`);
          shoe(F, V.add(h, V.mul(along, 0.06 * m_(F))), along, V.mul(F.up(`${s}Hand`), -1), red, GOLD);
        }
      } },
      // the same, in one hand (the right), both together
      slippers_r: { name: 'slippers in one hand', draw: F => {
        const V = MooodShapes.V;
        const red = c4('#c42a2a'), h = V.mix(F.P('RightHand'), F.P('RightHandMiddle1'), 0.6), along = [0, -1, 0], down = F.fwd('Hips');
        for (const s of [-1, 1]) shoe(F, V.add(h, V.add(V.mul(F.side('RightHand'), s * 0.04 * m_(F)), [0, -0.08 * m_(F), 0])), along, down, red, GOLD);
      } },
      // a big sack of coal on the right shoulder, held by its neck over it
      sack_shoulder: { name: 'sack on the shoulder', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F), sh = F.P('RightArm'), back = V.mul(F.fwd('Chest'), -1), sd = F.side('Chest');
        const c = V.add(sh, V.add(V.mul(back, 0.16 * m), V.add(V.mul(sd, -0.06 * m), [0, 0.02 * m, 0])));
        const y = V.unit(V.add(F.fwd('Chest'), [0, 0.5, 0])), z = V.unit(V.cross(sd, y));
        sack(F, c, [sd, y, z], 1.05);
      } },
      // a small light sack hanging from the left hand
      sack_small: { name: 'little sack', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F), h = F.P('LeftHand'), low = F.swing('sack_small', V.add(h, [0, -0.2 * m, 0]), 60), y = V.unit(V.sub(h, low));
        const x = V.unit(V.cross(y, F.fwd('Hips'))), z = V.cross(x, y);
        sack(F, V.add(low, V.mul(y, -0.02 * m)), [x, y, z], 0.55);
      } },
      // a Cossack's whip in the right hand: a short stiff handle out of the fist, the plaited lash hanging
      whip: { name: 'whip', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F), grip = V.mix(F.P('RightHand'), F.P('RightHandMiddle1'), 0.7), along = V.unit(V.sub(F.P('RightHand'), F.P('RightForeArm')));
        const tip = V.add(grip, V.mul(along, 0.22 * m)), wood = c4('#5a3a22'), lash = c4('#3a2a1e');
        F.bar(V.add(grip, V.mul(along, -0.05 * m)), tip, 0.014 * m, 0.012 * m, [[0, wood]], 6, F.side('RightHand'));
        const mid = F.swing('lash1', V.add(tip, [0, -0.2 * m, 0]), 80), end = F.swing('lash2', V.add(mid, [0, -0.2 * m, 0]), 50);
        F.tube([tip, mid, end], [[0, 0.008 * m], [2, 0.004 * m]], [[0, lash]], 5, F.side('RightHand'));
      } },
      // the queen's gift for learning: a painted wooden box of paints held in both hands, a rolled letter with a red seal on it
      paintbox: { name: 'box of paints and a letter', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F), { mid, axes } = between(F, 0.06), [x, y, z] = axes;
        F.ball(mid, axes, [0.17 * m, 0.06 * m, 0.11 * m], c4('#7a4a2a'), 8, 4);
        F.ball(V.add(mid, V.mul(y, 0.062 * m)), axes, [0.14 * m, 0.006 * m, 0.08 * m], c4('#c9a24a'), 8, 4);
        F.bar(V.add(V.add(mid, V.mul(y, 0.09 * m)), V.mul(x, -0.13 * m)), V.add(V.add(mid, V.mul(y, 0.09 * m)), V.mul(x, 0.13 * m)), 0.025 * m, 0.025 * m, [[0, c4('#ece2c8')]], 8, y);
        F.ball(V.add(mid, V.add(V.mul(y, 0.09 * m), V.mul(z, 0.026 * m))), axes, [0.02 * m, 0.02 * m, 0.008 * m], c4('#b02a2a'), 6);
      } },
      // the carollers' star: a pole held upright in both hands (plumb through them, as a pole is kept), on its top an
      // eight-pointed star of paper, gold and red rays round a white middle, turned the way he faces
      star: { name: 'carol star', draw: F => {
        const V = MooodShapes.V;
        const m = m_(F), mid = V.mix(F.P('LeftHand'), F.P('RightHand'), 0.5), up = [0, 1, 0], f0 = F.fwd('Chest');
        const fwd = V.unit([f0[0], 0, f0[2]]), side = V.cross(up, fwd), top = V.add(mid, [0, 1.0 * m, 0]), c = V.add(top, [0, 0.24 * m, 0]);
        F.bar(V.add(mid, [0, -0.6 * m, 0]), top, 0.016 * m, 0.014 * m, [[0, c4('#6a4a2e')]], 6, side);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * 2 * Math.PI, out = V.add(V.mul(side, Math.cos(a)), V.mul(up, Math.sin(a))), across = V.cross(fwd, out);
          F.ball(V.add(c, V.mul(out, 0.13 * m)), [across, out, fwd], [0.04 * m, 0.11 * m, 0.012 * m], i % 2 ? c4('#c8352c') : GOLD, 6);
        }
        F.ball(c, [side, up, fwd], [0.085 * m, 0.085 * m, 0.03 * m], c4('#f4ecd8'), 12);
        F.ball(V.add(c, V.mul(fwd, 0.02 * m)), [side, up, fwd], [0.04 * m, 0.04 * m, 0.016 * m], c4('#c8352c'), 10);
      } },
      // the moon in a hand: a hot silver crescent's disc on the palm (its light is the scene's: a light "at" the hand)
      moon: { name: 'the moon in the right hand', draw: F => moonIn(F, 'Right') },
      moon_l: { name: 'the moon in the left hand', draw: F => moonIn(F, 'Left') },
    },
  },
};
