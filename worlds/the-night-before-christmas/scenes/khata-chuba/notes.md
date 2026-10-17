# Tchub's Hut (`khata-chuba`)

A roomy hut by lamplight. On the left along the wall a white stove — its mouth with the fire turned to the room,
to the lamp; at the back a door to the yard; on the right a big window in ice, under it a table under a cloth — on it
the lamp and a little mirror, silhouettes against the window; along the right wall a bench. The warm lamp against the
cold window. The same language as in "Dikanka": whitewashed planes, the warm lamp against the cold
window; the embroidery on the cloth — one row of small red and black marks along its edge.

## Keys

All in `states` (what they mean, their ranges).

| key | what | start |
| --- | --- | --- |
| `lamp` 0…1 | the lamp on the table | 1 |
| `moon` 0…1 | the moon: its light on the snow beyond the window and the door, a little in the hut; 0 — stolen | 1 |
| `morning` 0…1 | the morning: cold light from the window, the lamp goes out by itself (looks) | 0 |
| `blizzard` 0…1 | the blizzard: in the window, beyond the open door; snow blows in over the threshold | 0 |
| `door` 0…1 | the door: 0 — shut, 1 — flung open inward, toward the stove | 0 |
| `door_turn` | the door's angle on its hinge (180…264°) — set by `script.js` from `door`, not to be touched | 180 |
| `frost` 0…1 | the frost on the window: it grows from the frame to the middle | 0.6 |
| `peep` 0…1 | a peephole thawed in the frost | 0 |
| `peep_x`, `peep_y` 0…1 | where the peephole is, shares of the window (from the left, from the top — as seen from the hut) | 0.5 |

`morning`, `blizzard`, `door`, `lamp` are directions too (sliders on the site). The keys of the people and the game —
below, "People and the film".

Named points: `window#glass` (the middle of the window), `frost#peep` (the peephole), `door#handle`, `threshold#step`,
`stove#mouth` (the stove's mouth), `bench#seat` (the bench by the right wall), `table#top`, `lamp#flame`,
`mirror#glass`. To be chosen — `door` and `threshold`.

## How it is made

- **The camera `roam`**: the room is 6.4 × 5.4 m, one walks about it (area 2 m to the sides, 3 m forward) and looks
  anywhere. The start — at the front wall, facing the door; the back wall is 4.8 m off.
- **The room of cards and planes**, put together on parents (`on`). The walls are cards turned inward (`facing`); the
  floor, the ceiling — planes; under the ceiling along the room the main beam — a plane underneath and two cards at
  the sides (on it). The stove (1.4 × 2.1 m, 1.95 high) — its long side `stove` turned to the room (`facing` 90: the
  mouth with the fire, the ledge, the niche under it); on it the end toward us (beyond the edge of a 16:9 frame, seen
  at 21:9), the stove-bed on top (a plane) and the flue in the back corner up to the ceiling. So the white stove is lit
  by the lamp — the side toward it warm, the fire in its mouth. The table (1.4 × 1.2 m) under the window — the cloth's
  edge in front `table` (a narrow overhang with embroidery, the rail, the legs), on it the side, the cloth's top (a
  plane), the lamp, the little mirror in a brass frame (`mirror_frame` — the frame and the silver, `mirror` — the
  glass). The bench along the right wall — the board's edge and the legs, on it the seat. The openings of the door and
  the window
  are cut in the back wall (`evenodd`) and go through its thickness (0.35 m): the reveals, the sill, the lintels, the
  frame, the glass, the frost, the door, the threshold — all on the back wall, in its metres. All inside — `inside`.
- **The door** is a card from its hinge (the left reveal), turned by the engine: `place: {facing: "door_turn"}`;
  `door_turn` is set by `script.js` from `door` (0…1 → 180…264°) while `door` moves.
