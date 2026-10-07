// The double doors open away into the rooms beyond as `doors` says: the left leaf turns on its hinge
// from 180 (shut) to 95, the right from 180 to 265 — `doors_l`, `doors_r` follow `doors` as it moves.
const OPEN = 85;
const turn = () => {
  const k = scene.get('doors') ?? 0;
  scene.set('doors_l', 180 - OPEN * k);
  scene.set('doors_r', 180 + OPEN * k);
};
scene.on('change', 'doors', turn);
scene.on('move', 'doors', turn);
turn();
