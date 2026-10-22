# film — a scene's film in beats, for the game

A film scene is cut into beats. The game starts them one at a time. Between the beats — choices, mini-games, lines; meanwhile the scene lives (breathing, fire, rain) and holds the beat's last pose.

```js
// the scene's script.js ("modules": ["chrysalids", "film"] in scene.json)
scene.kit.film.beats(scene, {
  enter: { from: { david_a: -3 }, rows: [[1, 'david_a', 0, 3, 'inOut']] },
  ask: { after: 'enter', from: { … }, rows: [ … ] },
  ask_lie: { after: 'enter', from: { … }, rows: [ … ] }, // a branch
}, { film: ['enter', 'ask'] });
```

- **The state key `beat`.** A beat's name starts that beat from the beginning. When the last row has ended, the scene says `scene.tell('beat:<name>')`. The game waits for it (`g.beat` in the game's code).
- **`film`, or no key at all** — the scene's own cut: the beats of `film` one after another. The world's viewer sees it. Put `"state": { "beat": "film", … }` in `scene.json`.
- **`rows`** — rows as in `scene.play`: `[at | '+s', key, value, over?, ease?]`, `[at, fn]`, `[at, key, {turn}]`, `[at, [keys], {path}]`. Seconds — from the beat's beginning.
- **`from`** — the values the beat begins with. They are set at once if the beat does not come after one of its `after` (the scene was opened at it, or another came before it). So the game can begin at any beat. It is a cut (`scene.cut`): the people are at once where `from` puts them — they do not walk there. `from` must describe all that the beat does not set itself.
- **A new beat cuts off the one going on:** its rows that have not begun yet will not begin. Movements begun go to their end. If the beat cut off is in the new one's `after`, `from` is not set: the new one goes on from what there is (a branch in the middle of a beat — without a jump). The rows of the beat cut off that have not begun yet the new one must set itself, if they are needed.
- **Branches** — separate beats with the same `after`.
- **Holding** — after a beat the values stay; the people of the module `chrysalids` breathe by themselves. If a pose must live more visibly (weeping, trembling), that is a part of the pose, not a new beat.

The camera a beat puts elsewhere at once (a `camera_*` row without `over`; in the scene's own cut, the next beat's `from` when it cuts to it) is made ready ahead of its moment (`scene.prepare`), as `scene.play` does: the new shot is shown at once, made.
