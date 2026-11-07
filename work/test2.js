const fs=require('fs');const {JSDOM}=require('jsdom');
const html=fs.readFileSync('/home/user/1c-profi.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});
const {window}=dom; window.confirm=()=>true; window.scrollTo=()=>{};
setTimeout(()=>{
 const d=window.document,q=s=>d.querySelector(s);
 console.log('topics:',d.querySelectorAll('#topicList .topic').length,'| subtitle:',q('#hSub').textContent);
 q('#btnQuick').click();
 const nOpts=d.querySelectorAll('#qOpts .opt').length;
 d.querySelectorAll('#qOpts .opt')[0].click(); q('#btnQNext').click();
 console.log('train answer ->', q('#btnQNext').textContent, '| explain:', !q('#qExplain').classList.contains('hide'));
 q('#btnQNext').click();
 console.log('q2 ok, back works:', !q('#btnQBack').hidden);
 q('#btnQuit').click();
 q('#btnEditor').click();
 // add question with proper events
 q('#btnAddQ').click();
 q('#fQ').value='Проверочный вопрос?';
 const inps=d.querySelectorAll('#fOpts input[type=text]');
 for(let i=0;i<inps.length;i++){ inps[i].value='Ответ '+(i+1); inps[i].dispatchEvent(new window.Event('input')); }
 d.querySelectorAll('#fOpts .chk')[0].click();
 q('#btnSaveQ').click();
 console.log('added ->', q('#edCount').textContent, '| toast:', q('#toast').textContent);
 q('#edSearch').value='Проверочный'; q('#edSearch').dispatchEvent(new window.Event('input'));
 console.log('search ->', d.querySelectorAll('#edList .list-item').length);
 q('#edSearch').value=''; q('#edSearch').dispatchEvent(new window.Event('input'));
 // start exam and finish quickly
 q('#btnEditBack').click();
 q('#btnExam').click();
 console.log('exam qs total:', q('#qTimer').textContent);
 for(let i=0;i<14;i++){ const opts=d.querySelectorAll('#qOpts .opt'); if(opts.length) opts[0].click(); q('#btnQNext').click(); }
 console.log('result screen:', !q('#view-result').classList.contains('hide'), '|', q('#rTitle').textContent, q('#rScore').textContent, q('#rVerdict').textContent);
 console.log('wrong items:', d.querySelectorAll('#rList .card').length);
 process.exit(0);
},900);
