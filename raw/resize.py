from PIL import Image, ImageOps
import os
import subprocess
import re
import traceback
import piexif
from pillow_heif import register_heif_opener

from presets import albums
from utils import rxPhoto, rxVideo, add_watermark, repair_exif, limit_size, MAX_SIDE

rxWebp = re.compile(r'.*\.webp$', re.I)
rxAvif = re.compile(r'.*\.avif$', re.I)

JPEG_QUALITY = 90
WEBP_QUALITY = 82
AVIF_QUALITY = 65
AVIF_SPEED = 2

SAVE_JPEG = True
SAVE_WEBP = True
SAVE_AVIF = True
SKIP_VIDEO = True

# cmd_video_resize = './HandBrakeCLI.exe -i %s -o %s' # Windows
cmd_video_resize = './HandBrakeCLI -i %s -o %s'  # macOS

albums = {
    'portugal': ('2015-04-21',)
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
    new_path_webp = new_path if rxWebp.match(new_path) else new_path + '.webp'
    new_path_avif = new_path if rxAvif.match(new_path) else new_path + '.avif'

    output_formats = {}
    if SAVE_JPEG:
        output_formats[new_path] = 'JPEG'
    if SAVE_WEBP:
        output_formats[new_path_webp] = 'WEBP'
    if SAVE_AVIF:
        output_formats[new_path_avif] = 'AVIF'

    source_mtime = os.path.getmtime(orig_path)
    tasks = {
        path: fmt for path, fmt in output_formats.items()
        if not os.path.exists(path) or os.path.getmtime(path) < source_mtime
    }
    if not tasks:
        return

    with Image.open(orig_path, 'r') as img:
        img = ImageOps.exif_transpose(img)
        byte_exif = b''
        if 'exif' in img.info:
            byte_exif = img.info['exif']
            try:
                exif = piexif.load(byte_exif)
                repair_exif(exif)
            except Exception as error:
                print(f"Warning: could not load EXIF from {orig_path}: {error}")
                exif = None

            if exif and byte_exif:
                exif['0th'].pop(piexif.ImageIFD.Orientation, None)
                components_configuration = piexif.ExifIFD.ComponentsConfiguration
                if isinstance(exif['Exif'].get(components_configuration), tuple):
                    exif['Exif'][components_configuration] = bytes(exif['Exif'][components_configuration])
                exif['Exif'].pop(piexif.ExifIFD.MakerNote, None)
                exif['Exif'].pop(piexif.ExifIFD.SceneType, None)
                del exif['thumbnail']
                while True:
                    try:
                        byte_exif = piexif.dump(exif)
                        break
                    except ValueError as error:
                        invalid_tag = re.search(r'(\d+) in (\w+) IFD\.', str(error))
                        if not invalid_tag or invalid_tag.group(2) not in exif:
                            raise
                        tag = int(invalid_tag.group(1))
                        if tag not in exif[invalid_tag.group(2)]:
                            raise
                        print(f"Dropping invalid EXIF tag {tag} from {invalid_tag.group(2)} IFD")
                        del exif[invalid_tag.group(2)][tag]

        if img.size[0] > MAX_SIDE or img.size[1] > MAX_SIDE:
            print("Need to resize")
            output_img = img.resize(limit_size(img.size), Image.LANCZOS)
        else:
            print("Copy intact")
            output_img = img.copy()

        output_img = add_watermark(output_img).convert('RGB')
        for path, fmt in tasks.items():
            save_options = {'exif': byte_exif}
            if fmt == 'JPEG':
                save_options.update(quality=JPEG_QUALITY, optimize=True)
            elif fmt == 'WEBP':
                save_options.update(quality=WEBP_QUALITY, method=6)
            elif fmt == 'AVIF':
                save_options.update(quality=AVIF_QUALITY, speed=AVIF_SPEED)
            try:
                output_img.save(path, fmt, **save_options)
            except Exception as error:
                print(f"Error: could not save {fmt} output {path}: {error}")


def resize_video(orig_path, new_path):
    if os.path.exists(new_path):
        if os.path.getmtime(new_path) >= os.path.getmtime(orig_path):
            print("already exists, origin hasn't changed")
            return

    command = ['./HandBrakeCLI', '-i', orig_path, '-o', new_path]
    print(f"Running video conversion: {orig_path} -> {new_path}")
    subprocess.run(command, check=True, capture_output=True, text=True)


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
            try:
                resize_file(filename)
            except Exception as error:
                print(f"Error processing {os.path.join(indir, filename)}: {error}")
                traceback.print_exc()
