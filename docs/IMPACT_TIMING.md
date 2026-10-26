# Grenade impact timing

Target: Bedrock 1.26.52, Script API 2.8.0.

The client draws the projectile slightly behind its real position, so exploding at once
looked like the blast started before the grenade arrived. Handler order now:

1. On the first hit event, copy the event `location` (the true impact point), dimension and
   `source`; block hits follow `hitVector` from that point onto the struck face plane (the
   reported point can lie short of the face), then move 0.05 blocks outside it; later hit
   events for the same projectile are ignored.
2. Next tick: stop and teleport the grenade to the impact point.
3. After 3 ticks (about 150 ms): spawn the green poof and detonate. Default (test build
   2026-10-26): fire `gm:detonate`, whose `minecraft:explode` group makes the grenade explode
   itself; the engine removes it. Script methods (`blast_probe.js`, `ATTRIBUTION_TEST.md`):
   create the explosion with the grenade (or thrower) as source.
4. Script methods only: one tick later, remove the grenade. Kills name the grenade as attacker, so other packs
   (Lothlorien Harmony, 2026-10-26) read the thrower from its projectile `owner` in their
   death/hurt after events; those must still find it valid.

Owner confirmed in game that the visual issue is fixed (2026-10-04).
Regression coverage: `tests/impact_timing.mjs`.

2026-10-25 source correction: grenade lifetime now covers the blast so native projectile
ownership can identify the attacker without treating the player as the exploding entity.
Timing/order/face offsets are covered offline; revised self-damage and kill credit await
engine retesting. The prior visual timing acceptance still applies to the unchanged delay.
