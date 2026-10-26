# Grenade backlog

Updated 2026-10-25 from owner feedback (Bedrock 1.26.52).

## Awaiting in-game verification: flight rework (2026-10-26)

Round 2: first lob looked good but flew ~11 blocks regardless of pitch and fell almost
vertically; blast looked above the ground. Now `isolated_physics: true` and block hits
traced onto the struck face.

- [ ] F1: flight is easy to follow; spark/smoke trail visible and not distracting.
- [ ] F2: range feels right (model estimate 15-25 blocks; tune `power`/`gravity`).
- [ ] F3: blast still appears when the grenade visibly lands (3-tick delay unchanged).
- [ ] F4: dispenser shot still launches and detonates with the new values.

Details: [flight notes](FLIGHT.md).

## Awaiting in-game verification

- [ ] G1: self-damage at feet with the live-grenade explosion source.
- [ ] G2: nearby (not direct-hit) blaze/skeleton damage on floor and wall impacts;
  blaze rods/XP and PvP kill credit. Native projectile-owner attribution is the intended
  route, but a passing script harness does not verify engine attacker resolution.
- [ ] G3 regression: dispenser launch/detonation and no player-kill rewards.

Details: [test feedback](TEST_FEEDBACK_2026-10-25.md).
