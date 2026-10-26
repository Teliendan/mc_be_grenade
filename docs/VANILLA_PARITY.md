# Grenade: design, limits, checks

Target Bedrock 1.26.52 / Script API 2.8.0. History: git (inspection of 2026-10-23).

## Design (counterparts: snowball projectile, TNT blast)
- Native `throwable` + `projectile` item (so dispensers work), stack 16, custom 0.5 s cooldown.
- Flight: readable lob (owner choice 2026-10-26, no snowball parity, no launch script):
  entity power 1.0, gravity 0.035, angle_offset -10; sprite drawn 1.5x with a client-side
  spark/smoke trail. Details: `FLIGHT.md`. Impact timing: see `IMPACT_TIMING.md`.
- Blast: radius 3, `breaksBlocks:false`, `causesFire:false`, `allowUnderwater:true`.
- The live grenade is passed as `ExplosionOptions.source`, and removed after the blast.
  Native `minecraft:projectile` ownership keeps the shooter separate from the exploding
  entity. Dispenser grenades receive no invented player owner. If the grenade has gone,
  the captured valid shooter is used; if both are gone the blast is ownerless.
- Block impacts move the landing/blast point 0.05 blocks out along the hit face, keeping
  the explosion origin outside the solid surface rather than exactly on its boundary.
- 2026-10-25 feedback correction: the previous player-as-source blast did not hurt the
  thrower and barely hurt nearby blazes/skeletons. The source/lifetime and surface-origin
  corrections are source-tested; damage, XP and PvP attribution need an engine retest.
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
