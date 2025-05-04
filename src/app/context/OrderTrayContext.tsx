// /var/www/html/nvrs-ts-v1/src/app/context/OrderTrayContext.tsx
"use client"

/**
 * OrderTrayContext
 * 
 * This context provides global state management for the restaurant ordering system.
 * It maintains the state of the order tray and provides functions to manipulate the order.
 * 
 * Key features:
 * - Maintains list of items in the order
 * - Persists order data in localStorage
 * - Provides functions to add, remove, and update items
 * - Calculates order totals
 * - Controls order tray panel visibility
 */

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { MenuItem } from '@/types/menu';

// Define the structure for items in the order tray
// This extends the basic MenuItem with order-specific properties
export interface OrderTrayItem {
    item_id: number;
    item_name: string;
    price: number;
    quantity: number;
    special_instructions?: string;
}

// Define the context type with all functions and state that will be available
type OrderTrayContextType = {
    // State
    orderItems: OrderTrayItem[];
    isOrderTrayOpen: boolean;

    // Order manipulation functions
    addToOrder: (menuItem: MenuItem, quantity: number, specialInstructions?: string) => void;
    removeFromOrder: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    updateSpecialInstructions: (itemId: number, instructions: string) => void;
    clearOrder: () => void;

    // Helper functions
    getTotalItems: () => number;
    getTotalPrice: () => number;
    toggleOrderTray: () => void;
};

// Create the context with default values
// These default values are used if a component tries to use the context without a provider
const OrderTrayContext = createContext<OrderTrayContextType>({
    orderItems: [],
    addToOrder: () => { },
    removeFromOrder: () => { },
    updateQuantity: () => { },
    updateSpecialInstructions: () => { },
    clearOrder: () => { },
    getTotalItems: () => 0,
    getTotalPrice: () => 0,
    isOrderTrayOpen: false,
    toggleOrderTray: () => { },
});

/**
 * OrderTrayProvider component
 * 
 * Provides the OrderTrayContext to all child components.
 * This should wrap the components that need access to the order state.
 * Typically, this would be placed near the root of your application.
 */
export const OrderTrayProvider = ({ children }: { children: ReactNode }) => {
    // Initialize order items state from localStorage if available
    // This allows the order to persist across page refreshes
    const [orderItems, setOrderItems] = useState<OrderTrayItem[]>(() => {
        if (typeof window !== 'undefined') {
            const savedOrder = localStorage.getItem('orderItems');
            return savedOrder ? JSON.parse(savedOrder) : [];
        }
        return [];
    });

    // State to control the visibility of the order tray panel
    const [isOrderTrayOpen, setIsOrderTrayOpen] = useState(false);

    // Toggle the order tray visibility
    const toggleOrderTray = () => {
        setIsOrderTrayOpen(prev => !prev);
    };

    // Save order to localStorage whenever it changes
    // This ensures the order persists even if the user refreshes the page
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('orderItems', JSON.stringify(orderItems));
        }
    }, [orderItems]);

    /**
     * Add a menu item to the order
     * 
     * If the item already exists in the order, its quantity is increased
     * If it's a new item, it's added to the order
     * 
     * @param menuItem - The menu item to add
     * @param quantity - The quantity to add
     * @param specialInstructions - Any special instructions for the item
     */
    const addToOrder = (menuItem: MenuItem, quantity: number, specialInstructions?: string) => {
        setOrderItems(prevItems => {
            //console.log to check process flow
            console.log('Before adding to order: ', { orderItems, isOrderTrayOpen });
            // Check if item already exists in order
            const existingItemIndex = prevItems.findIndex(item => item.item_id === menuItem.item_id);

            if (existingItemIndex !== -1) {
                // If item exists, update its quantity
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + quantity,
                    special_instructions: specialInstructions || updatedItems[existingItemIndex].special_instructions
                };
                return updatedItems;
            } else {
                // Otherwise, add new item to order
                return [...prevItems, {
                    item_id: menuItem.item_id,
                    item_name: menuItem.item_name,
                    price: menuItem.price,
                    quantity,
                    special_instructions: specialInstructions || ''
                }];
            }
        });

        // Open the order tray when adding an item for better UX
        // This gives immediate feedback that the item was added
        if (!isOrderTrayOpen) {
            setIsOrderTrayOpen(true);
        }
    };

    /**
     * Remove an item from the order
     * 
     * @param itemId - The ID of the item to remove
     */
    const removeFromOrder = (itemId: number) => {
        setOrderItems(prevItems => prevItems.filter(item => item.item_id !== itemId));
    };

    /**
     * Update the quantity of an item in the order
     * If quantity is set to 0 or less, the item is removed
     * 
     * @param itemId - The ID of the item to update
     * @param quantity - The new quantity
     */
    const updateQuantity = (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromOrder(itemId);
            return;
        }

        setOrderItems(prevItems =>
            prevItems.map(item =>
                item.item_id === itemId ? { ...item, quantity } : item
            )
        );
    };

    /**
     * Update special instructions for an item
     * 
     * @param itemId - The ID of the item to update
     * @param instructions - The new special instructions
     */
    const updateSpecialInstructions = (itemId: number, instructions: string) => {
        setOrderItems(prevItems =>
            prevItems.map(item =>
                item.item_id === itemId ? { ...item, special_instructions: instructions } : item
            )
        );
    };

    /**
     * Clear all items from the order
     */
    const clearOrder = () => {
        setOrderItems([]);
    };

    /**
     * Calculate total number of items in order
     * This counts each item's quantity, not just the number of different items
     * 
     * @returns The total number of items
     */
    const getTotalItems = () => {
        return orderItems.reduce((total, item) => total + item.quantity, 0);
    };

    /**
     * Calculate total price of all items in order
     * 
     * @returns The total price as a number
     */
    const getTotalPrice = () => {
        return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Provide the order tray state and functions to all child components
    return (
        <OrderTrayContext.Provider value={{
            orderItems,
            addToOrder,
            removeFromOrder,
            updateQuantity,
            updateSpecialInstructions,
            clearOrder,
            getTotalItems,
            getTotalPrice,
            isOrderTrayOpen,
            toggleOrderTray
        }}>
            {children}
        </OrderTrayContext.Provider>
    );
};

/**
 * Custom hook to use the order tray context
 * 
 * This makes it easier to access the order tray state and functions
 * from any component that needs it
 * 
 * Usage example:
 * const { addToOrder, getTotalItems } = useOrderTray();
 */
export const useOrderTray = () => useContext(OrderTrayContext);
