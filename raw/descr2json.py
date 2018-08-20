import re
import json
import io
from PIL import Image
from PIL.ExifTags import TAGS
import os.path

date = '2009-07-01'
# date = '2014-06-11'
# date = '2015-06-11'

filename = '%s/descript.ion' % date
file2 = io.open('../public/data/%s.json' % date, 'w', encoding='utf8')

rxPhoto = re.compile('[a-z_]+\d+\.[a-z0-9]{3,5}', re.I)

episodes = []
title = 'Istanbul'
descr = ''
with open(filename, 'r', encoding='cp1251') as fd:
    lines = fd.readlines()

    title = lines[0].strip()
    descr = lines[1].strip()
    pairs = [line.strip().split(' ', 1) for line in lines]
    prevItem = {}
    episodeId = 1
    for pair in pairs:
        item = {}
        filepath = '../public/data/%s/%s' % (date, pair[0])
        if rxPhoto.match(pair[0]) and os.path.isfile(filepath):
            if len(pair) > 1:
                item['descr'] = pair[1]
                item['photo'] = pair[0]
                item['id'] = episodeId
                with Image.open(filepath) as img:
                    if img:
                        if img.size[1] > img.size[0]:
                            item['vertical'] = True
                    # print(img.size)
                    aspect = round(100.0 * img.size[1] / img.size[0], 2)
                    if abs(aspect - 66.6) > 3:
                        item['aspect'] = aspect
                        print("%s %f" % (pair[0], aspect))
                episodes.append(item)
                episodeId += 1
            else:
                item = prevItem
                if not 'photos' in item:
                    item['photos'] = []
                    item['photos'].append(item['photo'])
                    item.pop('photo')
                item['photos'].append(pair[0])
            prevItem = item
            # print(item)

data = {
    "title": title,
    "description": descr,
    "date": date
}
data['episodes'] = episodes
#file2.write(' '.join(pair).encode('utf-8')+'\n')
jsondump = json.dumps(data, ensure_ascii=False)
file2.write(jsondump)
# print(data)