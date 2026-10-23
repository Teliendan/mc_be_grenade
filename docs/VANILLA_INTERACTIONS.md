# Vanilla interaction ledger

2026-10-18 inventory; Group21 inspection updated **2026-10-23**.
Target Bedrock **1.26.52** / Script API **2.8.0**.
Approved source fixes implemented2026-10-23; **native acceptance pending**.

Current [inspection and implementation](PARITY_INSPECTION.md): projectile source
is handed to the native explosion, and the full regression runner is registered.
Both fixes owner-approved. The self-contained [game checklist for another
machine](../../../docs/grenade-game-checks.md) records21 pending cases, settings,
expected outcomes versus observations and result fields. Updated build is73db9aa
plus the attribution fix; transfer uncommitted source for the other machine.
Passing source checks are not new game observations.

Follow the [shared interaction workflow](../../../.claude/skills/bedrock-modding/references/22-vanilla-interactions.md)
and [source/coverage report](../../../docs/vanilla-interactions-audit-2026-10-18.md).
The source report supplies canonical/archived Wiki URLs, inspected sections and
access/version limits. November 2025 archived pages are discovery evidence, not
proof of current engine behavior.

Every identifier below inherits the shared common prompts and its family row.
Linked block items, entity placers, projectiles and variants must be tested as
one feature. Existing notes establish only the interactions they actually
describe. **OPEN** means discovery/intent/implementation or game behavior remains
unresolved; no family below claims a completed all-interactions parity sweep.
For closure, expand the family row into individual interaction outcomes using
the shared row format and record test version/date.

## Family findings and decisions

| Group | Counterparts / existing evidence | Disposition and remaining interactions |
| --- | --- | --- |
| Throwable | Snowball item/projectile launch, custom impact explosion; `IMPACT_TIMING.md`, item/projectile JSON and scripts/main.js | Native throwable/projectile, stack 16, custom 0.5-second cooldown; impact is delayed three ticks after settle. Preserve current custom balance. **OPEN:** dispenser launch versus ordinary item ejection, consumption/Creative, source ownership and unloaded-projectile cleanup, fluid/portal/deflection/shield and button/plate/target/tripwire paths. Snowball's special target damage is not automatically grenade design. |
| Projectile/explosion | Native explosion function; projectileHitBlock/projectileHitEntity handlers | **Source-backed design:** radius 3, `breaksBlocks:false`, `causesFire:false`, `allowUnderwater:true`; preserve these choices without claiming this audit obtained owner approval. **OPEN:** kill credit/XP/loot/PvP, damage/knockback/shields/immunities and relevant gamerules. createExplosion supplies no `source`; inspect player and ownerless dispenser cases before calling credit correct or broken. Duplicate impact guard exists; game behavior remains a separate test. |

The hidden projectile's display name omission is a documented presentation
exception (`VERIFIER_WARNINGS.md`), not a blanket gameplay exception. The initial
inventory was documentation-only; approved source corrections are recorded above.

## Group21 interaction outcomes

Every row below covers the item/projectile pair unless explicitly limited.
**I** = `gm:grenade`; **P** = `gm:grenade_projectile`. Game evidence is limited
to the older accepted impact presentation; G-numbers link to the portable test
checklist. A documented native route remains pending actual native acceptance.

