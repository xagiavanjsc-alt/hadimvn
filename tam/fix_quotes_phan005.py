import re
f = r'C:\Users\hi\Desktop\code\han\tam\generate_phan005.py'
with open(f, 'r', encoding='utf-8') as file:
    lines = file.readlines()

new_lines = []
for line in lines:
    if re.match(r'\s+\("[^"]+", "[^"]+", "[^"]+\',\s*$', line):
        line = line[:-2] + '"),\n'
    new_lines.append(line)

with open(f, 'w', encoding='utf-8') as file:
    file.writelines(new_lines)
print('Fixed all')
