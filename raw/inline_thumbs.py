import json
import os.path
import io

import utils

outdir = '../public/data'

filenames = [
    'istanbul.json',
    'kaliningrad.json',
    'all-events.json',
]


def add_inline_thumbs(filename):

    fullname = '%s/%s' % (outdir, filename)

    with open(fullname, 'r', encoding='utf8') as fd:
        data = json.load(fd)

    changed = False

    events = data
    if isinstance(data, dict):
        events = data['events']
    
    for event in events:
        print(event)
        if "date" in event:
            pic = '%s/%s/%s' % (outdir, event['date'], event['img'])
        else:
            pic = '%s/%s' % (outdir, event['img'])

        thumb = utils.generate_thumb(pic)

        if thumb:
            if not 'thumb' in event or event['thumb'] != thumb:
                event['thumb'] = thumb
                changed = True

    if changed:
        print(data)
        fd2 = io.open(fullname, 'w', encoding='utf8')
        fd2.write(json.dumps(data, indent=1, ensure_ascii=False))
        print("File rewritten")


for filename in filenames:
    print(filename)
    add_inline_thumbs(filename)
