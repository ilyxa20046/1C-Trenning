const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:420,height:900}});
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
  await p.goto('file:///home/user/1c-profi.html'); await p.waitForTimeout(400);
  await p.click('#btnMenu'); await p.click('[data-go="io"]'); await p.waitForTimeout(300);
  const sample = JSON.stringify({topics:[],questions:[{topic:5,q:'Импортированный вопрос?',o:['Да','Нет','Возможно'],a:[2],n:'Проверка импорта'}]});
  await p.fill('#ioText', sample);
  await p.click('#btnImportText'); await p.waitForTimeout(500);
  console.log('toast:', (await p.textContent('#toast')).trim());
  await p.click('#mIOClose'); await p.waitForTimeout(200);
  await p.click('#btnEditor'); await p.waitForTimeout(300);
  await p.fill('#edSearch','Импортированный'); await p.waitForTimeout(400);
  const c = await p.textContent('#edCount');
  console.log('found in editor:', c.trim());
  // restore base
  await p.click('#btnEditBack'); await p.waitForTimeout(200);
  await p.click('#btnIO'); await p.waitForTimeout(300);
  await p.click('#btnRestoreBase'); await p.waitForTimeout(500);
  console.log('after restore toast:', (await p.textContent('#toast')).trim());
  console.log('errors:', errs);
  await b.close();
})();
