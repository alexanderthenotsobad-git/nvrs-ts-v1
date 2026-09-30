// /var/www/html/nvrs-ts-v1-ai-v1/src/app/components/SummaryModal.tsx

"use client";

import React from 'react';
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

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
    items: OrderTrayItem[];
    total: number;
    patron: Patron | null;
    isProcessing?: boolean;  // ADDED - optional prop
}

export default function SummaryModal({
    isOpen,
    onClose,
    onContinue,
    items,
    total,
    patron,
    isProcessing = false,  // ADDED with default
}: SummaryModalProps) {
    if (items.length === 0) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Order Summary</DialogTitle>
                    <DialogDescription>
                        Please review your order before proceeding to payment.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-blue-50 p-3 rounded-lg mb-2 border border-blue-200">
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

                <div className="flex-1 overflow-y-auto max-h-60">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.item_id}
                                className="flex justify-between items-center border-b pb-2"
                            >
                                <div className="flex-1">
                                    <h4 className="font-medium">{item.item_name}</h4>
                                    <span className="text-sm text-gray-500">
                                        Qty: {item.quantity}
                                    </span>
                                </div>
                                <span className="font-semibold">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4 mt-2">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total:</span>
                        <span className="text-2xl font-bold text-blue-600">
                            ${total.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isProcessing}
                    >
                        Edit Order
                    </Button>
                    <Button
                        onClick={onContinue}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!patron || isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Continue to Payment'}
                    </Button>
                </div>

                {!patron && (
                    <p className="text-xs text-red-500 text-center mt-2">
                        Please select a patron from the login dropdown before continuing.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}