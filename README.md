# Grenade

Throwable grenade (`gm:grenade`): craft it from four copper nuggets and gunpowder, stack of
16, throw it with use. It flies in an arc, lands, and explodes about 0.15 s later with a green
puff. The blast (radius 3) hurts entities but does not break blocks or start fires, and works
underwater. Kills are credited to the thrower (XP, player-only drops). Dispensers can fire it too.

Packs: `grenade_bp/` + `grenade_rp/`. Deploy with `.\mods deploy grenade` from the workspace.
Design, limits and in-game checks: [docs/VANILLA_PARITY.md](docs/VANILLA_PARITY.md).
Tests: `node tests/run.mjs` (also run by `.\mods verify grenade`).

## Localization

Nine locales use a mod-scoped contextual catalog. See [the localization notes](docs/LOCALIZATION.md) before adding or changing player-facing text.
