# Owner test feedback, 2026-10-25

Source: workspace `temp/testing_feedback.md`, checklist `docs/game-checks.md`.
Target: Bedrock 1.26.52 / Script API 2.8.0. Source checks are not engine acceptance.

| Item | Owner result | Disposition |
| --- | --- | --- |
| G1 self-damage | No, possibly related to G2 | Candidate fix implemented; retest required. Live grenade is now the direct explosion source, removed only after the blast, so the player is not used as the exploding entity. |
| G2 mob damage/rewards | Drops OK; nearby blazes and skeletons hardly take damage | Candidate fix implemented; block-hit blast/landing origin moves 0.05 blocks outside each solid face to avoid boundary exposure shielding. Confirm damage on open floors and walls, XP and PvP credit in game. |
| G3 dispenser | OK | Owner pass recorded; repeat after changed blast source. |
| Flight/physics | Too fast to see properly | Deferred to `TODO.md`; no launch/physics changes in this pass. |

## Evidence and limits

The source/exposure diagnosis is an inference from the implementation and reported
symptoms, not a reproduced engine diagnosis. The script tests verify all six face offsets,
impact delay and duplicate-hit handling, live source lifetime, missing-grenade/shooter
fallbacks and ownerless dispenser input. They cannot prove engine damage/XP attribution.
If the grenade disappears before the delayed blast, the previous valid-shooter fallback
still explodes; this fallback may retain the original source-player self-damage limitation.

Primary references reviewed 2026-10-25:
- Installed vanilla `vanilla_1.26.50/entities/fireball.json` keeps projectile and shooter
  distinct and triggers its native explosion on the projectile.
- [EntityProjectileComponent.owner](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entityprojectilecomponent?view=minecraft-bedrock-stable)
  identifies the attacker; [ExplosionOptions](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/explosionoptions?view=minecraft-bedrock-stable)
  exposes one direct source, without a separate attacker field.
- Official [26.50](https://feedback.minecraft.net/hc/en-us/articles/48826825649933-Minecraft-Bedrock-Edition-26-50-Changelog-Wilderness-Bound)
  and [26.52](https://feedback.minecraft.net/hc/en-us/articles/49175370527501-Minecraft-Bedrock-Edition-26-52-Hotfix-Changelog)
  notes did not identify a matching scripted explosion-damage fix.

Validation: `mods verify grenade` passed, 0 errors/warnings and 1 existing documented
exception. Parent agent owns final commit, wiki export and deployment status.
