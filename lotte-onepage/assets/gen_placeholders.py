"""One-off script to generate placeholder JPG assets. Not used at runtime.
Run: python3 assets/gen_placeholders.py
Regenerate or delete once real photography/video is supplied.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(ROOT, "images")

def font(size):
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def wrap(draw, text, f, max_width):
    words = text.split(" ")
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=f) <= max_width:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

def make(filename, size, bg, label, desc, dim_bottom=True):
    """Solid tint + faint diagonal hatch only — no baked-in copy.
    Real page text is overlaid live by the HTML/CSS, so burning text into
    the placeholder itself only doubles up with it (and DejaVu has no
    Korean glyphs, which used to render as tofu boxes). Keep placeholders
    to a small ASCII corner tag naming the file, nothing more.
    """
    w, h = size
    img = Image.new("RGB", (w, h), bg)
    draw = ImageDraw.Draw(img, "RGBA")

    # diagonal hatch to make it obviously a placeholder, not a real photo
    step = max(40, w // 30)
    for x in range(-h, w, step):
        draw.line([(x, 0), (x + h, h)], fill=(255, 255, 255, 16), width=2)

    tag_f = font(14)
    draw.text((16, h - 28), f"PLACEHOLDER {w}x{h} - {filename}", font=tag_f, fill=(255, 255, 255, 110))

    img.save(os.path.join(IMG_DIR, filename), quality=82)
    print("wrote", filename)

ASSETS = [
    ("hero-bg.jpg", (1600, 900), (58, 46, 46), "HERO", "실내에서 도시 야경을 보며 여유를 즐기는 라이프스타일 컷"),
    ("csv-bg.jpg", (1600, 900), (35, 66, 48), "CSV", "숲길에서 손잡고 걷는 다세대 가족"),
    ("business-bg.jpg", (1600, 900), (60, 45, 34), "BUSINESS", "역사적인 랜드마크 건물 외관, 단풍 도심 전경"),
    ("about-bg.jpg", (1600, 900), (30, 32, 60), "ABOUT LOTTE", "랜드마크 타워가 보이는 도시 야경 항공뷰"),
    ("esg-bg.jpg", (1600, 900), (52, 88, 110), "ESG", "맑은 하늘 배경의 풍력 터빈 클로즈업"),
    ("card-pr.jpg", (660, 880), (70, 55, 40), "PR", "도심 랜드마크 타워 주간 전경"),
    ("card-ir.jpg", (660, 880), (110, 30, 40), "IR", "랜드마크 건물 앞 풍선/색종이 날리는 항공샷"),
    ("card-careers.jpg", (660, 880), (60, 60, 30), "CAREERS", "책상에서 작업 중인 인물 컷"),
    ("menu-bg.jpg", (1600, 900), (20, 20, 24), "MENU BG", "랜드마크 타워 야경 (흐림 처리용)"),
]

if __name__ == "__main__":
    os.makedirs(IMG_DIR, exist_ok=True)
    for name, size, bg, label, desc in ASSETS:
        make(name, size, bg, label, desc)
