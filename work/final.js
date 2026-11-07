const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:420,height:900}, deviceScaleFactor:2});
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
  await p.goto('file:///home/user/1c-profi.html'); await p.waitForTimeout(500);
  // home has tickets button
  console.log('tickets btn:', await p.isVisible('#btnTickets'));
  await p.click('#btnTickets'); await p.waitForTimeout(400);
  await p.screenshot({path:'shot_tickets_final.png'});
  // verify every ticket has unique questions & 14 (except last 9)
  const info = await p.evaluate(() => {
    const T = buildTickets(); const flat = T.flat();
    const byTopic = {};
    T[0].forEach(id => { const t = id.split('.')[0]; byTopic[t] = (byTopic[t]||0)+1; });
    return {n:T.length, sizes:[...new Set(T.map(x=>x.length))], uniq:new Set(flat).size, all:flat.length, t1perTicket:byTopic};
  });
  console.log(JSON.stringify(info));
  // dark theme tickets screenshot
  await p.click('#btnTheme'); await p.waitForTimeout(300);
  await p.screenshot({path:'shot_tickets_dark.png'});
  console.log('errors:', errs);
  await b.close();
})();
