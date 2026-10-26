import { world, system } from "@minecraft/server";

const PROJECTILE_ID = "gm:grenade_projectile";
const EXPLOSION_RADIUS = 3;
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
  // Dispensers have no source; a shooter gone after the delay still leaves a blast (ownerless).
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

      const options = { breaksBlocks: false, causesFire: false, allowUnderwater: true };
      // The exploding entity is the grenade, not its shooter. Keep it alive for
      // the blast, preserving native projectile ownership for attacker attribution.
      // The shooter must remain distinct from the direct exploding source.
      if (projectile.isValid) options.source = projectile;
      else if (source?.isValid) options.source = source;
      try {
        dimension.createExplosion(location, EXPLOSION_RADIUS, options);
      } catch {
        /* chunk unloaded */
      }
      try {
        if (projectile.isValid) projectile.remove();
      } catch {
        /* already gone */
      }
      pendingImpacts.delete(projectileId);
    }, IMPACT_SETTLE_TICKS);
  });
}

world.afterEvents.worldLoad.subscribe(() => {
  world.afterEvents.projectileHitBlock.subscribe(onHit);
  world.afterEvents.projectileHitEntity.subscribe(onHit);
});
