import {z} from 'zod';
export const productSchema=z.object({name:z.string().trim().min(2).max(100),sku:z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9-]+$/),category:z.enum(['Pantry','Beverages','Fresh','Household','Other']),price:z.number().min(0).max(100000),quantity:z.number().int().min(0).max(1000000),minimum:z.number().int().min(0).max(1000000)}).strict();
export const movementSchema=z.object({productId:z.string().regex(/^[a-f0-9]{24}$/),type:z.enum(['IN','OUT']),quantity:z.number().int().positive().max(1000000),note:z.string().trim().max(250).default(''),clientId:z.string().uuid()}).strict();
export const credentials=z.object({email:z.string().email().max(150).transform(v=>v.toLowerCase()),password:z.string().min(10).max(72)});
export function delta(m){return m.type==='IN'?m.quantity:-m.quantity;}
export function reconcile(current, previous, next) {
 const previousEffect = previous ? delta(previous) : 0;
 const nextEffect = next ? delta(next) : 0;
 const result = current - previousEffect + nextEffect;
 if (result < 0) {
  throw Object.assign(
   new Error('Insufficient stock. Refresh inventory and review this movement.'),
   {status: 409}
  );
 }
 return result;
}
export function fail(status,message){throw Object.assign(new Error(message),{status});}
