import {readFileSync,writeFileSync} from 'node:fs';
let config=readFileSync('.env','utf8');
config=config.replace(/^DEMO_DATABASE=.*$/m,'DEMO_DATABASE=false');
for(const [name,value]of Object.entries({LOCAL_DATABASE:'true',LOCAL_DATABASE_PATH:'.data/mongodb',LOCAL_DATABASE_PORT:'27028'})){const pattern=new RegExp('^'+name+'=.*$','m');config=pattern.test(config)?config.replace(pattern,name+'='+value):config+'\n'+name+'='+value;}
writeFileSync('.env',config);console.log('Configured persistent local database. Existing secret values preserved.');
