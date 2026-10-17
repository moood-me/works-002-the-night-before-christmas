# Dikanka (`main`)

The village street on Christmas Eve. The world's first scene: it sets the world's style. In it — the street's film (the
engine's people).

## Style

Modern and fine: clean volumes, big empty planes, light and reflections. No lubok, no ornaments, no outlines, no
"olden" textures. A huge clear sky and a big moon over a small village; the snow glows; an ink-blue palette and rare
warm windows — the main contrast. The huts are whitewashed boxes under a hipped roof, one snowy plane to each slope; the
church on the rise — three log frames with tiers of roofs and domes, as a silhouette; the well's sweep — a single line;
the wattle fence — a band of weave and the rhythm of its stakes. The street is iced over: the ice is a mirror of all
that is above it.

The moon stands over the village in front — the light in our face: long shadows reach toward the viewer, the slopes
turned to the moon are lighter.

## Keys

All in `states` (what they mean, their ranges). `moon` 0…1 (0 — stolen: only the windows glow), `moon_x`/`moon_y`
(where the crescent is on the screen), `stars`, `blizzard`, `dawn`, `morning`, `windows`. `blizzard`, `dawn`, `morning`
are directions too (sliders on the site).

Named points: `chub#window` (the window in frost — Oksana's), `door#door`, `chimney_solokha#mouth` (Soloha's chimney),
`smithy#door` (the smithy), `church#wall` (the church wall), `moon#moon`; the huts' windows — `<hut>#window1…` (the
window in the end wall of Soloha's hut — `solokha_lwin#window3`).

## People and the film

The people are the engine's people (elements with `person`, the world's cast `modules/cast.js`, the motions —
`cast.md`): `chub_kozak` (Tchub — the man; `chub` is his hut), `panas`, `vakula`, `oksana`, the carollers `parubok1`
(with the star), `parubok2`, `odarka`, `divchyna1…3`. The keys — `<id>_a`, `<id>_d` (the world's metres; they stand on
the scene's relief), `_do`, `_turn`, `_look`, `_reach`, `_with`, `_gait`, `_steps`, `_here`. The sack Vakula throws
down — `sack` (`sack`, `sack_a`, `sack_d`; its neck — `sack#neck`). The scene is a film in beats (the module `film`);
the cut for the viewer: chub_out → lost → kolyadka → farewell.

| beat | what | s |
| --- | --- | --- |
| chub_out | Tchub and his crony come out of Tchub's door; Tchub looks at the sky — the moon goes out (`moon` → 0), he throws up his arms (`sky_wonder`); they go out of the gate into the dark | 12 |
| lost | a blizzard (`blizzard` 1), no moon: the two, bent, shielding their faces (`blizzard_walk`), trudge down the street and stop as silhouettes against Tchub's window; they look about; the crony goes off right into the snow, Tchub to his gate and into the hut | 27.5 |
| kolyadka | the moon is in the sky again: the carollers come down the street — in front a lad with the star on its pole (`zirka`, `star_walk`) — stop under Tchub's windows and sing (`sing`) | 18.5 |
| farewell | (after kolyadka) Oksana comes out to them; Vakula with a sack on his shoulder and a small one in his hand (`carry_walk`) throws the sack down before her (`put_down`), bows (`bow`) and goes off up the street; they laugh; Odarka and a girl drag the sack in at Tchub's gate, walking backwards (`drag_back`) | 34 |

The camera is the scene's own, with offsets (`camera_x`, `camera_z`, `camera_yaw`): the night with no moon is dark
(only the windows glow), so in `lost` the camera stands so that the two come up against Tchub's window — they are seen
as silhouettes.

## How it is made

- **The light is the engine's.** The scene is lit: things are painted in their daylight colours, the night is made by
  the light (`light.ambient`, `ambientColor`). The hours are `light.looks` by keys, in order: `moon` (the night with
  the moon), `dawn`, `morning`, `blizzard` — each with its haze (`haze`, `hazeColor`); with no moon — the dark base.
  `hazeGlow` — the warm air at the windows. The sky (`sky`, `stars`, `moon`) paints its own hour itself.
- **The sources** (`lights`): the moon shines from where the crescent is painted (`from: "moon#moon"` — it follows
  `moon_x`, `moon_y`), `on` — `moon`; the morning sun — `from` the right, `on` — `morning`. How much of the moon is
  left the looks say: at dawn 0.3, in the blizzard 0.15, in the morning 0. The windows — each window's `e.light` (its
  name — the window's point). The shadows are the engine's: `shadow` on the huts' walls and slopes, on all the church's
  faces (the frames, the tiers, the drums, the domes, the crosses), on the well, the poplars, the sweep, the fence —
  onto the snow, the street, the ice, the road, from each source that shines noticeably. A hut's shadow is cast
  together with its roof.
- **Volumes.** A hut is four walls (cards, `facing` by its turn) and a hipped roof — four planes with `tilt` (the front
  and back slopes trapezia, the end ones triangles); all stand on its front (`on`), so a hut is placed and turned by
  one element. The church is three log frames, each with its tier of roof (four slopes and a top), a drum (four walls),
  a dome (four slopes as a tent) and a cross; all on the front wall of the middle frame (`church`), the frames go 0.6 m
  into the slope. The well is a frame of four walls with snow on it, the sweep a card of round poles facing the eye.
  The engine's light lies on each face by its turn to the moon and the sun. What a thing is — its sizes and windows —
  is said once, in `lib.js` (`KHATY`, `CHURCH`); the code of each face is one and the same (`e.lib.khata(g, e)`,
  `e.lib.church`, `e.lib.well`): by its id a face finds whose it is and which, and paints itself.
- **Windows.** The glass, the glazing bars and the frost are on the wall (lit as the wall is). The light in the windows
  is a card of its own in front of the front wall (`<hut>`, `glows`: the night does not dim it), 1.5 cm from the wall
  and `inFront` of it (otherwise the wall, its centre standing nearer, is painted over it); it is also the hut's parent
  (`on`), the windows' points are on it. Tchub's door is a card of its own on the wall (`inFront`), the warm strip
  under it is on Tchub's windows' card.
- **The ground:** `relief` — the rise under the church; the snow, the street, the road to the steppe are planes with
  `drape` (they lie on it), `lit` (the windows fall on them in patches). The rise is carried by the snow's plane itself
  (4 km): the engine lays it on the relief the finer the more sharply it bends, and lights the slopes by their slant.
  The church's frames and the poplars' trunks go a little into the ground — the slope before them meets them with no
  gap. The ice is a plane with `reflect` and `rough`: in it the church, the poplars, the windows, the sky and the moon's
  path (from a high moon — at the bottom edge, at `moon_y` 0.35 — long). The sparkles at our feet — a plane with
  `glows`.
- **The fence** is one thing of parts (`e.part`): each stretch stands at its own depth.
- **The chimneys** are cards of their own on the slopes (`chimney_*`, `on` the hut, 25 cm into the roof), with smoke.
- **The blizzard** — strokes of snow on two cards (`blizzard_near`, `blizzard_far`). The wind in gusts: how far the
  snow has gone the lib's `beforeFrame` sums up from the gusts (`blown`), the painting only reads it — a frame is the
  same whether the frames before it were painted or not.
- **The night with the moon**: the moon is in front, the huts' shadowed sides are turned to us — they are held up by the
  `ambient` of the look `moon` (0.6) and by the light thrown back by the snow (the engine's `light.bounce`, 0.5 — none
  set of our own), the moon is 0.8: the walls read, the snow does not burn out.

## How to change the volumes

An element's code cannot make elements (`lib.js` and the modules only paint), so the faces are listed in `scene.json`
and their sizes in `lib.js`. There is no generator: everything is changed by hand.

- **To move, to turn a hut** — only its first element (`<hut>`): `across`, `distance` — the middle of its front (1.5 cm
  before the wall), `facing` — where the front looks (180 — at the start). The other faces stand on it (`on`) and go
  with it.
- **A new hut of the same size** — copy the nine elements of a like one (`<id>`, `_front`, `_b`, `_r`, `_l`,
  `_roof_f`, `_roof_b`, `_roof_r`, `_roof_l`) under a new id, unchanged but for the first; an entry in `KHATY`; the
  files `elements/<id>….js` — `e.lib.khata(g, e);`.
- **Another size** — the entry in `KHATY` and the faces' places (metres from the first element; g = 0.015 if the front
  has windows, otherwise 0 — then the first element is the front wall itself and there is no `_front`; o = 0.45 — the
  overhang):
  - `_front`: `distance` g, `facing` 180; `_b`: `distance` g + W, `facing` 0; `_r` / `_l`: `across` ±L/2,
    `distance` g + W/2, `facing` 90 / 270; `_lwin` (windows in the end wall): `across` −L/2 − g, `distance` g + W/2;
  - the roof — h = ridge − eave, Lb = L + 2o, Wb = W + 2o, Lt = L − 0.85 W, the middle cy = g + W/2, all the slopes
    at `elevation` eave + h/2: `_roof_f` — `distance` cy − Wb/4, `width` Lb, `depth` √((Wb/2)² + h²),
    `tilt` atan(h / (Wb/2)); `_roof_b` — the same, `distance` cy + Wb/4, `rotation` 180; `_roof_r` / `_roof_l` —
    `across` ±(Lb + Lt)/4, `distance` cy, `rotation` 90 / 270, `width` Wb, `depth` √(((Lb − Lt)/2)² + h²),
    `tilt` atan(h / ((Lb − Lt)/2));
  - a chimney — `on` the hut, `elevation` — the slope's height there less 0.25.
