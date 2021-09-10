import re
import json
import os.path
import cchardet as chardet

from presets import albums
from utils import read_descr_file

date = ''
rxDate = re.compile(r'\d{4}-\d\d-\d\d', re.I)



def lines2tags(lines, album, date):
    tags = {}

    title = lines[0].strip()
    descr = ''

    for i, line in enumerate(lines[1:]):
        pair = line.strip().split(' ', 1)
        dirname = pair[0]
        text = pair[1] if len(pair) > 1 else ''

        if rxDate.match(dirname):
            fullpath = '%s/%s' % (outdir, dirname)
            if os.path.isdir(fullpath):
                print("%s -> %s" % (fullpath, text))

                photo = ''
                parts = text.split('#')
                if len(parts) > 1:
                    text = parts[0].strip()
                    photo = parts[1].strip()

                if text == '':
                    text = dirname

                if not photo:
                    photo = select_cover(fullpath)

                item = create_event_item(outdir, dirname, text, photo)
                events.append(item)

            else:
                print("Directory not found (%s)" % fullpath)

        elif i == 1:
            descr = line.strip()

    return tags


def get_tags_from_date(album, date):
    infile = '%s/%s/descript.ion' % (album, date)
    outdir = '../public/data/tags'

    print("  %s" % date)

    if not os.path.isfile(infile):
        print("No descript.ion file, skipping")
        return

    lines = read_descr_file(infile)
    tags = lines2tags(lines, album, date)
    print(tags)
    # jsondump = json.dumps(data, ensure_ascii=False)


for album, dates in albums.items():

    print(album)

    for date in dates:
        get_tags_from_date(album, date)
        # generate_xdate_descr(album, date)
