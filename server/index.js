import 'dotenv/config';
import express from 'express';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {connectDatabase} from './db.js';
import {createApp} from './app.js';
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw Error('Run npm run keys to generate .env first');
const connection=await connectDatabase();
const app=createApp({...connection,secret:process.env.JWT_SECRET,origin:process.env.APP_ORIGIN});
if(existsSync('dist/index.html')){app.use(express.static(resolve('dist')));app.get('/{*path}',(req,res)=>res.sendFile(resolve('dist/index.html')));}
const server=app.listen(process.env.PORT||4000,'127.0.0.1',()=>console.log('SmartStock API ready at http://127.0.0.1:4000'));
async function shutdown(){server.close();await connection.close();process.exit(0);}process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
