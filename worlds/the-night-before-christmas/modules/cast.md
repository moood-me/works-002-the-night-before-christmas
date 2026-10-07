# cast — the people of «Ночь перед Рождеством» as the engine's people

A module for scenes with people (elements with `person`: `{"cast": "cast", "who": …}` — moood's docs/agents/people.md).
List it in a scene's `modules` with the others. All in the world's style `dikanka` (the engine's `geometry`: faceted, no
lines, no face — the scene's light lays itself on their colours, as on the huts).

## Who

- `vakula` — Vakula the smith, ~25: broad, a sheepskin kozhukh with a fleece collar and a red sash, wide dark trousers, a
  tall black lambskin hat (`shapka`, its top red cloth), black moustaches (`vusa`).
- `oksana` — Oksana, 17: an embroidered shirt, a red keptar over it, a dark-red plakhta (`plakhta`), a black braid with
  ribbons (`braid`), coral beads (`namysto`), red boots.
- `solokha` — the widow, stately and plump: a married woman's cap under a kerchief tied at the nape (`ochipok`), a dark
  plakhta, a brown keptar, beads.
- `chub` — the old Cossack: heavy, a long kozhukh, a blue sash, an enormous hat (`shapka_big`), grey moustaches hanging
  (`vusa_long`).
- `panas` — Kum Panas: smaller, a kozhukh, a hat, moustaches, his pipe in his mouth (`pipe`).
- `golova` — the village head: fat, a fine kozhukh, a blue sash, a big hat.
- `dyak` — the deacon: long and lean, a long dark kaftan (`kaftan`) to the ankles, a thin plait (`pigtail`), bare-headed.
- `odarka`, `divchyna1`, `divchyna2`, `divchyna3` — the girls who go carolling: short sheepskin coats over plakhty
  (`kozhushok`), kerchiefs tied under the chin (`platok`), braids; Odarka's red boots with gold (`gold_shoes`).
- `chort` — the devil: small and black, thin legs, horns (`horns`), a narrow snout with a pig's patch (`snout`), a goat's
  beard (`goatee`), a long tail swinging behind (`tail`).

A hat comes off with `wear: {hat: 'none'}`.

## Things in the hands (`<id>_with`)

`mirror` — Oksana's little mirror in a brass frame, held up by its handle in the right hand, its glass to her eyes (the
scene's own mirror on the table hides while she has it); `hat_hands` — a hat held in both hands before him (his own off:
`wear: {hat: 'none'}`); `cherevichki` — a pair of red shoes with gold, one in each hand; `cherevichki_r` — both in the
right hand; `sack_shoulder` — a big sack of coal on the right shoulder; `sack_small` — a small sack hanging from the left
hand; `moon` — the moon, a hot silver disc in the right hand.

## Motions (Kimodo's; put with put_motion)

Standing: `mirror` (loop: the right hand holds the mirror out, the left at the hair), `akimbo` (hands on the hips, chin
up), `proud` (arms folded, looking down at someone), `laugh` (hands on the belly, the head thrown back), `laugh_rock`
(rocking with laughter), `sing` (hands clasped, carolling, swaying), `examine` (something held in both hands at the
waist), `hug` (arms round someone's neck: with `reach` to their shoulders); once: `giggle` (a hand to the mouth), `vow`
(a fist to the chest, a nod), `bow` (a bow from the waist, a hand on the chest), `shake_snow` (brushing the snow off),
`wave_off` (a dismissive wave), `door_open` (pulls a door open and looks out), `shove` (both hands, a push), `refuse`
(both hands waving before the chest), `clap_shoulder` (the right arm out to someone's shoulder: with `reach`), `lift_up`
(bends, takes someone kneeling by the shoulders, straightens), `put_down` (sets something on the floor),
`try_on` (on one foot, pulling a shoe on the other), `fall_back` (pushed: staggers back, falls on the back, lies).
Gaits: `tiptoe` (creeping, bent, arms out), `waddle` (a fat man's sway).
On a chair or the bench (with `on` the seat — the hips over it as a pelvis sits): `sit_down` (once, onto a seat
behind), `rise` and `jump_up` (once, up), `sit_tease` (loop: hands on the hips, a gesture), `cap_seated` (loop: hands
in the lap, the head bowed — kneading the hat).
Kneeling: `kneel_down` (once, onto both knees, the hands out), `kneel_offer` (loop: on the knees, offering with both
hands). On the floor: `crawl_up` (once: from the hands and knees — out of a sack — up onto the feet).
