import os
import json

path = '../public/data'
MIN_NEEDED_FILES_TO_COMPARE = 3

from presets import albums


def get_useful_files(jsonfile):

    useful = ['descr.json',]
    with open(jsonfile, 'r', encoding='utf8') as content:
        data = json.load(content)

    for episode in data['episodes']:
        if 'photos' in episode:
            for p in episode['photos']:
                useful.append(p)
        elif 'photo' in episode:
            useful.append(episode['photo'])
        elif 'video' in episode:
            useful.append(episode['video'])

    return useful


def purge_dir(dirname, useful):

    if len(useful) < MIN_NEEDED_FILES_TO_COMPARE:
        # silently eximus
        return

    for filename in os.listdir(dirname):
        if filename in useful:
            pass
        else:
            print('  delete %s' % filename)
            os.remove('%s/%s' % (dirname, filename))



for album, dates in albums.items():

    for date in dates:

        dirname = '%s/%s/%s' % (path, album, date)
        print('Directory %s' % date)

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
