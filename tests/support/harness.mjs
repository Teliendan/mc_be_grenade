import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../../grenade_bp/scripts/main.js", import.meta.url), "utf8")
  .replace(/^import \{ world, system \} from "@minecraft\/server";\r?\n/, "");

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
  runInNewContext(source, { world, system: { run: schedule, runTimeout: schedule } });
  handlers.load();
  const record = (kind, location) => calls.push({ kind, tick, location: { ...location } });
  const dimension = {
    spawnParticle: (id, location) => record("particle", location),
    createExplosion: (location, radius, options) => {
      assert.equal(radius, 3);
      assert.equal(options.breaksBlocks, false);
      assert.equal(options.causesFire, false);
      assert.equal(options.allowUnderwater, true);
      record("explosion", location);
      calls[calls.length - 1].options = options;
      calls[calls.length - 1].sourceWasValid = options.source?.isValid;
    },
  };
  const projectile = (id = "grenade-1", typeId = "gm:grenade_projectile") => ({
    id, typeId, isValid: true,
    clearVelocity() { record("stop", {}); },
    teleport(location) { record("land", location); },
    remove() { this.isValid = false; record("remove", {}); },
  });
  return {
    calls, dimension, projectile,
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

