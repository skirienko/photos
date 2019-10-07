import os
import json

path = '../public/data'

# date = '2008-05-01'
# date = '2008-05-02'
# date = '2009-07-01'
date = '2014-06-11'
# date = '2015-06-11'
# date = '2015-06-20'
# date = '2016-07-01'
# date = '2017-07-11'
# date = '2018-09-10'

dirname = '%s/%s' % (path, date)
jsonfile = '%s/%s.json' % (path, date)

useful = []

with open(jsonfile, 'r', encoding='utf8') as content:
    print('JSON file "%s" found' % jsonfile)
    data = json.load(content)

for episode in data['episodes']:
    if 'photos' in episode:
        for p in episode['photos']:
            useful.append(p)
    elif 'photo' in episode:
        useful.append(episode['photo'])
print('%d files considered useful' % len(useful))

if not os.path.isdir(dirname):
    print('Directory "%s" not found or not a directory' % dirname)
    exit

print('Directory "%s" found' % dirname)
ls = os.listdir(dirname)

for filename in ls:
    if filename in useful:
        pass
    else:
        print(filename)
        os.remove('%s/%s' % (dirname, filename))
        

print('Clean.')
