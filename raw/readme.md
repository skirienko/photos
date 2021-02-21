Typical workflow
================

1. Put a folder with photos named like '2019-10-25'
2. Create a file descript.ion in it. For Windows use `dir /B > descript.ion`
3. If you have images from different sources you may want to order them by time of creation not by name. Use `python3 sortbyexifdate.py` to order by the date from EXIF.
4. Sometimes photos from different sources may have wrong time settings, so you may need to synchronize their EXIF datetime first. Use `change_exif_time.py` script or
`jhead` utility to do that.
For example, if you want to reduce EXIF timestamp by 3 hour for all files started with 'IMG-':
```jhead -ta-0:03:00 IMG-*.*```
5. Then you can use `python3 resize.py` to resize original images and videos.