# Grenade: development

- Item id `gm:grenade`, thrown as the hidden projectile `gm:grenade_projectile`.
- Packs: `grenade_bp/` (JSON plus Script API in `scripts/`) and `grenade_rp/`.
- Deploy with `.\mods deploy grenade` from the workspace; build the add-on locally with
  `.\mods package grenade`.
- Tests: `node tests/run.mjs` (also run by `.\mods verify grenade`).
- Design, limits and in-game checks: [VANILLA_PARITY.md](VANILLA_PARITY.md). Flight and blast
  decisions, including the approaches that failed: [FLIGHT.md](FLIGHT.md), [BLAST.md](BLAST.md).
- Localization: nine locales use a mod-scoped contextual catalog. Read
  [LOCALIZATION.md](LOCALIZATION.md) before adding or changing player-facing text.
