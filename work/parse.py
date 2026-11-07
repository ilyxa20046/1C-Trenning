import pymupdf, re, json

d = pymupdf.open('/home/user/uploads/Сборник.pdf')
raw = []
for i in range(7, 240):
    t = d[i].get_text()
    lines = t.split('\n')
    cleaned = []
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        if s.startswith('Сертификация "1С:Профессионал"'):
            continue
        if len(cleaned) == 0 and re.fullmatch(r'\d{1,3}', s):
            continue
        if 'Тестовые задания для самостоятельной подготовки' in s:
            continue
        cleaned.append(s)
    raw.append('\n'.join(cleaned))

text = '\n'.join(raw)
open('/home/user/work/raw.txt', 'w').write(text)
print(text[:600])
print('LEN', len(text))
qm = re.findall(r'(?m)^(\d{1,2})\.(\d{1,3})\s+', text)
print('markers', len(qm))
