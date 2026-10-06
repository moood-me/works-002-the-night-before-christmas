// The land comes on as the flight goes: each thing's distance (its `place`) from `progress`.
const flow = () => {
  const p = scene.get('progress') ?? 0;
  for (const [key, b] of scene.lib.FLOW) scene.set(key, scene.lib.distanceOf(b, p));
};
scene.on('change', 'progress', flow);
flow();

// Aloft, banking turns the flight aside and climbing lifts it (or drops it): the camera goes with it.
scene.every(0.05, () => {
  const h = scene.get('camera_h') ?? 0;
  if (h < 20) return;
  const bank = scene.get('bank') ?? 0;
  const climb = scene.get('climb') ?? 0;
  if (bank) scene.set('camera_x', scene.anim.clamp((scene.get('camera_x') ?? 0) + bank * 1.4, -260, 260));
  if (climb) scene.set('camera_h', scene.anim.clamp(h + climb * 0.7, 40, 240));
});
