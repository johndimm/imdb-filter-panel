import sys

def main():
    header = []
    filename = sys.argv[1]
    f = open (filename)
    for line in f.readlines():
        line.strip()
        output = []
        words = line.split('\t')
        for word in words:
            output.append('"%s"' % word.strip())
        print (','.join(output))


main()
