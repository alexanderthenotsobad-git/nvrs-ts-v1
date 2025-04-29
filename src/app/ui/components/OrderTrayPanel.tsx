// /var/www/html/nvrs-ts-v1/src/app/ui/components/OrderTrayPanel.tsx
"use client"

/**
 * OrderTrayPanel Component
 * 
 * This component displays the order tray as a side panel that slides in from the right.
 * It shows all items in the order, allows quantity adjustment, and provides
 * buttons to place or clear the order.
 * 
 * Features:
 * - Responsive design (full-width on mobile, fixed width on desktop)
 * - Sliding animation when opening/closing
 * - Shows order items with quantities and prices
 * - Displays order total
 * - Quantity adjustment controls
 * - Empty state display when no items are in the order
 */

import { useOrderTray } from '@/context/OrderTrayContext';
import { Button } from '@/ui/button';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';

const OrderTrayPanel = () => {
    // Get order state and functions from context
    const {
        orderItems,
        removeFromOrder,
        updateQuantity,
        clearOrder,
        getTotalItems,
        getTotalPrice,
        isOrderTrayOpen,
        toggleOrderTray
    } = useOrderTray();

    // State for managing special instructions input
    // Commented out for now - will be used in future implementation
    // const [showSpecialInstructions, setShowSpecialInstructions] = useState<number | null>(null);
    // const [specialInstructions, setSpecialInstructions] = useState<string>('');

    /**
     * Format a price number to a string with 2 decimal places
     * 
     * @param price - The price to format
     * @returns Formatted price string (e.g., "12.99")
     */
    const formatPrice = (price: number): string => {
        return price.toFixed(2);
    };

    /**
     * Handle quantity changes for items in the order
     * 
     * @param itemId - The ID of the item to update
     * @param newQuantity - The new quantity
     */
    const handleQuantityChange = (itemId: number, newQuantity: number) => {
        updateQuantity(itemId, newQuantity);
    };

    /**
     * Handle order submission
     * In a real app, this would send the order to your backend API
     * For this demo, it just shows an alert and clears the order
     */
    const handleSubmitOrder = () => {
        // In a real app, this would send the order to your backend API
        alert(`Order submitted! Total: $${formatPrice(getTotalPrice())}`);
        clearOrder();
    };

    return (
        <>
            {/* Mobile Order Button (visible on small screens only) */}
            <div className="fixed bottom-4 right-4 md:hidden z-30">
                <Button
                    onClick={toggleOrderTray}
                    className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center"
                    aria-label="Open order tray"
                >
                    <ShoppingCart className="h-6 w-6" />
                    {/* Badge showing number of items when there are items in the order */}
                    {getTotalItems() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                            {getTotalItems()}
                        </span>
                    )}
                </Button>
            </div>

            {/* Order Tray Panel - Side drawer that slides in from right */}
            <div
                className={`fixed top-0 right-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 transform ${isOrderTrayOpen ? 'translate-x-0' : 'translate-x-full'
                    } w-full md:w-96`}
                aria-hidden={!isOrderTrayOpen}
            >
                <div className="flex flex-col h-full">
                    {/* Header Section with Title and Close Button */}
                    <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                        <div className="flex items-center">
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            <h2 className="text-xl font-semibold">Your Order</h2>
                            {/* Item count badge */}
                            {getTotalItems() > 0 && (
                                <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                                    {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        {/* Close button */}
                        <button
                            onClick={toggleOrderTray}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Close order tray"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Order Items List - Scrollable area */}
                    <div className="flex-grow overflow-y-auto p-4">
                        {/* Empty state when no items in order */}
                        {orderItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <ShoppingCart className="h-12 w-12 mb-2 opacity-30" />
                                <p>Your order is empty</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={toggleOrderTray}
                                >
                                    Browse Menu
                                </Button>
                            </div>
                        ) : (
                            /* List of order items */
                            <ul className="space-y-4">
                                {orderItems.map((item) => (
                                    <li key={item.item_id} className="border rounded-lg p-3 bg-white shadow-sm">
                                        {/* Item header with name and remove button */}
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

                                        {/* Quantity Adjuster */}
                                        <div className="flex items-center mt-2 space-x-2">
                                            <div className="flex items-center border rounded">
                                                <button
                                                    onClick={() => handleQuantityChange(item.item_id, item.quantity - 1)}
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="px-3 py-1">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)}
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Item subtotal */}
                                            <span className="ml-auto font-medium">
                                                ${formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>

                                        {/* Special Instructions - if any */}
                                        {item.special_instructions && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p className="italic">&ldquo;{item.special_instructions}&rdquo;</p>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Order Summary & Checkout Section - Fixed at bottom */}
                    {orderItems.length > 0 && (
                        <div className="border-t p-4 bg-gray-50">
                            {/* Order total calculations */}
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

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={clearOrder}
                                >
                                    Clear Order
                                </Button>
                                <Button
                                    onClick={handleSubmitOrder}
                                >
                                    Place Order
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OrderTrayPanel;