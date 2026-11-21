// Budget of one detonation (performance audit G1, owner decision 2026-11-21): at most 16 entities (48 raycasts) per step,
// closest first; the first step runs in the detonation callback, so a normal fight is handled exactly as before.
import assert from "node:assert/strict";
import { harness } from "./support/harness.mjs";

const player = { id: "player", typeId: "minecraft:player", isValid: true };
const center = { x: 10, y: 64, z: 20 };
const BATCH = 16;
const perTick = (h, kind) => {
  const out = new Map();
  for (const c of h.calls) if (c.kind === kind) out.set(c.tick, (out.get(c.tick) ?? 0) + 1);
  return out;
};

{
  // A packed farm: 200 mobs, listed farthest first so the sort matters.
  const h = harness();
  const mobs = [];
  for (let i = 0; i < 200; i++) mobs.push(h.mob(`m${i}`, { x: 10 + 5.9 * (1 - i / 200), y: 64, z: 20 }));
  h.dimension.nearby = mobs;
  const grenade = h.projectile();
  h.hit("block", grenade, { ...center }, player);
  h.advance(40);
  const rays = perTick(h, "ray"), hits = perTick(h, "damage");
  const worstRays = Math.max(...rays.values()), worstHits = Math.max(...hits.values());
  assert.ok(worstRays <= BATCH * 3, `worst single call ${worstRays} raycasts`);
  assert.ok(worstHits <= BATCH, `worst single call ${worstHits} damage calls`);
  assert.equal(h.calls.filter((c) => c.kind === "damage").length, 200, "every mob is still hit");
  assert.equal(h.calls.filter((c) => c.kind === "query").length, 1, "one entity query per detonation");
  const order = h.calls.filter((c) => c.kind === "damage").map((c) => c.target);
  assert.deepEqual(order, mobs.slice().reverse().map((m) => m.id), "closest first");
  const detonate = h.calls.findIndex((c) => c.kind === "detonate");
  assert.ok(detonate > h.calls.map((c) => c.kind).lastIndexOf("damage"), "the harmless blast follows the last damage");
  assert.equal(h.calls.filter((c) => c.kind === "detonate").length, 1);
  console.log(`ok blast budget: 200 mobs -> worst call ${worstRays} raycasts / ${worstHits} damage (was 600 / 200), ${hits.size} steps`);
}

{
  // A normal fight (a few mobs): everything in the first step, same tick as the particle.
  const h = harness();
  h.dimension.nearby = [1, 2, 3, 4, 5].map((i) => h.mob(`m${i}`, { x: 10 + i / 2, y: 64, z: 20 }));
  h.hit("block", h.projectile(), { ...center }, player);
  h.advance(4);
  const dmg = h.calls.filter((c) => c.kind === "damage"), detonate = h.calls.find((c) => c.kind === "detonate");
  assert.equal(dmg.length, 5);
  assert.equal(new Set([...dmg, detonate].map((c) => c.tick)).size, 1, "damage and blast in one tick");
  // Exactly one batch of 16 is still one step.
  const edge = harness();
  edge.dimension.nearby = Array.from({ length: BATCH }, (_, i) => edge.mob(`e${i}`, { x: 11 + i / 10, y: 64, z: 20 }));
  edge.hit("block", edge.projectile(), { ...center }, player);
  edge.advance(4);
  assert.equal(new Set(edge.calls.filter((c) => c.kind === "damage" || c.kind === "detonate").map((c) => c.tick)).size, 1);
  console.log("ok blast budget: a small fight is fully handled in the first step");
}

{
  // Mobs that die between steps are skipped; the grenade stays the attacker when the thrower leaves.
  const h = harness(), thrower = { ...player };
  const mobs = Array.from({ length: 40 }, (_, i) => h.mob(`m${i}`, { x: 11 + i / 10, y: 64, z: 20 }));
  h.dimension.nearby = mobs;
  const grenade = h.projectile();
  h.hit("block", grenade, { ...center }, thrower);
  h.advance(4); // landing delay ends on tick 4: first batch
  for (const m of mobs.slice(20, 30)) m.isValid = false;
  thrower.isValid = false;
  h.advance(10);
  const dmg = h.calls.filter((c) => c.kind === "damage");
  assert.equal(dmg.length, 30, "ten dead mobs skipped");
  assert.equal(dmg[0].options.damagingEntity, thrower);
  assert.equal(dmg[dmg.length - 1].options.damagingEntity, grenade);
  console.log("ok blast budget: dead entities skipped, attacker re-resolved per step");
}
