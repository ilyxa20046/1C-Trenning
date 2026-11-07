const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:420,height:900}, deviceScaleFactor:2});
  await page.goto('file:///home/user/1c-profi.html');
  await page.waitForTimeout(600);
  await page.screenshot({path:'/home/user/work/shot_home.png', fullPage:false});
  await page.click('#btnQuick');
  await page.waitForTimeout(300);
  await page.screenshot({path:'/home/user/work/shot_quiz.png'});
  // answer wrong/right
  await page.click('#qOpts .opt');
  await page.click('#btnQNext');
  await page.waitForTimeout(200);
  await page.screenshot({path:'/home/user/work/shot_answer.png'});
  // desktop view
  const p2 = await browser.newPage({viewport:{width:1200,height:900}});
  await p2.goto('file:///home/user/1c-profi.html');
  await p2.waitForTimeout(500);
  await p2.screenshot({path:'/home/user/work/shot_desktop.png'});
  await browser.close();
})();
