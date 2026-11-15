const CACHE='smartstock-shell-v2';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/','/icon.svg','/manifest.webmanifest'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const {request}=event;const url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api'))return;event.respondWith((async()=>{const cache=await caches.open(CACHE);if(request.mode==='navigate'){try{const response=await fetch(request);if(response.ok)await cache.put('/',response.clone());return response;}catch{return await cache.match('/')||Response.error();}}const cached=await cache.match(request);if(cached)return cached;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;})());});
self.addEventListener('push',event=>{
 let payload={title:'SmartStock',body:'Your inventory needs attention.'};
 try{const incoming=event.data.json();if(typeof incoming.title==='string')payload.title=incoming.title;if(typeof incoming.body==='string')payload.body=incoming.body;}catch{}
 event.waitUntil((async()=>{
  let nativeNotification=true;
  try{await self.registration.showNotification(payload.title,{body:payload.body,icon:'/icon-192.png',badge:'/icon-192.png',tag:'smartstock-low-stock',renotify:true,requireInteraction:true,data:{url:'/'}});}catch{nativeNotification=false;}
  // This receipt is sent only by the real push event, never by the send-test button.
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows)client.postMessage({type:'SMARTSTOCK_PUSH_RECEIVED',title:payload.title,body:payload.body,nativeNotification});
 })());
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{if(windows.length)return windows[0].focus();return clients.openWindow('/');}));});
