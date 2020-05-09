from PIL import Image, ImageDraw, ImageFont
import os
from subprocess import call
import re
from shutil import copy2
import piexif

from presets import albums

MAX_SIDE = 1200
PANO_MIN_SIZE = 600
quality = 90

watermarks = {}

cmd_video_resize = './HandBrakeCLI.exe -i %s -o %s'

def generate_watermark(text):

    font_size_px = 20

    if text in watermarks:
        return watermarks[text]

    font_size_pt = font_size_px // 4 * 3
    s = (len(text) + 2) * font_size_px // 2
    img = Image.new('RGBA', (s, s), (0,0,0,0))
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

    transparent = Image.new('RGBA', img.size, (0,0,0,0))
    transparent.paste(img)

    watermark = generate_watermark('Sergey Kirienko')
    # bottom right corner
    position = (img.size[0] - watermark.size[0], img.size[1] - watermark.size[1])
    transparent.paste(watermark, position, mask=watermark)
    return transparent


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


def repair_exif(exif):
    if exif:
        # this field should be Rational but iPhone claims it Ascii
        broken_field = piexif.GPSIFD.GPSHPositioningError
        if 'GPS' in exif:
            if broken_field in exif['GPS'] and isinstance(exif['GPS'][broken_field], bytes):
                value = exif['GPS'][broken_field]
                exif['GPS'][broken_field] = tuple(map(int, value.decode().split('/')))


def resize(orig_path, new_path):

    with Image.open(orig_path, 'r') as img:
        if img:
            # print(img.size)
            if os.path.exists(new_path):
                if os.path.getmtime(new_path) >= os.path.getmtime(orig_path):
                    # print("already exists, origin hasn't changed")
                    return
            byte_exif = b''
            if 'exif' in img.info:
                byte_exif = img.info['exif']
                exif = piexif.load(byte_exif)
                repair_exif(exif)

                if exif and byte_exif:
                    if piexif.ImageIFD.Orientation in exif['0th']:
                        orientation = exif['0th'][piexif.ImageIFD.Orientation]
                        if orientation == 6:
                            print('Rotating 270')
                            img = img.transpose(Image.ROTATE_270)
                            exif['0th'][piexif.ImageIFD.Orientation] = 1
                        elif orientation == 8:
                            print('Rotating 90')
                            img = img.transpose(Image.ROTATE_90)
                            exif['0th'][piexif.ImageIFD.Orientation] = 1
                    
                    del exif['thumbnail']
                    byte_exif = piexif.dump(exif)

            if img.size[0] > MAX_SIDE or img.size[1] > MAX_SIDE:
                print("Need to resize")
                print(limit_size(img.size))
                resized_img = img.resize(limit_size(img.size), Image.ANTIALIAS)
                resized_img = add_watermark(resized_img).convert('RGB')
                resized_img.save(new_path, 'JPEG', quality=quality, exif=byte_exif)
            else:
                print("Copy intact")
                copy2(orig_path, new_path)


def resize_video(orig_path, new_path):

    if os.path.exists(new_path):
        if os.path.getmtime(new_path) >= os.path.getmtime(orig_path):
            # print("already exists, origin hasn't changed")
            return

    print(cmd_video_resize % (orig_path, new_path))
    call(cmd_video_resize % (orig_path, new_path))



rxPhoto = re.compile(r'[a-z_]+\d+[a-z_]*\.jpg', re.I) 
rxVideo = re.compile(r'[a-z_]+\d+[a-z_]*\.mov', re.I) 

for album, dates in albums.items():

    for date in dates:
        
        outdir = "../public/data/%s/%s" % (album, date)
        indir = "%s/%s/orig" % (album, date)
        indir2 = "%s/%s" % (album, date)

        if not os.path.exists(indir):
            indir = indir2
            if not os.path.exists(indir):
                print("Nothing to resize (%s)" % indir)
                continue

        if not os.path.exists(outdir):
            os.makedirs(outdir)

        ls = os.listdir(indir)
        for filename in ls:
            if rxPhoto.match(filename):
                print(filename)
                orig_path = '/'.join((indir, filename))
                new_path = '/'.join((outdir, filename))

                resize(orig_path, new_path)

            if rxVideo.match(filename):
                print(filename)
                orig_path = '/'.join((indir, filename))
                new_path = '/'.join((outdir, filename))

                resize_video(orig_path, new_path)

