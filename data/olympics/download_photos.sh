mysql olympics < athletes.sql > t1.txt
tail +2 t1.txt | head -1800 > athletes.txt
rm t1.txt
time python download_photos.py athletes.txt

