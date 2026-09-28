import { world, system } from "@minecraft/server";

const PROJECTILE_ID = "gm:grenade_projectile";
const EXPLOSION_RADIUS = 3;

// Green replacement for the vanilla snowballpoof, which is a hardcoded level event and
// cannot be recoloured. Shards are cut from the grenade's own sprite, so it matches the
// item by construction rather than by picking a green.
const HIT_PARTICLE = "gm:grenade_poof";

// The client renders the projectile a little behind its real position, so it used to
// wink out in mid-air. Snap it onto the impact point and hold it there briefly so the
// sprite is seen landing before it goes.
const LINGER_TICKS = 3;

function onHit(event) {
  let projectile;
  try {
    projectile = event.projectile;
    if (!projectile || projectile.typeId !== PROJECTILE_ID) return;
  } catch {
    return; // engine already destroyed it; not ours to care about
  }

  // Take the position from the EVENT, not the entity: it is the true impact point.
  const dimension = event.dimension;
  const location = event.location;

  system.run(() => {
    try {
      dimension.spawnParticle(HIT_PARTICLE, location);
    } catch {
      /* chunk unloaded */
    }

    try {
      if (projectile.isValid) {
        projectile.clearVelocity();
        projectile.teleport(location);
      }
    } catch {
      /* already gone */
    }

    try {
      dimension.createExplosion(location, EXPLOSION_RADIUS, {
        breaksBlocks: false,
        causesFire: false,
        allowUnderwater: true,
      });
    } catch {
      /* chunk unloaded */
    }

    system.runTimeout(() => {
      try {
        if (projectile.isValid) projectile.remove();
      } catch {
        /* already gone */
      }
    }, LINGER_TICKS);
  });
}

world.afterEvents.worldLoad.subscribe(() => {
  world.afterEvents.projectileHitBlock.subscribe(onHit);
  world.afterEvents.projectileHitEntity.subscribe(onHit);
});
