# Grenade flight

Final design, accepted by the owner on 2026-10-26 (Bedrock 1.26.52). Commits `3777388`,
`87443cb`, `515f9e2`.

## Design

Owner: drop snowball parity; the grenade must fly well past the thrower's feet but slowly
enough to watch. No fuse, no custom launch script (native `minecraft:throwable` throw).

- Entity `minecraft:projectile`: `power` 1.0, `gravity` 0.035, `angle_offset` -10 (aimed
  10 degrees above the crosshair; vanilla potions use -20), `isolated_physics: true`.
  Entity format stays 1.21.120: newer formats change other projectile defaults.
- Client entity: sprite drawn 1.5x (`scripts.scale`), own billboard
  `animation.gm.grenade_projectile.billboard` = camera rotation minus `query.body_y_rotation`.
- Trail `gm:grenade_trail`: a looping steady emitter started by a one-state animation
  controller; world-space particles stay behind the grenade and are drawn every frame by the
  client. Vanilla smoke flipbook tinted yellow-orange (fuse sparks) fading to grey.

## What worked and what did not (do not repeat)

- **Power 2.4 (old build):** reached snowball distance but was too fast to see.
- **First lob with `isolated_physics` omitted:** range ~11 blocks at any pitch, falling almost
  vertically. Omitted means false at this format, which adds outside friction and drag; a tick
  model needs ~0.91-0.95 total drag per tick to match. This is also why the old build needed
  power 2.4. Setting it explicitly gave a round arc whose range grows with pitch.
- **Vanilla `animation.actor.billboard`:** fine for hardcoded vanilla sprites only. A custom
  projectile's body turns to its flight yaw, so the sprite showed its edge to the thrower.
- **Trail:** a script `spawnParticle` trail (an earlier debugging aid) runs at 20 Hz and costs
  server time; the client particle is smooth. Owner: "the particles work good".
- Range numbers from a tick model (launch speed = `power`) were only estimates; the
  power-to-speed mapping of a `throwable` item was never measured. Tune in game.
