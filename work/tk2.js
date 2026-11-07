const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:420,height:900}, deviceScaleFactor:2});
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
  await p.goto('file:///home/user/1c-profi.html'); await p.waitForTimeout(400);
  await p.click('#btnTickets'); await p.waitForTimeout(300);
  await p.click('#tkList .topic'); await p.waitForTimeout(300);
  // answer first question wrong to see explanation
  const wrongIdx = await p.evaluate(() => { const q=Q.list[Q.i]; return q.o.findIndex((_,i)=> !q.a.includes(i+1))+1; });
  await p.click(`#qOpts .opt:nth-child(${wrongIdx})`);
  await p.click('#btnQNext'); await p.waitForTimeout(200);
  console.log('explain visible:', await p.evaluate(()=>!document.querySelector('#qExplain').classList.contains('hide')));
  console.log('explain text:', (await p.textContent('#qExplain')).slice(0,90));
  await p.screenshot({path:'shot_ticket_check.png'});
  // answer rest correctly
  for (let i=1;i<14;i++){
    await p.click('#btnQNext'); await p.waitForTimeout(60);  // Далее
    const idx = await p.evaluate(() => Q.list[Q.i].a[0]);
    await p.click(`#qOpts .opt:nth-child(${idx})`);
    await p.click('#btnQNext'); await p.waitForTimeout(60);
  }
  await p.click('#btnQNext'); await p.waitForTimeout(400); // Завершить
  console.log('result:', (await p.textContent('#rTitle')).trim(), (await p.textContent('#rScore')).trim(), (await p.textContent('#rVerdict')).trim());
  await p.click('#btnHome'); await p.waitForTimeout(300);
  console.log('card:', (await p.textContent('#tkList .topic')).replace(/\s+/g,' ').trim());
  console.log('sub:', await p.textContent('#tkSub'));
  await p.screenshot({path:'shot_tickets2.png'});
  console.log('errors:', errs);
  await b.close();
})();
