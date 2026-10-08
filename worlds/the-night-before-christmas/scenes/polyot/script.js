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

// Vakula on the devil's back (the engine's people, the world's cast), flying before the flyer's eye as `riders` says: the
// devil stretched out (`fly`), Vakula astride him (`on` his hips; `ride`), his hands on the horns. They keep AHEAD metres
// before the camera the way it faces (home: behind it on the way there); on the field they lie on the snow before the eye,
// and go up as high as it goes up (camera_h), where they are in the frame staying the same.
const AHEAD = 5, UP = 0.3;
const place = () => {
  const yaw = ((scene.get('camera_yaw') ?? 0) * Math.PI) / 180, here = (scene.get('riders') ?? 0) > 0.5;
  scene.set('chort_here', here);
  scene.set('vakula_here', here);
  scene.set('chort_steps', false);
  scene.set('chort_a', (scene.get('camera_x') ?? 0) + AHEAD * Math.sin(yaw));
  scene.set('chort_d', (scene.get('camera_z') ?? 0) + AHEAD * Math.cos(yaw));
  scene.set('chort_e', Math.max(0, scene.get('camera_h') ?? 0));
  scene.set('chort_turn', scene.get('camera_yaw') ?? 0);
};
for (const key of ['camera_x', 'camera_z', 'camera_h', 'camera_yaw', 'riders']) follow(key, place);
scene.set('chort_do', { motion: 'fly', loop: true });
scene.set('vakula_on', { at: 'chort#hips', up: UP });
scene.set('vakula_turn', 0);
scene.set('vakula_do', { motion: 'ride', loop: true });
scene.set('vakula_reach', { r: 'chort#head', l: 'chort#head' });
