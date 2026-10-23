# Grenade parity inspection

2026-10-23; Group21, baseline **`73db9aa`**, target Bedrock1.26.52/API2.8.0.
Owner approved both source fixes after inspection; implemented2026-10-23.
No new native observations. The owner's requested portable checklist is
[Grenade game checks](../../../docs/grenade-game-checks.md), with setup, baseline,
case IDs, required outcomes versus observations and result-record fields.
Workspace inspection/checklist commit: **`616aea2`**; approved regression
registration/deployed implementation handoff: **`c40425d`**. Mod source/tests/
documents remain uncommitted; the portable checklist is committed in workspace.

## Approved implementation, 2026-10-23

`onHit` captures the event source ID alongside the first impact coordinates.
At detonation it resolves that exact ID using `world.getEntity`, forwarding a
valid actor in `ExplosionOptions.source`. An absent/removed/invalid/unreadable
source is omitted so the grenade still detonates. Ownerless launchers remain
ownerless; there is no nearest-player guess or new late dimension/mode condition.
The projectile can already have been removed without losing its shooter ID.
Existing delay, arc, radius3 and terrain/fire/underwater options are retained.

Workspace `mods.json` now registers Grenade's full `tests/run.mjs`. The original
four impact scenarios moved intact into `impact_timing.mjs`;13 new ownership
cases and a suite-layout guard run independently through the shared runner.
Coverage includes both hit types, ownerless impacts, expired source/lookup
failures, fresh wrappers for the same ID, first-hit identity, simultaneous
owners, shooter dimension/mode changes and projectile removal. All three runners
pass. A temporary failing ownership runner made normal `mods verify grenade`
fail; the exact original passing file was restored before final deployment.
This verifies the registry wiring, not just direct invocation of the test file.

Both requested source fixes are complete. Game casesG06–G10/G19 still need
native observations of XP/kill credit/anger/PvP/shields/shooter exit. Reload/
unhit lifetime investigation remains deferred; no timer/retry/polling was added.
Source build is73db9aa plus the uncommitted2026-10-23 attribution changes;
`scripts/main.js` SHA256 is
`C82882DE66E0C569AFD6D6016300C2A556FF749B0742A4F3E463B32F1E99D7AE`.
Transfer the changed mod source/tests for the other machine; cloning the old
Grenade head alone does not include this fix. Managed deploy2026-10-23 copied
one BP script, removed0; RP already matched. `mods status grenade` confirmed
**both packs in sync**. Re-enter the world to load it; no new world is required.

## Original findings and recommendations (pre-fix inspection)

1. **Pass the thrower into the native explosion.** Both pinned projectile-hit
   events provide optional `source`; `ExplosionOptions` accepts optional `source`.
   `scripts/main.js` captures projectile/location/dimension but omits that source
   when creating a separate delayed explosion. Native projectile ownership does
   not, by itself, establish ownership of this separate API-created blast.
   Recommend capturing the event's source identity at impact and passing the
   still-valid actor to `createExplosion` at detonation. A genuinely ownerless
   dispenser/summoned case stays ownerless; an unavailable shooter must not
   cancel the blast. Do not invent a nearest-player owner or manual XP/loot/PvP
   system. Stable API2.8 supports the source handoff; no experiment is needed.
   This is a documented missing context, not proof of a reproduced XP/PvP bug.
   Exact death credit, XP, anger, shield and PvP outcomes needG06–G10/G19.

2. **Register the existing impact regression runner.** `tests/run.mjs` passes
   when run directly, but Grenade alone lacks `regression_tests` in workspace
   `mods.json`. Consequently its ordinary verify/deploy does not run those
   regressions. Recommend the same registry entry used by the other four mods;
   add independent source-attribution cases when implementing1. This audit ran
   the existing suite explicitly. No registry or test architecture was changed.

3. **Observe lifecycle boundaries before choosing recovery.** The pending-hit
   set and two callbacks are transient. No entityLoad recovery, saved impact
   record or explicit unhit-projectile timeout is authored. That is not proof
   of stuck actors: native projectile save/despawn/re-hit behavior must be
   observed inG16–G18. An injected unload/API exception only proves that the
   current catch drops that attempt. Do not add a polling/retry loop or blanket
   timeout without a practical reproducer and a once-only detonation policy.

## Keep the current design

