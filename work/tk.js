const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:420,height:900}, deviceScaleFactor:2});
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
  await p.goto('file:///home/user/1c-profi.html'); await p.waitForTimeout(500);
  const stats = await p.evaluate(() => {
    const T = buildTickets();
    const all = T.flat();
    const uniq = new Set(all);
    const sizes = {};
    T.forEach(t => sizes[t.length] = (sizes[t.length]||0)+1);
    // sections per first ticket
    const first = T[0].map(id => id.split('.')[0]);
    const dup = all.length - uniq.size;
    return {tickets: T.length, questions: all.length, unique: uniq.size, dup, sizes, firstSections: first.join(','), total: S.qs.length};
  });
  console.log(JSON.stringify(stats));
  await p.click('#btnTickets'); await p.waitForTimeout(400);
  console.log('sub:', await p.textContent('#tkSub'), '| cards:', await p.$$eval('#tkList .topic', e=>e.length));
  await p.screenshot({path:'shot_tickets.png'});
  await p.click('#tkList .topic'); await p.waitForTimeout(400);
  console.log('quiz header:', await p.textContent('#qTopic'), '| badge:', await p.textContent('#qBadge'), '| counter:', await p.textContent('#qTimer'));
  await p.screenshot({path:'shot_ticket_q.png'});
  // answer all 14 correctly
  for (let i=0;i<14;i++){
    const idx = await p.evaluate(() => { const q = Q.list[Q.i]; return q.a[0]; });
    await p.click(`#qOpts .opt:nth-child(${idx})`);
    await p.click('#btnQNext'); await p.waitForTimeout(80);
    if (i<13) { const t = await p.textContent('#btnQNext'); if (t.trim()==='Далее') await p.click('#btnQNext'); }
  }
  await p.waitForTimeout(400);
  console.log('result:', (await p.textContent('#rTitle')).trim(), '|', (await p.textContent('#rScore')).trim(), '|', (await p.textContent('#rVerdict')).trim());
  await p.screenshot({path:'shot_ticket_res.png'});
  await p.click('#btnHome'); await p.waitForTimeout(200);
  await p.click('#btnTickets'); await p.waitForTimeout(300);
  console.log('after pass sub:', await p.textContent('#tkSub'));
  const firstCard = await p.textContent('#tkList .topic');
  console.log('card text:', firstCard.replace(/\s+/g,' ').trim());
  // filter
  await p.click('#btnTicketFilter'); await p.waitForTimeout(300);
  console.log('filtered cards:', await p.$$eval('#tkList .topic', e=>e.length));
  await p.click('#btnTicketFilter'); await p.waitForTimeout(200);
  // random ticket
  await p.click('#btnRandomTicket'); await p.waitForTimeout(300);
  console.log('random ->', await p.textContent('#qTopic'));
  console.log('errors:', errs);
  await b.close();
})();
