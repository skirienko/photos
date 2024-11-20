import re
import json
import os

# set directory
abspath = os.path.abspath(__file__)
os.chdir(os.path.dirname(abspath))


from presets import albums, single_dates
from utils import read_descr_file, rxDate, rxPhoto, strip_md

date = ''
outdir = "../public/data"

docs = []

def get_docs_from_date(album, date):
    injson = f'../public/data/{album}/{date}/descr.json'

    # outdir = '../public/data/tags'

    print(f"  {date}")

    if not os.path.isfile(injson):
        print("No descr.json file, skipping")
        return

    get_docs_from_descr(injson, album, date)


def get_docs_from_descr(path, album, date):
    with open(path, "r") as f:
        res = json.load(f)
# title, descr, img, link
    if res and 'sections' in res:
        title = res['title']
        print(title)
        for section in res['sections']:
            print(section)
            if 'title' in section:
                obj = {
                    "path": get_client_path(album, date),
                    "place": album,
                    "date": res["date"],
                    "type": "subsection",
                    "title": title,
                    "descr": section["title"],
                    "hash": section["id"],
                    "photo": get_section_photo(section),
                }

            if 'episodes' in section:
                for episode in section['episodes']:
                    obj = {
                        "path": get_client_path(album, date),
                        "place": album,
                        "date": res["date"],
                        "type": "episode",
                        "title": title,
                        "descr": strip_md(episode["descr"]),
                        "hash": "e"+str(episode["id"]),
                        "photo": get_episode_photo(episode),
                    }
                    if is_undone(episode):
                        print("REJECT")
                    else:
                        add_to_docs(obj)


def add_to_docs(obj):
    obj['id'] = len(docs)+1
    print(obj)
    docs.append(obj)


def get_client_path(album, date):
    if album == '.':
        place = single_dates[date]
        return f'/{place}/{date}'
    else:
        return f'/{album}/{date}'


def get_section_photo(section):
    episode = section["episodes"][0]
    return get_episode_photo(episode)


def get_episode_photo(episode):
    if "photo" in episode:
        return episode["photo"]
    elif "photos" in episode:
        return episode["photos"][0]
    elif "poster" in episode:
        return episode["poster"]
    else:
        return ''


def is_undone(episode):
    first_photo = get_episode_photo(episode)
    searchTerm = first_photo.replace('.webp', '')
    if searchTerm == '':
        return False
    return episode['descr'] == '...' or bool(re.search(searchTerm, episode['descr']))


def write_docs(docs):
    fullname = f'{outdir}/docs.json'
    with open(fullname, 'w', encoding='utf8') as ofd:
        ofd.write(json.dumps(docs, ensure_ascii=False))


for album, dates in albums.items():
    for date in dates:
        get_docs_from_date(album, date)

if docs:
    write_docs(docs)
