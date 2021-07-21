drop table if exists olympic_medals_fact_photos;
create table olympic_medals_fact_photos as 
select o.*, p.url 
from olympic_medals_fact as o
join photos as p on p.original_name = o.athlete;
