from PIL import Image
from os import path, listdir
import io
import base64
import re

rxPhoto = re.compile(r'[a-z_]+\d+[a-z_]*\.jpe?g', re.I)

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


def generate_thumb(fullname):
    thumb = None
    if path.isfile(fullname):
        with Image.open(fullname) as img:
            thumb = img.resize([32, 24], Image.ANTIALIAS)
            output = io.BytesIO()
            thumb.save(output, format='JPEG', optimize=True, quality=60)
            b64 = base64.b64encode(output.getvalue())
            if b64:
                thumb = 'data:image/jpg;base64,' + b64.decode()
    else:
        print("No such file: %s" % fullname)

    return thumb
