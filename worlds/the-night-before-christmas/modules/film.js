// film — a scene's film in pieces (beats), for a game to play one at a time (film.md says how).
//   scene.kit.film.beats(scene, BEATS, { film: [names…] })
// BEATS: { <name>: { rows: [scene.play rows], from: { key: value… }, after: name | [names] } }
// The scene's `beat` (a state key) says which beat plays: set to a name, that beat plays from its
// start; when its last row has ended the scene tells 'beat:<name>' (scene.tell) — of a name it
// hasn't, at once 'beat-unknown:<name>'. `film` (or no beat at all) — the scene's own cut: the
// beats of `film`, one after another (what a viewer of the world sees). A beat begun while another
// still plays stops that one (its rows not yet started never start; the moves already started go
// on). `from` — the values the beat begins at: set at once when the beat does not follow one of
// `after` — the one before it, ended or still playing (the scene opened at it, or another beat came
// before), so a game may begin anywhere.
return {
  beats(scene, beats, { film = [] } = {}) {
    let gen = 0, last = null; // the beat before: the one playing, or the one that ended last
    const follows = (b, prev) => prev != null && [].concat(b.after ?? []).includes(prev);
    function play(name, then) {
      const b = beats[name];
      if (!b) return void scene.tell(`beat-unknown:${name}`);
      const mine = ++gen;
      // (a cut: the people already where it has them, facing as they are turned — no steps there from where they were)
      if (b.from && !follows(b, last)) scene.cut(b.from);
      last = name;
      // the rows timed as scene.play times them ('+s' after the row before ends), each one only if
      // this beat still plays
      let end = 0, at = 0;
      for (const row of b.rows || []) {
        const [when, a, v, over = 0, ease] = row;
        const start = typeof when === 'string' && when.startsWith('+') ? at + Number(when.slice(1)) : Number(when);
        const act = typeof a === 'function' ? a
          : Array.isArray(a) && v && typeof v === 'object' && Array.isArray(v.path) ? () => scene.path(a, v.path, { over, ease })
          : v && typeof v === 'object' && 'turn' in v ? () => scene.turn(a, v.turn, over, ease)
          : () => scene.set(a, v, over, ease);
        scene.after(start, () => { if (gen === mine) act(); });
        at = start + (typeof a === 'function' ? 0 : over);
        end = Math.max(end, at);
      }
      scene.after(end, () => {
        if (gen !== mine) return;
        scene.tell(`beat:${name}`);
        then?.();
      });
    }
    const cut = i => { if (i < film.length) play(film[i], () => cut(i + 1)); };
    const go = v => { if (v === 'film' || v == null) cut(0); else play(v); };
    scene.on('change', 'beat', v => { if (v != null) go(v); });
    go(scene.get('beat'));
  },
};