- **The window** (1.2 × 1.15 m, the sill at 0.85 m, to the right of the door) is the main cold source and the place of
  the mini-game "Frost": the glass (`glass`: at night the room and the lamp are reflected in it), the frame with its
  cross, the frost over it; the peephole — a patch rubbed in the frost up to 0.44 m with a ring of wet ice, close —
  `camera_target: "frost#peep"` (the point is set by the lib's `beforeFrame` from `peep_x`, `peep_y` — this frame's,
  whether the frost is painted or not). The frost is not `inside`: it glows with what is beyond the window (at night
  blue from the moon, in the morning white); it grows from the frame: a milky veil toward the middle and ferns of
  needles from the edges, a little greyer than the veil — seen both at night and by day.
- **The light is the engine's.** Outside the hut the light is `light.ambient` and the looks (`moon`, `blizzard` with
  haze, `morning`), into the hut comes `light.inside` of it (in the morning 0.3). The sources: the lamp (`lamp#flame`,
  `on` — `lamp`), the fire in the stove (`stove#fire`: a warm floor before the mouth), the window and the open door —
  `daylight` (the light of the yard; the door — by `door`), the moon — `from`. The morning is the look `morning`: the
  lamp goes out (`lights.lamp` 0), the window shines stronger (`lights.window` 1.2 — its share of the yard's light),
  the moon goes: the light from the window with a tone and a shadow, the table and the mirror silhouettes against it.
  The shadows — of the stove with its bed, the table with its top, the bench with its seat, from each source that
  shines noticeably (in the evening the lamp — the table top over it shelters the floor round the table, in the
  morning the window). What is turned from the light is lit up by the engine's bounced light (`light.bounce`, 0.5 —
  none set of our own): the cloth's overhang and the rail against the lamp read.
- **The yard** — the snow (a plane), the street, the wattle fence, the neighbours' huts with warm windows, the sky all
  round; the blizzard — beyond the wall (seen in the window and in the door) and at the threshold (`blizzard_in`,
  `drift` — snow on the floor with the door open). The wind in gusts: how far the snow has gone the module `khata`'s
  `beforeFrame` sums up from the gusts (`blown`), the painting only reads it.
- **What it shares with Soloha's Hut** is the world's module `khata` (`modules/khata.md`): the materials, a wall with
  openings, the stove's faces with its mouth, the bench, the table's side, the lamp, the window's glass and frame, the
  door, the threshold, the yard and the blizzard. In `lib.js` — this room's sizes (`WALLS`, `WINDOW`, `DOOR`, `STOVE`,
  `TABLE`) and only what is its own: the floor with a runner, the tablecloth, the little mirror, the frost with the
  peephole.

## Waits for the engine

- **Bounced light sees only the frame.** The stove's end (`stove_front`, facing the viewer; at 21:9 — at the left edge)
  stays almost black even at `bounce` 0.8: the front wall behind the viewer would light it up, but bounced light is
  taken only from what is in the frame and at a like depth (`gl.js`, `bounced` — a pass over the frame), and next to
  the end in the frame are the dark ceiling and floor at the edge.

## People and the film

