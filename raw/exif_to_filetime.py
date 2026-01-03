import os
import sys
import glob
import platform
import subprocess
from datetime import datetime, timezone

from PIL import Image, ExifTags

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


def get_image_datetime(path):
    try:
        with Image.open(path) as img:
            exif = img._getexif()
            if exif:
                exif_data = {
                    ExifTags.TAGS.get(tag, tag): value
                    for tag, value in exif.items()
                }

                for key in ("DateTimeOriginal", "DateTimeDigitized", "DateTime"):
                    if key in exif_data:
                        return datetime.strptime(
                            exif_data[key], "%Y:%m:%d %H:%M:%S"
                        )
    except Exception:
        pass
    return None


def get_mov_datetime(path):
    """
    Uses exiftool to extract QuickTime creation date.
    """
    try:
        result = subprocess.run(
            [
                "exiftool",
                "-api",
                "QuickTimeUTC",
                "-CreationDate",
                "-CreateDate",
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

        for key in ("CreationDate", "CreateDate", "TrackCreateDate"):
            if key in data:
                dt = datetime.fromisoformat(
                    data[key].replace("Z", "+00:00")
                )
                return dt.astimezone(timezone.utc).replace(tzinfo=None)

    except Exception:
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

        if ext in IMAGE_EXTS:
            dt = get_image_datetime(path)
        elif ext in VIDEO_EXTS:
            dt = get_mov_datetime(path)
        else:
            continue

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
