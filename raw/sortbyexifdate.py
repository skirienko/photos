import re
import io
import sys
from PIL import Image
from PIL.ExifTags import TAGS
import os.path
from datetime import datetime, timedelta

# date = '2017-07-11'
# date = '2018-09-11'
date = '2018-09-12'

EXIF_DT_FORMAT = '%Y:%m:%d %H:%M:%S'

filename = '%s/descript_orig.ion' % date
file2 = io.open('%s/descript.ion' % date, 'w', encoding='utf8')

rxPhoto = re.compile(r'[a-z_]+\d+\.(jpg|jpeg)', re.I)

with open(filename, 'r') as fd:
    lines = fd.readlines()

    title = lines[0].strip()
    descr = lines[1].strip()
    pairs = [line.strip().split(' ', 1) for line in lines]

    items = []

    photodir = '%s' % date
    if os.path.isdir('%s/orig' % date):
        photodir += '/orig' 

    for pair in pairs:
        item = {}

        filepath = '%s/%s' % (photodir, pair[0])

        if rxPhoto.match(pair[0]) and os.path.isfile(filepath):
            item['photo'] = pair[0]
            if len(pair) > 1:
                item['descr'] = pair[1]

            print(filepath)
            with Image.open(filepath) as img:
                try:
                    raw_exif = img._getexif()
                    if not raw_exif:
                        raise IOError('No EXIF for %s' % filepath)
                    exif = {}
                    print('got EXIF')
                    for tag, value in raw_exif.items():
                        exif[TAGS.get(tag)] = value
                    if 'DateTimeOriginal' in exif:
                        item['dt'] = datetime.strptime(exif['DateTimeOriginal'], EXIF_DT_FORMAT)
                    if 'Model' in exif:
                        item['model'] = exif['Model']
#                        if item['model'] == 'Canon PowerShot SX50 HS':
#                            item['dt'] = item['dt'] - timedelta(minutes=57)
                except:
                    pass
                if 'dt' not in item:
                    item['dt'] = datetime.fromtimestamp(os.path.getctime(filepath))
                if 'model' not in item:
                    item['model'] = '?'
            print(item)

            items.append(item)

    sorted_items = sorted(items, key=lambda i: i['dt'])
    # print(sorted_items)

    file2.write(title+'\n')
    file2.write(descr+'\n')
    for item in sorted_items:
        print('%s %s' % (item['photo'], item['dt']))
        file2.write('%s %s %s (%s)\n' % (item['photo'], item['dt'].strftime(EXIF_DT_FORMAT), item['photo'], item['model']))