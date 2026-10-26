import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../../grenade_bp/scripts/main.js", import.meta.url), "utf8")
  .replace(/^import \{ world, system, EntityDamageCause \} from "@minecraft\/server";\r?\n/, "");

const NORMALS = {
  Up: [0, 1, 0], Down: [0, -1, 0], East: [1, 0, 0], West: [-1, 0, 0], North: [0, 0, -1], South: [0, 0, 1],
};

function blockHit(location, spec) {
  const { face, block, hitVector } = typeof spec === "string" ? { face: spec } : spec;
  const [nx, ny, nz] = NORMALS[face];
  const cell = block ?? {
    x: Math.floor(location.x - nx / 2), y: Math.floor(location.y - ny / 2), z: Math.floor(location.z - nz / 2),
  };
  return { hitVector: hitVector ?? { x: -nx, y: -ny, z: -nz },
    getBlockHit: () => ({ face, block: { location: cell } }) };
}

export function harness() {
  let tick = 0;
  const queue = [];
  const handlers = {};
  const calls = [];
  const signal = (name) => ({ subscribe: (callback) => { handlers[name] = callback; } });
  const schedule = (callback, delay = 1) => queue.push({ at: tick + delay, callback });
  const world = {
afterEvents: {
    worldLoad: signal("load"), projectileHitBlock: signal("block"), projectileHitEntity: signal("entity"),
  } };
  runInNewContext(source, { world, system: { run: schedule, runTimeout: schedule },
    EntityDamageCause: { entityExplosion: "entityExplosion" } });
  handlers.load();
  const record = (kind, location) => calls.push({ kind, tick, location: { ...location } });
  const dimension = {
    spawnParticle: (id, location) => record("particle", location),
    // Tests fill `nearby` (what the engine's query returns) and may set `blocked(center, direction, maxDistance)`.
    nearby: [],
    blocked: () => false,
    getEntities(query) {
      record("query", query.location);
      calls[calls.length - 1].query = query;
      return this.nearby;
    },
    getBlockFromRay(center, direction, options) {
      return this.blocked(center, direction, options.maxDistance) ? { block: {} } : undefined;
    },
  };
  // A mob standing at `location`, `height` blocks tall; applyDamage records its arguments.
  const mob = (id, location, height = 1.8) => ({
    id, typeId: "minecraft:zombie", location, isValid: true,
    getHeadLocation: () => ({ ...location, y: location.y + height * 0.9 }),
    applyDamage(amount, options) {
      record("damage", location);
      Object.assign(calls[calls.length - 1], { target: id, amount, options });
      return true;
    },
  });
  const projectile = (id = "grenade-1", typeId = "gm:grenade_projectile") => ({
    id, typeId, isValid: true,
    clearVelocity() { record("stop", {}); },
    teleport(location) { record("land", location); },
    triggerEvent(event) { record("detonate", {}); calls[calls.length - 1].event = event; },
  });
  return {
    calls, dimension, projectile, mob,
    // `face` is a face name (head-on hit, reported on the face) or { face, block, hitVector }.
    hit(kind, entity, location = { x: 10, y: 64, z: 20 }, source, face) {
      handlers[kind]({ projectile: entity, dimension, location, source,
        ...(face ? blockHit(location, face) : {}) });
    },
    advance(count = 1) {
      for (let n = 0; n < count; n++) {
        tick++;
        const due = queue.filter((job) => job.at <= tick);
        for (const job of due) {
          queue.splice(queue.indexOf(job), 1);
          job.callback();
        }
      }
    },
  };
}
