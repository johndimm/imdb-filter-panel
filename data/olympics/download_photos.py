import re
import sys
import os
import time
import random
import urllib

commons_template = "curl 'https://commons.wikimedia.org/w/index.php?%s&title=Special:MediaSearch&go=Go&type=image' > %s"

wiki_template = "curl 'https://en.wikipedia.org/wiki/%s' > ./html/%s.html"

def multipleNames (name):
    words = name.split(' ')
    fixed = []
    for word in words:
      fixed.append(word.capitalize())
    return '+'.join(fixed)

def nameCaps (line):
    # SOUKUP, Jaroslav
    line = line.strip().lower()
    words = line.split(', ')
    first = ''
    second = ''
    if len(words) > 0:
        first = multipleNames(words[0])
    if len(words) > 1:
        second = multipleNames(words[1])
    return "+".join([second, first])

def download(athlete, filename):
    f = { 'search' : athlete }
    a = urllib.urlencode(f)
    curl_cmd = commons_template % (a, filename)
    print (curl_cmd)
    os.system(curl_cmd)

    delay = random.randint(2,6)
    time.sleep(delay)

def extract(athlete, athlete_db, filename, output):
    f = open (filename)
    b = f.read()
    f.close()

    pattern = r'"url":"(.*?)"'
    match = re.search(pattern, b)
    if match:
      output.write ("%s\t%s\t%s\n" % (athlete_db, athlete, match.group(1)))

def main():
  f = open(sys.argv[1])
  output = open ('photos.txt','w')
  for line in f:
      athlete_db = line.strip()
      athlete = nameCaps(athlete_db)
      filename = "./html/%s.html" % re.sub(r"\W+", '+', athlete_db)
      if not os.path.isfile(filename):
        download(athlete, filename)
      extract(athlete, athlete_db, filename, output)
      output.flush()

  output.close()

main()