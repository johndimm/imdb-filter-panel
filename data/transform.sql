drop table if exists movies;

create table movies as
select *,
  split_part(genre, ',', 1) as genre1,
  split_part(genre, ',', 2) as genre2,
  split_part(genre, ',', 3) as genre3,
  split_part(actors, ',', 1) as actor1,
  split_part(actors, ',', 2) as actor2,
  split_part(actors, ',', 3) as actor3,
  split_part(actors, ',', 4) as actor4,
  split_part(director, ',', 1) as director1,
  split_part(director, ',', 2) as director2,
  split_part(writer, ',', 1) as writer1,
  split_part(writer, ',', 2) as writer2,
  split_part(language, ',', 1) as language1,
  split_part(country, ',', 1) as country1,
  left(ratings_value,1)  as rating,
  concat(substring(year,1,3),'0') as decade
from movies_xfer;






