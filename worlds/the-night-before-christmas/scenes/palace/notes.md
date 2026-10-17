# The Palace (`palace`)

A hall of the palace in Petersburg; in it a film — Vakula before the Tsaritsa (the engine's people). The contrast to
Dikanka: cold scale, mirrors, candles, parquet. A long hall
(14 × 46 m, 10 m high) seen along its length; the ceiling — three big coffers between deep beams, in the middle one a
plafond — a pale sky in a gold oval, the chandeliers hang from rosettes in the middle of the coffers. On the left seven
tall windows onto the winter night over the river — on the far bank the lights of the embankment and a gold spire,
behind the panes snow falls slowly; on the right across from the windows — mirrors in gold frames, paintings between
them; three chandeliers on the axis; at the end on a dais under red — an armchair before tall white doors. The walls
are a cold white, the gold in thin lines, the parquet polished to a mirror. The moon shines in at the windows: the
windows with their bars lie across the floor — cold light across the warm. The only bright colours in the hall are the
painting Vakula will stand before: a mother with her child, ultramarine, vermilion and gold.

## Keys

All in `states` (what they mean, their ranges).

| key | what | start |
| --- | --- | --- |
| `candles` 0…1 | the candles: 0 — the hall in the dark, only the moon in the windows; toward 1 they light from the far end toward us — the chandeliers one after another, the sconces | 1 |
| `doors` 0…1 | the doors at the end: 0 — shut, 1 — flung open onto the lit rooms (the beat `tsaritsa`) | 0 |
| `doors_l`, `doors_r` | the leaves' angles (180 → 95 and 180 → 265) — set by `script.js` from `doors`, not to be touched | 180 |
| `moon` 0…1 | the moon over the river: in the windows, its light — the windows on the parquet | 1 |

`doors` is a direction too (a slider on the site).

Named points: `painting#canvas` (the middle of the painting — for the close-up `painting`), `chair#seat`,
`chair` (the chair's top), `end#doorway` (the middle of the doorway — where the Tsaritsa comes in from),
`door_l#handle`, `door_r#handle`, `chandeliers#c1` … `#c3` (the chandeliers from us), `windows#w1` … `#w7`,
`mirrors#m1` … `#m7` (from us), `sky#moon`. To be chosen — `painting` (a standing card).

## People and the film

The people are the engine's people (elements with `person`, the world's cast `modules/cast.js`, the motions —
`cast.md`): `vakula`, `zaporozhets1`, `zaporozhets2`, `tsaritsa`, `potemkin`. The keys — `<id>_a`, `<id>_d` (metres),
`_do`, `_turn`, `_look`, `_reach`, `_with`, `_gait`, `_steps`, `_here`. They stand on the scene's relief (`relief` →
`lib.floorAt`): the parquet — 0, the dais — two steps, 0.15 and 0.3 m, where its planes `dais_*` are; the Tsaritsa
comes out of the rooms and goes up onto the dais by herself.
The cut for the viewer: hall → tsaritsa → slippers.

| beat | what | s |
| --- | --- | --- |
| hall | past us come in two Zaporozhtsy and Vakula, they look at the chandeliers; the Zaporozhtsy go to the dais, Vakula stops before the painting (the mother with her child) | 18 |
| tsaritsa | the doors fly open (`doors`): out of the rooms — the Tsaritsa with Potyomkin, onto the dais; the Zaporozhtsy fall on their faces (`prostrate`), Vakula runs to them and goes down on his knees (`kneel_down`) | 14 |
| slippers | (after tsaritsa) Vakula on his knees begs (`kneel_offer`); the Tsaritsa laughs (`giggle`), speaks (`gracious`) — close; Potyomkin brings the slippers out of the rooms and gives them; Vakula gets up (`stand_up`), looks at them (`examine`), bows (`bow`); the Zaporozhtsy rise (`bow_up`, `stand_up`) | 29 |

The camera is the scene's own, with offsets (`camera_z` along the hall, `camera_x`, `camera_yaw` — to the painting and
three-quarters to the dais); on the Tsaritsa's word — the operator (`camera_target` tsaritsa).

## How it is made

- **The camera `roam`**: the start at the front wall on the hall's axis, the horizon in the middle of the frame — the
  floor and its reflections take the bottom, the hall's height the top; one can walk along the hall up to the dais
  (area 6, 6, 0.5, 34).
- **Volumes.** The walls are 46 m cards with the windows cut out (the left one) and with the mirrors' silvering in
  frames (the right one); they go 0.3 m into the ceiling — they meet it with no gap. The windows go through the wall's
  thickness (0.8 m): each has its far and near reveals (cards), a sill and a head (planes). The end of the hall is a
  wall with a doorway 3.4 × 6.4 m, reveals, leaves on hinges (`place: facing`), behind them the rooms (walls, a
  ceiling) and the enfilade: parts (`e.part`) of one element, each a wall with a doorway at its own depth. The dais is
  two steps (planes and risers), the chair a card and a seat. The ceiling is a plane over the whole palace: cream, in
  it three coffers with a dark gold frame, the plafond in its oval, rosettes over the chandeliers; the coffers are
  divided by beams across the hall from wall to wall (`BEAMS` 2, 14, 26, 38 m: the front and back faces cards, the
  underside a plane, 0.7 × 1.2 m). What a thing is — its sizes — is said once in `lib.js` (`HALL`, `BAYS`, `WIN`,
  `MIRROR`, `DOORWAY`, `CANVAS`, `CHANDELIERS`, `BEAMS`, `PLAFOND`); the faces' places in `scene.json`.
