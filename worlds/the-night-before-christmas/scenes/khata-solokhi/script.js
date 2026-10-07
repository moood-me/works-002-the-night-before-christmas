// The door turns on its hinge as `door` says: shut (0) faces the room, open (1) swung in toward the
// back wall — its angle, `door_turn`, follows `door` as it moves. A knock (`knock` counting up) jolts
// it in its frame: in a little, and it springs back.
const OPEN = 84;
const JOLT = 5;
const shut = () => 180 + OPEN * (scene.get('door') ?? 0);
const turn = () => scene.set('door_turn', shut());
scene.on('change', 'door', turn);
scene.on('move', 'door', turn);
scene.on('change', 'knock', (now, was) => {
  if ((now ?? 0) <= (was ?? 0)) return;
  scene.play([
    [0, 'door_turn', shut() + JOLT, 0.06, 'out'],
    ['+0', 'door_turn', shut(), 0.5, 'spring'],
  ]);
});
turn();

// The moon thrown into the stove (moon_up) floods the hut with its white light while it is in there,
// going up the flue: `flood`, the weight of the light's look, follows moon_up.
const { span } = scene.anim;
const flood = () => {
  const u = scene.get('moon_up') ?? 0;
  scene.set('flood', span(u, 0.36, 0.5) * (1 - span(u, 0.6, 0.95)));
};
scene.on('change', 'moon_up', flood);
scene.on('move', 'moon_up', flood);
flood();
