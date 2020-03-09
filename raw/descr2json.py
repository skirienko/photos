import re
import json
import io
from PIL import Image
from PIL.ExifTags import TAGS
import os.path
import cchardet as chardet

from presets import dates

date = ''

outdir = '../public/data'

rxPhoto = re.compile(r'[a-z_]+\d+[a-z_]*\.[a-z0-9]{3,5}', re.I)
rxVimeo = re.compile(r'^vimeo:(\d+)$', re.I)


def need_to_rebuild(infile, outfile):
    return not os.path.exists(outfile) or os.path.getmtime(infile) > os.path.getmtime(outfile)


def detect_encoding(filename):
    with open(filename, 'rb') as probe:
        txt = probe.read()
        enc = chardet.detect(txt)
        return enc['encoding']
    

def read_descr_file(filename):
    with open(filename, 'r', encoding=detect_encoding(filename)) as fd:
        lines = fd.readlines()

    return lines


def lines2data(lines):

    episodes = []
    title = lines[0].strip()
    descr = lines[1].strip()
    
    prevItem = {}
    episode_id = 1
    subtitle_id = 1

    for line in lines[2:]:
        pair = line.strip().split(' ', 1)
        filename = pair[0]
        text = pair[1] if len(pair) > 1 else ''

        if rxPhoto.match(filename):
            if os.path.isfile(get_filepath(filename)):
                if text != '':
                    item = create_photo_item(filename, text, episode_id)
                    episodes.append(item)
                    episode_id += 1
                    prevItem = item
                else:
                    add_photo_to_item(filename, prevItem)

            else:
                print("file not found")

        elif rxVimeo.match(filename):
            m = rxVimeo.match(filename)
            code = m.group(1)
            item = create_vimeo_item(code, text, episode_id)
            episodes.append(item)
            episode_id += 1
            prevItem = item

        else:
            if line != title and line != descr:
                item = create_subtitle_item(line, subtitle_id)
                episodes.append(item)
                subtitle_id += 1

    data = {
        "title": title,
        "description": descr,
        "date": date
    }
    data['episodes'] = episodes

    return data


def get_filepath(filename):
    return '%s/%s/%s' % (outdir, date, filename)


def create_photo_item(filename, text, episode_id):
    print(filename)
    item = {}
    item['descr'] = text
    item['photo'] = filename
    item['id'] = episode_id
    with Image.open(get_filepath(filename)) as img:
        if img:
            if img.size[1] > img.size[0]:
                item['vertical'] = True
            # print(img.size)
            aspect = round(100.0 * img.size[1] / img.size[0], 2)
            if abs(aspect - 66.6) > 0.1:
                item['aspect'] = aspect
                # print("aspect %f" % aspect)

    return item


def add_photo_to_item(filename, item):
    if not 'photos' in item:
        item['photos'] = []
        item['photos'].append(item['photo'])
        item.pop('photo')
    item['photos'].append(filename)


def create_vimeo_item(code, text, episode_id):
    print('Vimeo!')
    item = {}
    item['id'] = episode_id
    item['type'] = 'vimeo'
    item['video'] = code
    item['descr'] = text
    return item


def create_subtitle_item(line, subtitle_id):
    print("=== %s" % line)
    item = {}
    subtitle = line.strip()
    hash = "section-%d" % subtitle_id
    parts = subtitle.split('#')
    if len(parts) > 1:
        subtitle = parts[0].strip()
        hash = parts[1].strip()

    item['subtitle'] = subtitle
    item['id'] = hash
    return item


for date in dates:
    print('Date %s' % date)

    infile = '%s/descript.ion' % date
    outfile = '%s/%s/descr.json' % (outdir, date)

    print("%s" % outfile)
    if not need_to_rebuild(infile, outfile):
        print('already exists, origin hasn\'t changed')
    else:
        lines = read_descr_file(infile)
        data = lines2data(lines)
        # print(data)
        jsondump = json.dumps(data, ensure_ascii=False)

        with open(outfile, 'w', encoding='utf8') as ofd:
            ofd.write(jsondump)
