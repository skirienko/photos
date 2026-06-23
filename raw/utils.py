from PIL import Image, ImageDraw, ImageFont
from os import path, listdir
import io
import base64
import re
import chardet
import piexif

rxDate = re.compile(r'\d{4}-\d\d-\d\d', re.I)
rxPhoto = re.compile(r'[a-z_\-\d]+\.(jpe?g|png|gif|webp|heic)', re.I)
rxVideo = re.compile(r'[a-z_\-]+\d+[a-z_\-]*\.mov$', re.I)


def strip_md(text):
    return re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)


def select_cover(dirname):
    candidate = None
    maxsize = 0

    for filename in listdir(dirname):
        if rxPhoto.match(filename):
            fullname = '%s/%s' % (dirname, filename)
            aspect = get_aspect(fullname)
            if aspect == 75 or aspect == 66.67:
                size = path.getsize(fullname)
                print('%s: %s' % (filename, size))
                if size > maxsize:
                    candidate = filename
                    maxsize = size

    return candidate


def get_aspect(fullpath):
    aspect = 0
    with Image.open(fullpath) as img:
        if img:
            aspect = round(100.0 * img.size[1] / img.size[0], 2)

    return aspect


MAX_SIDE = 1200
PANO_MIN_SIZE = 600

def limit_size(size):
    if size[0] <= MAX_SIDE and size[1] <= MAX_SIDE:
        return size
    else:
        aspect = float(size[0]) / float(size[1])
        print("aspect: %f" % aspect)
        if aspect >= 1:
            if aspect > 2:
                print("PANORAMA!")
                return [int(round(PANO_MIN_SIZE * aspect)), PANO_MIN_SIZE]
            else:
                return [MAX_SIDE, int(round(MAX_SIDE / aspect))]
        else:
            return [int(round(MAX_SIDE * aspect)), MAX_SIDE]


def generate_thumb(fullname):
    thumb = None
    if path.isfile(fullname):
        with Image.open(fullname) as img:
            thumb = img.resize([32, 24], Image.LANCZOS)
            output = io.BytesIO()
            thumb.save(output, format='JPEG', optimize=True, quality=60)
            b64 = base64.b64encode(output.getvalue())
            if b64:
                thumb = 'data:image/jpg;base64,' + b64.decode()
    else:
        print("No such file: %s" % fullname)

    return thumb


watermarks = {}

def generate_watermark(text):
    font_size_px = 20

    if text in watermarks:
        return watermarks[text]

    font_size_pt = font_size_px // 4 * 3
    s = (len(text) + 2) * font_size_px // 2
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    drawing = ImageDraw.Draw(img)
    font = ImageFont.truetype(font='./fonts/PTSansBold.ttf', size=font_size_pt)

    fill = (255, 255, 255, 80)
    print("generate watermark '%s'" % text)

    line_height = font_size_px + font_size_px // 4
    drawing.text((font_size_px // 2, s - line_height), text, fill=fill, font=font)
    img = img.rotate(90, resample=Image.BICUBIC).crop((s - line_height, 0, s, s))
    watermarks[text] = img
    return img


def add_watermark(img):
    transparent = Image.new('RGBA', img.size, (0, 0, 0, 0))
    transparent.paste(img)

    watermark = generate_watermark('Sergey Kirienko')
    # bottom right corner
    position = (img.size[0] - watermark.size[0], img.size[1] - watermark.size[1])
    transparent.paste(watermark, position, mask=watermark)
    return transparent


def repair_exif(exif):
    if exif:
        # this field should be Rational but iPhone claims it Ascii
        broken_field = piexif.GPSIFD.GPSHPositioningError
        if 'GPS' in exif:
            if broken_field in exif['GPS'] and isinstance(exif['GPS'][broken_field], bytes):
                value = exif['GPS'][broken_field]
                exif['GPS'][broken_field] = tuple(map(int, value.decode().split('/')))


def detect_encoding(filename):
    with open(filename, 'rb') as probe:
        txt = probe.read()
        enc = chardet.detect(txt)
        return enc['encoding']
    

def read_descr_file(filename):
    with open(filename, 'r', encoding=detect_encoding(filename)) as fd:
        lines = fd.readlines()

    return lines
