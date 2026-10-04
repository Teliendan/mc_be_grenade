"""Generate the grenade sprite and matching pack badges. Run from any directory."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PALETTE = {
    '.': (0, 0, 0, 0),
    'o': '#26352c', 's': '#3e5031', 'g': '#5e7339',
    'l': '#899b49', 'h': '#bbc46b', 'm': '#718342',
    'd': '#303d47', 'i': '#657783', 'a': '#a6bbc0', 'w': '#e2ece4',
}
# Deliberate clusters: rounded cast body, recessed seams, folded steel lever,
# and a hollow pull ring. One pixel of breathing room around the silhouette.
ROWS = [
    '................',
    '.......awaa.....',
    '.....iiad.da....',
    '.....awiiia.....',
    '.....sggddi.....',
    '....olhlgsdi....',
    '...olhlgsgdi....',
    '...olggssgsi....',
    '..olhlsmlgsi....',
    '..olggsgggsi....',
    '..osssossssi....',
    '...olgsmgso.....',
    '...omgsggso.....',
    '....osssso......',
    '.....oooo.......',
    '................',
]


def sprite():
    assert len(ROWS) == 16 and all(len(row) == 16 for row in ROWS)
    img = Image.new('RGBA', (16, 16))
    for y, row in enumerate(ROWS):
        for x, symbol in enumerate(row):
            img.putpixel((x, y), Image.new('RGBA', (1, 1), PALETTE[symbol]).getpixel((0, 0)))
    assert {p[3] for p in img.getdata()} == {0, 255}
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
