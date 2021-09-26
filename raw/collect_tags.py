import re
import json
import os.path
import cchardet as chardet

from presets import albums
from utils import read_descr_file, rxDate, rxPhoto

date = ''


def lines2tags(lines, album, date):
    print("lines2tags in %s / %s" % (album, date))
    tags = {}

    title = lines[0].strip()
    descr = ''

    for i, line in enumerate(lines[1:]):

        # strip first term as it is usually a filename or videocode
        pair = line.strip().split(' ', 1)
        text = pair[1] if len(pair) > 1 else ''

        if rxDate.match(pair[0]):
            dirname = pair[0]
            fullpath = '%s/%s' % (outdir, dirname)        
            print("fullpath %s" % (fullpath,))

            if os.path.isdir(fullpath):
                print("%s -> %s" % (fullpath, text))

                photo = ''
                parts = text.split('#')
                if len(parts) > 1:
                    text = parts[0].strip()
                    photo = parts[1].strip()
                    print("photo: %s" % photo)

                if text == '':
                    text = dirname

                if not photo:
                    photo = select_cover(fullpath)

                item = create_event_item(outdir, dirname, text, photo)
                events.append(item)

            else:
                print("Directory not found (%s)" % fullpath)

        elif rxPhoto.match(pair[0]):
            photo = pair[0]
            if len(pair) > 1:
                res = strip_end_tags(pair[1])
                if len(res['tags']) > 0:
                    tags[pair[0]] = res['tags']

        elif i == 1:
            descr = line.strip()
        else:
            ...

    return tags

def strip_end_tags(text):
    result = {'text': text, 'tags': []}
    rxTag = re.compile('^#[a-z0-9\-_]+')
    words = text.split(' ')
    for i, word in enumerate(reversed(words)):
        if rxTag.match(word):
            print("MATCH %d %s" % (i, word))
            result['tags'].append(word)
        else:
            if i > 0:
                result['text'] = ' '.join(words[:-i])
            break

    return result


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