| IDs | Interaction / counterpart aspect | Required outcome | Disposition | Implementation / evidence | Verification / next test |
| --- | --- | --- | --- | --- | --- |
| I | Acquisition/recipe/unlock/Creative/stack | Existing bespoke recipe; stack16; localized item | Implemented/native | Four copper nuggets + gunpowder, one output; gunpowder unlock; menu_category; item/RP/catalog | Shared verify/localization pass; G01/G20 |
| I/P | Player throw, consumption, Creative, cooldown | Native accepted throw/consumption; custom0.5s cooldown | Implemented/native; intentional cooldown | Item throwable/projectile/cooldown components | G02/G03/G19; no inventory script to duplicate costs |
| I/P | Dispenser vs dropper | Dispenser launches P; dropper transports ordinary I | Documented native route | Item projectile explicitly supports dispenser; present already | G05; no new launcher workaround justified |
| P | Flight/shape/motion/owner immunity | Preserve accepted arc and native projectile handling | Implemented/native declaration | Power2.4/gravity0.03/collision0.25, physics; old format defaults retained | Earlier arc evidence; G03/G11/G12/G19 native comparison pending |
| P | First impact/duplicate/concurrent grenades | One accepted detonation at first captured impact after settle | Implemented | pending set, copied event location, scheduled snap +3 settle ticks | Four regression scenarios pass; visual timing owner accepted2026-10-04; G03/G15 |
| P | Explosion terrain/fire/radius/water policy | Native power3 blast, no block destruction/fire, underwater allowed | Source-established custom difference | Explicit createExplosion options | Mock option checks pass; G04/G10/G11/G14 native outcomes pending |
| P | Thrower/attacker identity, XP/loot/PvP/anger | Preserve legitimate thrower; genuine ownerless sources stay ownerless | Source handoff implemented; native outcomes OPEN | Captured event source ID, resolved valid actor in ExplosionOptions.source; invalid/absent source cannot cancel detonation | 13 ownership cases pass; G06–G10/G19 remain pending |
| P | Damage/exposure/armor/shields/knockback | Native explosion response with chosen custom power | Native API route; acceptance OPEN | No hand-coded health loss or impact_damage; source omission separately open | G07/G08/G09, measure Bedrock values rather than Java formulas |
| P | Deflection/immune mobs/vehicles/projectile collisions | Native counterpart contact/interception where applicable | Open engine behavior | Generic projectile family, native component; no guessed vanilla runtime alias | G09/G12/G14/G19; separate contact from delayed blast |
| P | Fluids/fire/portals/world limits | No unintended stuck/repeated effects; record actual engine transition | Open | Existing native physics and script event dimension/location | G11/G18; newer docs/defaults do not establish behavior of old format |
| P | Reload/unload/owner exit/unhit lifetime | Explicit observed lifetime and once-only detonation policy | Open investigation | No authored saved impact state or explicit unhit timeout; callbacks/set transient | G16–G19; do not add recovery polling from absence alone |
| I/P | Native controls/vibrations/warden | Record actual counterpart interactions and sound/event timing | Open engine behavior | No scripted button/plate/target/sculk support | G13; family membership is not proof every consumer recognizes P |
| I/P | Relevant gamerules/difficulty/multiplayer | Keep declared no-terrain/no-fire and establish other rule applicability | Open | Native blast options; no custom PvP/rule override | G07/G09/G10/G15/G21; TNT rules do not automatically define custom grenade policy |
| I | Transport/death/item hazards/display/name | Ordinary native inventory-item behavior | Implemented/native, acceptance OPEN | No scripted priming of inventory/dropped items; no bespoke immunity/repair/enchant slots | G01/G20; no implied primed-TNT or fuel/repair role |
| P | Spawn egg/name/biology | Internal flight actor, no egg or biological jobs | Intentional presentation; biological mechanics inapplicable | is_spawnable:false, diagnostic summon, exact unnamed-entity exception | Source/verify; no blanket gameplay exemption |
| I/P | Snowball crafting/snow harvesting/blaze bonus, wind toggles, TNT mining/priming | Do not add unrelated counterpart functions | Inapplicable to grenade design | Custom recipe/purpose; explosion replaces snowball harmless combat | Source design reason; no guessed tags/extra damage |
| I/P | Verification pipeline | Impact and ownership regression checks run before deployment | Implemented | Registered tests/run.mjs; named impact-timing/ownership/suite-layout runners | All three runners pass; ordinary verify deliberately rejected a temporary failing suite before restoration |

## Exact authored inventory

### Blocks (0)

No explicit blocks definitions. Reused vanilla/automatic block items still require applicable review.

### Items (1)

| Identifier | Review group | Source |
| --- | --- | --- |
| `gm:grenade` | Throwable | [grenade_bp](../grenade_bp/items/grenade.json) |

### Entities (1)

| Identifier | Review group | Source |
| --- | --- | --- |
| `gm:grenade_projectile` | Projectile/explosion | [grenade_bp](../grenade_bp/entities/grenade_projectile.json) |

