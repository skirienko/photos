from PIL import Image
import os
from subprocess import call
import re
from shutil import copy2
import piexif
from pillow_heif import register_heif_opener

from presets import albums
from utils import rxPhoto, rxVideo, add_watermark, repair_exif, limit_size, MAX_SIDE

rxWebp = re.compile(r'.*\.webp$', re.I)

quality = 90

SAVE_JPEG = True
SAVE_WEBP = True
SKIP_VIDEO = True

# cmd_video_resize = './HandBrakeCLI.exe -i %s -o %s' # Windows
cmd_video_resize = './HandBrakeCLI -i %s -o %s'  # macOS

albums = {
    'portugal': ('2015-04-23',)
    # '.': ('2022-07-14',)
    #'brasil': ('2007-03-05',)
}

register_heif_opener()


def resize_file(filename):
    orig_path = '/'.join(('.', indir, filename))
    new_path = '/'.join((outdir, filename))

    if rxPhoto.match(filename):
        print(filename)
        resize_photo(orig_path, new_path)

    if rxVideo.match(filename) and not SKIP_VIDEO:
        print(filename)
        resize_video(orig_path, new_path)


def resize_photo(orig_path, new_path):
    with Image.open(orig_path, 'r') as img:
        if img:
            # print(img.size)
            if rxWebp.match(new_path):
                new_path_webp = new_path
            else:
                new_path_webp = new_path + '.webp'

            tasks = {}
            if SAVE_JPEG: tasks[new_path] = 'JPEG'
            if SAVE_WEBP: tasks[new_path_webp] = 'WEBP'

            paths = list(tasks.keys())
            for path in paths:
                if os.path.exists(path):
                    if os.path.getmtime(path) >= os.path.getmtime(orig_path):
                        # print("already exists, origin hasn't changed")
                        del tasks[path]

            if not tasks:
                return
            byte_exif = b''
            if 'exif' in img.info:
                byte_exif = img.info['exif']
                try:
                    exif = piexif.load(byte_exif)
                    repair_exif(exif)
                except Exception:
                    print("Could not load EXIF")
                    print(byte_exif)
                    exif = None

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
                resized_img = img.resize(limit_size(img.size), Image.LANCZOS)
                resized_img = add_watermark(resized_img).convert('RGB')
                for path, fmt in tasks.items():
                    resized_img.save(path, fmt, quality=quality, exif=byte_exif)

            else:
                print("Copy intact")
                copy2(orig_path, new_path)
                # TODO: other tasks


def resize_video(orig_path, new_path):
    if os.path.exists(new_path):
        if os.path.getmtime(new_path) >= os.path.getmtime(orig_path):
            print("already exists, origin hasn't changed")
            return

    print(['./HandBrakeCLI', '-i', orig_path, '-o', new_path])
    call(['./HandBrakeCLI', '-i', orig_path, '-o', new_path])


for album, dates in albums.items():

    for date in dates:

        outdir = f"../public/data/{album}/{date}"
        indir = f"{album}/{date}/orig"
        indir2 = f"{album}/{date}"

        if not os.path.exists(indir):
            indir = indir2
            if not os.path.exists(indir):
                print(f"Nothing to resize ({indir})")
                continue

        if not os.path.exists(outdir):
            os.makedirs(outdir)

        ls = os.listdir(indir)
        for filename in ls:
            resize_file(filename)
