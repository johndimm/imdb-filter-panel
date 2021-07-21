drop table if exists photos;
create table photos (
  original_name text,
  first_last text,
  url text
);

load data local infile 'images.txt' into table photos;