Native item `projectile` explicitly documents dispenser support; Grenade already
declares it alongside `throwable`. Dispenser ejection is an engine check, not an
established missing launcher implementation. Keep native item consumption and
the stack16/custom0.5-second cooldown. No scripted dispenser, offhand expansion
or launcher power changes are proposed.

Keep power3, breaksBlocks:false, causesFire:false, allowUnderwater:true and the
existing flight power2.4/gravity0.03. Those are source-established grenade
choices, not a request to copy harmless snowball damage or destructive TNT.
No-terrain behavior does not promise nearby item/vehicle/entity immunity.
The projectile has no native impact_damage branch; explosion damage and native
collision/interception are separate aspects. Do not add snowball's blaze-only
damage, snow-block crafting, snow harvesting, snow-golem ammunition, wind-charge
door toggling or TNT block priming just because those are counterpart mechanics.

Retain the owner-accepted delayed impact presentation: scheduled stop/snap,
three settle ticks, remove/green fragments/blast together, first-hit coordinates,
pending duplicate guard. Four existing regression scenarios pass for ordering,
concurrent/repeated hits, copied coordinates, missing projectile and failed
particle. They do not establish native timing, unload ordering or damage.

Current entity format1.21.120 matters. Official26.50 changes omitted
`isolated_physics` to true at format1.26.30+ and `multiple_targets` to false at
format1.26.50+. Older formats retain false/true respectively. A casual format
bump would change flight/contact behavior despite identical authored numbers.
Do not retune or enable newer defaults during this inspection. Custom projectile
physics is stable since26.30; the old Learn experimental note is stale. Current
26.50 owner/vehicle immunity and26.52 Spectator fixes take precedence over older
Wiki descriptions; no local workaround is proposed for those fixed paths.

## Verification and discovery limits

Current `mods verify grenade`: localization passes,0 errors/0 warnings/**1
documented unnamed-flight-entity exception**. It automatically runs all three
registered runners: original four timing scenarios,13 ownership tests and suite
layout. All pass. The original inspection baseline73db9aa was already in sync;
the source fix requires managed redeployment, recorded in the implementation.
Item/projectile IDs, recipe/unlock, BP/RP/particle bindings, all scripts, existing
tests and linked timing/tag/localization/graphics notes were inspected. Existing
graphics acceptance remains pending; do not remove its old review scratch here.

Sources retrieved2026-10-23:

- Installed `vanilla_1.26.50/entities/snowball.json` and
  `wind_charge_projectile.json`, plus native TNT reference; pinned2.8 declarations
  for both hit events, projectile owner and explosion options. Native snowball
  uses remove_on_hit and blaze-filtered damage; grenade intentionally uses script
  settlement instead. JSON absence is not proof of no native lifetime behavior.
- Official [26.50](https://feedback.minecraft.net/hc/en-us/articles/48826825649933-Minecraft-Bedrock-Edition-26-50-Changelog-Wilderness-Bound):
  version-dependent physics/target defaults, projectile families and spatial
  owner/vehicle immunity. [26.52](https://feedback.minecraft.net/hc/en-us/articles/49175370527501-Minecraft-Bedrock-Edition-26-52-Hotfix-Changelog):
  Spectator projectile immunity fix.26.51 has no relevant projectile change.
- Creator [item projectile](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_projectile?view=minecraft-bedrock-stable):
  dispenser route. [Hit event](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/projectilehitblockafterevent?view=minecraft-bedrock-stable),
  [explosion options](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/explosionoptions?view=minecraft-bedrock-stable):
  optional source; not a guarantee of each loot/PvP result.
  [Entity projectile](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_projectile?view=minecraft-bedrock-stable):
  inertia, contact, damage/reflect settings; its generic defaults/experimental
  notices must be read with format-specific current release notes.
- Canonical Wiki [Snowball](https://minecraft.wiki/w/Snowball),
  [Explosion](https://minecraft.wiki/w/Explosion), [Dispenser](https://minecraft.wiki/w/Dispenser).
  Current snowball fetch robots-blocked; corresponding **November2025** archive
  pages at `https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/`
  were used for discovery: obtaining/stack/recipe versus throwing/combat,
  dispensers and collision/environment; explosion entity/block/fire/drop/rule
  distinctions; dispenser item actions. No revision ID/current-Wiki claim.
  Explosion entity formulas and dispenser quasi-connectivity are Java-labelled;
  do not import them as Bedrock numerical expectations. Linked native consumers
  remain concrete pending cases inG07–G20 rather than assumed covered.
