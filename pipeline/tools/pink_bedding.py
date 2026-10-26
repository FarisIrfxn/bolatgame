"""Restore the requested pink fabric palette after TRELLIS shifts it towards coral.
Keeps the generated mesh, white frame, fabric detail and other texture maps intact.
Usage: Comfy venv python pink_bedding.py source.web.glb output.glb
"""
import io
import json
import struct
import sys
from pathlib import Path
import numpy as np
from PIL import Image

src, dst = map(Path, sys.argv[1:3])
raw = src.read_bytes()
chunks = {}
pos = 12
while pos < len(raw):
    length, kind = struct.unpack_from('<II', raw, pos)
    chunks[kind] = raw[pos + 8:pos + 8 + length]
    pos += 8 + length
j = json.loads(chunks[0x4E4F534A])
binary = bytearray(chunks[0x004E4942])
indices = {m['pbrMetallicRoughness']['baseColorTexture']['index'] for m in j['materials']}
images = set()
for index in indices:
    texture = j['textures'][index]
    images.add(texture.get('source', texture.get('extensions', {}).get('EXT_texture_webp', {}).get('source')))
for index in images:
    entry = j['images'][index]
    view = j['bufferViews'][entry['bufferView']]
    start = view.get('byteOffset', 0)
    im = Image.open(io.BytesIO(binary[start:start + view['byteLength']])).convert('RGB')
    a = np.asarray(im, dtype=np.float32) / 255
    hi, lo = a.max(axis=2), a.min(axis=2)
    saturation = (hi - lo) / np.maximum(hi, 0.001)
    mask = np.clip((saturation - .22) / .10, 0, 1)
    mask *= np.clip((a[:,:,0] - a[:,:,1] - .04) / .08, 0, 1)
    mask *= np.clip((a[:,:,0] - a[:,:,2] - .02) / .06, 0, 1)
    # One pink hue; retain relative values and saturation variation in painted folds.
    value = np.minimum(hi * .97 + .07, 1)
    sat = np.clip(saturation * .60, .26, .42)
    pink = np.stack((value, value * (1 - sat), value * (1 - sat * .38)), axis=2)
    corrected = a * (1 - mask[:,:,None]) + pink * mask[:,:,None]
    stream = io.BytesIO()
    Image.fromarray(np.uint8(np.clip(corrected * 255, 0, 255))).save(stream, format='WEBP', quality=92)
    data = stream.getvalue()
    binary.extend(b'\x00' * ((-len(binary)) % 4))
    j['bufferViews'].append({'buffer':0, 'byteOffset':len(binary), 'byteLength':len(data)})
    entry['bufferView'] = len(j['bufferViews']) - 1
    entry['mimeType'] = 'image/webp'
    binary.extend(data)
j['buffers'][0]['byteLength'] = len(binary)
js = json.dumps(j, separators=(',', ':')).encode()
js += b' ' * ((-len(js)) % 4)
binary.extend(b'\x00' * ((-len(binary)) % 4))
total = 12 + 8 + len(js) + 8 + len(binary)
dst.write_bytes(struct.pack('<III',0x46546C67,2,total) + struct.pack('<II',len(js),0x4E4F534A) + js + struct.pack('<II',len(binary),0x004E4942) + binary)
print(dst)
