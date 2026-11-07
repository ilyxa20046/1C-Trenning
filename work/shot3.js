const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:420,height:900}, deviceScaleFactor:2});
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('file:///home/user/1c-profi.html'); await p.waitForTimeout(500);
  await p.click('#btnEditor'); await p.waitForTimeout(400);
  await p.screenshot({path:'shot_editor.png'});
  await p.click('#edList .li-q .icon-btn:nth-of-type(2)'); await p.waitForTimeout(400);
  await p.screenshot({path:'shot_form.png'});
  // test filter
  await p.click('#btnCancelQ'); await p.waitForTimeout(200);
  await p.selectOption('#edTopic','7'); await p.waitForTimeout(300);
  const n = await p.$$eval('#edList .li-q', els=>els.length);
  console.log('filter t7 rows:', n, 'count label:', await p.textContent('#edCount'));
  console.log('errors:', errs);
  await b.close();
})();
