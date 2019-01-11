import os
# import re
from datetime import datetime, timedelta
from shutil import copy2
import piexif

date = '2018-09-10'
wrong_hour = 8
decreate_minutes = 60


EXIF_DT_FORMAT = '%Y:%m:%d %H:%M:%S'

dirname = "%s/orig" % date

print("Started")
# rxPhoto = re.compile('[a-z_]+\d+[a-z_]*\.jpg', re.I) 

filenames = ['IMG_1085.JPG', 'IMG_1086.JPG', 'IMG_1087.JPG']

for filename in filenames:
    fullname = '/'.join((dirname, filename))
    if os.path.isfile(fullname):
        print(fullname)

        exif = piexif.load(fullname)

        if exif:
            print("got EXIF")

            exif_section = exif['0th']
            field = piexif.ImageIFD.DateTime
            if field in exif_section:
                print(exif_section[field])
                dt = datetime.strptime(exif_section[field].decode(), EXIF_DT_FORMAT)
                if dt.strftime('%Y-%m-%d') == date and dt.hour == wrong_hour:
                    dt = dt - timedelta(minutes=decreate_minutes)
                    exif_section[field] = dt.strftime(EXIF_DT_FORMAT).encode()
                    print('Time changed to %s' % dt)

            exif_section = exif['Exif']
            for field in [piexif.ExifIFD.DateTimeOriginal, piexif.ExifIFD.DateTimeDigitized]:
                if field in exif_section:
                    print(exif_section[field])
                    dt = datetime.strptime(exif_section[field].decode(), EXIF_DT_FORMAT)
                    if dt.strftime('%Y-%m-%d') == date and dt.hour == wrong_hour:
                        dt = dt - timedelta(minutes=decreate_minutes)
                        exif_section[field] = dt.strftime(EXIF_DT_FORMAT).encode()
                        print('Time changed to %s' % dt)

            byte_exif = piexif.dump(exif)
            piexif.insert(byte_exif, fullname)
