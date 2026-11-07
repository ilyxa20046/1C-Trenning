const fs = require('fs');
const {JSDOM} = require('jsdom');
const html = fs.readFileSync('/home/user/1c-profi.html','utf8');
const dom = new JSDOM(html, {runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/'});
const {window} = dom;
window.confirm = () => true;
window.alert = () => {};
window.scrollTo = () => {};
setTimeout(() => {
  const d = window.document;
  const q = s => d.querySelector(s);
  console.log('topics rendered:', d.querySelectorAll('#topicList .topic').length);
  console.log('hSub:', q('#hSub').textContent);
  // start quick training
  q('#btnQuick').click();
  console.log('quiz visible:', !q('#view-quiz').classList.contains('hide'));
  console.log('question:', q('#qText').textContent.slice(0,60));
  console.log('options:', d.querySelectorAll('#qOpts .opt').length);
  // choose first option and check
  d.querySelectorAll('#qOpts .opt')[0].click();
  q('#btnQNext').click();
  console.log('explain shown:', !q('#qExplain').classList.contains('hide'), '|', q('#qExplain').textContent.slice(0,50));
  q('#btnQNext').click();
  console.log('moved to q2:', q('#qText').textContent.slice(0,40));
  // go home
  q('#btnQuit').click();
  // exam
  q('#btnExam').click();
  console.log('exam timer:', q('#qTimer').textContent, 'total badge', q('#qBadge').textContent);
  // editor
  q('#btnEditor').click();
  console.log('editor rows:', d.querySelectorAll('#edList .list-item').length, '|', q('#edCount').textContent);
  q('#btnAddQ').click();
  q('#fQ').value = 'Тестовый вопрос?';
  const inps = d.querySelectorAll('#fOpts input[type=text]');
  inps[0].value = 'Вариант А'; inps[1].value = 'Вариант Б';
  d.querySelectorAll('#fOpts .chk')[0].click();
  q('#btnSaveQ').click();
  console.log('after add editor count:', q('#edCount').textContent);
  console.log('toast:', q('#toast').textContent);
  // search
  q('#edSearch').value = 'Тестовый вопрос';
  q('#edSearch').dispatchEvent(new window.Event('input'));
  console.log('search rows:', d.querySelectorAll('#edList .list-item').length);
  // star toggle
  console.log('OK ALL');
}, 800);
