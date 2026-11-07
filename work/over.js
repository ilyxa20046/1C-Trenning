const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:320,height:640}});
  await p.goto('file:///home/user/1c-profi.html'); await p.waitForTimeout(400);
  const bad = await p.evaluate(() => {
    const out=[]; const W=document.documentElement.clientWidth;
    document.querySelectorAll('*').forEach(el=>{
      const r=el.getBoundingClientRect();
      if (r.width>0 && r.right > W+0.5) out.push([el.tagName+'.'+(el.className||''), Math.round(r.left), Math.round(r.right), el.id]);
    });
    return out.slice(0,15);
  });
  console.log(JSON.stringify(bad,null,1));
  await b.close();
})();
