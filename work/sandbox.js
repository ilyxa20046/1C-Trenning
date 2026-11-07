const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:460,height:900}});
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('file:///home/user/frame.html');
  await p.waitForTimeout(1500);
  const frame = p.frames().find(f=>f.url().includes('1c-profi'));
  const txt = frame ? await frame.evaluate(()=>document.body.innerText.slice(0,160)) : 'NO FRAME';
  console.log('iframe text:', JSON.stringify(txt));
  const topics = frame ? await frame.evaluate(()=>document.querySelectorAll('#topicList .topic').length) : -1;
  console.log('topics in sandboxed iframe:', topics);
  await p.screenshot({path:'shot_sandbox.png'});
  console.log('errors:', errs);
  await b.close();
})();
