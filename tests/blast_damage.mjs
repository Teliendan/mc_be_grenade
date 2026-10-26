import assert from "node:assert/strict";
import { harness } from "./support/harness.mjs";

const player = { id: "player", typeId: "minecraft:player", isValid: true };
const center = { x: 10, y: 64, z: 20 };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
// The script runs in its own VM context: compare plain copies of the objects it builds.
const plain = (value) => JSON.parse(JSON.stringify(value));
const damages = (h) => h.calls.filter((c) => c.kind === "damage");

{
  // Vanilla falloff over twice the radius (6 blocks); the thrower is not their own attacker.
  const h = harness();
  const zombie = h.mob("zombie", { ...center });
  const far = h.mob("far", { x: 13, y: 64, z: 20 });
  const self = h.mob("player", { x: 14, y: 64, z: 20 });
  h.dimension.nearby = [zombie, far, self];
  const grenade = h.projectile();
  h.hit("block", grenade, { ...center }, player);
  h.advance(4);
  assert.deepEqual(plain(h.calls.find((c) => c.kind === "query").query), { location: center, maxDistance: 6,
    excludeTypes: ["minecraft:item", "minecraft:xp_orb", "gm:grenade_projectile"] });
  const [a, b, c] = damages(h);
  near(a.amount, 43);
  near(b.amount, 16.75);
  near(c.amount, ((1 / 9 + 1 / 3) / 2) * 42 + 1);
  for (const d of [a, b]) {
    assert.equal(d.options.cause, "entityExplosion");
    assert.equal(d.options.damagingEntity, player);
  }
  assert.deepEqual(plain(c.options), { cause: "entityExplosion" });
  const detonation = h.calls.find((call) => call.kind === "detonate");
  assert.equal(detonation.event, "gm:detonate");
  assert.ok(h.calls.indexOf(detonation) > h.calls.indexOf(c), "damage first, then the harmless engine blast");
  console.log("ok scripted blast: vanilla falloff, thrower credited, harmless visual blast");
}

{
  // Cover: a wall hides the feet and middle rays (shallow), the head ray clears it.
  const h = harness();
  h.dimension.nearby = [h.mob("zombie", { x: 13, y: 64, z: 20 })];
  h.dimension.blocked = (from, direction) => direction.y < 0.4;
  h.hit("block", h.projectile(), { ...center }, player);
  h.advance(4);
  near(damages(h)[0].amount, ((1 / 36 + 1 / 6) / 2) * 42 + 1);

  const hidden = harness();
  hidden.dimension.nearby = [hidden.mob("zombie", { x: 13, y: 64, z: 20 })];
  hidden.dimension.blocked = () => true;
  hidden.hit("block", hidden.projectile(), { ...center }, player);
  hidden.advance(4);
  assert.equal(damages(hidden).length, 0, "fully behind a wall: no damage");
  console.log("ok scripted blast: cover reduces or blocks the damage");
}

{
  // A thrower who left during the landing delay: the damage names the grenade.
  const h = harness(), thrower = { ...player };
  h.dimension.nearby = [h.mob("zombie", { ...center })];
  const grenade = h.projectile();
  h.hit("block", grenade, { ...center }, thrower);
  h.advance();
  thrower.isValid = false;
  h.advance(3);
  assert.equal(damages(h)[0].options.damagingEntity, grenade);

  // Grenade and thrower both gone: the damage still lands, with no attacker.
  const bare = harness(), gone = bare.projectile();
  bare.dimension.nearby = [bare.mob("zombie", { ...center })];
  bare.hit("block", gone, { ...center });
  gone.isValid = false;
  bare.advance(4);
  assert.deepEqual(plain(damages(bare)[0].options), { cause: "entityExplosion" });
  console.log("ok scripted blast: attacker falls back to the grenade, then to none");
}

{
  // A dispenser grenade has no thrower; its damage names the grenade.
  const h = harness();
  h.dimension.nearby = [h.mob("zombie", { ...center })];
  const grenade = h.projectile();
  h.hit("block", grenade, { ...center });
  h.advance(4);
  assert.equal(damages(h)[0].options.damagingEntity, grenade);
  console.log("ok scripted blast: dispenser damage names the grenade");
}
