import re, json
from collections import defaultdict

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

q_re = re.compile(r'^(\d{1,2})\.(\d{1,3})(?![\d.,])\s*(.*)$')
o_re = re.compile(r'^(\d{1,2})\.(?!\d)\s*(.*)$')

questions = []
cur = None
cur_opt = None
opt_count = 0
cur_topic = 0
cur_num = 0


def append(parts, new):
    if not parts:
        parts.append(new)
        return
    prev = parts[-1]
    if prev.endswith('-') and len(prev) > 1 and prev[-2].isalpha():
        parts[-1] = prev[:-1] + new
    else:
        parts.append(new)


def finish_option():
    global cur_opt
    if cur is not None and cur_opt is not None:
        cur['options'].append(' '.join(cur_opt).strip())
        cur_opt = None


def finish_question():
    global cur, cur_opt, opt_count
    if cur is None:
        return
    finish_option()
    cur['question'] = ' '.join(cur['q_parts']).strip()
    del cur['q_parts']
    questions.append(cur)
    cur = None
    opt_count = 0


for ln in lines:
    if not ln:
        continue
    m = q_re.match(ln)
    handled = False
    if m:
        topic, num, rest = int(m.group(1)), int(m.group(2)), m.group(3)
        is_next = (topic == cur_topic and num == cur_num + 1)
        is_new_topic = (topic == cur_topic + 1 and num == 1)
        if topic in TOPICS and (is_next or is_new_topic or cur is None):
            finish_question()
            cur = {'topic': topic, 'num': num, 'q_parts': [rest] if rest else [], 'options': []}
            cur_topic, cur_num = topic, num
            opt_count = 0
            handled = True
    if handled:
        continue
    m2 = o_re.match(ln)
    if m2 and cur is not None:
        n = int(m2.group(1))
        if n == opt_count + 1:
            finish_option()
            opt_count += 1
            cur_opt = [m2.group(2)] if m2.group(2) else []
            continue
    if cur is not None:
        if cur_opt is None:
            append(cur['q_parts'], ln)
        else:
            append(cur_opt, ln)

finish_question()

bytopic = defaultdict(list)
for q in questions:
    bytopic[q['topic']].append(q)

problems = []
for t in sorted(bytopic):
    qs = bytopic[t]
    ids = [q['num'] for q in qs]
    if ids != list(range(1, len(qs) + 1)):
        problems.append((t, 'ids', len(qs), ids[:8], ids[-4:]))
    for q in qs:
        if len(q['options']) < 2:
            problems.append((t, q['num'], 'few options', len(q['options'])))
        for o in q['options']:
            if not o.strip():
                problems.append((t, q['num'], 'empty opt'))

print('TOTAL:', len(questions))
for t in sorted(bytopic):
    print('topic %2d  %3d questions' % (t, len(bytopic[t])))
print('problems:', len(problems))
for p in problems[:40]:
    print(p)
json.dump(questions, open('/home/user/work/questions_raw.json', 'w'), ensure_ascii=False, indent=1)
