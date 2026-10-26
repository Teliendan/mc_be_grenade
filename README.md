# Grenade

Throwable grenade (`gm:grenade`): craft it from four copper nuggets and gunpowder, stack of
16, throw it with use. It flies in a slow, visible arc trailing sparks and smoke, lands, and explodes about 0.15 s later with a green
puff. The blast (radius 3, damage fading out to 6 blocks) hurts creatures but does not break
blocks, start fires or destroy items on the ground, and works underwater. Its damage counts as
the thrower's attack for every add-on (XP and player-only drops await an in-game check). Dispensers can fire it too.

Packs: `grenade_bp/` + `grenade_rp/`. Deploy with `.\mods deploy grenade` from the workspace.
Design, limits and in-game checks: [docs/VANILLA_PARITY.md](docs/VANILLA_PARITY.md).
Tests: `node tests/run.mjs` (also run by `.\mods verify grenade`).

## Localization

Nine locales use a mod-scoped contextual catalog. See [the localization notes](docs/LOCALIZATION.md) before adding or changing player-facing text.
