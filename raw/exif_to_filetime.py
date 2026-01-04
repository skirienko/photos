import os
import sys
import glob
import platform
import subprocess
from datetime import datetime, timezone

from PIL import Image, ExifTags
import piexif

# HEIC support
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass


IMAGE_EXTS = {
    ".jpg", ".jpeg", ".heic", ".heif",
    ".tif", ".tiff", ".dng", ".webp", ".png"
}

VIDEO_EXTS = {".mov"}

EXIF_DT_FORMAT1 = '%Y:%m:%d %H:%M:%S'
EXIF_DT_FORMAT2 = '%Y:%m:%d %H:%M:%S%z'

def get_media_datetime(path):
    ext = os.path.splitext(path)[1].lower()

    # Fast path: JPEG / TIFF
    if ext in {".jpg", ".jpeg", ".tif", ".tiff"}:
        try:
            with Image.open(path) as img:
                if hasattr(img, "_getexif"):
                    exif = img._getexif()
                    if exif:
                        exif_data = {
                            ExifTags.TAGS.get(k, k): v
                            for k, v in exif.items()
                        }
                        for key in (
                            "DateTimeOriginal",
                            "DateTimeDigitized",
                            "DateTime",
                        ):
                            if key in exif_data:
                                dt = datetime.strptime(exif_data[key], EXIF_DT_FORMAT1)
                                return dt
        except Exception:
            pass

    # Fallback: HEIC, MOV, PNG, RAW, etc.
    try:
        result = subprocess.run(
            [
                "exiftool",
                "-api", "QuickTimeUTC",
                "-DateTimeOriginal",
                "-CreateDate",
                "-CreationDate",
                "-TrackCreateDate",
                "-j",
                path,
            ],
            capture_output=True,
            text=True,
            check=True,
        )

        import json
        data = json.loads(result.stdout)[0]

        for key in (
            "DateTimeOriginal",
            "CreateDate",
            "CreationDate",
            "TrackCreateDate",
        ):
            if key in data:
                try:
                    dt = datetime.strptime(data[key], EXIF_DT_FORMAT1)
                    #print(f'format {EXIF_DT_FORMAT1} OK')
                except Exception:
                    dt = datetime.strptime(data[key], EXIF_DT_FORMAT2)
                    #print(f'format {EXIF_DT_FORMAT2} OK')

                return dt

    except Exception as e:
        print(e)
        pass

    return None


def set_file_times(path, dt):
    ts = dt.timestamp()
    os.utime(path, (ts, ts))

    if platform.system() == "Windows":
        import pywintypes
        import win32file
        import win32con

        handle = win32file.CreateFile(
            path,
            win32con.GENERIC_WRITE,
            win32con.FILE_SHARE_READ
            | win32con.FILE_SHARE_WRITE
            | win32con.FILE_SHARE_DELETE,
            None,
            win32con.OPEN_EXISTING,
            win32con.FILE_ATTRIBUTE_NORMAL,
            None,
        )

        win_time = pywintypes.Time(dt)
        win32file.SetFileTime(handle, win_time, win_time, win_time)
        handle.close()


def process_pattern(pattern):
    files = sorted(set(glob.glob(pattern, recursive=True)))

    for path in files:
        if not os.path.isfile(path):
            continue

        ext = os.path.splitext(path)[1].lower()

        dt = get_media_datetime(path)

        if not dt:
            print(f"SKIP (no date): {path}")
            continue

        set_file_times(path, dt)
        print(f"OK   {path} → {dt}")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python exif_to_filetime.py <pattern> [pattern...]")
        print("Examples:")
        print("  python exif_to_filetime.py **/*.jpg **/*.mov")
        sys.exit(1)

    for pattern in sys.argv[1:]:
        process_pattern(pattern)


if __name__ == "__main__":
    main()
