# Grenade

Throwable grenade item (`gm:grenade`) with a crafting recipe and an exploding
projectile entity (`gm:grenade_projectile`).

Packs: `grenade_bp/` + `grenade_rp/`. Deploy with `mods deploy grenade` from the workspace.

Notes: the throw arc settled at entity `power: 2.4`, `gravity: 0.03`, with the item's
`minecraft:throwable` carrying only `do_swing_animation`. Shared source:
[projectile notes](../../.claude/skills/bedrock-modding/references/07-projectiles.md).

Group21 fixes: [implementation and pending game checks](docs/PARITY_INSPECTION.md).
For later testing on another machine, use the self-contained
[game checklist](../../docs/grenade-game-checks.md), including baseline revision,
setup,21 pending cases and a results template. No new native results are claimed.
Impact/ownership regressions run with `node tests/run.mjs` and automatically
during normal workspace verification/deployment. Named selections are
`mods verify grenade --suite impact-timing` and `--suite ownership`.

## Localization

Nine locales use a mod-scoped contextual catalog. See [the localization notes](docs/LOCALIZATION.md) before adding or changing player-facing text.
