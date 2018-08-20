from PIL import Image
import os
import re
from shutil import copy2

dirname = "2009-07-01/orig"
outdir = "../public/data/2009-07-01"
MAX_SIDE = 1200
PANO_MIN_SIZE = 600
quality = 90

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
rxPhoto = re.compile('[a-z_]+\d+x?\.jpg', re.I) 
# rxPhoto = re.compile('[a-z_]+0166\.jpg', re.I) 
dirs = os.listdir(dirname)
for filename in dirs:
    if rxPhoto.match(filename):
        print(filename)
        with Image.open('/'.join((dirname, filename)), 'r') as img:
            if img:
                print(img.size)
                exif = b''
                if 'exif' in img.info:
                    exif = img.info['exif']
                if img.size[0] > MAX_SIDE or img.size[1] > MAX_SIDE:
                    print("Need to resize")
                    print(limit_size(img.size))
                    resized_img = img.resize(limit_size(img.size), Image.ANTIALIAS)
                    resized_img.save('/'.join( (outdir, filename) ), 'JPEG', quality=quality, exif=exif)
                else:
                    print("Copy intact")
                    copy2('/'.join(dirname, filename), '/'.join( (outdir, filename)))

