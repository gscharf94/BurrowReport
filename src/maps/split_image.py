from PIL import Image
import os
import math

TILE_SIZE = 512
folder_path = f'{os.getcwd()}/final/public/maps'

def create_tiles(job_name, page_number):
    image_path = f'{folder_path}/originals/{job_name}/{page_number}.jpg'
    im = Image.open(image_path)
    w, h = im.size

    save_tiles(im, 5, job_name, page_number)

    im_sixteenth = im.resize((int(w/8), int(h/8)))
    save_tiles(im_sixteenth, 2, job_name, page_number)
    im_sixteenth.close()

    im_quarter = im.resize((int(w/4), int(h/4)))
    save_tiles(im_quarter, 3, job_name, page_number)
    im_quarter.close()

    im_half = im.resize((int(w/2), int(h/2)))
    save_tiles(im_half, 4, job_name, page_number)
    im_half.close()

    im_double = im.resize((w*2, h*2))
    save_tiles(im_double, 6, job_name, page_number)
    im_double.close()

    im_quadruple = im.resize((w*4, h*4))
    save_tiles(im_quadruple, 7, job_name, page_number)
    im_quadruple.close()

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
