"""Weichgezeichnete Hintergründe für die Infografik-Szenen aus den Standbildern.

Aufruf: python3 blur_bg.py <bildordner>   (liest <bildordner>/*.jpg, schreibt <bildordner>/blur/*.jpg)
"""
import glob
import os
import sys

from PIL import Image, ImageFilter

src = sys.argv[1]
out = os.path.join(src, "blur")
os.makedirs(out, exist_ok=True)
for p in sorted(glob.glob(os.path.join(src, "*.jpg"))):
    dst = os.path.join(out, os.path.basename(p))
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(p):
        continue
    im = Image.open(p).convert("RGB").resize((960, 540), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(14)).resize((1920, 1080), Image.BICUBIC)
    im.save(dst, quality=88)
    print("blur", os.path.basename(p))
