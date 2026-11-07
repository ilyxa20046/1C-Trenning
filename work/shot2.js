const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:420,height:900}, deviceScaleFactor:2});
  await p.goto('file:///home/user/1c-profi.html'); await p.waitForTimeout(500);
  // editor
  await p.click('#btnEditor'); await p.waitForTimeout(300);
  await p.screenshot({path:'shot_editor.png'});
  await p.click('#edList .list-item'); await p.waitForTimeout(300);
  await p.screenshot({path:'shot_form.png', fullPage:false});
  // dark theme + exam result
  await b.close();
  const b2 = await chromium.launch();
  const p2 = await b2.newPage({viewport:{width:420,height:900}, deviceScaleFactor:2});
  await p2.goto('file:///home/user/1c-profi.html'); await p2.waitForTimeout(400);
  await p2.click('#btnTheme'); await p2.waitForTimeout(200);
  await p2.click('#btnExam'); await p2.waitForTimeout(300);
  await p2.screenshot({path:'shot_exam_dark.png'});
  for (let i=0;i<14;i++){ const o = await p2.$$('#qOpts .opt'); if(o.length) await o[0].click(); await p2.click('#btnQNext'); await p2.waitForTimeout(60);}
  await p2.waitForTimeout(300);
  await p2.screenshot({path:'shot_result_dark.png'});
  await b2.close();
})();
