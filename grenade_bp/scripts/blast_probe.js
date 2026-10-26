// TEMPORARY owner test (2026-10-26): compare which attacker the engine reports for each
// blast method, i.e. what other developers' add-ons see. Remove this file and its import
// in main.js once the owner picks a method (docs/ATTRIBUTION_TEST.md). Readout goes to the
// Content Log (developer text, not localized): turn on the Content Log GUI to see it.
import { system, world } from "@minecraft/server";

const MODES = ["scripted", "native", "grenade"];
const EXPLOSION_CAUSES = ["entityExplosion", "blockExplosion"];
let mode = "scripted";
let logging = false;

export const blastMode = () => mode;

function describe(entity) {
  try {
    if (!entity) return "none";
    return entity.typeId === "minecraft:player" ? `player ${entity.name}` : entity.typeId;
  } catch {
    return "gone";
  }
}

function report(what, victim, damageSource) {
  if (!logging || !EXPLOSION_CAUSES.includes(damageSource.cause)) return;
  console.warn(`[gm:blast ${mode}] ${describe(victim)} ${what}: attacker ${describe(damageSource.damagingEntity)}, ` +
    `projectile ${describe(damageSource.damagingProjectile)}, cause ${damageSource.cause}`);
}

export function startBlastProbe() {
  system.afterEvents.scriptEventReceive.subscribe(({ id, message }) => {
    if (id !== "gm:blast") return;
    const word = message.trim();
    if (MODES.includes(word)) mode = word;
    else if (word === "log") logging = !logging;
    console.warn(`[gm:blast] method ${mode}, readout ${logging ? "on" : "off"}`);
  }, { namespaces: ["gm"] });
  world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource, damage }) =>
    report(`hurt ${damage.toFixed(1)}`, hurtEntity, damageSource));
  world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => report("died", deadEntity, damageSource));
}
