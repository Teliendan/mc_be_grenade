# Grenade impact timing

2026-10-04. Target game: Bedrock 1.26.52, Script API 2.8.0.
Commit: `Delay grenade explosion until impact is visible`.

The previous handler snapped the projectile to the impact location and kept it visible
for three ticks, but spawned the fragments and explosion before that wait. This allowed
the explosion to appear while the client was still drawing the grenade in flight.

The handler now stops and snaps the grenade first, waits three ticks (about 150 ms at
20 ticks/second), then removes it and starts both detonation effects together. Blast
location comes from the first hit event; duplicate block/entity hits during the wait
are ignored. Blast radius, damage behavior and throwing arc retain their existing values.

Validation: `node mods/grenade/tests/run.mjs` tests block and entity impact ordering,
the wait before all effects, duplicate events, simultaneous grenades, captured hit
coordinates, and missing projectile/particle failure handling. The tests and
`mods verify grenade` passed; both packs were deployed and confirmed in sync.
The owner confirmed the visual issue is fixed in game on 2026-10-04. The exact
running game version was not independently checked; 1.26.52 is the local reference
version. No iteration scratch was created for this fix.

API grounding: the local 2.8.0 declarations and Microsoft's
[ProjectileHitBlockAfterEvent documentation](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/projectilehitblockafterevent?view=minecraft-bedrock-stable)
describe `location` as the hit location. The existing shared projectile notes contain
the earlier in-game observations about client rendering lag. This change fixes the
order in our script; it does not establish new engine behavior.
