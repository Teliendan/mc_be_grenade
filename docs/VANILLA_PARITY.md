# Grenade: design, limits, checks

Target Bedrock 1.26.52 / Script API 2.8.0. History: git (inspection of 2026-10-23).

## Design (counterparts: snowball projectile, TNT blast)
- Native `throwable` + `projectile` item (so dispensers work), stack 16, custom 0.5 s cooldown.
- Flight: entity power 2.4, gravity 0.03. Impact timing: see `IMPACT_TIMING.md`.
- Blast: radius 3, `breaksBlocks:false`, `causesFire:false`, `allowUnderwater:true`.
- The thrower (`event.source`) is passed as `ExplosionOptions.source`, otherwise the blast is
  ownerless and gives no XP and no `killed_by_player` loot (blaze rods, spider eyes...).
  Owner approved 2026-10-23. Dispenser shots have no source and stay ownerless; if the shooter
  is gone after the settle delay the blast still happens, ownerless.
- Not copied: snowball blaze damage, snow crafting, wind-charge door toggling, TNT priming.

## Known limits
- Entity format stays 1.21.120: 26.50 changes defaults (`isolated_physics` true from format
  1.26.30, `multiple_targets` false from 1.26.50), so a format bump changes flight/contact.
- Nothing persists an impact: a grenade unloaded in the 3-tick window may not explode.
- The hidden projectile has no display name (`VERIFIER_WARNINGS.md`).

## In-game checks (not yet done)
1. Throw a grenade at your own feet: does it damage you? (Source set may exclude the thrower.)
2. Kill a blaze with a grenade: rods and XP drop.
3. Kill another player in PvP: kill credit is yours.
4. Dispenser shot: fires and explodes; kills give no XP.
5. Throw, then die or leave before the blast: it still explodes.
6. Blast hurts mobs and items, breaks no blocks, starts no fire; works underwater.
7. Survival: one grenade consumed per throw, 0.5 s cooldown; Creative consumes none.
8. Recipe: four copper nuggets + gunpowder gives one grenade.
