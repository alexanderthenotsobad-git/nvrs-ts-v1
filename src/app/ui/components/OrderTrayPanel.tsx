// /var/www/html/nvrs-ts-v1-ai-v1/src/app/ui/components/OrderTrayPanel.tsx

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderTray } from '../context/OrderTrayContext';
import { useUserRole } from '../context/UserContext';
import { Button } from '@/ui/button';
import { X, Minus, Plus, Trash2, Bell, Menu } from 'lucide-react';
import TrayIcon from '@/ui/icons/TrayIcon';
import { CheckoutModal } from '@/ui/components/CheckoutModal';
import { API_BASE_URL } from '@/lib/stripe';

const OrderTrayPanel = () => {
    const router = useRouter();

    // Order context
    const {
        orderItems,
        removeFromOrder,
        updateQuantity,
        clearOrder,
        getTotalItems,
        getTotalPrice,
        isOrderTrayOpen,
        toggleOrderTray
        // Debug: track showCheckout state changes
    } = useOrderTray();

    // User context
    const { currentPatron } = useUserRole();

    // Local UI state
    const [showCheckout, setShowCheckout] = useState(false);
    const [showBellNotification, setShowBellNotification] = useState(false);

    // Format price helper
    const formatPrice = (price: number): string => price.toFixed(2);

    // Browse Menu
    const handleBrowseMenu = () => {
        router.push('/menu');
        toggleOrderTray();
    };

    // Ring the Bell
    const handleRingBell = async () => {
        if (!currentPatron) {
            alert('Please select a patron first');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/notify-service`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patron_id: currentPatron.patron_id,
                    patron_name: currentPatron.patron_name,
                })
            });

            if (response.ok) {
                alert(`🔔 Service notified! ${currentPatron.patron_name} needs assistance.`);
                setShowBellNotification(true);
                setTimeout(() => setShowBellNotification(false), 3000);
            } else {
                alert('Service notification failed. Please try again.');
            }
        } catch (error) {
            console.error('Ring bell error:', error);
            alert('Service notification failed. Please try again.');
        }
    };

    // Open checkout modal
    const handleCheckoutClick = () => {
        console.log('🔍 Checkout clicked!');
        console.log('Items:', orderItems);
        console.log('Patron:', currentPatron);

        if (orderItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        setShowCheckout(true);
    };

    // Handle successful payment
    const handlePaymentSuccess = () => {
        clearOrder();
        toggleOrderTray();
    };

    return (
        <>
            {/* Floating Bell Notification */}
            {showBellNotification && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg text-center animate-bounce">
                    🔔 Staff has been notified!
                </div>
            )}

            {/* Mobile Order Button */}
            <div className="fixed bottom-4 right-4 md:hidden z-30">
                <Button
                    onClick={toggleOrderTray}
                    className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center"
                    aria-label="Open order tray"
                >
                    <TrayIcon size={24} className="text-white" />
                    {getTotalItems() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                            {getTotalItems()}
                        </span>
                    )}
                </Button>
            </div>

            {/* Desktop Order Button */}
            <div className="hidden md:block fixed bottom-4 right-4 z-30">
                <Button
                    onClick={toggleOrderTray}
                    className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center"
                    aria-label="Open order tray"
                >
                    <TrayIcon size={24} className="text-white" />
                    {getTotalItems() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                            {getTotalItems()}
                        </span>
                    )}
                </Button>
            </div>

            {/* Order Tray Panel */}
            <div
                className={`fixed top-0 right-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 transform ${isOrderTrayOpen ? 'translate-x-0' : 'translate-x-full'
                    } w-full md:w-96`}
                aria-hidden={!isOrderTrayOpen}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                        <div className="flex items-center">
                            <h2 className="text-xl font-semibold">Your Order</h2>
                            {getTotalItems() > 0 && (
                                <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                                    {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={toggleOrderTray}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Close order tray"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Patron Display */}
                    <div className="px-4 py-2 bg-blue-50 border-b text-sm flex items-center justify-between">
                        <span className="text-gray-600">Ordering as:</span>
                        <span className="font-semibold text-blue-700">
                            {currentPatron ? currentPatron.patron_name : 'Not selected'}
                        </span>
                        {!currentPatron && (
                            <span className="text-red-500 text-xs ml-2">
                                (Select from login)
                            </span>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="flex-grow overflow-y-auto p-4">
                        {orderItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <TrayIcon size={48} className="mb-2 opacity-30" />
                                <p>Your order tray is empty</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={handleBrowseMenu}
                                >
                                    Browse Menu
                                </Button>
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {orderItems.map((item) => (
                                    <li key={item.item_id} className="border rounded-lg p-3 bg-white shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium">{item.item_name}</h3>
                                                <p className="text-gray-600">${formatPrice(item.price)} each</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromOrder(item.item_id)}
                                                className="text-red-500 hover:text-red-700"
                                                aria-label={`Remove ${item.item_name} from order`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center mt-2 space-x-2">
                                            <div className="flex items-center border rounded">
                                                <button
                                                    onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="px-3 py-1">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <span className="ml-auto font-medium">
                                                ${formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {orderItems.length > 0 && (
                        <div className="border-t p-4 bg-gray-50">
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${formatPrice(getTotalPrice())}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total:</span>
                                    <span>${formatPrice(getTotalPrice())}</span>
                                </div>
                            </div>

                            {/* Three buttons */}
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleBrowseMenu}
                                    className="text-sm"
                                >
                                    <Menu className="w-4 h-4 mr-1" />
                                    Browse
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handleRingBell}
                                    className="text-sm"
                                    disabled={!currentPatron}
                                >
                                    <Bell className="w-4 h-4 mr-1" />
                                    Ring Bell
                                </Button>

                                <Button
                                    onClick={() => {
                                        console.log('🔥 Button clicked!');
                                        handleCheckoutClick();
                                    }} className="text-sm bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={!currentPatron}
                                >
                                    Checkout
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                onClick={clearOrder}
                                className="w-full mt-2 text-gray-500 hover:text-red-500 text-sm"
                            >
                                Clear Tray
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Modal (handles everything) */}
            <CheckoutModal

                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                onSuccess={handlePaymentSuccess}
                items={orderItems}
                total={getTotalPrice()}
                patron={currentPatron}
            />
        </>
    );
};

export default OrderTrayPanel;