The people are the engine's people (elements with `person`, the world's cast `modules/cast.js`, Kimodo's motions —
`cast.md`): `oksana`, `vakula`, `odarka`, `divchyna1`…`3`, `chub`, `dyak`, `solokha`, `passer` (a passer-by beyond the
window). Their keys — `<id>_a`, `<id>_d` (the place), `_do`, `_turn`, `_look`, `_reach`, `_with`, `_wear`, `_on`,
`_gait`, `_steps`, `_still`, `_here`.
The scene is a film in beats (the module `film`, `script.js`): each beat's `from` is a cut into what the beats before
it left (`chain`/`settle`, the motions' ends once — `once(...).ends`). The cut for the viewer (`film`): mirror → creep →
caught → bench → girls → shoes → whim → vow → knock → let_in → leave → sack → window → rumor → enter → bow → chub_yes →
to_her → word → two_weddings. The game's branches: proud (after whim), shove (after knock), chub_grumble (after bow),
no_need (after to_her), threshold → try_on (after enter).

| beat | what | s |
| --- | --- | --- |
| mirror | Oksana takes the little mirror from the table (the table's mirror hides while she has it: `oksana_with`), steps out into the stove's light, admires herself; close — her; she laughs | 12 |
| creep | the door, Vakula comes in on tiptoe (`tiptoe`) and creeps up (`vakula_pos` 0.22); then the game | 6.2 |
| caught | she sees him in the mirror, turns round, hands on her hips | 5 |
| bench | they sit down on the bench (`sit_down`, then `<id>_on` — the bench's seat, 0.45 m): he the closer the farther he crept; he has his hat off, kneads it | 8 |
| girls | the door, the girls one by one (`girls`), Odarka shakes off the snow; Oksana jumps up to meet them | 10 |
| shoes | Odarka steps forward; the camera lowers its eyes to her slippers (`camera_look`) | 4 |
| whim | Vakula gets up, comes over; close, Oksana (facing us); the girls roar with laughter (`laugh`) | 8 |
| vow / proud | "I will" (a fist to the chest), Oksana looks down on him / his hat on his head, to the door, the laughter breaks off | 5 / 7 |
| knock | the girls run off, Oksana on the bench again, Vakula at the door; the blizzard; three blows — the door shakes | 9 |
| shove / let_in | the door ajar — a shove — Tchub on his back in a snowdrift (`fall_back`), his hat in the snow (`chub_hat`) / Tchub comes in, shakes off the snow, Oksana jumps up, Vakula bows, Tchub waves his hand and goes | 6 / 13 |
| leave | Vakula goes off into the blizzard | 4.4 |
| sack | night (`moon` 1): the girls drag in a sack walking backwards (`sack` 1, `drag_back`), Oksana unties it — out crawl Tchub and the sacristan (`crawl_up`), the sacristan creeps away | 16 |
| window | the morning; Oksana at the window (the frost, the peephole, a passer-by — `passer`) | 3 |
| rumor | a girl looks in at the door | 4 |
| enter | Tchub by the stove (`chub_present`), Vakula comes in in a new hat (the look `vakula_feast`) with a gift (`gift`: 1 — the slippers, 2 — the box of paints and a letter) | 8 |
| bow → chub_yes / chub_grumble | on his knees, the whip (`kneel_down`, `kneel_offer`) → Tchub roars with laughter, lifts him up, claps him on the shoulder / waves his hand, to the stove | 7 → 7 / 4 |
| to_her → no_need / word | to Oksana, the gift in his hands → close: "I don't want them" (`refuse`), her arms round his neck (`hug`) / she takes it, looks it over, nods | 6 → 8 / 6 |
| threshold → try_on | the gift on the threshold (`gift_left`), he goes → Oksana picks it up, puts them on (`try_on`; the look with the slippers), to the window | 7.4 → 16.5 |
| two_weddings | Soloha comes in; Tchub twirls his moustache and takes her arm (`solokha_present`) | 8 |

The game's keys are turned into what the people do (`script.js`): `vakula_pos` — the way from the door to the bench
(until caught) and how close he will sit (after); `mirror_turn` — she moves the mirror aside and looks into it, he
freezes in mid-step (`vakula_still`); `girls` — how many girls have come in; `laugh` — they roar with laughter or sing
carols; `chub_present`, `solokha_present` — in the hut; `passer` — a figure on the road beyond the window; `sack`,
`gift`, `gift_left`, `chub_hat` — things. The camera: `camera_x`, `camera_yaw` — to the bench and the door at once; on
the close-ups (`camera_target`) — straight.

## Waits

- The close-ups are for now made by the camera (`camera_target`, `medium`) on the people; the cards of the module
  `closeups` (the face in the mirror, Odarka's slippers) are not made.
- The night with the moon (`sack`, `moon` 1) is light, almost like the morning — so the scene's light sees the moon on
  the snow.

## Next (scenes.md)

Close-ups (`closeups`).
