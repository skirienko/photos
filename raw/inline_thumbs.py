from PIL import Image
import json
import os.path
import io
import base64

dir = '../public/data'
infile = '%s/all-events.json' % dir
outfile = '%s/all-events2.json' % dir

with open(infile, 'r') as fd:
    data = json.load(fd)

for event in data:
    pic = '%s/%s/%s' % (dir, event['id'], event['img'])
    # print(pic)
    if os.path.isfile(pic):
        with Image.open(pic) as img:
            thumb = img.resize([32, 24], Image.ANTIALIAS)
            output = io.BytesIO()
            thumb.save(output, format='JPEG', optimize=True, quality=60)
            b64 = base64.b64encode(output.getvalue())
            if b64:
                event['thumb'] = 'data:image/jpg;base64,' + b64.decode()

print(data)
fd2 = io.open(outfile, 'w', encoding='utf8')
fd2.write(json.dumps(data, ensure_ascii=False))

