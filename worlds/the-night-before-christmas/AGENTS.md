# A world of moood

This repository is a world of moood (https://moood.me) as files. How to work in it:
https://github.com/moood-me/docs — principles.md first (what matters, what never to do), README.md, then the
scene's language, by the engine its scene.json says: scene-format-3.md for a new scene and one that says "engine": 3,
scene-format.md for one that says "engine": 2, scene-format-1.md for one that says neither (made for the old engine).

- Each deployment of moood has a branch of its own here: env/dev — moood's own, env/<computer>/<stack> — a
  stack on someone's computer. There is no main. Work in a branch of your own, begun from the
  branch of the deployment you work for (the MCP's world_repo says which).
- look_at_branch (an MCP tool) shows a scene of your branch rendered.
- Its texts are English; every other language is a translation beside them (lang/): moood's check (npm @moood/check)
  lays them out and checks them — a branch goes into a deployment's translated into every language.
- Merge your branch into the deployment's with git and push — never rewrite a deployment's branch — or
  merge_branch("<space>/<slug>" — this repository's name, its "--" a "/" —, your branch, a note), which checks
  only that it is yours to change.
