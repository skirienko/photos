import re
import json
import os.path
import cchardet as chardet

from presets import albums
from utils import read_descr_file, rxDate, rxPhoto

date = ''
outdir = "../public/data"

tags = {}

def lines2tags(lines, album, date):
    # print("lines2tags in %s / %s" % (album, date))
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
    rxTag = re.compile('^#([a-z0-9\-_]+)')
    words = text.split(' ')
    for i, word in enumerate(reversed(words)):
        m = rxTag.match(word) 
        if m:
            tag = m.group(1)
            result['tags'].append(tag)
        else:
            if i > 0:
                result['text'] = ' '.join(words[:-i])
            break

    return result


def get_section_photo(section):
    episode = section["episodes"][0]
    return get_episode_photo(episode)


def get_episode_photo(episode):
    if "photo" in episode:
        return episode["photo"]
    elif "photos" in episode:
        return episode["photos"][0]
    else:
        return ''


def find_tags_in_json(path):
    with open(path, "r") as f:
        res = json.load(f)

    if res and 'sections' in res:
        print(res['date'])

        title = res['title']
        for section in res['sections']:
            if 'tags' in section:
                # print(section['tags'])
                for tag in section['tags']:
                    print(tag)
                    obj = {
                        "type": "subsection",
                        "title": title,
                        "descr": section["title"],
                        "date": res["date"],
                        "photo": get_section_photo(section),
                    }
                    add_to_tags(tag, obj)

            if 'episodes' in section:
                for episode in section['episodes']:
                    if 'tags' in episode:
                        for tag in episode['tags']:
                            print(tag)
                            obj = {
                                "type": "episode",
                                "title": title,
                                "descr": episode["descr"],
                                "date": res["date"],
                                "episode": episode["id"],
                                "photo": get_episode_photo(episode),
                            }
                            add_to_tags(tag, obj)

    return tags


def get_tags_from_date(album, date):
    infile = '%s/%s/descript.ion' % (album, date)
    injson = '../public/data/%s/%s/descr.json' % (album, date)

    # outdir = '../public/data/tags'

    print("  %s" % (date))

    if not os.path.isfile(injson):
        print("No descr.json file, skipping")
        return

    tags = find_tags_in_json(injson)


def add_to_tags(tag, obj):
    if not tag in tags:
        tags[tag] = []
    
    tags[tag].append(obj)


def write_tag(tag, data):
    fullname = "%s/tags/%s.json" % (outdir, tag)
    print(fullname)
    with open(fullname, 'w', encoding='utf8') as ofd:
        ofd.write(json.dumps(data, ensure_ascii=False))


def write_index(tags):
    keys = sorted(tags.keys())
    index = [{"tag": k, "len": len(tags[k])} for k in keys]
    print(index)
    fullname = "%s/tags.json" % outdir
    with open(fullname, 'w', encoding='utf8') as ofd:
        ofd.write(json.dumps(index, ensure_ascii=False))


def write_tags(tags):
    write_index(tags)
 
    tagsdir = "%s/tags" % outdir
    if not os.path.exists(tagsdir):
        os.makedirs(tagsdir)

    for tag, data in tags.items():
        write_tag(tag, data)


for album, dates in albums.items():

    print(album)

    for date in dates:
        get_tags_from_date(album, date)
        # generate_xdate_descr(album, date)

    if tags:
        print(tags)
        write_tags(tags)
