import { API_BASE_URL } from './stripe';

export interface CreatePaymentIntentRequest {
    amount: number;
    currency: string;
    orderId?: number;
    metadata?: Record<string, string | number | boolean>;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
}

export const paymentService = {
    createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
        const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }

        return response.json();
    },
};