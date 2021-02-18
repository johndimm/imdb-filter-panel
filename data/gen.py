import sys
import csv

FILE = sys.argv[1]
TABLE = 'movies_xfer'

def main():
    with open (FILE) as csvfile:
      reader = csv.reader(csvfile)
      fields = []
      for row in reader:
          if len(fields) == 0:
             # First line
             for field in row:
                fields.append(field.lower().replace('.','_'))
             break
      
    createTable(fields)
    copyData(fields)

def createTable(fields):
    lines = []
    for field in fields:
        fs = field.strip()
        if fs != '':
          lines.append("\"%s\" varchar" % fs)


    stmt = """
create table %s (
  id SERIAL PRIMARY KEY,
  %s
)
    """  %  (TABLE, ",\n  ".join(lines))


    print "drop table if exists %s cascade;" % TABLE
    print(stmt)
    print (";")

def copyData(fields):
    bareFields = []
    for field in fields:
        fs = field.strip()
        if fs != '':
          bareFields.append(fs)
    fieldList = ','.join(bareFields)
    print ("\copy %s(%s) from %s with csv header;" % (TABLE, fieldList, FILE))

main()
