import { world, system } from "@minecraft/server";

const PROJECTILE_ID = "gm:grenade_projectile";
const EXPLOSION_RADIUS = 3;

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
        if (projectile.isValid) projectile.remove();
      } catch {
        /* already gone */
      }

      try {
        dimension.spawnParticle(HIT_PARTICLE, location);
      } catch {
        /* chunk unloaded */
      }

      const options = { breaksBlocks: false, causesFire: false, allowUnderwater: true };
      if (source?.isValid) options.source = source;
      try {
        dimension.createExplosion(location, EXPLOSION_RADIUS, options);
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
