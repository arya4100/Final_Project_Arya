import 'dotenv/config';
import {connectDatabase} from '../server/db.js';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
process.env.DEMO_DATABASE='false';process.env.LOCAL_DATABASE='true';
const marker='persistence-'+crypto.randomUUID();
let connection=await connectDatabase();
await connection.db.collection('verification').insertOne({_id:marker,purpose:'Persistent restart verification',createdAt:new Date()});
const before={database:connection.db.databaseName,products:await connection.db.collection('products').countDocuments(),persistent:connection.persistent};
await connection.close();
connection=await connectDatabase();
try{const saved=await connection.db.collection('verification').findOne({_id:marker});assert.ok(saved);assert.ok(connection.persistent);const topology=await connection.db.admin().command({replSetGetStatus:1});const result={status:'passed',before,after:{markerSurvived:true,products:await connection.db.collection('products').countDocuments(),replicaSet:topology.set,members:topology.members.map(m=>({name:m.name,state:m.stateStr,health:m.health}))},storage:'.data/mongodb (WiredTiger)',scope:'Local single-node persistence, not cloud high availability'};await connection.db.collection('verification').deleteOne({_id:marker});writeFileSync('evidence/persistence-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));}finally{await connection.close();}
