"""One-time import of the website's public images into this repository."""
from pathlib import Path
import io,json,urllib.request
from PIL import Image
for item in json.loads(Path('scripts/asset-manifest.json').read_text(encoding='utf-8')):
    target=Path(item['target'])
    if target.is_file(): continue
    with urllib.request.urlopen(item['source'],timeout=45) as response:
        image=Image.open(io.BytesIO(response.read()))
        image.thumbnail((1680,1680))
        target.parent.mkdir(parents=True,exist_ok=True)
        image.save(target,format='WEBP',quality=82)
        print('Imported',target)
