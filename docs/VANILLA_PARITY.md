# Grenade: design, limits, checks

Target Bedrock 1.26.52 / Script API 2.8.0. History: git (inspection of 2026-10-23).

## Design (counterparts: snowball projectile, TNT blast)
- Native `throwable` + `projectile` item (so dispensers work), stack 16, custom 0.5 s cooldown.
- Flight: a slow, readable lob instead of snowball parity (owner, 2026-10-26): `FLIGHT.md`.
- Blast: scripted vanilla-falloff damage naming the thrower, plus a harmless native explosion
  for sound, particles and knockback (owner, 2026-10-26): `BLAST.md`. No block breaking or
  fire; works underwater. Dispenser grenades name the grenade, never an invented player.
- Owner decision: items and XP orbs on the ground survive the blast (vanilla blasts destroy items).
- Not copied: snowball blaze damage, snow crafting, wind-charge door toggling, TNT priming.

## Known limits
- Entity format stays 1.21.120: 26.50 changes defaults (`isolated_physics` true from format
  1.26.30, `multiple_targets` false from 1.26.50), so a format bump changes flight/contact.
- Nothing persists an impact: a grenade unloaded in the 3-tick window may not explode.
- Blast exposure uses three rays, not vanilla's grid: partial cover is coarser.
- The hidden projectile has no display name (`VERIFIER_WARNINGS.md`).

## Owner regression checks
1. Throw at your own feet in Survival: it hurts you.
2. Mobs near the blast take damage, less behind cover; kills give XP and count as yours.
3. A dispenser fires and detonates grenades; dispenser kills give no player-kill rewards.
4. Throw, then die or leave before the blast: it still explodes.
5. Breaks no blocks, starts no fire, leaves items on the ground; works underwater.
6. Survival: one grenade consumed per throw, 0.5 s cooldown; Creative consumes none.
7. Recipe: four copper nuggets + gunpowder gives one grenade.

## Bedrock 26.60 impact (2026-10-27, documented only)

Source review against the 26.60 changelog and API 2.11.0 / 2.12.0-beta declarations; nothing tested in game.

- Verdict: no change needed. The mod stays on entity/item format 1.21.120 and Script API 2.8.0; the 26.60 schema tightening does not apply at those formats and no API the script uses was removed.
- Format bump stays blocked by the recorded decision (a newer format changes `isolated_physics` and `multiple_targets` defaults); vanilla's newer projectiles use `pushable_by_entity` + `pushable_by_block` instead of `pushable`, useful only if a bump is ever chosen.
- `ExplosionOptions` still has no attacker field in 2.11.0, so the scripted `applyDamage` blast (`BLAST.md`) stays.
- Deferred idea: a custom throw sound needs an RP sound plus an item format bump to 1.26.50 or later; a feature request, not a fix. Owner may check the throw subtitle (cosmetic, unverified).
- Owner regression checks on 26.60: the checks listed above under owner regression checks, plus the flight arc (`FLIGHT.md`).
