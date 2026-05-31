import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_please_configure_in_env_file';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  WARNING: STRIPE_SECRET_KEY is not defined or is empty in .env. Payments will fail.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
  maxNetworkRetries: 2,
});

export default stripe;

