// How much the moon shines (lights.moon): as `moon` says, paler as the dawn comes, not at all in the
// morning or through the blizzard.
const KEYS = ['moon', 'dawn', 'morning', 'blizzard'];
const shine = () => {
  const v = (k, d) => scene.get(k) ?? d;
  scene.set('moonlight', v('moon', 1) * (1 - 0.7 * v('dawn', 0)) * (1 - v('morning', 0)) * (1 - 0.85 * v('blizzard', 0)));
};
for (const k of KEYS) {
  scene.on('change', k, shine);
  scene.on('move', k, shine);
}
shine();
