from PIL import Image, ImageDraw, ImageFont
import os
import re
from shutil import copy2
import piexif

# date = '2009-07-01'
date = '2015-06-20'
# date = '2016-07-01'

dirname = "%s/orig" % date
outdir = "../public/data/%s" % date
MAX_SIDE = 1200
PANO_MIN_SIZE = 600
quality = 90

def add_watermark(img):

    drawing = ImageDraw.Draw(img)
    text = 'Sergey Kirienko'
    font = ImageFont.load_default()

    pos = (100, 100)
    fill = (255, 255, 255, 128)
    print("watermark '%s'" % text)

    drawing.text(pos, text, fill=fill, font=font)


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

print("Started")
rxPhoto = re.compile('[a-z_]+\d+[a-z_]*\.jpg', re.I) 
# rxPhoto = re.compile('[a-z_]+1891\.jpg', re.I) 
dirs = os.listdir(dirname)
for filename in dirs:
    if rxPhoto.match(filename):
        print(filename)
        with Image.open('/'.join((dirname, filename)), 'r') as img:
            if img:
                print(img.size)
                if 'exif' in img.info:
                    byte_exif = img.info['exif']
                    exif = piexif.load(byte_exif)

                if exif and byte_exif:
                    print('EXIF size: %d' % len(byte_exif))
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
                    # add_watermark(resized_img)
                    resized_img.save('/'.join( (outdir, filename) ), 'JPEG', quality=quality, exif=byte_exif)
                else:
                    print("Copy intact")
                    copy2('/'.join(dirname, filename), '/'.join( (outdir, filename)))

