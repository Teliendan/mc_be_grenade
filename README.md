# Grenade

Throwable grenade item (`gm:grenade`) with a crafting recipe and an exploding
projectile entity (`gm:grenade_projectile`).

Packs: `grenade_bp/` + `grenade_rp/`. Deploy with `mods deploy grenade` from the workspace.

Notes: the throw arc settled at entity `power: 2.4`, `gravity: 0.03`, with the item's
`minecraft:throwable` carrying only `do_swing_animation` (see the Claude memory
`bedrock-projectile-traps` for why, and how to measure if it needs retuning).