- **The church** — likewise from `church` (the front wall of the middle frame, `elevation` −0.6): a frame's size
  a = 6.2 s, its walls `_b`/`_r`/`_l` (the side frames — `church_w_f`…, `church_e_f`…, on `church`, `across` x), the
  tier with its middle 3.1 m behind `church` at the height 7.5 s + 0.6, the drum and the dome over it — by `CHURCH`.

## Waits for the engine

- **The shadows of one volume's faces add up.** Each face (a wall, a slope) lays its shadow over the others (`gl.js`,
  `drawShadowOf`: each caster is a pass of its own with `blendFunc(ONE, ONE_MINUS_SRC_ALPHA)`), so where the shadows
  of one hut's faces overlap the shadow is darker, and the faces' edges show. It is strongest in the morning
  (`morning` 1: the low sun on the right, the huts on the right by the well). A point in one source's shadow is equally
  dark however many faces cover it: on a receiver the shadows of one source should merge (the maximum), not pile up.

- **The light of the carollers' star.** The star on the pole (`zirka`) is paper: the scene's light lies on it as on
  everything, it has no light of its own. The candles in it wait for the engine: a person's points (`#hands`, `#head`…)
  are joints, a part of the cast has no point of its own, and a source `lights[].at` cannot be set at the top of the
  pole; nor can the colour of a part that glows by itself (does not dim at night).

## Next (scenes.md)

The sledge, the witch out of Soloha's chimney, the devil with the moon in the street (`moon_held`, `heat`, `pocket`),
Christmas morning — the people going to church, the church wall close (`closeup`). Tchub's window in frost is the place
for `window_oksana`.
