from PIL import Image
import os
import math

TILE_SIZE = 256
folder_path = f'{os.getcwd()}/final/public/maps'

def create_tiles(job_name, page_number):
    image_path = f'{folder_path}/originals/{job_name}/{page_number}.jpg'
    im = Image.open(image_path)
    w, h = im.size

    save_tiles(im, 5, job_name, page_number)


def create_folders(job_name, x_splits, zoom, page_number):
    folder = f'{folder_path}/tiled/{job_name}'
    try:
        os.mkdir(folder)
    except:
        pass
    try:
        os.mkdir(f'{folder}/{page_number}')
    except:
        pass
    try:
        os.mkdir(f'{folder}/{page_number}/{zoom}')
    except:
        pass
    for i in range(x_splits):
        try:
            os.mkdir(f'{folder}/{page_number}/{zoom}/{i}')
        except:
            pass


def save_tiles(image, zoom, job_name, page_number):
    h_splits = int(math.ceil(image.size[0]/TILE_SIZE))
    v_splits = int(math.ceil(image.size[1]/TILE_SIZE))

    print(f'h: {h_splits} v: {v_splits}')

    create_folders(job_name, h_splits, zoom, page_number)

    for y in range(v_splits):
        for x in range(h_splits):
            l = x * TILE_SIZE
            t = y * TILE_SIZE
            r = (x*TILE_SIZE) + TILE_SIZE
            b = (y*TILE_SIZE) + TILE_SIZE
            tile = image.crop((l, t, r, b))
            tile.save(f'{folder_path}/tiled/{job_name}/{page_number}/{zoom}/{x}/{y}.jpg')

create_tiles('T404W', 2)
