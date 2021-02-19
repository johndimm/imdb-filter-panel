python gen.py IMDBdata_MainData.csv > movies.sql
psql -f movies.sql
psql -f transform.sql
psql -f fix_bad_image_links.sql
