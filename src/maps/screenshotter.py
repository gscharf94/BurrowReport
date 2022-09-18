### this basically takes a nw corner and se corner and then takes a screenshot of that
### which will be used in the split_image later
### this is for prints that we cat extract the image from with pdfimages

### since pyautogui sucks we need to use xdotools
### scratch that it's not pyautogui.. gnome-screen grabs the keyboard and mouse
### soo... instead of somehow piping xdotools into that i found another command
### line utility, maim. much simpler

import pyautogui as pg
import time
import os

JOB_NAME = input("job name... \n")

PAGES = input("# of pages... \n")
while not PAGES.isdigit():
    PAGES = input("please enter a number... \n")

OUTPUT_PATH = "/home/gustavo/Documents/programming_stuff/burrowReport/final/public/maps/originals/"

def make_job_folder(job, path):
    try:
        os.mkdir(f'{path}/{job}')
    except OSError as err:
        print(f'dir for job {job} already exists')

def count_down(n):
    print(f'COUNTDOWN... T-{n}s')
    for i in range(n):
        print(f'{n-i}...')
        time.sleep(1)

# def move_down():
#     pg.press('n')
#     pg.press('right')
#     pg.press('down')
#     time.sleep(1.5)

# def move_down():
#     pg.press('n')
#     pg.press('down')
#     time.sleep(1)

def move_down():
    pg.press('n')
    time.sleep(0.3)
    pg.press('n')
    time.sleep(1.5)

def get_pos():
    input('put mouse over NW corner')
    pos = pg.position()
    NW = [pos.x, pos.y]
    input('put mouse over SE corner')
    pos = pg.position()
    SE = [pos.x, pos.y]
    print(f'NW: {NW}\nSE: {SE}')
    return [NW, SE]

def take_screenshot(nw, ne, i):
    os.system(f'maim -g {W}x{H}+{NW[0]}+{NW[1]} {OUTPUT_PATH}/{JOB_NAME}/{i}.png')
    time.sleep(1)

make_job_folder(JOB_NAME, OUTPUT_PATH)

NW, SE = get_pos()

W = SE[0] - NW[0]
H = SE[1] - NW[1]

print('make sure pdf is in focus')

count_down(5)
for i in range(int(PAGES)):
    take_screenshot(NW, SE, i+1)
    move_down()
