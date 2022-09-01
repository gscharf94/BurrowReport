from PIL import Image
import os
import math

TILE_SIZE = 512
folder_path = f'{os.getcwd()}/final/public/maps'

def create_tiles(job_name, page_number):
    try: 
        image_path = f'{folder_path}/originals/{job_name}/{page_number}.jpg'
        im = Image.open(image_path)
    except:
        image_path = f'{folder_path}/originals/{job_name}/{page_number}.png'
        im = Image.open(image_path)
        im = im.convert('RGB')

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

    create_folders(job_name, h_splits, zoom, page_number)

    for y in range(v_splits):
        for x in range(h_splits):
            l = x * TILE_SIZE
            t = y * TILE_SIZE
            r = (x*TILE_SIZE) + TILE_SIZE
            b = (y*TILE_SIZE) + TILE_SIZE
            tile = image.crop((l, t, r, b))
            tile.save(f'{folder_path}/tiled/{job_name}/{page_number}/{zoom}/{x}/{y}.jpg')

# JOB_NAME = "P4882"
# for file in os.listdir(f'{folder_path}/originals/P4882'):
#     create_tiles(JOB_NAME, int(file.split(".")[0]));

JOBS = [
    # "T404W",
    # "P4882",
    # "P4819",
    # "P4811",
    # "P4772",
    # "P4765",
    # "P4761",
    # "P4746",
    # "MMP-10151953",
    # "CPE-434050",
    # "CPE-412560",
    # "P4745",
    # "P4729",
    # "JB3",
    # "JB4",
    "BASEBALL",
    # "BIG_HOUSE",
    # "WO12",
    # "CRAN-RTFL_SAR03-004-1.5",
    # "VERM",
    # "BAYSIDE",
    # "U51091-STRATUM-HEALTH-5955-RAND-BLVD",
    # "MMP-10016262",
    # "MMP-10016234-1.1",
    # "MMP-10016234-1.2",
    # "MMP-10016234-1.3",
    # "MMP-10016292-1.3",
    # "T413W",
    # "P4824",
    # "MMP-10069517-1.1",
]

for job in JOBS:
    print(f'job: {job}')
    for file in os.listdir(f'{folder_path}/originals/{job}'):
        print(f'page: {file.split(".")[0]}')
        create_tiles(job, int(file.split(".")[0]))
