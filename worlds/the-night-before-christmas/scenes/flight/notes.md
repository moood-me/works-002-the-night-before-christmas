# The Flight (`flight`)

The space of the flight; before the camera — Vakula astride the devil (the engine's people). The way lies on the ground,
where it is: the field behind Patsyuk's fence (haystacks), Dikanka ahead; further on the steppe with haystacks, a
windmill and farms, a forest, three villages, Petersburg — stone houses
and the palace with lit windows over the Neva. On the right all the way — the river in ice, along it a sledge road.
The camera flies over all this: `progress` moves it forward, `camera_h` raises it; back, home, it flies
facing Dikanka (`camera_yaw` 180). The same language as in "Dikanka": simple forms, snow,
an ink-blue night, warm windows, the moon, open space.

## Keys

| key | what | start |
| --- | --- | --- |
| `progress` 0…1 | the way: the script sets `camera_z` = progress × 6000 m (0 — the field, 1 — at the palace) | 0 |
| `camera_h` | the camera's height (the engine's key): 0 — on the field, at eye level; in flight ≈110 m. The takeoff (`takeoff`) is this | 0 |
| `bank` −1…1 | banking: the camera banks (`camera_roll`, up to 25°); in the air (`camera_h` > 20) the course drifts aside — the script changes `camera_x` (±260 m) | 0 |
| `climb` −1…1 | the nose up/down (`camera_pitch`, up to 12°); in the air the script changes `camera_h` (40…240 m) | 0 |
| `moon` 0…1 | the moon and its light | 1 |
| `moon_near` 0…1 | the moon close by: a huge crescent beside the fliers, the light stronger | 0 |
| `stars` 0…1 | the stars; the faint ones go out first | 1 |
| `riders` 0/1 | Vakula astride the devil before the camera (`devil`, `vakula` — the engine's people): they keep 5 m ahead along the camera's gaze (`camera_yaw`: home — ahead along the way back); on the field they lie on the snow before the eye and rise to the same height as the camera (`camera_h`) — in the frame they are in the same place. The script places them from the camera's keys — the `devil_*` themselves are not to be touched | 1 |
| `dawn` 0…1 | the dawn: the sky turns pink, the glow — in the south-east (ahead on the left on the way home), the stars go out one after another, the moon pales to a crescent with no halo | 0 |

`dawn` is a direction too (a slider on the site). Home (the beat `home`): `camera_yaw` 180 (the engine's key) and
`progress` from 1 to 0 — the camera flies back facing the way it goes.

## How it is made

- The camera `around` (`turn` 45): the flier looks about, 45° to the sides; it is moved by the film and the script
  (`camera_z`, `camera_h`, `camera_x`, `camera_roll`, `camera_pitch`), and `camera_yaw` turns
  it home. The sky is a full circle: ahead (north, toward Petersburg) — its middle; the moon on the right ahead,
  the dawn's glow in the south-east; stars all round the circle, the ends meet. The flight is seen both ways —
  there (the moon ahead on the right) and home (the glow ahead on the left), so the sky is painted all round, and
  that is the camera `around` (artist.md, `camera_yaw`: "a scene to be seen all round paints its sky … for
  around/roam"). In `picture` with `camera_yaw` 180 Dikanka is seen right, but the sky behind is only the edges of
  what is painted in front: an even gradient, with no glow, stars or moon.
- The ground does not move. The snow is one plane to the horizon in every direction (`ground`); the sledge road
  (`road`) and the river (`river`) are on the plane along the way, long ones — the engine paints them finer where they
  are near. The river's ice is `reflect` with `rough`: in it the sky, all that is over it and the moon's path.
- The buildings of the way are volumes, as in "Dikanka": huts (four walls and a hipped roof — planes with
  `tilt`, turned every which way), churches (a log frame, a tier, a drum, a tent dome, a cross), a windmill (a frame, a
  tent roof, the sails — a card), the stone houses of Petersburg and the palace (walls, a hipped roof, the palace with
  three pavilions with tent roofs); all on its front side (`on`), so from a height the roofs are seen. The light in the
  windows is a card of its own in front of the wall (`glows`, `inFront` of the wall), on the houses and the palace —
  in front and behind; each window's light — `e.light`, `hazeGlow` — the warm air by them. What a building is — its
  kind and size — is said once, in `lib.js` (`HOUSES`: hut, church, block, palace, windmill); the code of each face is
  one — `e.lib.house(g, e)`: by its id a face finds whose it is and which, and paints itself. The faces' places are in
  `scene.json`. The firs, the haystacks, the clouds, the fence are cards facing the eye (round and
  soft), in their daylight colours.
- The light is the engine's: the scene is lit (`ambient`), the hours are `light.looks` by the keys `moon`, `moon_near`,
  `dawn`, each with its haze; the moon shines from where it is painted (`lights`: `from: "moon#moon"`, `on` — `moon`,
  at dawn 0.3) — the snow by its slant, the walls and slopes by their turn, the clouds and the firs evenly. The sky
  (`sky`, `stars`, `moon`) paints its own hour itself.

## How to change the volumes

Elements are not made by code (`lib.js` and the modules only paint): the faces are listed in `scene.json`, the sizes in
`HOUSES` in `lib.js`. There is no generator, everything is changed by hand.

- **To move, to turn a building** — only its first element (the building's id): `across`, `distance` — the middle of
  its front side (for buildings with windows — 5 cm before the wall: this is the card of the windows' light),
  `facing` — where the front looks (180 — at the start). The other faces stand on it (`on`).
- **One more hut** — copy the nine elements of any hut (`<id>`, `_front`, `_b`, `_r`, `_l`,
  `_roof_f…_l`) under a new id, changing only the first; an entry in `HOUSES`; the files — `e.lib.house(g, e);`. The
  same for a church (18 faces with the cross; of the same `s`), a house, the palace.
- **Another size** — as in the notes of "Dikanka" (the section "How to change the volumes"): the walls at g (0.05),
  g + W, g + W/2 ± L/2; the slopes — `tilt` atan(h / run), `depth` √(run² + h²), an overhang of 0.5 m.

## People

`devil` flies face down (`fly`), `vakula` astride him (`on` — his hips, `up` 0.3; `ride`), his hands reaching for the
horns. They are placed by the script from the camera's keys (`riders`): from the flier's eye they are seen from behind,
the devil almost all under Vakula — his legs and tail are seen. What they do in flight (the devil bucks, Vakula makes
the sign of the cross over him, the hat) — not yet.

## Waits for the engine

- **A black line on the horizon from a height.** With the camera raised a pure black (0, 0, 0) runs along the horizon
  the whole width: at `camera_h` 110 m — a row of 1 px, at 240 — of 2 px, at 30 and on the field there is none; the
  same in `around` and in `picture`. It is drawn by the snow's plane to the horizon (`ground`, 1000 km): without it
  there is no line, and the sky painted below the horizon does not cover it. Somewhere in how `gl.js` lays a plane's
  far edge at the horizon with a raised camera (horizontal planes).
- **The near strip of long planes from a height.** The river and the road (`river`, `road`, 9 and 8 km) with the camera
  raised break off across the frame: at `camera_h` 110 — nearer than ~290 m before the camera they are not painted, at
  30 — they vanish in a strip ~180…300 m and are there again nearer; at 240 there is no strip (it is below the frame).
  The same at the scene's 3 and 8 s. It looks like the plane's tiles for a raised camera (`gl.js` `refinePlanes` /
  `tilesOf`, `engine.js` `planeTiles`).

## Next (scenes.md)

Vakula and the devil by the camera already fly (`riders`); next — what they do (`devil`, `buck`, `hat`, `look`, `tail`,
`squirm`, the cross `cross_v`, `cross_h`, `on_paper`, the paper `paper`, `gift`), the witch coming toward them
(`witch`), an element `view` — something to gaze at below, the film's beats (`field`…`home`).
