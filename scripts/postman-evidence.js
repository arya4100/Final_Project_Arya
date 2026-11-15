import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {writeFileSync,mkdirSync} from 'node:fs';
mkdirSync('.evidence-private',{recursive:true});
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn('C:/Users/aryap/AppData/Local/Postman/app-11.86.1/Postman.exe',['--remote-debugging-port=9231','--user-data-dir='+process.cwd()+'/.tools/postman-profile','--no-sandbox'],{env,windowsHide:true,stdio:'ignore'});
let browser,page;
try{for(let i=0;i<30;i++){try{const targets=await(await fetch('http://127.0.0.1:9231/json/list')).json();if(targets.some(t=>t.type==='page'))break;}catch{}await new Promise(r=>setTimeout(r,300));}browser=await chromium.connectOverCDP('http://127.0.0.1:9231');page=browser.contexts()[0].pages()[0];await page.getByText('Send',{exact:true}).first().waitFor();const dismiss=page.getByText('Open Lightweight API Client',{exact:true});if(await dismiss.count())await dismiss.click();
 const login=await(await fetch('http://127.0.0.1:4000/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'manager@smartstock.demo',password:'SmartStock!2026'})})).json();
 const evidence=[];
 async function send(name,method,path,body,expected){await page.getByText('Import',{exact:true}).first().click();const curl=`curl --request ${method} 'http://127.0.0.1:4000/api${path}' --header 'Authorization: Bearer ${login.token}' --header 'Content-Type: application/json'`+(body?` --data-raw '${JSON.stringify(body)}'`:'');await page.getByPlaceholder('Paste cURL to import...').fill(curl);await page.getByPlaceholder('Paste cURL to import...').press('Enter');await page.getByPlaceholder('Paste cURL to import...').waitFor({state:'hidden'});await page.getByRole('button',{name:'Send',exact:true}).click();await page.waitForFunction(code=>document.body.innerText.includes(String(code)),expected,{timeout:10000});await new Promise(r=>setTimeout(r,600));await page.screenshot({path:`evidence/${name}.png`});evidence.push({name,method,path,status:expected,tool:'Actual Postman desktop request and response'});}
 await send('15-postman-products','GET','/products',null,200);
 await send('16-postman-validation','POST','/products',{name:'Invalid evidence product',sku:'INVALID-EVIDENCE',category:'Other',price:-1,quantity:0,minimum:0},400);
 const existing=await(await fetch('http://127.0.0.1:4000/api/products',{headers:{authorization:'Bearer '+login.token}})).json();
 await send('17-postman-conflict','POST','/movements',{productId:existing[0]._id,type:'OUT',quantity:999999,note:'Evidence of rejected oversell',clientId:crypto.randomUUID()},409);
 await send('18-postman-push','POST','/push/test',{},200);
 writeFileSync('evidence/postman-desktop.json',JSON.stringify({status:'passed',requests:evidence},null,2));console.log('Captured four real Postman desktop responses.');
}catch(e){console.log(e.stack);if(page)await page.screenshot({path:'.evidence-private/postman-failure.png'});}finally{await browser?.close();child.kill();}
