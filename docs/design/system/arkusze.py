# Z-12 · zrzuty wzorcowe do repo (linia bazowa audytu SP-13) i arkusze zbiorcze do oglądania.
# Każdy zrzut w palecie 256 kolorów; plik > 300 KB (strażnik repo) dzielę na pasy w pełnej rozdzielczości: <nazwa>-<i>z<n>.png.
# Arkusz: jeden ekran w 5 szerokościach (góra strony, do 1500 px wysokości), motyw jasny nad ciemnym, skala 0,4.
# Użycie: python3 -I arkusze.py <katalog zrzutów (podkatalogi klucz/, stany/, kontrast/)> <docs/design/system/wzorce-zrzuty>
import io, os, sys
from PIL import Image, ImageDraw, ImageFont

SRC, DST = sys.argv[1], sys.argv[2]
LIMIT = 300 * 1024
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)

def png(im, colors=256):
    b = io.BytesIO(); im.convert('RGB').quantize(colors=colors, method=Image.Quantize.FASTOCTREE).save(b, 'PNG', optimize=True); return b.getvalue()

def save(im, base, out):
    data = png(im)
    if len(data) <= LIMIT: open(os.path.join(out, base + '.png'), 'wb').write(data); return 1
    parts = 2
    while True:
        chunks = [png(im.crop((0, i * im.height // parts, im.width, (i + 1) * im.height // parts))) for i in range(parts)]
        if all(len(c) <= LIMIT for c in chunks): break
        parts += 1
    for i, c in enumerate(chunks): open(os.path.join(out, f'{base}-{i + 1}z{parts}.png'), 'wb').write(c)
    return parts

def sheet(screen, out):
    rows = []
    for theme in ('jasny', 'ciemny'):
        cells = []
        for w in (320, 390, 768, 1024, 1440):
            im = Image.open(os.path.join(SRC, 'klucz', f'{screen}-{w}-{theme}.png')).convert('RGB'); im = im.crop((0, 0, im.width, min(im.height, 1500)))
            cells.append((f'{w} px · {theme}', im.resize((int(im.width * .4), int(im.height * .4)), Image.LANCZOS)))
        h = max(c[1].height for c in cells) + 40; wsum = sum(c[1].width for c in cells) + 24 * (len(cells) + 1)
        row = Image.new('RGB', (wsum, h), (255, 255, 255)); d = ImageDraw.Draw(row); x = 24
        for lab, im in cells: d.text((x, 8), lab, fill=(20, 24, 30), font=FONT); row.paste(im, (x, 40)); d.rectangle((x - 1, 39, x + im.width, 40 + im.height), outline=(150, 150, 150)); x += im.width + 24
        rows.append(row)
    W = max(r.width for r in rows); H = sum(r.height for r in rows) + 16
    s = Image.new('RGB', (W, H), (255, 255, 255)); y = 0
    for r in rows: s.paste(r, (0, y)); y += r.height + 16
    data = png(s, 64); assert len(data) <= LIMIT, f'{screen}: arkusz > 300 KB'
    open(os.path.join(out, f'arkusz-{screen}.png'), 'wb').write(data)

os.makedirs(DST, exist_ok=True); n = 0
for sub in ('klucz', 'stany', 'kontrast'):
    for f in sorted(os.listdir(os.path.join(SRC, sub))):
        if f.endswith('.png'): n += save(Image.open(os.path.join(SRC, sub, f)), f[:-4], DST)
for s in ('cwiczenie', 'glowna', 'lista'): sheet(s, DST)
print(f'pliki zrzutów: {n}; arkusze: 3')
