"""PNG frames from Blender -> web frames: d/ 1440 wide (laptops), m/ 720 wide (phones), WebP."""
import os
import sys

from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
for sub in ("d", "m"):
    os.makedirs(os.path.join(dst, sub), exist_ok=True)
total = {"d": 0, "m": 0}
for name in sorted(f for f in os.listdir(src) if f.endswith(".png")):
    im = Image.open(os.path.join(src, name)).convert("RGB")
    base = name[:-4] + ".webp"
    d = im if im.width <= 1440 else im.resize((1440, round(im.height * 1440 / im.width)), Image.LANCZOS)
    d.save(os.path.join(dst, "d", base), "WEBP", quality=76, method=6)
    m = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
    m.save(os.path.join(dst, "m", base), "WEBP", quality=72, method=6)
    total["d"] += os.path.getsize(os.path.join(dst, "d", base))
    total["m"] += os.path.getsize(os.path.join(dst, "m", base))
print({k: f"{v / 1e6:.1f} MB" for k, v in total.items()})
