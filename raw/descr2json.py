import sys
import re
import json
import io
from PIL import Image
from PIL.ExifTags import TAGS
import os.path

from presets import albums
from utils import get_aspect, select_cover, generate_thumb, read_descr_file, rxDate, rxPhoto, rxVideo
from collect_tags import strip_end_tags

args = sys.argv[1:]

# should all files be rebuilt
REBUILD_ALL = False

if '-f' in args or '--force' in args:
    REBUILD_ALL = True


albums = {
    '.': ('2022-07-14',)
}

date = ''

rxVimeo = re.compile(r'^vimeo:(\d+)$', re.I)


def need_to_rebuild(infile, outfile):
    return not os.path.exists(outfile) \
            or os.path.getmtime(infile) > os.path.getmtime(outfile) \
            or REBUILD_ALL


def lines2album_data(lines, album, outdir):

    events = []
    title = lines[0].strip()
    descr = ''

    for i, line in enumerate(lines[1:]):
        pair = line.strip().split(' ', 1)
        dirname = pair[0]
        text = pair[1] if len(pair) > 1 else ''

        if rxDate.match(dirname):
            fullpath = f'{outdir}/{dirname}'
            if os.path.isdir(fullpath):
                print(f"{fullpath} -> {text}")

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
                print(f"Directory not found ({fullpath})")

        elif i == 1:
            descr = line.strip()



    data = {
        "title": title,
        "description": descr,
    }
    data['events'] = events

    return data


def lines2data(lines, outdir):

    sections = []
    title = lines[0].strip()
    descr = ''
    
    prevItem = None
    prevText = ''
    episode_id = 1
    section_id = 1

    episodes = []
    section = {'episodes':[], 'id':'section-0'}
    for i, line in enumerate(lines[1:]):
        line = line.strip()
        pair = line.split(' ', 1)
        filename = pair[0]
        text = pair[1] if len(pair) > 1 else ''
        # searching for tags in the text
        res = strip_end_tags(text)
        if res['tags']:
            text = res['text']
            tags = res['tags']
        else:
            tags = []

        if rxPhoto.match(filename):
            fullpath = f"{outdir}/{filename}"
            if os.path.isfile(fullpath):
                aspect = get_aspect(fullpath)
                print(f"{fullpath} -> {text}")

                # special case for webp duplicates
                if os.path.isfile(fullpath+".webp"):
                    filename = filename+".webp"

                if text != '' or prevItem == None:
                    if text == '':
                        text = prevText
                    item = create_photo_item(filename, text, episode_id, aspect)
                    if aspect < 50 or aspect > 200:
                        tags.append("panorama")
                        print(f"PANORAMA")
                    if tags:
                        item['tags'] = tags
                    section['episodes'].append(item)
                    episode_id += 1
                    prevItem = item
                else:
                    add_photo_to_item(filename, prevItem)
            # if there's only WEBP version
            elif os.path.isfile(fullpath+".webp"):
                filename = filename+".webp"

            else:
                print("file not found (%s)" % fullpath)

            if text != '':
                prevText = text

        elif rxVideo.match(filename):
            fullpath = '%s/%s' % (outdir, filename)
            if os.path.isfile(fullpath):
                print("%s -> %s" % (fullpath, text))
                poster = filename+'.jpg'
                if not os.path.exists('%s/%s' % (outdir, poster)):
                    poster = None
                item = create_video_item(filename, text, episode_id, poster)
                print(tags)
                tags.append('video')
                item['tags'] = tags
                section['episodes'].append(item)
                episode_id += 1
                prevItem = item

        elif rxVimeo.match(filename):
            m = rxVimeo.match(filename)
            code = m.group(1)
            item = create_vimeo_item(code, text, episode_id)
            tags.append('video')
            item['tags'] = tags
            section['episodes'].append(item)
            episode_id += 1
            prevItem = item

        else:
            print(f'{filename} does not match')
            if i == 0:
                descr = line

            if line != title and line != descr:
                sections.append(section)
                section = {'episodes': []}
                item = create_subtitle_item(line, section_id)
                if item['id']:
                    section['id'] = item['id']
                    if 'tags' in item:
                        section['tags'] = item['tags']
                if item['subtitle']:
                    section['title'] = item['subtitle']
                
                section_id += 1

    sections.append(section)
    data = {
        "title": title,
        "description": descr,
        "date": date,
        "sections": sections
    }

    return data


def create_event_item(outdir, dirname, text, photo):
    print(dirname)
    item = {}
    item['date'] = dirname
    item['title'] = text
    data_path = f'{outdir}/{dirname}'
    data_path = data_path.replace('../public/data/', '')
    data_path = data_path.replace('./', '')
    item['data_path'] = data_path
    item['photo'] = f'{dirname}/{photo}'
    if photo:
        fullname = f'{outdir}/{dirname}/{photo}'
        thumb = generate_thumb(fullname)
        if thumb:
            item['thumb'] = thumb

    return item


def create_photo_item(filename, text, episode_id, aspect):
    print(filename)
    item = {}
    item['descr'] = text
    item['photo'] = filename
    item['id'] = episode_id
    if aspect > 100:
        item['vertical'] = True

    # if unusual image aspect
    if abs(aspect - 66.6) > 0.1:
        item['aspect'] = aspect

    return item


def add_photo_to_item(filename, item):
    if not 'photos' in item:
        item['photos'] = []
        item['photos'].append(item['photo'])
        item.pop('photo')
    item['photos'].append(filename)


def create_video_item(filename, text, episode_id, poster=None):
    item = {}
    item['id'] = episode_id
    item['type'] = 'video'
    item['video'] = filename
    item['descr'] = text
    if poster:
        item['poster'] = poster
    return item

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
        item['tags'] = [hash,]

    item['subtitle'] = subtitle
    item['id'] = hash
    return item


def generate_album_descr(album):
    infile = '%s/descript.ion' % album
    outdir = '../public/data/%s' % album
    outfile = '%s/descr.json' % outdir

    print("== %s ==" % outdir)
    if not os.path.isfile(infile):
        print("No descript.ion file, skipping")
        return

    if not need_to_rebuild(infile, outfile) and False:
        print("Already exists, origin hasn't changed")
        return

    lines = read_descr_file(infile)
    data = lines2album_data(lines, album, outdir)
    # print(data)
    jsondump = json.dumps(data, ensure_ascii=False)

    with open(outfile, 'w', encoding='utf8') as ofd:
        ofd.write(jsondump)


def generate_date_descr(album, date):
    infile = '%s/%s/descript.ion' % (album, date)
    outdir = '../public/data/%s/%s' % (album, date)
    outfile = '%s/descr.json' % outdir

    print("=== %s ===" % outdir)
    if not os.path.isfile(infile):
        print("No descript.ion file, skipping")
        return

    if not need_to_rebuild(infile, outfile):
        print("Already exists, origin hasn't changed")
        return

    lines = read_descr_file(infile)
    data = lines2data(lines, outdir)
    # print(data)
    jsondump = json.dumps(data, ensure_ascii=False)

    with open(outfile, 'w', encoding='utf8') as ofd:
        ofd.write(jsondump)

# albums = {
#     'portugal': (
#         '2015-04-17',
#         '2015-04-18',
#         '2015-04-19',
#     ),
# }
for album, dates in albums.items():

    generate_album_descr(album)

    for date in dates:

        generate_date_descr(album, date)
