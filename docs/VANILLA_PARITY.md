# Grenade: design, limits, checks

Target Bedrock 1.26.52 / Script API 2.8.0. History: git (inspection of 2026-10-23).

## Design (counterparts: snowball projectile, TNT blast)
- Native `throwable` + `projectile` item (so dispensers work), stack 16, custom 0.5 s cooldown.
- Flight: readable lob (owner choice 2026-10-26, no snowball parity, no launch script):
  entity power 1.0, gravity 0.035, angle_offset -10, isolated_physics true; sprite drawn 1.5x with a client-side
  spark/smoke trail. Details: `FLIGHT.md`. Impact timing: see `IMPACT_TIMING.md`.
- Blast (test build 2026-10-26, owner chose scripted damage): the grenade explodes itself
  (`minecraft:explode` power 3, `damage_scaling` 0: sound, particles, knockback; no block
  breaking, fire, underwater-proof), and the script applies the damage with
  `applyDamage(cause entityExplosion, damagingEntity thrower)` so every pack sees the thrower.
  Vanilla falloff over 6 blocks; exposure approximated by three rays (feet/middle/head).
  The thrower's own damage carries no attacker. Dispenser grenades name the grenade.
- Owner decision: items and XP orbs on the ground are not damaged (vanilla blasts destroy items).
- Why (verified in game 2026-10-26, `ATTRIBUTION_TEST.md`): an exploding projectile reports
  itself as attacker (native or script), and a player-sourced script blast damages nothing.
- Block impacts move the landing/blast point 0.05 blocks out along the hit face, keeping
  the explosion origin outside the solid surface rather than exactly on its boundary.
- Not copied: snowball blaze damage, snow crafting, wind-charge door toggling, TNT priming.

## Known limits
- Entity format stays 1.21.120: 26.50 changes defaults (`isolated_physics` true from format
  1.26.30, `multiple_targets` false from 1.26.50), so a format bump changes flight/contact.
- Nothing persists an impact: a grenade unloaded in the 3-tick window may not explode.
- The hidden projectile has no display name (`VERIFIER_WARNINGS.md`).

## Remaining in-game checks after 2026-10-25 feedback
1. Retest G1: throw at your own feet in Survival on Normal; the grenade should hurt you.
2. Retest G2: throw beside a blaze and skeleton on an open floor, then into a wall beside them; damage should not require a direct hit. Confirm blaze rods and XP.
3. Kill another player in PvP: kill credit is yours.
4. G3 passed on 2026-10-25. Repeat dispenser firing and ownerless kills after the source change.
5. Throw, then die or leave before the blast: it still explodes.
6. Blast hurts mobs and items, breaks no blocks, starts no fire; works underwater.
7. Survival: one grenade consumed per throw, 0.5 s cooldown; Creative consumes none.
8. Recipe: four copper nuggets + gunpowder gives one grenade.
