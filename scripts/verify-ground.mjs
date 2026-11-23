// Real Firefox viewer controls; compare ground-floor surfaces without injecting camera or Unit state.
// node scripts/verify-ground.mjs <baseUrl> <outputDir>
import {firefox} from 'playwright'
import {mkdirSync,writeFileSync} from 'node:fs'
const [url,out]=process.argv.slice(2);mkdirSync(out,{recursive:true})
const browser=await firefox.launch({headless:true});const page=await browser.newPage({viewport:{width:1920,height:1040}});const errors=[]
page.on('pageerror',e=>errors.push(e.message))
try{
 await page.goto(`${url}/u/sheltech-ground?staff=1&quality=lite`)
 await page.getByRole('button',{name:'Enter',exact:true}).click({timeout:120000})
 await page.getByRole('button',{name:'Rooms',exact:true}).waitFor();await page.waitForTimeout(7000)
 for(const name of ['1:8 ramp (east)','Driveway (north-east)','Lawn']){
  await page.keyboard.press('o');await page.waitForTimeout(250);await page.getByRole('button',{name:'Rooms',exact:true}).click()
  await page.locator('.room-row').filter({has:page.getByText(name,{exact:true})}).click()
  await page.waitForTimeout(1200)
  const key=name.replace(/[^a-z0-9]+/gi,'-').replace(/-$/,'').toLowerCase()
  await page.screenshot({path:`${out}/${key}.png`})
  if(name!=='Driveway (north-east)') {
   // The staff editor's documented drag-to-look gesture; no scene/camera state is injected.
   await page.getByRole('button',{name:'Edit furniture',exact:true}).click()
   await page.mouse.move(80,400);await page.mouse.down();await page.mouse.move(860,400,{steps:12});await page.mouse.up()
   await page.getByRole('button',{name:'Edit furniture',exact:true}).click()
   await page.waitForTimeout(700)
   await page.screenshot({path:`${out}/${key}-reverse.png`})
  }
 }
 writeFileSync(`${out}/result.json`,JSON.stringify({errors,body:await page.locator('body').innerText()},null,2))
}finally{await browser.close()}
