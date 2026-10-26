# Grenade blast attribution test (2026-10-26)

Goal (owner): add-ons from other developers, and vanilla mechanics, must see the
**thrower** as the killer. Lothlorien's projectile-owner lookup (`attacker.js`) is only a
workaround. The temporary `grenade_bp/scripts/blast_probe.js` switches the blast method so
all three can be compared in one session; remove it once one is chosen.

| Method | How | Known before this test |
| --- | --- | --- |
| `scripted` (default, owner choice) | script `applyDamage(entityExplosion, damagingEntity thrower)` to creatures in 6 blocks, then a harmless `minecraft:explode` (`damage_scaling` 0) for sound/particles/knockback; items and XP orbs untouched | nothing yet |
| `native` | script fires `gm:detonate`; the grenade's own `minecraft:explode` (vanilla fireball/wither skull pattern) | nothing; lead only |
| `grenade` | script `createExplosion`, source = grenade (2026-10-25 build) | Lothlorien saw no player killer; self-damage expected |
| `player` | script `createExplosion`, source = thrower (pre-2026-10-25 build) | drops OK, no self-damage (owner, 2026-10-25) |

## Owner procedure

Survival world, cheats on. Settings > Creator: enable the Content Log GUI (level Warning or
lower); the readout is developer text there. Run `/scriptevent gm:blast log` once.

For each method, `/scriptevent gm:blast scripted` (then `native`, then `grenade`):

1. Throw at a few zombies or cows. Read the log line per hit: `attacker ...` is what other
   add-ons see (`damagingEntity`); `projectile ...` is `damagingProjectile`.
2. Did killed mobs drop XP orbs?
3. Did a surviving zombie turn on you?
4. Throw one at your own feet: did you take damage?

Dispenser shots stay ownerless by design. Scripted method extras: items and XP orbs on
the ground survive; does a creature behind a wall take less damage; do armor and Blast
Protection reduce your own damage; is the knockback still there and away from the blast?

## Results

| Method | Attacker shown | XP orbs | Zombie retaliates | Self-damage |
| --- | --- | --- | --- | --- |
| scripted | | | | |
| native | `gm:grenade_projectile` (projectile: none) | | | |
| grenade | `gm:grenade_projectile` (projectile: none) | | | |
| player | none: the blast did no damage to mobs (owner, 2026-10-26) | | | |

Owner readout, Bedrock 1.26.52, 2026-10-26 (unicorn and swan hits/kills, cause
`entityExplosion`): the native `minecraft:explode` route names the grenade exactly like the
script blast does, so it does not give the thrower credit. Hits did 4.7-36.3 damage.
With the thrower as `createExplosion` source the blast damaged no mobs at all (this also
explains the 2026-10-25 "blazes and skeletons hardly take damage" report). No explosion
source both credits the thrower and does damage. Remaining route: the script applies the
damage itself with `applyDamage(amount, { cause: entityExplosion, damagingEntity: thrower })`.
