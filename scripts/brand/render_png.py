"""Renders brand PNGs (app icons, apple icon, favicon.ico, Open Graph image) from the SVGs."""
import asyncio, pathlib, io
from PIL import Image
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
FONTS = ROOT / "node_modules/@fontsource-variable"
CSS = f"""@font-face{{font-family:Fredoka;src:url(file://{FONTS}/fredoka/files/fredoka-latin-wght-normal.woff2)}}
@font-face{{font-family:'Noto Sans Georgian';src:url(file://{FONTS}/noto-sans-georgian/files/noto-sans-georgian-georgian-wght-normal.woff2)}}
html,body{{margin:0;background:transparent}}"""

async def shot(pg, svg_path, w, h, out, transparent=False):
    svg = (ROOT / svg_path).read_text()
    await pg.set_viewport_size({"width": w, "height": h})
    tmp = pathlib.Path("/tmp/brand_render.html")
    tmp.write_text(f"<!doctype html><meta charset=utf-8><style>{CSS} svg{{display:block;width:{w}px;height:{h}px}}</style>{svg}")
    await pg.goto(f"file://{tmp}")
    await pg.evaluate("document.fonts.ready")
    await pg.wait_for_timeout(300)
    await pg.screenshot(path=str(ROOT / out), omit_background=transparent)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        for size in (192, 512):
            await shot(pg, "public/brand/wivilo-app-icon.svg", size, size, f"public/brand/icon-{size}.png", transparent=True)
        await shot(pg, "public/brand/wivilo-app-icon.svg", 180, 180, "src/app/apple-icon.png")
        await shot(pg, "public/brand/wivilo-og.svg", 1200, 630, "src/app/opengraph-image.png")
        await shot(pg, "public/brand/wivilo-og.svg", 1200, 630, "public/brand/wivilo-og.png")
        lw = int(pathlib.Path("/tmp/logo_w.txt").read_text())
        await shot(pg, "public/brand/wivilo-logo.svg", lw, 260, "public/brand/wivilo-logo.png", transparent=True)
        await shot(pg, "public/brand/wivilo-app-icon.svg", 256, 256, "/tmp/fav256.png", transparent=True)
        await b.close()
    im = Image.open("/tmp/fav256.png").convert("RGBA")
    im.save(ROOT / "src/app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    # maskable icon (full bleed background for Android)
    print("pngs + favicon.ico written")
asyncio.run(main())
