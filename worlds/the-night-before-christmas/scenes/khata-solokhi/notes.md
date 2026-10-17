# Soloha's Hut (`khata-solokhi`)

The widow's hut. Lower and closer than Tchub's Hut, warmer and darker: a rose-tinted whitewash, a ceiling of
smoke-blackened boards, and in the middle a big white stove with its mouth toward us, its chimney going into the
ceiling. By the stove's left side, in the lamplight, three sacks of coal (the game's hiding places). On the left by the
wall a bench, before it a table — the lamp, a bottle of cherry brandy (the only bright spot — ruby glass, glowing at its
edge toward the lamp), two bowls; across from the bench a stool. On the right in the wall a door to the yard, in the
back wall a small window. By the stove — a broom (Soloha is a witch). The hut is seen from a corner (the room is turned
by 32°): at Tchub's — frontal, light and roomy; here — a diagonal, the white volume of the stove against the dark
ceiling, the black sacks against the stove's lit side.

## Keys

All in `states` (what they mean, their ranges).

| key | what | start |
| --- | --- | --- |
| `lamp` 0…1 | the lamp on the table | 1 |
| `moon` 0…1 | the moon in the sky: in the window and beyond the door, its light in the hut; in chapter II stolen | 0 |
| `blizzard` 0…1 | the blizzard beyond the window and the door, snow blows in over the threshold | 0 |
| `door` 0…1 | the door: 0 — shut, 1 — flung open inward, toward the back wall | 0 |
| `door_turn` | the door's angle (180…264°, up to 269 at a knock) — set by `script.js` from `door` and `knock`, not to be touched | 180 |
| `knock` 0…3 | how many times someone has knocked: at each new knock the door shudders in its frame | 0 |
| `soot` 0…1 | a cloud of soot from the stove's mouth: up to 0.3 it bursts out, toward 1 it spreads and settles (the beat `chimney`) | 0 |
| `who` 0…4 | who is being hidden: 1 the devil, 2 the mayor, 3 the sacristan, 4 Tchub | 0 |
| `stuff` 0…1 | how far the one being hidden is in the sack already: the sack stands open until 1 | 1 |
| `in1`, `in2`, `in3` | who is in the sack: names joined by "+", as they got in — `devil`, `head`, `dyak`, `chub` (`'dyak+chub'`); `''` — coal only | `''` |
| `moon_floor` 0…1 | the moon has rolled out of the pocket and rolls along the floor from the sacks to the right, to the stove's mouth: 0 — still in the pocket | 0 |
| `moon_held` 0/1 | the moon in a hand — it is gone from the floor (the hand paints it) | 0 |
| `moon_up` 0…1 | the moon thrown into the stove: up to 0.35 it flies to the mouth, up to 0.6 in the stove — the mouth blazes, the hut floods with white, toward 1 gone up the chimney | 0 |
| `flood` | the moon's white light in the hut (the weight of `light.looks.flood`) — set by the script from `moon_up`, not to be touched | 0 |
| `which` 1…3 | which sack wriggles and sneezes | 1 |
| `wriggle` 0…1 | the sack `which` heaves about | 0 |
| `sneeze` 0/1 | when it becomes 1 — the sack `which` jumps and breathes out coal dust | 0 |

`door`, `blizzard`, `moon`, `soot` are directions too (sliders on the site).

A sack is the bigger the more is in it: coal, the devil is small, the mayor fat, the sacristan, Tchub (`BULK` in
`lib.js`). A name in `inN` it does not know the scene says as a warning. The moon on the floor — after it `moon_up`
lifts it from where it lay (`moon_floor`). Once the moon is back over Dikanka the game sets `moon` 1: the window turns
silver, cold light falls into the hut.

Named points: `stove#mouth` (the stove's mouth — where Soloha comes out of), `stove#top`, `flue#top` (where the chimney
goes into the ceiling — where the moon goes), `sack1#neck` … `sack3#neck` (and a sack's head — its point `sack1`…: a
line from the sack), `moon_in#moon` (the moon on the floor and in flight), `soot#cloud`, `door#handle`,
`threshold#step`, `table#top`, `lamp#flame`, `dishes#bottle`, `bench#seat` (Tchub), `stool#seat` (Soloha across from
him), `window#glass`. To be chosen — `sack1`, `sack2`, `sack3`, `stove`, `door` (standing cards).

