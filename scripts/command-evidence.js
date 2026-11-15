import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const raw=readFileSync('evidence/tests.txt');const tests=(raw[0]===255?raw.toString('utf16le'):raw.toString('utf8')).replace(/^\uFEFF/,'');
const lines=tests.split(/\r?\n/);const excerpt=lines.filter(l=>/^# Subtest:|^# tests |^# pass |^# fail |^# duration|^> |^ok /.test(l));
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage({viewport:{width:1300,height:1100}});
await page.setContent('<html><style>body{margin:0;background:#f5f7f1;color:#304832;padding:40px;font:14px Consolas,monospace}h1{font:27px Arial}p{color:#6e8062}pre{background:#182d22;color:#e2ecd6;padding:28px;border-radius:10px;line-height:1.6;white-space:pre-wrap}</style><h1>SmartStock / verification command evidence</h1><p>Real test transcript excerpt rendered for readability. This is not the original setup terminal.</p><pre></pre></html>');
await page.locator('pre').evaluate((el,value)=>el.textContent=value,'Node runtime: '+process.version+'\nCommand: npm test\nSource: evidence/tests.txt\n\n'+excerpt.join('\n'));
await page.screenshot({path:'evidence/14-command-evidence.png',fullPage:true});await browser.close();console.log('Actual command transcript screenshot generated.');
