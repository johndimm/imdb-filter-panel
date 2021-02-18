drop table if exists movies_xfer cascade;

create table movies_xfer (
  id SERIAL PRIMARY KEY,
  "title" varchar,
  "year" varchar,
  "rated" varchar,
  "released" varchar,
  "runtime" varchar,
  "genre" varchar,
  "director" varchar,
  "writer" varchar,
  "actors" varchar,
  "plot" varchar,
  "language" varchar,
  "country" varchar,
  "awards" varchar,
  "poster" varchar,
  "ratings_source" varchar,
  "ratings_value" varchar,
  "metascore" varchar,
  "imdbrating" varchar,
  "imdbvotes" varchar,
  "imdbid" varchar,
  "type" varchar,
  "dvd" varchar,
  "boxoffice" varchar,
  "production" varchar,
  "website" varchar,
  "response" varchar,
  "tomatourl" varchar
)
    
;
\copy movies_xfer(title,year,rated,released,runtime,genre,director,writer,actors,plot,language,country,awards,poster,ratings_source,ratings_value,metascore,imdbrating,imdbvotes,imdbid,type,dvd,boxoffice,production,website,response,tomatourl) from IMDBdata_MainData.csv with csv header;
