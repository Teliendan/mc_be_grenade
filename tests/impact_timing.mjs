import assert from "node:assert/strict";
import {harness} from "./support/harness.mjs";

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
  assert.deepEqual(h.calls.map((c) => c.kind), ["stop", "land", "particle", "explosion", "remove"]);
  for (const c of h.calls.slice(2, 4)) {
    assert.equal(c.tick, 4);
    assert.deepEqual(c.location, { x: 10, y: 64, z: 20 });
  }
  h.advance(10);
  assert.equal(h.calls.length, 5);
  console.log(`ok ${kind} hit: landing precedes all detonation effects`);
}

for (const [face, expected] of Object.entries({
  Up: {x: 10, y: 64.05, z: 20}, Down: {x: 10, y: 63.95, z: 20},
  East: {x: 10.05, y: 64, z: 20}, West: {x: 9.95, y: 64, z: 20},
  North: {x: 10, y: 64, z: 19.95}, South: {x: 10, y: 64, z: 20.05},
})) {
  const h = harness();
  h.hit('block', h.projectile(), undefined, undefined, face);
  h.advance(4);
  assert.deepEqual(h.calls.find(call => call.kind === 'explosion').location, expected);
  assert.deepEqual(h.calls.find(call => call.kind === 'land').location, expected);
}
console.log('ok block impacts detonate outside all six solid faces');

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
