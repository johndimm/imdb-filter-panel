drop table if exists example cascade;

create table example (
  id SERIAL PRIMARY KEY,
  "name" varchar,
  "size" varchar,
  "color" varchar,
  "shape" varchar,
  "image" varchar
)
    
;
\copy example(name,size,color,shape,image) from example.tsv with delimiter E'	' csv header;
