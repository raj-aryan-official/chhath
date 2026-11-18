import Razorpay from 'razorpay';
import { env, isRazorpayConfigured } from './env.js';

let client = null;

export const getRazorpay = () => {
  if (!isRazorpayConfigured()) return null;
  if (!client) {
    client = new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
  }
  return client;
};