## How it is made

- **The camera `roam`**: the room is 6 × 6 m, 2.3 m high; the start — in the front left corner, the gaze along the
  diagonal at the stove. The whole room stands on an unseen anchor `room` (the middle of the floor, `facing` 148): the
  walls, the floor, the ceiling, the stove, the sacks, the table, the yard — on it (`on`), in its axes x (to the right),
  z (from the front wall). Where things are — `AT` in `lib.js` (the same numbers as in `scene.json`: the painting needs
  them to find one thing from another — the dust by the sacks, the moon's path, the soot by the chimney). The light
  sources in `lights` are in the world's axes: the window and the door worked out from the room's axes.
- **What it shares with Tchub's Hut** is the world's module `khata` (`modules/khata.md`): the materials, a wall with
  openings (here with a rose-tinted whitewash), the stove's faces and its mouth, the mouth's outline, the bench, the
  table's side (with no cloth), the lamp, the window's glass and frame, the door, the threshold, the yard and the
  blizzard. In `lib.js` — this hut's sizes and only what is its own: the floor with coal dust, the smoke-blackened
  ceiling, the soot over the mouth, the sacks, the moon, the cloud of soot, the broom, the table's boards, the bottle
  and the bowls, the stool.
- **Volumes of cards and planes.** The stove (1.9 × 1.5 m, 1.6 high) — the front face `stove` with the mouth, on it the
  side ones, the back one, the stove-bed (a plane) and a chimney 0.6 × 0.6 m of four faces up to the ceiling. The table
  — its end toward us and its side (cards), the top (a plane). The bench — the board's edge and the seat. The stool —
  the legs and a round seat. The openings of the window and the door are cut in the walls and go through their
  thickness (0.4 m): the reveals, the sill, the lintels. All inside — `inside`.
- **The sacks** are cards facing the eye (the engine lights a round thing as round): a low-poly silhouette with facets,
  a tied knot or an open neck. `wriggle` bends the sides by a noise of time; the jump at a sneeze is from the moment
  `sneeze` became 1: the lib's `beforeFrame` remembers it (`sneezedAt`), the painting only reads it.
- **The moon** is parts (`e.part`) of the element `moon_in`: a crescent rolling like a wheel along a curve (`ROLL`), each
  frame at its own depth; it glows by itself (`glows`), its light is `moon_in#glow` (in `lights` — a reach of 5.5 m):
  the sacks, the table, the stool cast long shadows from it. Thrown, it flies in an arc to the mouth and vanishes in
  it; the mouth blazes white (`stove#moon`), white light floods the hut — the look `flood`.
- **The soot** is a card along the mouth, 12 cm in front of it: soft dark puffs, each going its own way.
- **The light is the engine's.** The base is a dark night with no moon (`ambient` 0.2, blue, into the hut comes
  `inside` 0.25); the looks: `moon`, `blizzard`, `flood`. The sources: the lamp (`lamp#flame`, `on` — `lamp`), the
  embers in the mouth (`stove#fire`, weaker than at Tchub's: Soloha has only just come down the chimney), the window
  and the open door — `daylight`, the moon — `from`, the moon on the floor, the moon in the stove. The shadows — of the
  stove (all its faces, the stove-bed, the chimney), the sacks, the table with its top, the bench, the stool, the broom
  (onto the stove's side too) — from each source that shines noticeably. The engine's bounced light (`light.bounce`
  0.35 — darker than by default: the shadows deeper).
- **The yard** — the snow round the hut (a plane, the hut's floor cut out), the wattle fence and a neighbour's hut
  beyond the door, a hut beyond the window, the sky all round; the blizzard — beyond the window, beyond the door and in
  the doorway (`blizzard_in`, `drift`).

## People and the film

The people are the engine's people (elements with `person`, the world's cast `modules/cast.js`, the motions —
`cast.md`): `solokha`, `chort`, `golova`, `dyak`, `chub`, `vakula`. The keys — `<id>_a`, `<id>_d`, `<id>_e` (the place
in the world's metres; `_e` — down, into a sack), `_do`, `_turn`, `_look`, `_reach`, `_with`, `_on`, `_gait`,
`_steps`, `_still`, `_here`. The hut is turned (the anchor `room`, 148°): the people's places in `script.js` are
written in the hut's axes and turned into the world's (`W`, `T`). The scene is a film in beats (the module `film`):
each beat's `from` is a cut into what the beats before it left by the canon (`WAY`).

The cut for the viewer: chimney → court → knock → hide → stuffed → guest_head → knock → hide → stuffed → guest_dyak →
knock → hide → stuffed → guest_chub → talk → knock → hide → stuffed → vakula_in → lift → carry. `stuffed` is a beat only
for this cut: the last to come is hidden as in the tale (the devil into the first sack, the mayor into the second, the
sacristan into the third, Tchub in with the sacristan); in the game "Sacks" the player plays it. The game's branches:
seen, moon_out, untie.

| beat | what | s |
| --- | --- | --- |
| chimney | out of the mouth, all soot — Soloha, she shakes herself off; after her the devil head over heels (`roll`), sneezes (`sneeze`) | 10 |
| court | the devil kisses her hand (`kiss_hand`), she laughs, flicks him on the snout (`reach`) | 8 |
| knock | three knocks (`knock`): all who are in the hut freeze (`_still`), look at the door | 2 |
| hide | (the game) "Sacks": Soloha at the sacks | 1 |
| moon_out | (the game) the moon: in a hand (`moon_held`, `moon_hand` — right/left), hot (`heat` — she tosses it, blows, `juggle`), into the stove (`moon_up` — `throw`); the moon's light from her hands — `lights.moon_hand` | 1 |
| guest_head, guest_dyak, guest_chub | they come in: the mayor shakes off the snow and sits down at the table, strokes his belly (`belly_seated`); the sacristan coughs and stretches his neck (`cough`); Tchub sits down heavily | 8–9.5 |
| seen | the one come in and the one not hidden freeze and bow to each other | 5.5 |
| talk | Tchub at the table (`talk_table`), Soloha across from him on the stool | 5 |
| vakula_in | Vakula comes in, sits down on the stool, gets up, looks at the sacks | 11 |
| lift | (the game) "Heavy": Vakula at a sack | 1.6 |
| untie | he unties them: out crawl (`crawl_up`) Tchub with the sacristan, the mayor, they go off one after another | 14 |
| carry | the sacks onto his shoulders (`lift_sack`, `carried`), he goes (`carry_walk`) | 7.4 |

The game's keys are turned into the people (`script.js`): `who`, `stuff`, `in1…in3` — who is being hidden: he is in
the sack's open neck, huddled (`huddle`), goes into it by `stuff` (up to 0.6 — beyond it the sack is all of him),
Soloha by him presses on his head and shoulder; who is in a sack is not seen. `head_present`, `dyak_present`,
`chub_present`, `vakula_present` — in the hut (in their places: the mayor and Tchub on the bench at the table, the
sacristan at the table's edge). `lift`, `which` — Vakula at a sack: lifted a little — he heaves it onto his shoulder
(`lift_sack`, then `carry_stand`; the sack by the stove hides — `carried`), let go — he sets it down. The camera: each
beat has its shot — the operator (`camera_target`, `camera_shot`) on Soloha, on the guest coming in (full length, to
the waist when he has sat down and talks), on the door at a knock, the sack near when someone is hidden in it; the long
shot is the scene's own camera (wider than `full` the operator goes through the walls of the little hut). At the end of
`carry` — Soloha alone, facing us.

## Waits

- The sacristan's legs out of the sack, a head stuck in the neck — not made: everyone is hidden alike.
- The moon in flight between the hands (`moon_hand` between −0.35 and 0.35) is not painted.

## Waits for the engine

Nothing found.

## Next (scenes.md)

Close-ups (`closeups`).
