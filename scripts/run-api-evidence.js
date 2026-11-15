import newman from 'newman';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const collection=JSON.parse(readFileSync('docs/SmartStock.postman_collection.json','utf8'));
const run=newman.run({collection,reporters:['cli'],timeoutRequest:10000});
run.on('done',(error,summary)=>{if(error)throw error;const result={tool:'Newman — official Postman collection runner',executedAt:new Date().toISOString(),stats:summary.run.stats,failures:summary.run.failures.map(f=>({source:f.source?.name,error:f.error?.message})),requests:summary.run.executions.map(e=>({name:e.item.name,method:e.request.method,url:e.request.url.toString(),status:e.response?.code,body:e.item.name.includes('Login')?'Authentication response omitted to protect bearer tokens':e.response?.stream?.toString(),assertions:(e.assertions||[]).map(a=>({name:a.assertion,passed:!a.error}))}))};writeFileSync('evidence/postman-run.json',JSON.stringify(result,null,2));assert.equal(result.failures.length,0);console.log('Sanitized Postman collection run saved.');});
