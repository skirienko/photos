from PIL import Image
import json
import os.path
import io
import base64

dir = '../public/data'

filenames = [
    'istanbul.json',
    'kaliningrad.json',
    'all-events.json',
]

def add_inline_thumbs(filename):

    fullname = '%s/%s' % (dir, filename)

    with open(fullname, 'r', encoding='utf8') as fd:
        data = json.load(fd)

    changed = False

    events = data
    if isinstance(data, dict):
        events = data['events']
    
    for event in events:
        print(event)
        if "date" in event:
            pic = '%s/%s/%s' % (dir, event['date'], event['img'])
        else:
            pic = '%s/%s' % (dir, event['img'])

        thumb = None
        if os.path.isfile(pic):
            with Image.open(pic) as img:
                thumb = img.resize([32, 24], Image.ANTIALIAS)
                output = io.BytesIO()
                thumb.save(output, format='JPEG', optimize=True, quality=60)
                b64 = base64.b64encode(output.getvalue())
                if b64:
                    thumb = 'data:image/jpg;base64,' + b64.decode()

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
