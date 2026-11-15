import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
const run=promisify(execFile),result={recordedAt:new Date().toISOString()};
try{const tests=await run(process.execPath,['--test','--test-concurrency=1','tests/api.test.js','tests/domain.test.js'],{maxBuffer:2000000});writeFileSync('evidence/tests.txt',tests.stdout+tests.stderr);result.tests={status:'passed',total:Number(tests.stdout.match(/# tests (\d+)/)?.[1]),failed:Number(tests.stdout.match(/# fail (\d+)/)?.[1])};console.log('Tests:',result.tests);const npmCli=join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');const build=await run(process.execPath,[npmCli,'run','build'],{maxBuffer:2000000});writeFileSync('evidence/build.txt',build.stdout+build.stderr);result.build={status:'passed'};console.log('Production build passed');result.status='passed';}catch(e){result.status='failed';result.error=e.message;console.error(e.stdout||e.stderr||e.message);process.exitCode=1;}finally{writeFileSync('evidence/final-verification.json',JSON.stringify(result,null,2));}
