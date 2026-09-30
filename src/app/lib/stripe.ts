import { loadStripe } from '@stripe/stripe-js';

// Get from Stripe Dashboard - replace with your publishable key
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai.alexanderthenotsobad.us/';