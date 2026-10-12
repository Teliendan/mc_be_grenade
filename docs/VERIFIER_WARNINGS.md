# Documented verifier exception

2026-10-13, target Bedrock 1.26.52. **0 errors, 0 warnings, 1 documented exception**.
[Exact record](../grenade_bp/verification_exceptions.json) retains the reason/evidence.

`entity.gm:grenade_projectile.name` is deliberately omitted from en_US.lang.
This entity is the thrown grenade in flight and its explosion lifecycle, not an
inventory item or spawn-egg mob. The player-facing grenade item already has a
localized name. BP/RP entity definitions mark it non-spawnable and provide its
flight model; scripts use its exact ID. A display name would help debugging only,
not throwing, physics, damage or classification. It may remain unnamed.

This is source-reviewed evidence, not a new engine test. New unnamed entities
still warn; stale or malformed exception records fail. No errors are excused.
Implementation commit: `Classify grenade projectile and document its unnamed entity`.
