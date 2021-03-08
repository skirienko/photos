Typical workflow
================

1. Put a folder with photos named like '2019-10-25'
2. Create a file descript.ion in it. For Windows use `dir /B > descript.ion`
3. If you have images from different sources you may want to order them by time of creation not by name. Use `python sortbyexifdate.py` to order by the date from EXIF.
4. Sometimes photos from different sources may have wrong time settings, so you may need to synchronize their EXIF datetime first. Use `change_exif_time.py script` or
`jhead` utility to do that.
For example, if you want to reduce EXIF timestamp by 3 hour for all files started with 'IMG-':
```jhead -ta-0:03:00 IMG-*.*```
Also useful:
```jhead -ft``` - Change file modification time according to EXIF time


Portugal:
SX150:
я фотаю маму по улочке в сторону конвента:
    2015:04:19 09:05:44 IMG-7108.JPG (Canon PowerShot SX150 IS)
    ===
    2015:04:19 12:01:14 IMG_7053.JPG (Canon PowerShot SX50 HS)
    ---------------
    02:55:30

я фотаю сквозь зубцы башни на подъёме к конвенту:
    2015:04:19 09:29:39 IMG-7124.JPG (Canon PowerShot SX150 IS)

я фотаю в церкви какие-то колонны или ХЗ:
    2015:04:19 10:02:01 IMG-7178.JPG (Canon PowerShot SX150 IS)

в Коимбре на улочке папа фотает меня, а я его:
    2015:04:19 14:27:19 IMG-7325.JPG (Canon PowerShot SX150 IS)

в Коимбре, барельефы по пути вверх:
    2015:04:19 14:36:25 IMG-7332.JPG (Canon PowerShot SX150 IS)

в Коимбре, на часах 16:50:
    2015:04:19 16:50:42 IMG-7396.JPG (Canon PowerShot SX150 IS)

в Порту, отель (прибытие):
    2015:04:19 19:32:29 IMG-7401.JPG (Canon PowerShot SX150 IS)
    2015:04:19 19:32:42 IMG-7402.JPG (Canon PowerShot SX150 IS)
    2015:04:19 19:33:12 IMG-7404.JPG (Canon PowerShot SX150 IS)

в Порту, вид из окна гостиницы:
    2015:04:19 19:52:10 IMG-7407.JPG (Canon PowerShot SX150 IS)
    ~~~
    2015:04:19 19:30:59 IMG_0678.jpeg (iPhone 6) но время более раннее

SX50:
снизу, а папа в окне гостиницы:
2015:04:19 11:53:35 IMG_7042.JPG (Canon PowerShot SX50 HS)
2015:04:19 11:53:44 IMG_7043.JPG (Canon PowerShot SX50 HS)
2015:04:19 11:53:53 IMG_7045.JPG (Canon PowerShot SX50 HS)

в Коимбре, папа что-то фотает на улочке:
    2015:04:19 17:22:58 IMG_7280.JPG (Canon PowerShot SX50 HS)

в Коимбре на горе в универе, папа фотает меня:
    2015:04:19 17:40:25 IMG_7310.JPG (Canon PowerShot SX50 HS)
    ===
    2015:04:19 14:44:57 IMG-7340.JPG (Canon PowerShot SX150 IS)
    --------
    02:55:28

в Коимбре на башне:
    2015:04:19 18:26:52 IMG_7335.JPG (Canon PowerShot SX50 HS)
    ~~~
    2015:04:19 15:32:44 IMG_0626.jpeg (iPhone 6)
    2015:04:19 15:33:05 IMG_0627.jpeg (iPhone 6)

в Коимбре на башне, папа снизу фотает меня:
    2015:04:19 18:29:38 IMG_7342.JPG (Canon PowerShot SX50 HS)
    2015:04:19 18:29:42 IMG_7343.JPG (Canon PowerShot SX50 HS)
    ===
    2015:04:19 15:34:07 IMG-7343.JPG (Canon PowerShot SX150 IS)
    2015:04:19 15:34:16 IMG-7344.JPG (Canon PowerShot SX150 IS) — время на башне 15:32 или :33
    ~~~
    2015:04:19 15:33:58 IMG_0628.jpeg (iPhone 6)

в Коимбре, на башенных часах примерно 16:21:
    2015:04:19 19:16:04 IMG_7385.JPG (Canon PowerShot SX50 HS)
    ----------
    02:55:04

iPhone
------
в Коимбре, надпись София на стене:
    2020:10:26 23:46:33 IMG_0649.jpeg (?)
    ~~~
    2015:04:19 19:02:16 IMG_7358.JPG (Canon PowerShot SX50 HS):
    ~~~
    2015:04:19 16:08:35 IMG-7354.JPG (Canon PowerShot SX150 IS)

в Коимбре, надпись Эрос на стене:
    2020:10:26 23:46:33 IMG_0650.jpeg (?)
    ~~~
    2015:04:19 19:04:27 IMG_7363.JPG (Canon PowerShot SX50 HS)
    2015:04:19 19:05:18 IMG_7364.JPG (Canon PowerShot SX50 HS)
    ~~~~
    2015:04:19 16:08:53 IMG-7355.JPG (Canon PowerShot SX150 IS)
    папа фотает маму(?) и надпись Эрос на стене:
    2015:04:19 19:04:21 IMG_7362.JPG (Canon PowerShot SX50 HS)
    ===
    2015:04:19 16:09:06 IMG-7356.JPG (Canon PowerShot SX150 IS)
    ----------
    02:55:15

в Коимбре спуск по улочке, фотаю папу:
    2015:04:19 16:09:35 IMG_0651.jpeg (iPhone 6)

в машине, папа за рулем, на часах 16:54:
    2015:04:19 17:54:03 IMG_0660.jpeg (iPhone 6)

в машине, подъезжаем к Порту, на часах 17:12:
    2015:04:19 18:12:32 IMG_0667.jpeg (iPhone 6):

спущенные колеса:
    2015:04:19 18:48:34 IMG_0675.jpeg (iPhone 6)


SX50 HS - часы спешат на 3 часа - 4 минуты 45 сек = 02:55:15

SX150 IS - возможно, спешат на 1 мин

19:06
18:27
-----
00:39

14:44:57
14:44:31
---------
00:00:26


Done:
jhead.exe -ta-02:55:15 IMG_*.JPG
jhead.exe -ta-00:00:39 IMG_*.JPG
jhead.exe -ta-00:00:26 IMG-*.JPG