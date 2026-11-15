import { randomBytes } from 'node:crypto';
import { existsSync,readFileSync,writeFileSync } from 'node:fs';
import webpush from 'web-push';
if(existsSync('.env')){console.log('.env already exists; keys preserved.');process.exit(0);}
const keys=webpush.generateVAPIDKeys();
writeFileSync('.env',readFileSync('.env.example','utf8').replace('JWT_SECRET=','JWT_SECRET='+randomBytes(48).toString('hex')).replace('VAPID_PUBLIC_KEY=','VAPID_PUBLIC_KEY='+keys.publicKey).replace('VAPID_PRIVATE_KEY=','VAPID_PRIVATE_KEY='+keys.privateKey),{mode:0o600});
console.log('Generated JWT and VAPID secrets in ignored .env. Never commit this file.');
