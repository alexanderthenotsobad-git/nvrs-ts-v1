// /var/www/html/nvrs-ts-v1-ai-v1/src/app/ui/components/CheckoutModal.tsx

"use client";

import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, API_BASE_URL } from '@/lib/stripe';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/ui/radix-dialog';
import { Button } from '@/ui/button';
import { OrderTrayItem } from '../context/OrderTrayContext';
import { Patron } from '../context/UserContext';

// Types
interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    items: OrderTrayItem[];
    total: number;
    patron: Patron | null;
}

type Step = 'summary' | 'payment' | 'success';

// Utility
const formatPrice = (price: number): string => price.toFixed(2);

// ============================================================
// Step 1: Summary Component
// ============================================================
const SummaryStep: React.FC<{
    items: OrderTrayItem[];
    total: number;
    patron: Patron | null;
    error: string | null;
    isProcessing: boolean;
    onContinue: () => void;
    onCancel: () => void;
}> = ({ items, total, patron, error, isProcessing, onContinue, onCancel }) => (
    <>
        <DialogHeader>
            <DialogTitle className="text-xl font-bold">Order Summary</DialogTitle>
            <DialogDescription>
                Review your order before proceeding to payment.
            </DialogDescription>
        </DialogHeader>

        {/* Patron info */}
        <div className="bg-blue-50 p-3 rounded-lg mb-2 border border-blue-200 mt-4">
            <span className="text-sm text-gray-600">Ordering as:</span>
            <span className="font-semibold ml-2 text-blue-700">
                {patron ? patron.patron_name : 'Not selected'}
            </span>
            {!patron && (
                <span className="text-sm text-red-500 ml-2">
                    (Please select a patron from the login dropdown)
                </span>
            )}
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto max-h-60 space-y-3">
            {items.map((item) => (
                <div key={item.item_id} className="flex justify-between items-center border-b pb-2">
                    <div className="flex-1">
                        <h4 className="font-medium">{item.item_name}</h4>
                        <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-semibold">${formatPrice(item.price * item.quantity)}</span>
                </div>
            ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">${formatPrice(total)}</span>
            </div>
        </div>

        {/* Error */}
        {error && (
            <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
            </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
            </Button>
            <Button
                onClick={onContinue}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!patron || isProcessing}
            >
                {isProcessing ? 'Processing...' : 'Continue to Payment'}
            </Button>
        </div>
    </>
);

// ============================================================
// Step 2: Payment Component
// ============================================================
const PaymentForm: React.FC<{
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}> = ({ amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: `${window.location.origin}/payment-success` },
            redirect: 'if_required',
        });

        if (error) {
            onError(error.message || 'Payment failed');
            setIsProcessing(false);
        } else {
            onSuccess();
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </button>
        </form>
    );
};

const PaymentStep: React.FC<{
    clientSecret: string;
    amount: number;
    error: string | null;
    onSuccess: () => void;
    onError: (error: string) => void;
}> = ({ clientSecret, amount, error, onSuccess, onError }) => (
    <>
        <DialogHeader>
            <DialogTitle className="text-xl font-bold">Complete Your Payment</DialogTitle>
            <DialogDescription>
                Enter your card details to complete the order.
            </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                    amount={amount}
                    onSuccess={onSuccess}
                    onError={onError}
                />
            </Elements>
        </div>
    </>
);

// ============================================================
// Step 3: Success Component
// ============================================================
const SuccessStep: React.FC<{
    items: OrderTrayItem[];
    total: number;
    onClose: () => void;
}> = ({ items, total, onClose }) => (
    <div className="flex flex-col items-center text-center py-4">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>

        <div className="w-full bg-gray-50 p-4 rounded-lg mb-4 text-left">
            <h4 className="font-semibold mb-2">Order Summary:</h4>
            {items.map((item) => (
                <div key={item.item_id} className="flex justify-between text-sm py-1 border-b">
                    <span>{item.item_name} x {item.quantity}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            ))}
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total:</span>
                <span>${formatPrice(total)}</span>
            </div>
        </div>

        <div className="flex gap-3 mt-4 w-full">
            <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
                Close
            </button>
            <button
                onClick={() => window.location.href = '/order-history'}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
                View Order History
            </button>
        </div>

        <button
            onClick={() => alert('Receipt sent to email!')}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
        >
            📧 Email Receipt
        </button>
    </div>
);

// ============================================================
// Main Component
// ============================================================
export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    items,
    total,
    patron,
}) => {
    // State
    const [step, setStep] = useState<Step>('summary');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | undefined>();

    // Handlers
    const handleContinueToPayment = async () => {
        if (!patron) {
            setError('Please select a patron first.');
            return;
        }
        if (items.length === 0) {
            setError('Your cart is empty.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(item => ({
                        item_id: item.item_id,
                        quantity: item.quantity
                    })),
                    patron_id: patron.patron_id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create payment intent');
            }

            const data = await response.json();
            setClientSecret(data.clientSecret);
            setStep('payment');
        } catch (error) {
            console.error('Payment initialization error:', error);
            setError(error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePaymentSuccess = () => {
        setStep('success');
        onSuccess();
    };

    const handleClose = () => {
        setStep('summary');
        setError(null);
        setClientSecret(undefined);
        onClose();
    };

    // Render by step
    const renderContent = () => {
        switch (step) {
            case 'summary':
                return (
                    <SummaryStep
                        items={items}
                        total={total}
                        patron={patron}
                        error={error}
                        isProcessing={isProcessing}
                        onContinue={handleContinueToPayment}
                        onCancel={handleClose}
                    />
                );
            case 'payment':
                return (
                    <PaymentStep
                        clientSecret={clientSecret!}
                        amount={total}
                        error={error}
                        onSuccess={handlePaymentSuccess}
                        onError={setError}
                    />
                );
            case 'success':
                return <SuccessStep items={items} total={total} onClose={handleClose} />;
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
};