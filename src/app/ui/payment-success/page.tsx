"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const paymentIntentId = searchParams.get('payment_intent');

    useEffect(() => {
        if (!paymentIntentId) {
            router.push('/');
        }
    }, [paymentIntentId, router]);

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-4">Your order has been confirmed.</p>
                <p className="text-sm text-gray-500 mb-6">Payment ID: {paymentIntentId}</p>
                <Link
                    href="/"
                    className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
                >
                    Continue Shopping
                </Link>
            </div>
        </main>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}