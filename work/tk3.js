const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:420,height:900}, deviceScaleFactor:2});
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
  await p.goto('file:///home/user/1c-profi.html'); await p.waitForTimeout(400);
  await p.click('#btnTickets'); await p.waitForTimeout(200);
  await p.click('#tkList .topic'); await p.waitForTimeout(300);
  for (let i=0;i<14;i++){
    if (i>0){ await p.click('#btnQNext'); await p.waitForTimeout(50); }
    const idx = await p.evaluate(() => Q.list[Q.i].a[0]);
    await p.click(`#qOpts .opt:nth-child(${idx})`);
    await p.click('#btnQNext'); await p.waitForTimeout(50);
  }
  await p.click('#btnQNext'); await p.waitForTimeout(400);  // Завершить
  const nb = await p.textContent('#btnNextTicket');
  console.log('next button:', nb.trim(), '| visible:', await p.isVisible('#btnNextTicket'));
  await p.screenshot({path:'shot_ticket_res2.png'});
  await p.click('#btnNextTicket'); await p.waitForTimeout(400);
  console.log('now on:', (await p.textContent('#qTopic')).trim(), '| badge', await p.textContent('#qBadge'));
  // check that after finishing ticket 1, nextTicket means ticket 2
  console.log('errors:', errs);
  await b.close();
})();
