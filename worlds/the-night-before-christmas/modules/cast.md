# cast — the people of "The Night Before Christmas" as the engine's people

A module for scenes with people (elements with `person`: `{"cast": "cast", "who": …}` — moood's docs/agents/people.md).
List it in a scene's `modules` with the others. All in the world's style `dikanka` (the engine's `geometry`: faceted, no
lines, the engine's face `simple` — at rest, or as `<id>_mood` says; the scene's light lays itself on their colours, as on the huts).

## Who

- `vakula` — Vakula the smith, ~25: broad, a sheepskin coat (`sheepskin`) with a fleece collar and a red sash, wide dark trousers, a
  tall black lambskin hat (`lambskin_hat`, its top red cloth), black moustaches (`moustache`). `vakula_feast` — he on Christmas
  morning: a new grey hat with a gold top, a new sash (worn over him: `wear`).
- `oksana` — Oksana, 17: an embroidered shirt, a red sleeveless jacket over it, a dark-red wrap skirt (`wrap_skirt`), a black braid with
  ribbons (`braid`), coral beads (`beads`), red boots.
- `solokha` — the widow, stately and plump: a married woman's cap under a kerchief tied at the nape (`married_cap`), a dark
  wrap skirt, a brown sleeveless jacket, beads.
- `chub` — the old Cossack: heavy, a long sheepskin coat, a blue sash, an enormous hat (`big_hat`), grey moustaches hanging
  (`long_moustache`).
- `panas` — Panas, Tchub's crony: smaller, a sheepskin coat, a hat, moustaches, his pipe in his mouth (`pipe`).
- `mayor` — the mayor: fat, a fine sheepskin coat, a blue sash, a big hat.
- `sacristan` — the sacristan: long and lean, a long dark kaftan (`kaftan`) to the ankles, a thin plait (`pigtail`), bare-headed.
- `odarka`, `girl1`, `girl2`, `girl3` — the girls who go carolling: short sheepskin coats over wrap skirts
  (`short_sheepskin`), kerchiefs tied under the chin (`kerchief`), braids; Odarka's red boots with gold (`gold_shoes`).
- `lad1`, `lad2` — the lads who go carolling: sheepskin coats, sashes, lambskin hats; the first carries the star.
- In Petersburg: `tsaritsa` — the Tsaritsa: powdered hair in a bun, a small crown (`diadem`), a silver-white gown to the
  floor (`gown`) with an ermine collar and the blue ribbon of St Andrew; `potemkin` — tall, a green uniform coat to the
  knees (`uniform`), the ribbon and the star, powdered hair; `zaporozhets1`, `zaporozhets2` — the Zaporozhtsy: long
  coats with wide sashes (`long_coat`), shaved heads with a forelock (`forelock`), long moustaches.
- `devil` — the devil: small and black, thin legs, horns (`horns`), a narrow snout with a pig's patch (`snout`), a goat's
  beard (`goatee`), a long tail swinging behind (`tail`).

A hat comes off with `wear: {hat: 'none'}`.

## Things in the hands (`<id>_with`)

`mirror` — Oksana's little mirror in a brass frame, held up by its handle in the right hand, its glass to her eyes (the
scene's own mirror on the table hides while she has it); `hat_hands` — a hat held in both hands before him (his own off:
`wear: {hat: 'none'}`); `slippers` — a pair of red shoes with gold, one in each hand; `slippers_r` — both in the
right hand; `whip` — a Cossack's whip in the right hand, the lash hanging; `paintbox` — the Tsaritsa's gift for
learning: a box of paints in both hands, a rolled letter on it; `sack_shoulder` — a big sack of coal on the right shoulder; `sack_small` — a small sack hanging from the left
hand; `star` — the carollers' star: a pole held upright in both hands (plumb through them), an eight-pointed paper star on
its top, gold and red rays round a white middle; `moon`, `moon_l` — the moon, a hot silver disc in the right hand, in the left (its light is the scene's:
a light `"at"` the hands).

## Motions (Kimodo's; put with put_motion)

Standing: `mirror` (loop: the right hand holds the mirror out, the left at the hair), `akimbo` (hands on the hips, chin
up), `proud` (arms folded, looking down at someone), `laugh` (hands on the belly, the head thrown back), `laugh_rock`
(rocking with laughter), `sing` (hands clasped, carolling, swaying), `examine` (something held in both hands at the
waist), `hug` (arms round someone's neck: with `reach` to their shoulders); once: `giggle` (a hand to the mouth), `vow`
(a fist to the chest, a nod), `bow` (a bow from the waist, a hand on the chest), `shake_snow` (brushing the snow off),
`wave_off` (a dismissive wave), `door_open` (pulls a door open and looks out), `shove` (both hands, a push), `refuse`
(both hands waving before the chest), `clap_shoulder` (the right arm out to someone's shoulder: with `reach`), `lift_up`
(bends, takes someone kneeling by the shoulders, straightens), `put_down` (sets something on the floor),
`try_on` (on one foot, pulling a shoe on the other), `fall_back` (pushed: staggers back, falls on the back, lies — it
turns them: ask for its end's facing from where it begins), `mustache` (twirls the moustache), `sky_wonder` (looks up at the sky, throws both arms up, lowers them), `gracious` (a woman's word: one hand on the hip,
the other up, palm open, and down).
The devil and the guests: `roll` (once: a forward roll and up — tumbling out of the stove), `sneeze` (once),
`kiss_hand` (once: bows, takes a hand, kisses it, with a flourish), `cough` (once: into the fist, then the neck out),
`juggle` (loop: a hot thing tossed from hand to hand, blown on), `throw` (once: overhand), `huddle` (loop: down on the
heels, hunched — into a sack), `lift_sack` (once: bends, heaves a big sack up onto the right shoulder), `carry_stand`
(loop: under a sack on the shoulder).
Gaits: `tiptoe` (creeping, bent, arms out), `blizzard_walk` (bent against the wind, both hands shielding the face),
`star_walk` (the hands together at the chest — a pole held upright: with `star`; standing with it: `sing`), `waddle` (a fat man's sway), `drag_back` (walking backwards, pulling
something along the floor: a backward gait), `carry_walk` (bent under a sack on the right shoulder).
Flying: `fly` (loop: face down, stretched out, the legs kicking — the devil in the air; lifted by the place's
`elevation`), `ride` (loop: seated, the thighs forward, the shins hanging — astride: `on` the devil's hips).
On a chair or the bench (with `on` the seat — the hips over it as a pelvis sits): `sit_down` (once, onto a seat
behind), `rise` and `jump_up` (once, up), `sit_tease` (loop: hands on the hips, a gesture), `cap_seated` (loop: hands
in the lap, the head bowed — kneading the hat), `belly_seated` (loop: leaning back, stroking the belly), `talk_table`
(loop: hands on the table, talking).
Kneeling: `kneel_down` (once, onto both knees, the hands out), `prostrate` (once: down onto the knees, then face to the
floor, held there), `bow_up` (once: from face to the floor up to kneeling upright), `kneel_offer` (loop: on the knees, offering with both
hands), `stand_up` (once, off the knees). On the floor: `crawl_up` (once: from the hands and knees — out of a sack — up onto the feet).
