import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
const cwd=process.cwd(),safe='safe.directory='+cwd.replaceAll('\\','/');
const git=(args,options={})=>execFileSync('git',['-c',safe,...args],{cwd,encoding:'utf8',...options});
const env={...process.env,GCM_INTERACTIVE:'Never',GIT_TERMINAL_PROMPT:'0'};
const credential=git(['credential','fill'],{env,input:'protocol=https\nhost=github.com\nusername=arya4100\n\n',stdio:['pipe','pipe','pipe']});
const fields=Object.fromEntries(credential.trim().split('\n').map(line=>{const separator=line.indexOf('=');return[line.slice(0,separator),line.slice(separator+1)];}));
if(!fields.password)throw Error('GitHub authentication unavailable; no token was printed or saved.');
const headers={Authorization:'Bearer '+fields.password,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
async function api(path,options={}){const response=await fetch('https://api.github.com'+path,{headers,...options});if(!response.ok)throw Error(`GitHub API ${response.status}: ${path}`);return response.json();}
const user=await api('/user');console.log('Authenticated GitHub account:',user.login);
mkdirSync('.tools',{recursive:true});let repo;
if(existsSync('.tools/github-target.json')){const target=JSON.parse(readFileSync('.tools/github-target.json','utf8'));repo=await api('/repos/'+target.full_name);}else{
 for(const name of ['smartstock-inventory-pwa','smartstock-coursework-2026','smartstock-inventory-2026-'+Date.now()]){const response=await fetch(`https://api.github.com/repos/${user.login}/${name}`,{headers});if(response.status!==404)continue;repo=await api('/user/repos',{method:'POST',body:JSON.stringify({name,description:'SmartStock inventory PWA — React, Express, MongoDB transactions, offline sync and Web Push',private:true,auto_init:false})});break;}
 if(!repo)throw Error('Could not select a new repository name.');writeFileSync('.tools/github-target.json',JSON.stringify({full_name:repo.full_name,html_url:repo.html_url,clone_url:repo.clone_url,private:repo.private},null,2));
}
const submission=JSON.parse(readFileSync('docs/submission.json','utf8'));submission.githubUrl=repo.html_url;submission.githubVisibility='private';writeFileSync('docs/submission.json',JSON.stringify(submission,null,2));
if(process.argv.includes('--prepare-only')){console.log('Prepared private repository:',repo.html_url);process.exit(0);}
const ignored=git(['check-ignore','.env','.data/','.tools/','.evidence-private/','node_modules/']).trim().split('\n');if(ignored.length<5)throw Error('Private file ignore check failed');
git(['config','user.name',user.name||user.login]);git(['config','user.email',`${user.id}+${user.login}@users.noreply.github.com`]);
git(['add','.']);
const staged=git(['diff','--cached','--name-only']).trim().split('\n');if(staged.some(path=>/^\.env$|^\.data\/|^\.tools\/|^\.evidence-private\/|node_modules\//.test(path)))throw Error('Private runtime file staged; refusing publication');
const secrets=readFileSync('.env','utf8').split(/\r?\n/).filter(line=>/^(JWT_SECRET|VAPID_PRIVATE_KEY)=/.test(line)).map(line=>line.slice(line.indexOf('=')+1)).filter(Boolean);
for(const path of staged.filter(p=>/\.(js|jsx|json|md|txt|cmd|ps1|yml|yaml|example)$/.test(p))){const source=readFileSync(path,'utf8');if(secrets.some(secret=>source.includes(secret)))throw Error('A server secret appears in staged source: '+path);}
git(['commit','-m','Complete SmartStock inventory PWA, verification evidence and reports']);
git(['branch','-M','main']);let remotes=git(['remote']).trim().split('\n');if(remotes.includes('origin')){if(git(['remote','get-url','origin']).trim()!==repo.clone_url)throw Error('Existing origin differs; refusing replacement');}else git(['remote','add','origin',repo.clone_url]);
git(['push','-u','origin','main'],{env,stdio:['ignore','pipe','pipe']});
const commit=git(['rev-parse','HEAD']).trim();const metadata=await api('/repos/'+repo.full_name+'/commits/main');if(metadata.sha!==commit)throw Error('Remote commit verification failed');
writeFileSync('evidence/github-verification.json',JSON.stringify({status:'passed',url:repo.html_url,visibility:repo.private?'private':'public',commit,remoteCommitVerified:true,secretFilesExcluded:true},null,2));console.log('Published and verified:',repo.html_url,'commit',commit);
