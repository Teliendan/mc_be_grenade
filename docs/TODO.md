# Grenade backlog

Updated 2026-10-25 from owner feedback (Bedrock 1.26.52).

## Deferred redesign

- [ ] Redo the flight/physics model. Current grenades travel so fast they are difficult
  to see. Measure vanilla snowball launch/arc and current grenade server/client positions,
  then design a slower readable flight without losing range or impact synchronization.
  Keep the graphics/landing acceptance and player/dispenser ownership behavior in scope.
  This testing-fix pass deliberately leaves power, gravity and entity format unchanged.

## Awaiting in-game verification

- [ ] G1: self-damage at feet with the live-grenade explosion source.
- [ ] G2: nearby (not direct-hit) blaze/skeleton damage on floor and wall impacts;
  blaze rods/XP and PvP kill credit. Native projectile-owner attribution is the intended
  route, but a passing script harness does not verify engine attacker resolution.
- [ ] G3 regression: dispenser launch/detonation and no player-kill rewards.

Details: [test feedback](TEST_FEEDBACK_2026-10-25.md).
