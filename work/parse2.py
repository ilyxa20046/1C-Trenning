import re, json

text = open('/home/user/work/raw.txt').read()
lines = [l.strip() for l in text.split('\n')]

TOPICS = {
    1: "Общие механизмы, понятия и термины",
    2: "Редакторы и инструменты общие",
    3: "Редакторы и инструменты режима разработки",
    4: "Конструкторы",
    5: "Технология разработки",
    6: "Объектная модель прикладного решения",
    7: "Табличная модель прикладного решения",
    8: "Механизмы интеграции и обмена данными",
    9: "Система взаимодействия",
    10: "Интерфейсные механизмы",
    11: "Механизмы построения отчетности",
    12: "Механизмы оперативного учета",
    13: "Объекты и механизмы бухгалтерского учета",
    14: "Механизмы сложных периодических расчетов",
}

q_re = re.compile(r'^(\d{1,2})\.(\d{1,3})\s*(.*)$')
o_re = re.compile(r'^(\d{1,2})\.\s+(.*)$')

questions = []
cur = None
cur_opt = None
expect_opt = 1


def join(cur_parts, new):
    if not cur_parts:
        return new
    prev = cur_parts[-1]
    # fix hyphenation at line break
    if prev.endswith('-') and not prev.endswith('--'):
        cur_parts[-1] = prev[:-1] + new
    else:
        cur_parts.append(new)
    return None


def finish():
    global cur, cur_opt
    if cur is None:
        return
    if cur_opt is not None:
        cur['options'].append(' '.join(cur_opt).strip())
    cur['question'] = ' '.join(cur['q_parts']).strip()
    del cur['q_parts']
    questions.append(cur)
    cur = None
    cur_opt = None


for ln in lines:
    if not ln:
        continue
    m = q_re.match(ln)
    # question marker: topic 1..14 and question number 1..200, and second group exists
    if m and 1 <= int(m.group(1)) <= 14 and 1 <= int(m.group(2)) <= 200:
        topic, num, rest = int(m.group(1)), int(m.group(2)), m.group(3)
        # Heuristic: a real new question either starts a fresh block or the previous
        # block already has >=2 options. Also option lines never look like X.Y.
        finish()
        cur = {'topic': topic, 'num': num, 'q_parts': [rest] if rest else [], 'options': []}
        cur_opt = None
        expect_opt = 1
        continue
    m2 = o_re.match(ln)
    if m2 and cur is not None and int(m2.group(1)) == expect_opt:
        if cur_opt is not None:
            cur['options'].append(' '.join(cur_opt).strip())
        cur_opt = [m2.group(2)]
        expect_opt += 1
        continue
    # continuation
    if cur is not None:
        if cur_opt is None:
            join(cur['q_parts'], ln)
        else:
            join(cur_opt, ln)

finish()

# validation
from collections import defaultdict
bytopic = defaultdict(list)
for q in questions:
    bytopic[q['topic']].append(q)

problems = []
for t in sorted(bytopic):
    qs = bytopic[t]
    ids = [q['num'] for q in qs]
    expected = list(range(1, len(qs) + 1))
    if ids != expected:
        # find gaps/dups
        miss = sorted(set(expected) - set(ids))
        dup = [i for i in set(ids) if ids.count(i) > 1]
        problems.append((t, 'ids', miss[:10], dup[:10], len(qs)))
    for q in qs:
        n = len(q['options'])
        if n < 2:
            problems.append((t, q['num'], 'few options', n))
        if q['options']:
            for i, o in enumerate(q['options']):
                if not o.strip():
                    problems.append((t, q['num'], 'empty opt', i + 1))

print('total questions:', len(questions))
for t in sorted(bytopic):
    print(' topic', t, len(bytopic[t]), 'max', max(q['num'] for q in bytopic[t]))
print('problems:', len(problems))
for p in problems[:40]:
    print(p)

json.dump(questions, open('/home/user/work/questions_raw.json', 'w'), ensure_ascii=False, indent=1)
