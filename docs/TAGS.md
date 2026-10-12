# grenade: tag/family audit

2026-10-13; target Bedrock 1.26.52 / Script API 2.8.0. Source revision `9ae966b`.

Status: source inventory and official-documentation review. Approved classifications implemented 2026-10-13; no new engine tests. A reasoned omission is a valid audit result. See the implementation update below.

Scope: 0 block definitions, 1 entity definitions, across every `*_bp` pack in this mod. Relevant explicit item tags were cross-checked for the block/item distinction.

## Recommendations and effects

Approved and implemented 2026-10-13: `gm:grenade_projectile` now has family
`projectile`. This enables projectile-family filters. Exact type-ID selection
already identifies grenades specifically, so an own family is deliberately
omitted. The projectile component/script retains flight and impact behavior.
No behavior generator writes this definition.

## Complete block inventory

Tags below are declared in root components. `omitted` and `[]` both mean no declared tags; they are retained by design unless a proposal above says otherwise. The material profile records the existing mining/harvest policy; a tag is not a harvest gate.

| Block | Declared tags | Profile / decision |
| --- | --- | --- |
| None | - | No custom blocks |

Inspected all block permutations: 0 tag-component overrides. Other components still vary by state; no all-state engine behavior is claimed.

## Complete entity inventory

| Entity | Base families | Group overrides / decision |
| --- | --- | --- |
| [gm:grenade_projectile](../grenade_bp/entities/grenade_projectile.json) | `projectile` | Approved projectile family; own family omitted as redundant with exact type-ID selection |

## Related explicit item tags

These are item-component tags, not block tags. This is a cross-check, not a request to classify every inventory item.

| Item | Tags |
| --- | --- |
| None declared | Omission alone is not an error |

## Evidence and follow-up

- Shared decision rules and primary sources: [tags and families](../../../.claude/skills/bedrock-modding/references/14-tags.md).
- Cross-mod findings and verification status: [workspace audit](../../../docs/tag-audit-2026-10-13.md).
- Existing runtime quest/hostility/debug tags are separate from these families. No new runtime tags or cleanup mechanisms are proposed.
- If accepted, update any responsible generator, run `mods verify <mod>`, deploy and confirm `in sync`, then record relevant engine observations here.

## Verification and deployment (2026-10-13)

Shared verifier: 0 errors / 1 justified warning. Deployed through `mods deploy
grenade`; game sync is checked in the workspace audit. No new in-game test.
Warning rationale: [verifier warnings](VERIFIER_WARNINGS.md).
