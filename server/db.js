import {MongoClient} from 'mongodb';
import bcrypt from 'bcryptjs';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
export async function connectDatabase(){
 let replica;
 const persistent=process.env.LOCAL_DATABASE==='true'&&process.env.DEMO_DATABASE!=='true';
 if(process.env.DEMO_DATABASE==='true'||persistent){
  const {MongoMemoryReplSet}=await import('mongodb-memory-server');
  const options={replSet:{count:1},binary:{downloadDir:resolve('.mongo')}};
  if(persistent){const dbPath=resolve(process.env.LOCAL_DATABASE_PATH||'.data/mongodb');await mkdir(dbPath,{recursive:true});options.instanceOpts=[{dbPath,port:Number(process.env.LOCAL_DATABASE_PORT||27028)}];options.replSet={count:1,name:'smartstock-local',storageEngine:'wiredTiger',ip:'127.0.0.1'};}
  // A persistent replica member must keep the host:port stored in its on-disk config.
  // Disable the test library's free-port rotation for this local development mode.
  class PersistentReplicaSet extends MongoMemoryReplSet{getInstanceOpts(...args){return {...super.getInstanceOpts(...args),portGeneration:false};}}
  replica=await(persistent?PersistentReplicaSet:MongoMemoryReplSet).create(options);
 }
 const client=new MongoClient(replica?replica.getUri():process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});await client.connect();
 const db=client.db(process.env.MONGODB_DATABASE||'smartstock');
 await Promise.all([db.collection('users').createIndex({email:1},{unique:true}),db.collection('products').createIndex({sku:1},{unique:true}),db.collection('movements').createIndex({clientId:1},{unique:true}),db.collection('commands').createIndex({clientId:1},{unique:true}),db.collection('subscriptions').createIndex({userId:1,endpoint:1},{unique:true})]);
 if(process.env.SEED_DEMO==='true'&&await db.collection('users').countDocuments()===0){
 const passwordHash=await bcrypt.hash('SmartStock!2026',12);
 await db.collection('users').insertMany([{name:'Arya Patel',email:'manager@smartstock.demo',role:'manager',passwordHash},{name:'Jamie Lee',email:'employee@smartstock.demo',role:'employee',passwordHash}]);
 await db.collection('products').insertMany([['Organic rolled oats','PAN-001','Pantry',6.9,48,12],['Oat milk original','BEV-002','Beverages',4.5,8,15],['Sourdough loaf','FRE-003','Fresh',8.5,24,8],['House blend coffee','BEV-004','Beverages',18.9,36,10],['Extra virgin olive oil','PAN-005','Pantry',14.5,6,10],['Lemon dish soap','HOU-006','Household',5.9,32,8],['Free-range eggs','FRE-007','Fresh',9.5,0,12],['Wildflower honey','PAN-008','Pantry',12.9,27,6]].map(([name,sku,category,price,quantity,minimum])=>({name,sku,category,price,quantity,minimum,version:0,updatedAt:new Date()})));
 }
 return {client,db,persistent,close:async()=>{await client.close();await replica?.stop(persistent?{doCleanup:false,force:false}:undefined);}};
}
