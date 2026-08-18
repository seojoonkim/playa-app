from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/images/playa-instagram-facilities/playa-lounge-1.webp"
WORDMARK = Path("/tmp/playa-wordmark.png")
OUTPUT = ROOT / "public/og-image-v2.jpg"
SIZE = (1200, 630)

source = Image.open(SOURCE).convert("RGB")
scale = max(SIZE[0] / source.width, SIZE[1] / source.height)
resized = source.resize((round(source.width * scale), round(source.height * scale)), Image.Resampling.LANCZOS)
left = (resized.width - SIZE[0]) // 2
top = round((resized.height - SIZE[1]) * 0.40)
canvas = resized.crop((left, top, left + SIZE[0], top + SIZE[1]))
canvas = ImageEnhance.Color(canvas).enhance(0.78)
canvas = ImageEnhance.Contrast(canvas).enhance(1.05)

# Quiet olive-charcoal grade and central reading field.
grade = Image.new("RGBA", SIZE, (17, 20, 15, 74))
canvas = Image.alpha_composite(canvas.convert("RGBA"), grade)
shade = Image.new("L", SIZE, 0)
draw = ImageDraw.Draw(shade)
for y in range(SIZE[1]):
    vertical = int(42 + 60 * abs(y - SIZE[1] / 2) / (SIZE[1] / 2))
    draw.line((0, y, SIZE[0], y), fill=min(118, vertical))
shade = shade.filter(ImageFilter.GaussianBlur(34))
canvas = Image.alpha_composite(canvas, Image.new("RGBA", SIZE, (8, 10, 8, 0)).putalpha(shade) or Image.new("RGBA", SIZE))

# Subtle vignette.
vignette = Image.new("L", SIZE, 0)
vd = ImageDraw.Draw(vignette)
vd.rectangle((46, 34, SIZE[0] - 46, SIZE[1] - 34), fill=196)
vignette = vignette.filter(ImageFilter.GaussianBlur(105))
dark = Image.new("RGBA", SIZE, (6, 8, 6, 118))
dark.putalpha(Image.eval(vignette, lambda p: 118 - int(p * 0.46)))
canvas = Image.alpha_composite(canvas, dark)

logo = Image.open(WORDMARK).convert("RGBA")
# SVG renders black; recolor its alpha to warm ivory.
alpha = logo.getchannel("A")
logo_fill = Image.new("RGBA", logo.size, (242, 238, 228, 255))
logo_fill.putalpha(alpha)
logo_x = (SIZE[0] - logo.width) // 2
logo_y = 241
canvas.alpha_composite(logo_fill, (logo_x, logo_y))

caption_lines = ("PRIVATE MEMBERSHIP", "A DIFFERENT PACE")
font_candidates = [
    "/System/Library/Fonts/Supplemental/Helvetica Neue.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
]
font_path = next(Path(p) for p in font_candidates if Path(p).exists())
font = ImageFont.truetype(str(font_path), 34)
letter_spacing = 7
line_gap = 19
y = logo_y + logo.height + 39
text_draw = ImageDraw.Draw(canvas)
for caption in caption_lines:
    widths = [font.getlength(ch) for ch in caption]
    text_w = sum(widths) + letter_spacing * (len(caption) - 1)
    x = (SIZE[0] - text_w) / 2
    for ch, width in zip(caption, widths):
        text_draw.text((round(x), y), ch, font=font, fill=(242, 238, 228, 232))
        x += width + letter_spacing
    y += font.size + line_gap

# Hairline anchors the composition without becoming a frame.
line_y = y + 8
text_draw.line((SIZE[0] // 2 - 34, line_y, SIZE[0] // 2 + 34, line_y), fill=(242, 238, 228, 124), width=1)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
canvas.convert("RGB").save(OUTPUT, "JPEG", quality=90, optimize=True, progressive=True)
print(f"{OUTPUT} {OUTPUT.stat().st_size} bytes")
