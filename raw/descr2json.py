import re
import json
import io
from PIL import Image
from PIL.ExifTags import TAGS
import os.path
import cchardet as chardet

# date = '2008-05-01'
# date = '2008-05-02'
# date = '2009-07-01'
# date = '2014-06-11'
# date = '2015-06-11'
date = '2015-06-20'
# date = '2016-07-01'
# date = '2018-09-10'

filename = '%s/descript.ion' % date
file2 = io.open('../public/data/%s.json' % date, 'w', encoding='utf8')

rxPhoto = re.compile(r'[a-z_]+\d+[a-z_]*\.[a-z0-9]{3,5}', re.I)
rxVimeo = re.compile(r'^vimeo:(\d+)$', re.I)

episodes = []
title = ''
descr = ''

with open(filename, 'rb') as probe:
    txt = probe.read()
    enc = chardet.detect(txt)

with open(filename, 'r', encoding=enc['encoding']) as fd:

    lines = fd.readlines()

    title = lines[0].strip()
    descr = lines[1].strip()
    pairs = [line.strip().split(' ', 1) for line in lines]
    prevItem = {}
    episodeId = 1
    subtitleId = 1
    for line in lines[2:]:
        pair = line.strip().split(' ', 1)
    
        item = {}
        filepath = '../public/data/%s/%s' % (date, pair[0])
        if rxPhoto.match(pair[0]):
            print(pair[0])
            if os.path.isfile(filepath):
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
                        if abs(aspect - 66.6) > 0.1:
                            item['aspect'] = aspect
                            print("aspect %f" % aspect)
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
            else:
                print("file not found")
        elif rxVimeo.match(pair[0]):
            m = rxVimeo.match(pair[0])
            print('Vimeo!')
            item['id'] = episodeId
            item['type'] = 'vimeo'
            item['descr'] = pair[1] if len(pair) > 1 else ''
            item['video'] = m.group(1)
            episodes.append(item)
            episodeId += 1
            prevItem = item
        else:
            if line != title and line != descr:
                subtitle = line.strip()
                code = "section-%d" % subtitleId
                parts = subtitle.split('#')
                print(parts)
                if len(parts) > 1:
                    subtitle = parts[0].strip()
                    code = parts[1].strip()

                item['subtitle'] = subtitle
                item['id'] = code

                print("=== %s" % line)
                episodes.append(item)
                subtitleId += 1

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