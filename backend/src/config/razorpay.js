import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined in environment variables. Payments will fail.');
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export default razorpay;
