# Grenade graphics

The art is a 16x16 olive frag grenade (oval cell body, steel head, lever and pull ring); the projectile
uses the same texture, and both packs share a 256x256 badge of it over an amber blast.

- Regenerate texture and pack icons: `python -B tools/make_graphics.py`
- Owner's choice: f5_current, chosen 2026-11-12 from three rounds of variants. Commit `9445ce4`.
- Accepted by the owner in game, 2026-11-17.

## PBR (Vibrant Visuals)

`grenade.texture_set.json` and `grenade_mers.tga` sit at the textures root and are generated from
`tools/pbr_spec.json` (steel pin and lever like `items/bucket_empty`, painted body like `items/turtle_helmet`).
Rebuild after any change to `grenade.png`: `python -I .claude/skills/bedrock-art/scripts/pbr_mers.py build mods/grenade/tools/pbr_spec.json`
(from the workspace root); check with the same command plus `--check`.
