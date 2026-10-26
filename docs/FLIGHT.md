# Grenade flight

Target: Bedrock 1.26.52. Owner decision 2026-10-26: drop snowball parity; the grenade
must still fly well past the player's feet, but slowly enough to be seen. No fuse, and no
custom launch script (the native `minecraft:throwable` throw stays).

## Design

- Entity `minecraft:projectile`: `power` 1.0 (was 2.4), `gravity` 0.035 (was 0.03),
  `angle_offset` -10 (aimed 10 degrees above the crosshair, like vanilla potions' -20),
  `isolated_physics: true` (explicit; see history). Entity format stays 1.21.120: newer
  formats change other projectile defaults.
- Client entity: sprite drawn 1.5x (`scripts.scale`); collision box unchanged.
- Trail: `gm:grenade_trail`, a looping steady emitter started by a one-state animation
  controller. Particles stay in world space, so they are left behind the grenade; they are
  drawn every frame by the client, unlike a script `spawnParticle` trail. Vanilla smoke
  flipbook, tinted bright yellow-orange (fuse sparks) fading to grey smoke.

## Expected numbers (model only, not measured)

Simple tick model (pos += v; v *= 0.99; v.y -= gravity; launch speed = power):

| Pitch | Old range | New range | New air time |
| --- | --- | --- | --- |
| level | 25 blocks | 16 blocks | 0.85 s |
| 20 deg up | 95 blocks | 24 blocks | 1.6 s |
| 45 deg up | 108 blocks | 22 blocks | 2.3 s |

The power-to-speed mapping for a `throwable` item has not been measured
(`bedrock-modding` reference 07), so in-game range may differ; tune `power` first,
then `gravity`. Checks: [TODO](TODO.md) F1-F4.

## History

- 2026-10-26 first lob (commit 3777388): owner liked the look, but range was only ~11
  blocks whatever the pitch, and the fall turned almost vertical. That is a drag-dominated
  path: the model reproduces it with ~0.91-0.95 total drag per tick instead of 0.99. Cause:
  `isolated_physics` was omitted, which at this format means false, so outside friction and
  drag also apply (MS *Creating Custom Projectiles*). It explains why the old grenade needed
  power 2.4 for snowball reach. Now set explicitly; awaiting in-game check.
- Same report: the blast looked centred above the ground. Block hits are now traced along
  `hitVector` onto the struck face before the 0.05 outward offset (`IMPACT_TIMING.md`).