- **The chandeliers and the sconces are parts.** The three chandeliers are parts of one element `chandeliers` (each at
  its own depth, on a rod from the ceiling): two rings of candles, crystal, the light `chandeliers#c1…c3` (in `lights`
  — a reach of 15 m). The sconces on the piers are parts of `sconces_l`, `sconces_r`. Which candle burns — by
  `candles` and the distance (`litAt`): they are lit from the far end.
- **The mirrors** are one card `mirrors` along the right wall with `glass` (strength 1): in it the engine reflects the
  hall — the windows opposite, the chandeliers, the sconces, the open doors; behind the glass a dark silvering. The
  windows are a card `windows_glass` with `glass` 0.3: at night the candles are faintly reflected in them; the bars —
  `windows` over it.
- **The parquet** is a plane with `reflect` (0.4, blur 0.05: polished, not glass): in it the chandeliers, the windows,
  the doors, the moonlit windows on the floor.
- **The light is the engine's.** The base is the night (`ambient` 0.08, blue); the look `candles` warms the air with
  the candles. The sources: the moon (`from: "sky#moon"` — where the sky paints the crescent), the three chandeliers,
  the sconces, the light of the rooms behind the doors (`on` — `doors`). The shadows: the left wall with the windows,
  the bars and the ceiling — from the moon (onto the parquet and the right wall): the moon comes into the hall only by
  the windows. The end wall and the leaves — from what lights them (the rooms, the moon): the rooms' light lies in the
  doorway as a strip on the parquet. The chair — onto the dais.
- **Behind the windows** — the sky all round with the stars and the moon, the embankment's snow (a plane, the palace's
  floor cut out), the far bank (`city`, glows by itself: the lights of the embankment), the snow falling behind the
  panes (`snowfall`).

## Waits for the engine

- **An upright mirror is only `glass`.** The mirrors on the wall are made of glass of strength 1 over a dark silvering;
  only planes have `reflect`, and a plane steeper than 80° is "a wall, a card" (`engine.js`, `turnOf`). What in glass
  is not as in a mirror (`gl.js`): (1) glass's strength in a lit scene is multiplied by `1 − ambient` (`drawGlass`:
  `M.strength * (1 - SCENE.lit * Math.min(1, SCENE.ambient))`) — the mirror dims as the hall grows light; (2) the
  reflection is laid as a "screen" (`GFS`, blend `1 − dst, 1`) — it only adds light, so the mirror rests on the dark
  silvering and cannot show dark on light; (3) there is no sky in it, no ground and no other panes (`drawMirrored`:
  "not the sky, the ground, the land, panes") — the windows opposite are in the mirrors without the night sky, the
  mirrors do not reflect each other (no endless enfilade); (4) half the frame (`glassMirrors`:
  `mirrorTarget(CW / 2, CH / 2)`).
- **Steps in the parquet's reflection.** A plane's mirror is painted at half the frame (`gl.js`, `mirrors`:
  `mirrorTarget(CW / 2, CH / 2)`): at the light sills the edges in the parquet are stepped (the blur 0.05 softens it,
  but does not take it away).
- **Light slits at the seam of the shadow's receivers.** The shadow of one caster passing from one receiver to another
  (the left wall and the ceiling — onto the right wall and the floor) leaves along the seam a strip the shadow does not
  cover: the top of the right wall under the ceiling and its bottom at the parquet glow with the moon in a thin line.
  In `gl.js`, `shadowCells`: a cell whose corners fall on different receivers is split `SH_DEPTH` (3) times and then
  dropped (`SH_GRID` 12 × 20 for the whole card: on a 46 m wall a cell is ~4 × 0.5 m, what is left a strip of a few
  cm). For the same reason the front wall and the beams' back faces do not take the moon's shadow: added to `onto`,
  they cut the wall's and the ceiling's shadow into many seams — on the front wall the shadow is a staircase of teeth,
  and a cornice along the right wall (tried) opened all its upper part to the moon. So only the parquet and the right
  wall take it, and the front wall and the beams' back faces glow with the moon through the wall — seen if one turns
  round.

## Next (scenes.md)

People (the module `dikanka`): the Zaporozhtsy and Vakula come from the depth, the Tsaritsa with her suite out of the
doors, the chair (`tsaritsa_present`, `zap_down`, `vak_down`, `vak_bow`, `sneeze`, `court_laugh`); the gifts in the
servants' hands (`gift`: the slippers on a cushion, a letter, a box of paints); close-ups (`closeup`, the module
`closeups`: the Tsaritsa's smile, the slippers; the painting — `camera_target: "painting#canvas"`); the film's beats
(`enter` … `leave`).
