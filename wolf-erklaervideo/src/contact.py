"""Kontaktbogen aus QA-Frames: python3 contact.py <qa-ordner> <out-präfix> [pro_blatt]"""
import json, sys
from PIL import Image, ImageDraw
d = json.load(open(sys.argv[1] + "/index.json"))
per = int(sys.argv[3]) if len(sys.argv) > 3 else 12
w, h, cols = 640, 360, 3
for s in range(0, len(d), per):
    chunk = d[s:s + per]
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * h), "black")
    for i, e in enumerate(chunk):
        im = Image.open(e["file"]).resize((w, h), Image.LANCZOS)
        dr = ImageDraw.Draw(im); dr.rectangle([0, 0, 170, 22], fill="black"); dr.text((4, 4), f"{e['id']} {e['t']}", fill="yellow")
        sheet.paste(im, ((i % cols) * w, (i // cols) * h))
    out = f"{sys.argv[2]}_{s // per + 1}.jpg"
    sheet.save(out, quality=82); print(out)
