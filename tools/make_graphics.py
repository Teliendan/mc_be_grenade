"""Generate the grenade sprite (F5 frag shape, current palette) and matching pack badges. Run from any directory."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
# Roles of the palette: ramp (groove, shade, mid, light), outline, rim light, steel (dark, mid, light, glint).
RAMP = ['#26352c', '#3e5031', '#5e7339', '#899b49']
OUTLINE = '#1a251f'
RIM = '#bbc46b'
STEEL = ['#303d47', '#657783', '#a6bbc0', '#e2ece4']
# Lever: (x, y, steel index). Ring: 3x3 hollow, top-left corner below.
LEVER = [(10, 3, 0), (11, 3, 2), (12, 4, 2), (12, 5, 1), (11, 4, 0),
         (13, 4, 0), (13, 5, 0), (13, 6, 0), (12, 6, 0)]
RING = (5, 0)


def rgba(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


def body(img):
    """Oval cast body: cells cut by one groove column and two groove rows, flat 3-tone
    shading per cell (light from the top-left), lighter top/left cell edges, rim light."""
    cx, cy, rx, ry = 7.5, 10.0, 5.5, 5.0
    gx, gy = [7], [8, 11]
    mask = {(x, y) for y in range(16) for x in range(16)
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1.0}
    cells = {}
    for x, y in mask:
        key = (sum(x > l for l in gx), sum(y > l for l in gy))
        cells.setdefault(key, []).append((x, y))
    for pts in cells.values():
        mx = sum(p[0] for p in pts) / len(pts)
        my = sum(p[1] for p in pts) / len(pts)
        lum = -0.6 * (mx + .5 - cx) / rx - 0.7 * (my + .5 - cy) / ry
        base = 1 if lum < -0.15 else (2 if lum < 0.35 else 3)
        x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
        y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
        for x, y in pts:
            t = base
            if len(pts) >= 6:
                if (x == x0 or y == y0) and base < 3:
                    t = base + 1
                elif (x == x1 or y == y1) and base > 1:
                    t = base - 1
            img.putpixel((x, y), rgba(RAMP[t]))
    for x, y in mask:
        if x in gx or y in gy:
            img.putpixel((x, y), rgba(RAMP[0]))
    edge = {(x, y) for x, y in mask
            if any((x + dx, y + dy) not in mask for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))}
    for p in edge:
        img.putpixel(p, rgba(OUTLINE))
    for x, y in sorted(mask - edge):
        if (x - 1, y) in edge or (x, y - 1) in edge:
            img.putpixel((x, y), rgba(RIM))


def head(img):
    """Steel fuse head, a 5x3 block with a glint."""
    for y in range(3, 6):
        for x in range(5, 10):
            edge = x in (5, 9) or y in (3, 5)
            img.putpixel((x, y), rgba(OUTLINE if edge else (STEEL[2] if x == 6 else STEEL[1])))
    img.putpixel((6, 4), rgba(STEEL[3]))


def ring(img):
    x, y = RING
    for dx, dy in [(0, 0), (1, 0), (2, 0), (0, 1), (2, 1), (0, 2), (1, 2), (2, 2)]:
        img.putpixel((x + dx, y + dy), rgba(STEEL[2]))
    for dx, dy in [(2, 1), (1, 2), (2, 2)]:
        img.putpixel((x + dx, y + dy), rgba(STEEL[1]))


def sprite():
    img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    body(img)
    head(img)
    for x, y, k in LEVER:
        img.putpixel((x, y), rgba(STEEL[k]))
    ring(img)
    assert set(img.getchannel('A').tobytes()) == {0, 255}
    return img


def badge(item):
    # Compose on a single 64px grid; export with nearest-neighbour scaling.
    img = Image.new('RGBA', (64, 64), '#17262c')
    d = ImageDraw.Draw(img)
    d.rectangle((2, 2, 61, 61), fill='#34464b')
    d.rectangle((4, 4, 59, 59), fill='#21343b')
    d.polygon([(4, 4), (59, 4), (4, 59)], fill='#2a4045')
    # A warm, angular blast halo sets off the cool steel and olive shell.
    d.polygon([(13, 15), (26, 18), (33, 8), (39, 19), (53, 14),
               (47, 29), (56, 36), (44, 41), (48, 54), (34, 48),
               (23, 56), (21, 44), (8, 46), (14, 33), (7, 24),
               (19, 24)], fill='#835039')
    d.polygon([(19, 21), (29, 22), (33, 15), (38, 25), (47, 22),
               (42, 32), (49, 37), (39, 40), (40, 47), (30, 43),
               (24, 49), (23, 39), (15, 40), (20, 31), (14, 27)], fill='#d28d45')
    large = item.resize((48, 48), Image.Resampling.NEAREST)
    shadow = Image.new('RGBA', large.size, '#111e25')
    shadow.putalpha(large.getchannel('A'))
    img.alpha_composite(shadow, (11, 10))
    img.alpha_composite(large, (8, 6))
    for box in [(7, 8, 9, 10), (53, 49, 55, 51), (10, 53, 11, 54)]:
        d.rectangle(box, fill='#edbc69')
    return img.convert('RGB').resize((256, 256), Image.Resampling.NEAREST)


if __name__ == '__main__':
    item = sprite()
    item.save(ROOT / 'grenade_rp/textures/grenade.png')
    icon = badge(item)
    for pack in ('grenade_bp', 'grenade_rp'):
        icon.save(ROOT / pack / 'pack_icon.png')
    print('Generated 16x16 item/projectile texture and both 256x256 pack icons.')
