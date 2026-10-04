# Grenade graphics

## 2026-10-04 — awaiting owner review

- Replaced the item texture with a transparent 16×16 olive grenade: recessed body segments, top-left highlights, steel lever and hollow pull ring. The projectile uses this same texture.
- Both packs use the same 256×256 badge: matching grenade over an angular amber blast and dark teal frame.
- Reproduce all three PNGs with `python -B tools/make_graphics.py` from this mod directory.
- Compared against vanilla iron ingot and fireball icons with the shared icon review sheet. Item: 104 painted pixels, 10 colours, value range 0.52, largest solid area 9%; no review warnings. Visually inspected inventory/hotbar sizes and the pack icon.
- Shared pack verifier: zero errors, one warning. Static and image review only; not verified in game (installed reference version 1.26.52).
- Initial deployment was refused with PermissionError. The owner then explicitly authorized deployment into C:/mc; elevated `mods deploy grenade` succeeded on 2026-10-04 and `mods status` confirmed both packs in sync. Leave the world and re-enter for in-game review.
- Generator and assets are recorded in commit `Improve grenade item texture and pack icons`. Visual acceptance in game remains pending. Review scratch remains in `temp/grenade-graphics/`; remove it after acceptance under the workspace cleanup rule.
