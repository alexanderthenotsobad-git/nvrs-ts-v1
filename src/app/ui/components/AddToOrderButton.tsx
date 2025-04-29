// /var/www/html/nvrs-ts-v1/src/app/ui/components/AddToOrderButton.tsx
"use client"

/**
 * AddToOrderButton Component
 * 
 * This component provides a button that adds items to the order tray.
 * It includes:
 * - A quantity selector (+ and - buttons)
 * - An "Add to Order" button that shows feedback when clicked
 * 
 * This component is designed to be used within menu item cards.
 * 
 * Example usage:
 * <AddToOrderButton menuItem={item} />
 */

import { useState } from 'react';
import { useOrderTray } from '@/context/OrderTrayContext';
import { Button } from '@/ui/button';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import type { MenuItem } from '@/types/menu';

// Props definition
interface AddToOrderButtonProps {
    menuItem: MenuItem;
}

const AddToOrderButton = ({ menuItem }: AddToOrderButtonProps) => {
    // Get the addToOrder function from our context
    const { addToOrder } = useOrderTray();

    // Local state for quantity and button state
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    /**
     * Handle adding the item to the order
     * Shows visual feedback and resets after a delay
     */
    const handleAddToOrder = () => {
        // Add the item to the order (this will also open the order tray panel)
        addToOrder(menuItem, quantity);

        // Show visual feedback that the item was added
        setIsAdded(true);

        // Reset after 2 seconds
        setTimeout(() => {
            setIsAdded(false);
            setQuantity(1); // Reset quantity for next addition
        }, 2000);
    };

    /**
     * Increase the quantity
     */
    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    /**
     * Decrease the quantity (minimum 1)
     */
    const decreaseQuantity = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    return (
        <div className="flex items-center space-x-2">
            {/* Quantity selector */}
            <div className="flex items-center border rounded-md">
                <button
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                    onClick={decreaseQuantity}
                    disabled={isAdded || quantity <= 1}
                    aria-label="Decrease quantity"
                >
                    <Minus className="h-3 w-3" />
                </button>
                <span className="px-3 py-1">{quantity}</span>
                <button
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                    onClick={increaseQuantity}
                    disabled={isAdded}
                    aria-label="Increase quantity"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>

            {/* Add to Order button */}
            <Button
                onClick={handleAddToOrder}
                disabled={isAdded}
                className={isAdded ? "bg-green-600 hover:bg-green-600" : ""}
                aria-label={`Add ${quantity} ${menuItem.item_name} to order`}
            >
                {/* Button changes to show "Added" with a checkmark when clicked */}
                {isAdded ? (
                    <>
                        <Check size={16} className="mr-1" />
                        Added
                    </>
                ) : (
                    <>
                        <ShoppingCart size={16} className="mr-1" />
                        Add to Order
                    </>
                )}
            </Button>
        </div>
    );
};

export default AddToOrderButton;