import os
import json

path = '../public/data'
MIN_NEEDED_FILES_TO_COMPARE = 3

from presets import albums


def get_useful_files(jsonfile):

    useful = ['descr.json',]
    with open(jsonfile, 'r', encoding='utf8') as content:
        data = json.load(content)

    sections = []
    if 'episodes' in data:
        sections.append({'episodes': data['episodes']})
    elif 'sections' in data:
        sections = data['sections']


    for section in sections:
        for episode in section['episodes']:
            if 'photos' in episode:
                for p in episode['photos']:
                    useful.append(p)
            elif 'photo' in episode:
                useful.append(episode['photo'])
            elif 'video' in episode:
                useful.append(episode['video'])
                if 'poster' in episode:
                    useful.append(episode['poster'])

    return useful

def purge_dir(dirname, useful):

    if len(useful) < MIN_NEEDED_FILES_TO_COMPARE:
        # silently eximus
        return

    for filename in sorted(os.listdir(dirname)):
        trimmed = filename.removesuffix('.webp')
        extended = filename+'.webp'
        if not (filename in useful) and not (trimmed in useful) and not (extended in useful):
            print(f'  delete {filename}')
            os.remove('%s/%s' % (dirname, filename))


for album, dates in albums.items():

    for date in dates:

        dirname = f'{path}/{album}/{date}'
        print(f'Directory {date}')

        if not os.path.isdir(dirname):
            print('Directory "%s" not found, ignoring this date' % dirname)
            continue

        jsonfile = '%s/descr.json' % (dirname)

        if not os.path.isfile(jsonfile):
            print('JSON file "%s" not found, ignoring this date' % jsonfile)
            continue

        useful = get_useful_files(jsonfile)

        if len(useful) < MIN_NEEDED_FILES_TO_COMPARE:
            print('Not enough useful file to judge, ignoring this date')
            continue

        purge_dir(dirname, useful)
