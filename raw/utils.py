from PIL import Image
import os.path
import io
import base64


def generate_thumb(fullname):
    thumb = None
    if os.path.isfile(fullname):
        with Image.open(fullname) as img:
            thumb = img.resize([32, 24], Image.ANTIALIAS)
            output = io.BytesIO()
            thumb.save(output, format='JPEG', optimize=True, quality=60)
            b64 = base64.b64encode(output.getvalue())
            if b64:
                thumb = 'data:image/jpg;base64,' + b64.decode()

    return thumb
