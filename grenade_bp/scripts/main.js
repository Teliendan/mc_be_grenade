import { world, system, EntityDamageCause } from "@minecraft/server";

const PROJECTILE_ID = "gm:grenade_projectile";
// Adds the entity's harmless minecraft:explode group (vanilla fireball pattern): sound,
// particles and knockback; damageAround() deals the damage.
const DETONATE_EVENT = "gm:detonate";
// Vanilla explosion damage reaches twice the explosion power (3, the entity's
// minecraft:explode) and falls off linearly.
const DAMAGE_RANGE = 6;
// Owner: items (and XP orbs) on the ground survive the blast.
const UNHARMED_TYPES = ["minecraft:item", "minecraft:xp_orb", PROJECTILE_ID];
const BLOCK_IMPACT_OFFSET = 0.05;
const FACE_NORMALS = {
  Up: { x: 0, y: 1, z: 0 }, Down: { x: 0, y: -1, z: 0 },
  East: { x: 1, y: 0, z: 0 }, West: { x: -1, y: 0, z: 0 },
  North: { x: 0, y: 0, z: -1 }, South: { x: 0, y: 0, z: 1 },
};
const FACE_AXES = { Up: "y", Down: "y", East: "x", West: "x", North: "z", South: "z" };

// Green replacement for the vanilla snowballpoof, which is a hardcoded level event and
// cannot be recoloured. Shards are cut from the grenade's own sprite, so it matches the
// item by construction rather than by picking a green.
const HIT_PARTICLE = "gm:grenade_poof";

// The client renders the projectile a little behind its real position, so it used to
// wink out in mid-air. Snap it onto the impact point and give the client time to
// show the landing before starting any explosion effects or removing the sprite.
const IMPACT_SETTLE_TICKS = 3;
const pendingImpacts = new Set();

// Share of the entity the blast can see: rays to its feet, middle and head that no
// solid block stops (vanilla samples a grid over the whole collision box).
function exposure(dimension, center, entity) {
  const feet = entity.location;
  const head = entity.getHeadLocation();
  const points = [
    { x: feet.x, y: feet.y + 0.1, z: feet.z },
    { x: feet.x, y: (feet.y + head.y) / 2, z: feet.z },
    head,
  ];
  let seen = 0;
  for (const point of points) {
    const offset = { x: point.x - center.x, y: point.y - center.y, z: point.z - center.z };
    const distance = Math.hypot(offset.x, offset.y, offset.z);
    if (distance < 0.01) {
      seen++;
      continue;
    }
    const direction = { x: offset.x / distance, y: offset.y / distance, z: offset.z / distance };
    if (!dimension.getBlockFromRay(center, direction, { maxDistance: distance })) seen++;
  }
  return seen / points.length;
}

// Apply the blast damage ourselves so every pack sees the thrower as the attacker:
// an exploding grenade is reported as its own attacker, and a player-sourced script
// explosion damages nothing (verified in game, docs/BLAST.md). Vanilla falloff:
// impact = (1 - distance / range) * exposure; damage = (impact^2 + impact) / 2 * 7 * range + 1.
function damageAround(dimension, center, attacker) {
  const entities = dimension.getEntities({ location: center, maxDistance: DAMAGE_RANGE, excludeTypes: UNHARMED_TYPES });
  for (const entity of entities) {
    try {
      const feet = entity.location;
      const distance = Math.hypot(feet.x - center.x, feet.y - center.y, feet.z - center.z);
      const impact = (1 - distance / DAMAGE_RANGE) * exposure(dimension, center, entity);
      if (impact <= 0) continue;
      const options = { cause: EntityDamageCause.entityExplosion };
      // The thrower's own blast is not an attack on themselves.
      if (attacker && attacker.id !== entity.id) options.damagingEntity = attacker;
      entity.applyDamage(((impact * impact + impact) / 2) * 7 * DAMAGE_RANGE + 1, options);
    } catch {
      /* entity gone */
    }
  }
}

function onHit(event) {
  let projectile;
  let projectileId;
  try {
    projectile = event.projectile;
    if (!projectile || projectile.typeId !== PROJECTILE_ID) return;
    projectileId = projectile.id;
    if (pendingImpacts.has(projectileId)) return;
  } catch {
    return; // engine already destroyed it; not ours to care about
  }
  pendingImpacts.add(projectileId);

  // Take the position from the EVENT, not the entity: it is the true impact point.
  const dimension = event.dimension;
  const location = { ...event.location };
  if (event.getBlockHit) {
    const { block, face } = event.getBlockHit();
    const normal = FACE_NORMALS[face];
    // The reported location can sit short of the struck face (owner saw steep falls
    // explode above the ground), so follow the flight direction onto the face plane.
    const axis = FACE_AXES[face];
    const plane = block.location[axis] + Math.max(normal[axis], 0);
    const along = (plane - location[axis]) / event.hitVector[axis];
    location.x += event.hitVector.x * along;
    location.y += event.hitVector.y * along;
    location.z += event.hitVector.z * along;
    // Keep the blast just outside that surface so exposure rays do not start inside
    // the block and shield nearby mobs.
    location.x += normal.x * BLOCK_IMPACT_OFFSET;
    location.y += normal.y * BLOCK_IMPACT_OFFSET;
    location.z += normal.z * BLOCK_IMPACT_OFFSET;
  }
  // Dispensers have no source: their blasts name the grenade.
  const source = event.source;

  system.run(() => {
    try {
      if (projectile.isValid) {
        projectile.clearVelocity();
        projectile.teleport(location);
      }
    } catch {
      /* already gone */
    }

    system.runTimeout(() => {
      try {
        dimension.spawnParticle(HIT_PARTICLE, location);
      } catch {
        /* chunk unloaded */
      }

      const attacker = source?.isValid ? source : projectile.isValid ? projectile : undefined;
      try {
        damageAround(dimension, location, attacker);
      } catch {
        /* chunk unloaded */
      }
      // The grenade then explodes itself, harmlessly; the engine removes it.
      try {
        if (projectile.isValid) projectile.triggerEvent(DETONATE_EVENT);
      } catch {
        /* chunk unloaded */
      }
      pendingImpacts.delete(projectileId);
    }, IMPACT_SETTLE_TICKS);
  });
}

world.afterEvents.worldLoad.subscribe(() => {
  world.afterEvents.projectileHitBlock.subscribe(onHit);
  world.afterEvents.projectileHitEntity.subscribe(onHit);
});
