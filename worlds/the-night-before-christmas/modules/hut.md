# hut

The huts from inside — what the world's rooms have in common (Tchub's Hut, Soloha's Hut): the materials in their
daylight colours (the evening, the night, the morning are made by the scene's light), the walls, the stove, the bench,
the table, the lamp, the window, the door and the yard beyond them. The room's sizes and what only one hut has are in
the scene's `lib.js`; the module paints by the sizes it is given.

Each painter paints in its element's metres: a card — from its anchor, x along it (as seen standing facing it), y
down; a plane — from above, from its centre, y toward the viewer.

- **Colour:** `hex('#rrggbb')` → [r, g, b] 0…1, `lerp(a, b, u)`, `css(c, alpha)`, `rect(g, x0, y0, x1, y1, c,
  alpha)`, `fill(g, c, r = 10)` — the whole surface in one (the ceiling, the main beam, a board, the snow).
- **Materials:** `LIME` (whitewash), `CLAY` (a clay floor), `WOOD`, `DARK`, `LINEN`, `RED`, `INK`, `SOOT`, `BRASS`.
- `wall(g, w, h, holes, lime = LIME)` — a whitewashed wall w × h, the openings `[[x0, y0, x1, y1]…]` cut out
  (`evenodd`), a clay band along the bottom; `lime` — a tinted whitewash.
- `stove(g, e, x0, x1, h, x = null, fire = 1)` — a face of the stove; with `x` — the mouth with its middle at x: the
  ledge, the fire (`fire` 0…1 — how much of it is left; the light `id#fire`), the niche under it; the point
  `id#mouth`. `mouth(g, x)` — the mouth's outline (a path, to fill).
- `bench(g, e, L)` — the bench's edge L long and its legs, the point `id#seat`. `table(g, w, h, cloth)` — the table's
  side 2w long, the top at the height h: with a cloth (`cloth`, an overhang with embroidery) or a board's edge.
- `lamp(g, e)` — the lamp on the table by the keys `lamp` and `morning`: the light and the point `id#flame`.
- `pane(g, W)`, `frame(g, e, W)` — the window's glass (an element with `glass`) and the frame with its cross by the
  opening `W = { x0, y0, x1, y1 }`; the point `id#glass`.
- `door(g, e, w, h)` — a door from its hinge (x 0 → w), the point `id#handle`; `threshold(g, e, w)` — the threshold,
  `id#step`; `drift(g, e)` — the snow blown in over the threshold (a plane; by the keys `blizzard` × `door`).
- **The yard:** `sky(g, e)` — the sky all round by `morning`, `blizzard`, `moon` (stars); `snow(g, e, hole)` — the snow
  (a plane; `hole` — [x0, y0, x1, y1], the hut's floor, cut out); `hut(g, e)` — a neighbour's hut with warm windows;
  `road(g)` — the street with ruts (a plane); `fence(g)` — a wattle fence of 20 m.
- `blizzard(g, e, [w, top, n, speed], storm)` — the blizzard on a card: half-width w, height top, n strokes at full,
  drift speed; `storm` 0…1 — how much of it there is. The wind in gusts: how far the snow has gone the module's
  `beforeFrame` sums up (`blown`), the painting only reads it.
