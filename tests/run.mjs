// Run with: node mods/grenade/tests/run.mjs (from the workspace root).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../grenade_bp/scripts/main.js", import.meta.url), "utf8")
  .replace(/^import \{ world, system \} from "@minecraft\/server";\r?\n/, "");

function harness() {
  let tick = 0;
  const queue = [];
  const handlers = {};
  const calls = [];
  const signal = (name) => ({ subscribe: (callback) => { handlers[name] = callback; } });
  const schedule = (callback, delay = 1) => queue.push({ at: tick + delay, callback });
  const world = { afterEvents: {
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
    hit(kind, entity, location = { x: 10, y: 64, z: 20 }) {
      handlers[kind]({ projectile: entity, dimension, location });
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

for (const kind of ["block", "entity"]) {
  const h = harness();
  const p = h.projectile();
  const impact = { x: 10, y: 64, z: 20 };
  h.hit(kind, p, impact);
  impact.y = 100; // The delayed blast must retain the first hit coordinates.
  h.advance();
  assert.deepEqual(h.calls.map((c) => c.kind), ["stop", "land"]);
  assert.deepEqual(h.calls[1].location, { x: 10, y: 64, z: 20 });
  h.advance(2);
  assert.equal(h.calls.length, 2, "no effects while the landing is settling");
  assert.equal(p.isValid, true, "keep the grenade visible until detonation");
  h.advance();
  assert.deepEqual(h.calls.map((c) => c.kind), ["stop", "land", "remove", "particle", "explosion"]);
  for (const c of h.calls.slice(3)) {
    assert.equal(c.tick, 4);
    assert.deepEqual(c.location, { x: 10, y: 64, z: 20 });
  }
  h.advance(10);
  assert.equal(h.calls.length, 5);
  console.log(`ok ${kind} hit: landing precedes all detonation effects`);
}

{
  const h = harness();
  const p = h.projectile();
  h.hit("entity", p);
  h.hit("block", p, { x: 99, y: 99, z: 99 });
  h.advance();
  h.hit("block", p);
  h.hit("block", h.projectile("grenade-2"));
  h.hit("block", h.projectile("snowball", "minecraft:snowball"));
  h.advance(10);
  const blasts = h.calls.filter((c) => c.kind === "explosion");
  assert.equal(blasts.length, 2, "each grenade explodes once; unrelated projectiles are ignored");
  assert.deepEqual(blasts.map((c) => c.tick), [4, 5]);
  assert.deepEqual(blasts[0].location, { x: 10, y: 64, z: 20 });
  console.log("ok repeated hit events and concurrent grenades");
}

{
  const h = harness();
  const p = h.projectile();
  h.hit("block", p);
  p.isValid = false;
  h.dimension.spawnParticle = () => { throw new Error("unloaded chunk"); };
  h.advance(4);
  assert.equal(h.calls.filter((c) => c.kind === "explosion").length, 1);
  console.log("ok missing projectile and failed particles do not cancel the blast");
}
