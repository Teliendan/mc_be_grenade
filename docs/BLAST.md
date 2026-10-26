# Grenade blast

Final design, accepted by the owner on 2026-10-26 (Bedrock 1.26.52, Script API 2.8.0).
Commits: grenade `a723775` (scripted damage) and the cleanup commit after it.

## Design

Goal (owner): the thrower is the attacker for **every** add-on, including other developers'
packs, and for vanilla mechanics such as XP and mob retaliation. A workaround inside one
consumer pack is not enough.

1. On the first hit event, copy the event location, dimension and `source` (the thrower).
   Block hits are traced along `hitVector` onto the struck face plane, then moved 0.05
   blocks outside it. Later hit events for the same grenade are ignored.
2. Next tick: stop the grenade and teleport it to that point.
3. Three ticks later (the client draws the projectile behind its real position; exploding
   at once looked like a mid-air blast): spawn the green poof, then:
   - `damageAround()` damages every entity within 6 blocks except items, XP orbs and
     grenades (owner: items on the ground survive). Vanilla falloff:
     `impact = (1 - distance / 6) * exposure`, `damage = (impact^2 + impact) / 2 * 7 * 6 + 1`
     (43 at the centre). Exposure is the share of three rays (feet, middle, head) that no
     solid block stops; vanilla samples a grid over the collision box.
   - Each hit is `applyDamage(amount, { cause: entityExplosion, damagingEntity })` naming the
     thrower; the thrower's own damage carries no attacker. A dispenser grenade, or one whose
     thrower has left, names the grenade; with both gone there is no attacker.
   - `triggerEvent("gm:detonate")` adds `minecraft:explode` (power 3, `damage_scaling` 0, no
     block breaking or fire, underwater-proof, fuse 0): sound, particles and knockback. The
     engine then removes the grenade.

Tests: `tests/impact_timing.mjs`, `tests/blast_damage.mjs`.

## What worked and what did not (do not repeat)

All in game on 1.26.52, 2026-10-25/26, read with a temporary probe that logged the
`damageSource` of every explosion hit (removed after the test).

| Route | Attacker other packs see | Result |
| --- | --- | --- |
| `createExplosion`, source = thrower (original build) | thrower | **damages no mobs at all**; thrower not hurt either |
| `createExplosion`, source = grenade | `gm:grenade_projectile`, no projectile | damage OK, thrower hurt, no credit |
| Native `minecraft:explode` on the grenade (vanilla fireball pattern: an event adds the group, fuse 0) | `gm:grenade_projectile`, no projectile | same as above: the engine does not resolve a projectile's owner for explosions |
| Harmless native explosion + script `applyDamage` naming the thrower | thrower | **works** (owner accepted) |

- `ExplosionOptions` has only `source`; there is no separate attacker field.
- A consumer-side lookup (Lothlorien read the grenade's `minecraft:projectile` owner) was a
  stopgap; it was removed once the blast itself named the thrower.
- The 2026-10-25 report "nearby blazes and skeletons hardly take damage" was the
  player-sourced blast, not exposure shielding at the block face.
- The 0.05-block face offset and the `hitVector` trace stay: a blast origin exactly on a solid
  surface, and hit locations short of the face on steep falls, both looked wrong.

## Limits

- Exposure is approximated by three rays, not vanilla's grid, so partial cover is coarser.
- Nothing persists an impact: a grenade unloaded in the 3-tick window may not explode.
