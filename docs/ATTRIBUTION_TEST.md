# Grenade blast attribution test (2026-10-26)

Goal (owner): add-ons from other developers, and vanilla mechanics, must see the
**thrower** as the killer. Lothlorien's projectile-owner lookup (`attacker.js`) is only a
workaround. The temporary `grenade_bp/scripts/blast_probe.js` switches the blast method so
all three can be compared in one session; remove it once one is chosen.

| Method | How | Known before this test |
| --- | --- | --- |
| `native` (default) | script fires `gm:detonate`; the grenade's own `minecraft:explode` (vanilla fireball/wither skull pattern) | nothing; lead only |
| `grenade` | script `createExplosion`, source = grenade (2026-10-25 build) | Lothlorien saw no player killer; self-damage expected |
| `player` | script `createExplosion`, source = thrower (pre-2026-10-25 build) | drops OK, no self-damage (owner, 2026-10-25) |

## Owner procedure

Survival world, cheats on. Settings > Creator: enable the Content Log GUI (level Warning or
lower); the readout is developer text there. Run `/scriptevent gm:blast log` once.

For each method, `/scriptevent gm:blast native` (then `grenade`, then `player`):

1. Throw at a few zombies or cows. Read the log line per hit: `attacker ...` is what other
   add-ons see (`damagingEntity`); `projectile ...` is `damagingProjectile`.
2. Did killed mobs drop XP orbs?
3. Did a surviving zombie turn on you?
4. Throw one at your own feet: did you take damage?

Dispenser shots stay ownerless by design.

## Results

| Method | Attacker shown | XP orbs | Zombie retaliates | Self-damage |
| --- | --- | --- | --- | --- |
| native | | | | |
| grenade | | | | |
| player | | | | |
