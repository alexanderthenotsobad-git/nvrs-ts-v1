// /var/www/html/nvrs-ts-v1/src/app/ui/components/SimpleAddToOrderButton.tsx
"use client"

import { Button } from '@/ui/button';
import { ShoppingCart } from 'lucide-react';
import type { MenuItem } from '@/types/menu';
import { useOrderTray } from '@/context/OrderTrayContext';

interface SimpleAddToOrderButtonProps {
    menuItem: MenuItem;
}

const SimpleAddToOrderButton = ({ menuItem }: SimpleAddToOrderButtonProps) => {
    // Get the addToOrder function from our context
    const { addToOrder } = useOrderTray();

    // Simple handler function that logs and attempts to use the context
    const handleClick = () => {
        console.log('Add to order button clicked');
        console.log('Menu item:', menuItem);

        try {
            console.log('Context function available:', !!addToOrder);
            // Add 1 quantity of the item
            addToOrder(menuItem, 1);
            console.log('Item added to order');
        } catch (error) {
            console.error('Error adding to order:', error);
        }
    };

    return (
        <Button
            onClick={handleClick}
            variant="default"
            size="sm"
        >
            <ShoppingCart size={16} className="mr-1" />
            Add to Order (Simple)
        </Button>
    );
};

export default SimpleAddToOrderButton;