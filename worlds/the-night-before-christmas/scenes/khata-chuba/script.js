// The door turns on its hinge as `door` says: shut (0) faces the room, open (1) swung in toward the
// stove — its angle, `door_turn`, follows `door` as it moves.
const turn = () => scene.set('door_turn', 180 + 84 * (scene.get('door') ?? 0));
scene.on('change', 'door', turn);
scene.on('move', 'door', turn);
turn();
