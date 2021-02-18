python gen.py IMDBdata_MainData.csv > movies.sql
psql -f movies.sql
psql -f transform.sql
