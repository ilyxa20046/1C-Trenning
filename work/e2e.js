const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2});
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('dialog', d=>d.accept());
  await p.goto('file:///home/user/1c-profi.html');
  await p.waitForTimeout(400);

  async function answerAll(mode){
    let guard=0;
    while (guard++ < 60) {
      const inResult = await p.evaluate(()=>!document.querySelector('#view-result').classList.contains('hide'));
      if (inResult) break;
      const opts = await p.$$('#qOpts .opt');
      if (!opts.length) break;
      await opts[opts.length-1].click();
      const btn = await p.textContent('#btnQNext');
      await p.click('#btnQNext');
      if ((btn||'').trim() !== 'Далее') { await p.waitForTimeout(40); await p.click('#btnQNext'); }
      await p.waitForTimeout(30);
    }
  }

  await p.click('#btnQuick');
  await answerAll();
  console.log('training:', (await p.textContent('#rScore')).trim(), '|', (await p.textContent('#rVerdict')).trim());

  await p.click('#btnHome'); await p.waitForTimeout(300);
  const stats = await p.$$eval('.stat b', els=>els.map(e=>e.textContent));
  console.log('stats:', stats);

  await p.click('#btnErrors'); await p.waitForTimeout(300);
  console.log('errors mode starts at q:', (await p.textContent('#qBadge')).trim(), '| still quiz:', await p.evaluate(()=>!document.querySelector('#view-quiz').classList.contains('hide')));
  await p.click('#btnStarQ'); await p.waitForTimeout(100);
  await p.click('#btnQuit'); await p.waitForTimeout(200);

  await p.reload(); await p.waitForTimeout(700);
  console.log('after reload stats:', await p.$$eval('.stat b', els=>els.map(e=>e.textContent)));

  await p.click('#btnMenu'); await p.waitForTimeout(200);
  await p.click('[data-go="io"]'); await p.waitForTimeout(200);
  const [dl] = await Promise.all([p.waitForEvent('download', {timeout:6000}).catch(()=>null), p.click('#btnExport')]);
  if (dl){ const j = JSON.parse(fs.readFileSync(await dl.path(),'utf8')); console.log('export:', j.questions.length, 'questions /', j.topics.length, 'topics'); }
  else console.log('export: FAILED');
  await p.click('#mIOClose'); await p.waitForTimeout(150);

  await p.click('#btnQuick'); await p.waitForTimeout(200);
  await p.keyboard.press('1'); await p.waitForTimeout(80);
  await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  const ex = (await p.textContent('#qExplain')).trim();
  console.log('keyboard 1+Enter -> explain shown:', ex.length>0, '|', ex.slice(0,42));
  await p.click('#btnQuit'); await p.waitForTimeout(200);

  await p.click('#btnFav'); await p.waitForTimeout(300);
  console.log('favorites badge:', (await p.textContent('#qBadge')).trim());
  await p.click('#btnQuit'); await p.waitForTimeout(200);

  await p.setViewportSize({width:320,height:640});
  await p.waitForTimeout(300);
  const w = await p.evaluate(()=>document.documentElement.scrollWidth);
  console.log('scrollWidth@320:', w, w<=321?'OK':'(OVERFLOW)');
  await p.screenshot({path:'shot_320.png'});
  console.log('errors:', errs);
  await b.close();
})();
