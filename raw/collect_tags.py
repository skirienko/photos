import re
import json
import os.path
import cchardet as chardet

from presets import albums
from utils import read_descr_file, rxDate, rxPhoto

date = ''
outdir = "../public/data"
redirects_file = "../public/tag_redirects.txt"

tags = {}
secondary_tags = {}


def read_preset_tags():
    infile = './tags.txt'
    if not os.path.isfile(infile):
        print("No tags.txt file, skipping")
        return

    lines = read_descr_file(infile)
    for i, line in enumerate(lines):
        result = strip_end_tags(line)
        if result['tags']:
            mainTag = result['tags'][0]
            tags[mainTag] = create_tag(result['text'], result['tags'])

    print(tags)


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
 
    if len(result['tags']) == len(words):
        result['text'] = result['tags'][0]

    result['tags'] = list(reversed(result['tags']))
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


def find_tags_in_json(path, album, date):
    with open(path, "r") as f:
        res = json.load(f)

    if res and 'sections' in res:

        title = res['title']
        for section in res['sections']:
            if 'tags' in section:
                # print(section['tags'])
                for tag in section['tags']:
                    print(tag)
                    obj = {
                        "tag": tag,
                        "path": get_client_path(album, date),
                        "place": album,
                        "date": res["date"],
                        "type": "subsection",
                        "title": title,
                        "descr": section["title"],
                        "hash": section["id"],
                        "photo": get_section_photo(section),
                    }
                    add_to_tags(tag, obj)

            if 'episodes' in section:
                for episode in section['episodes']:
                    if 'tags' in episode:
                        for tag in episode['tags']:
                            print(tag)
                            obj = {
                                "tag": tag,
                                "path": get_client_path(album, date),
                                "place": album,
                                "date": res["date"],
                                "type": "episode",
                                "title": title,
                                "descr": episode["descr"],
                                "hash": "e"+str(episode["id"]),
                                "photo": get_episode_photo(episode),
                            }
                            add_to_tags(tag, obj)


def get_client_path(album, date):
    if album == '.':
        return f'/{date}'
    else:
        return f'/{album}/{date}'


def get_tags_from_date(album, date):
    injson = f'../public/data/{album}/{date}/descr.json'

    # outdir = '../public/data/tags'

    print(f"  {date}")

    if not os.path.isfile(injson):
        print("No descr.json file, skipping")
        return

    find_tags_in_json(injson, album, date)


def find_correct_tag(candidate):
    res = None
    for tag, data in tags.items():
        if tag == candidate:
            res = tag
            break
        elif candidate in data['tags']:
            res = tag
            break

    return res

def create_tag(title, tags):
    return {
        "title": title,
        "tags": tags,
        "items": []
    }


def add_to_tags(tag, obj):
    correct_tag = find_correct_tag(tag)

    if correct_tag:
        tag = correct_tag
    else:
        tags[tag] = create_tag(tag, [tag])
    
    tags[tag]["items"].append(obj)


def write_tag(tag, data):
    fullname = f"{outdir}/tags/{tag}.json"
    print(fullname)
    with open(fullname, 'w', encoding='utf8') as ofd:
        ofd.write(json.dumps(data, ensure_ascii=False))


def write_index(tags):
    keys = sorted(tags.keys())
    index = [{"tag": k, "title": tags[k]['title'] ,"len": len(tags[k]['items'])} for k in keys]
    fullname = "%s/tags.json" % outdir
    with open(fullname, 'w', encoding='utf8') as ofd:
        ofd.write(json.dumps(index, ensure_ascii=False))


def write_tag_redirects(tags):

    lines = []
    for tag, data in tags.items():
        for alias in data['tags']:
            if alias != tag:
                # nginx config format
                line = f"/data/tags/{alias}.json\t/data/tags/{tag}.json;\n"
                lines.append(line)

    with open(redirects_file, 'w') as fd:
        fd.writelines(lines)


def write_tags(tags):
    write_index(tags)
 
    tagsdir = f"{outdir}/tags"
    if not os.path.exists(tagsdir):
        os.makedirs(tagsdir)

    for tag, data in tags.items():
        write_tag(tag, data)

    write_tag_redirects(tags)


read_preset_tags()
for album, dates in albums.items():

    for date in dates:
        get_tags_from_date(album, date)
        # generate_xdate_descr(album, date)

if tags:
    print(tags)
    write_tags(tags)
