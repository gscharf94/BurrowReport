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

PAGES = 13
OUTPUT_PATH = "/home/gustavo/Pictures/Screenshots"

NW = (22, 172)
NE = (2546, 1072)
W = NE[0]-NW[0]
H = NE[1]-NW[1]

def count_down(n):
    print(f'COUNTDOWN... T-{n}s')
    for i in range(n):
        print(f'{n-i}...')
        time.sleep(1)

def move_down():
    pg.press('n')
    pg.press('right')
    pg.press('down')
    time.sleep(1.5)

def get_pos():
    count_down(1)
    print(pg.position())

def take_screenshot(nw, ne, i):
    os.system(f'maim -g {W}x{H}+{NW[0]}+{NW[1]} {OUTPUT_PATH}/{i}.png')
    time.sleep(1)


count_down(5)

for i in range(PAGES):
    move_down()
    take_screenshot(NW, NE, i+1)

# count_down(2)
# take_screenshot(NW, NE, 10)
