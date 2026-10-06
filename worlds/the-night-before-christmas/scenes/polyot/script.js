// The flight goes along the way as `progress` says: the camera, ROUTE metres at the end. Banking
// tips the camera (camera_roll), climbing raises its nose (camera_pitch) — moving as they move.
const ROLL = 25;
const PITCH = 12;
const follow = (key, fn) => {
  scene.on('change', key, fn);
  scene.on('move', key, fn);
  fn();
};
follow('progress', () => scene.set('camera_z', (scene.get('progress') ?? 0) * scene.lib.ROUTE));
follow('bank', () => scene.set('camera_roll', ROLL * (scene.get('bank') ?? 0)));
follow('climb', () => scene.set('camera_pitch', PITCH * (scene.get('climb') ?? 0)));

// Aloft, banking turns the flight aside and climbing lifts it (or drops it).
scene.every(0.05, () => {
  const h = scene.get('camera_h') ?? 0;
  if (h < 20) return;
  const bank = scene.get('bank') ?? 0;
  const climb = scene.get('climb') ?? 0;
  if (bank) scene.set('camera_x', scene.anim.clamp((scene.get('camera_x') ?? 0) + bank * 1.4, -260, 260));
  if (climb) scene.set('camera_h', scene.anim.clamp(h + climb * 0.7, 40, 240));
});
