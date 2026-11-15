import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {ObjectId} from 'mongodb';
import {randomUUID} from 'node:crypto';
import pino from 'pino';
import webpush from 'web-push';
import {z} from 'zod';
import {productSchema,movementSchema,credentials,reconcile,fail} from './domain.js';
export function createApp({db,client,secret,origin='http://127.0.0.1:5173',logger=pino(),pushClient=webpush}){
 const app=express();const revoked=new Map();
 app.use(helmet({contentSecurityPolicy:{directives:{'script-src':["'self'"],'img-src':["'self'",'data:'],'style-src':["'self'","'unsafe-inline'"]}}}));app.use(express.json({limit:'32kb'}));app.use(cookieParser());
 app.use((req,res,next)=>{req.requestId=randomUUID();res.set('X-Request-ID',req.requestId);res.set('Cache-Control','no-store');res.on('finish',()=>logger.info({requestId:req.requestId,method:req.method,path:req.path,status:res.statusCode},'HTTP request'));if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.get('origin')&&![origin,'http://127.0.0.1:4000'].includes(req.get('origin')))return res.status(403).json({error:'Origin not allowed'});next();});
 const users=db.collection('users'),products=db.collection('products'),movements=db.collection('movements'),subscriptions=db.collection('subscriptions');
 const id=v=>{if(!/^[a-f0-9]{24}$/.test(v))fail(400,'Invalid record ID');return new ObjectId(v);};
 const view=u=>({id:u._id.toString(),name:u.name,email:u.email,role:u.role});
 function auth(req,res,next){try{const token=req.cookies.session||req.get('authorization')?.replace(/^Bearer /,'');const claims=jwt.verify(token,secret,{algorithms:['HS256'],issuer:'smartstock',audience:'smartstock-app'});if(revoked.has(claims.jti))throw Error();req.user=claims;next();}catch{res.status(401).json({error:'Please sign in again.'});}}
 const manager=(req,res,next)=>req.user.role==='manager'?next():res.status(403).json({error:'Manager permission required'});
 const limiter=rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:'draft-7',legacyHeaders:false});
 app.get('/api/health',async(req,res)=>{await db.command({ping:1});res.json({status:'ok',database:'MongoDB'});});
 app.post('/api/auth/register',limiter,async(req,res)=>{const data=credentials.extend({name:z.string().trim().min(2).max(80)}).strict().parse(req.body);await users.insertOne({name:data.name,email:data.email,passwordHash:await bcrypt.hash(data.password,12),role:'employee'});res.status(201).json({message:'Account created. Sign in to continue.'});});
 app.post('/api/auth/login',limiter,async(req,res)=>{const data=credentials.parse(req.body);const user=await users.findOne({email:data.email});if(!user||!await bcrypt.compare(data.password,user.passwordHash))fail(401,'Email or password is incorrect');const token=jwt.sign({sub:user._id.toString(),role:user.role,name:user.name},secret,{expiresIn:'2h',issuer:'smartstock',audience:'smartstock-app',jwtid:randomUUID()});res.cookie('session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:7200000});res.json({user:view(user),token});});
 app.post('/api/auth/logout',auth,(req,res)=>{revoked.set(req.user.jti,req.user.exp);for(const [key,expiry]of revoked)if(expiry<Date.now()/1000)revoked.delete(key);res.clearCookie('session');res.json({message:'Signed out'});});
 app.get('/api/auth/me',auth,async(req,res)=>{const user=await users.findOne({_id:id(req.user.sub)});if(!user)fail(401,'Account unavailable');res.json(view(user));});
 app.get('/api/products',auth,async(req,res)=>res.json(await products.find().sort({name:1}).toArray()));
 app.get('/api/products/:id',auth,async(req,res)=>{const p=await products.findOne({_id:id(req.params.id)});if(!p)fail(404,'Product not found');res.json(p);});
 app.post('/api/products',auth,manager,async(req,res)=>{const data=productSchema.parse(req.body);const result=await products.insertOne({...data,version:0,updatedAt:new Date()});res.status(201).json({...data,_id:result.insertedId});});
 app.put('/api/products/:id',auth,manager,async(req,res)=>{const {version,...data}=z.object({version:z.number().int().min(0)}).passthrough().parse(req.body);const parsed=productSchema.parse(data);const session=client.startSession();let updated;try{await session.withTransaction(async()=>{const old=await products.findOne({_id:id(req.params.id)},{session});if(!old)fail(404,'Product not found');if(old.version!==version)fail(409,'Product changed. Refresh and try again.');if(old.quantity!==parsed.quantity)fail(400,'Use a stock movement to change quantity');updated=await products.findOneAndUpdate({_id:old._id,version},{$set:{...parsed,updatedAt:new Date()},$inc:{version:1}},{session,returnDocument:'after'});});}finally{await session.endSession();}res.json(updated);});
 app.delete('/api/products/:id',auth,manager,async(req,res)=>{const session=client.startSession();try{await session.withTransaction(async()=>{const p=await products.findOne({_id:id(req.params.id)},{session});if(!p)fail(404,'Product not found');if(await movements.findOne({productId:req.params.id},{session}))fail(409,'Keep products with movement history for audit integrity.');await products.deleteOne({_id:p._id},{session});});}finally{await session.endSession();}res.json({message:'Product deleted'});});
 app.get('/api/movements',auth,async(req,res)=>res.json(await movements.find().sort({createdAt:-1}).limit(500).toArray()));
 app.get('/api/movements/:id',auth,async(req,res)=>{const m=await movements.findOne({_id:id(req.params.id)});if(!m)fail(404,'Movement not found');res.json(m);});
 async function notify(product,filter={}){if(!process.env.VAPID_PRIVATE_KEY)return {sent:0,failed:0};pushClient.setVapidDetails(process.env.VAPID_SUBJECT,process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);let sent=0,failed=0;for(const sub of await subscriptions.find(filter).toArray()){try{await pushClient.sendNotification(sub.subscription,JSON.stringify({title:'Low stock · SmartStock',body:`${product.name}: ${product.quantity} remaining`,url:'/'}));sent++;}catch(e){failed++;if([404,410].includes(e.statusCode))await subscriptions.deleteOne({_id:sub._id});logger.warn({status:e.statusCode},'Push delivery failed');}}return {sent,failed};}
 async function mutate(req,res,mode){const input=mode==='delete'?null:movementSchema.parse(req.body);const session=client.startSession();let result,low;
 try{await session.withTransaction(async()=>{low=null;const previous=mode==='create'?null:await movements.findOne({_id:id(req.params.id)},{session});if(mode!=='create'&&!previous)fail(404,'Movement not found');if(mode==='create'){const command=await db.collection('commands').findOne({clientId:input.clientId},{session});const duplicate=command?.result||await movements.findOne({clientId:input.clientId},{session});if(duplicate){if(duplicate.actorId!==req.user.sub||['productId','type','quantity','note'].some(k=>duplicate[k]!==input[k]))fail(409,'Idempotency key already used for different data');result=duplicate;return;}}
 if(previous&&input&&(previous.productId!==input.productId||previous.clientId!==input.clientId))fail(400,'Product and client ID cannot change');
 const product=await products.findOne({_id:id((input||previous).productId)},{session});if(!product)fail(404,'Product not found');const quantity=reconcile(product.quantity,previous,input);
 await products.updateOne({_id:product._id},{$set:{quantity,updatedAt:new Date()},$inc:{version:1}},{session});
 if(mode==='delete'){await movements.deleteOne({_id:previous._id},{session});result={message:'Movement reversed and deleted'};}else{const record={...input,actorId:previous?.actorId||req.user.sub,actor:previous?.actor||req.user.name,createdAt:previous?.createdAt||new Date(),updatedBy:req.user.name,updatedAt:new Date()};if(previous){await movements.updateOne({_id:previous._id},{$set:record},{session});result={...record,_id:previous._id};}else{const inserted=await movements.insertOne(record,{session});result={...record,_id:inserted.insertedId};}}
 if(mode==='create')await db.collection('commands').insertOne({clientId:input.clientId,result,at:new Date()},{session});
 await db.collection('audit').insertOne({action:`movement.${mode}`,actorId:req.user.sub,recordId:result._id||previous._id,before:previous,after:input,at:new Date()},{session});
 if(product.quantity>product.minimum&&quantity<=product.minimum)low={...product,quantity};});}finally{await session.endSession();}
 if(low)notify(low).catch(e=>logger.error({message:e.message},'Notification failed after committed movement'));res.status(mode==='create'?201:200).json(result);}
 app.post('/api/movements',auth,(req,res)=>mutate(req,res,'create'));
 app.put('/api/movements/:id',auth,manager,(req,res)=>mutate(req,res,'update'));
 app.delete('/api/movements/:id',auth,manager,(req,res)=>mutate(req,res,'delete'));
 app.get('/api/push/key',auth,(req,res)=>res.json({publicKey:process.env.VAPID_PUBLIC_KEY||null}));
 const subscriptionSchema=z.object({endpoint:z.string().url().max(2048).refine(v=>{const u=new URL(v);return u.protocol==='https:'&&(u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com'||u.hostname.endsWith('.push.apple.com')||u.hostname.endsWith('.notify.windows.com'));},'Unsupported push provider'),keys:z.object({p256dh:z.string().min(40).max(200),auth:z.string().min(10).max(100)}),expirationTime:z.number().nullable().optional()});
 app.post('/api/push/subscribe',auth,async(req,res)=>{const subscription=subscriptionSchema.parse(req.body);await subscriptions.updateOne({userId:req.user.sub,endpoint:subscription.endpoint},{$set:{subscription}},{upsert:true});res.status(201).json({message:'Notifications enabled'});});
 app.delete('/api/push/subscribe',auth,async(req,res)=>{await subscriptions.deleteMany({userId:req.user.sub});res.json({message:'Subscriptions removed'});});
 app.post('/api/push/test',auth,async(req,res)=>{const {endpoint}=z.object({endpoint:z.string().url().max(2048).optional()}).strict().parse(req.body||{});res.json(await notify({name:'Test notification',quantity:3},{userId:req.user.sub,...(endpoint?{endpoint}:{})}));});
 app.use('/api',(req,res)=>res.status(404).json({error:'Endpoint not found'}));
 app.use((err,req,res,next)=>{const status=err instanceof z.ZodError?400:err.code===11000?409:err.status||500;logger[status>=500?'error':'warn']({requestId:req.requestId,status,message:err.message},'Request rejected');res.status(status).json({error:err instanceof z.ZodError?err.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '):err.code===11000?'This SKU, email, or client ID already exists':status===500?'Unexpected server error':err.message,requestId:req.requestId});});
 return app;
}
