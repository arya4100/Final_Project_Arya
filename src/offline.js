import {openDB} from 'idb';
import {api} from './api';
const database=openDB('smartstock-private',1,{upgrade(db){db.createObjectStore('snapshots');db.createObjectStore('queue',{keyPath:'clientId'});}});
export async function saveSnapshot(user,data){return(await database).put('snapshots',{...data,savedAt:new Date().toISOString()},user);}
export async function snapshot(user){return(await database).get('snapshots',user);}
export async function enqueue(user,movement){return(await database).put('queue',{clientId:movement.clientId,user,movement,state:'pending'});}
export async function pending(user){return(await(await database).getAll('queue')).filter(x=>x.user===user);}
export async function discard(clientId){return(await database).delete('queue',clientId);}
export async function clearPrivate(){const db=await database;await db.clear('snapshots');await db.clear('queue');}
let syncing=false;
export async function synchronize(user){if(syncing)return;syncing=true;try{for(const item of await pending(user)){try{await api('/movements',{method:'POST',body:item.movement});await discard(item.clientId);}catch(e){if(!e.status)break;await(await database).put('queue',{...item,state:'conflict',error:e.message});}}}finally{syncing=false;}}
export async function enablePush(){if(!('PushManager'in window))throw Error('This browser does not support Web Push.');const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('Notification permission was not granted.');const {publicKey}=await api('/push/key');if(!publicKey)throw Error('Generate server VAPID keys first.');const registration=await navigator.serviceWorker.ready;const raw=atob(publicKey.replace(/-/g,'+').replace(/_/g,'/'));const key=Uint8Array.from(raw,c=>c.charCodeAt(0));const subscription=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});await api('/push/subscribe',{method:'POST',body:subscription.toJSON()});}
