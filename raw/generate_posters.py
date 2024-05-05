import os
import re

from subprocess import call

from presets import albums
from utils import get_aspect, select_cover, generate_thumb, rxVideo

date = ''

cmd_video_img = './ffmpeg -v quiet -i %s -ss 00:00:00 -vframes 1 -y %s'

def generate_posters(album, date):
    dir = '../public/data/%s/%s' % (album, date)
    if os.path.exists(dir):
        ls = os.listdir(dir)
        for filename in ls:
            if rxVideo.match(filename):
                fullpath = '%s/%s' % (dir, filename)
                imgpath = fullpath+'.jpg'
                print(cmd_video_img % (fullpath, imgpath))
                call(cmd_video_img % (fullpath, imgpath), shell=True)



for album, dates in albums.items():

    for date in dates:

        generate_posters(album, date)
