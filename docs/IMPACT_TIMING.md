# Grenade impact timing

Target: Bedrock 1.26.52, Script API 2.8.0.

The client draws the projectile slightly behind its real position, so exploding at once
looked like the blast started before the grenade arrived. Handler order now:

1. On the first hit event, copy the event `location` (the true impact point), dimension and
   `source`; later hit events for the same projectile are ignored.
2. Next tick: stop and teleport the grenade to the impact point.
3. After 3 ticks (about 150 ms): remove the grenade, spawn the green poof and create the
   explosion together.

Owner confirmed in game that the visual issue is fixed (2026-10-04).
Regression coverage: `tests/impact_timing.mjs`.
