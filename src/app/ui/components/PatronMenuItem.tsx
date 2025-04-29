// /var/www/html/nvrs-ts-v1/src/app/ui/components/PatronMenuItem.tsx
"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { ShoppingCart } from 'lucide-react'
import type { MenuItem } from '@/types/menu'
import SimpleAddToOrderButton from './SimpleAddToOrderButton'
import { useOrderTray } from '@/context/OrderTrayContext'

interface PatronMenuItemProps {
    item: MenuItem;
}

const PatronMenuItem = ({ item }: PatronMenuItemProps) => {
    // Get the context directly to check if it's available
    const orderTrayContext = useOrderTray();

    // Format price helper function
    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
    }

    // Simple direct handler for debugging
    const handleDirectAdd = () => {
        console.log('Direct add button clicked');
        console.log('Order tray context available:', !!orderTrayContext);

        try {
            orderTrayContext.addToOrder(item, 1);
            console.log('Item added directly');
        } catch (error) {
            console.error('Error adding directly:', error);
        }
    };

    return (
        <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle>{item.item_name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 h-32 relative overflow-hidden rounded-md">
                    {item.image_id ? (
                        <Image
                            src={`https://api.alexanderthenotsobad.us/api/images/${item.image_id}`}
                            alt={item.item_name}
                            width={200}
                            height={200}
                            className="object-cover w-full h-full"
                            unoptimized={true}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                            No image available
                        </div>
                    )}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{item.item_desc}</p>

                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">${formatPrice(item.price)}</span>

                    <div className="flex space-x-2">
                        {/* Original SimpleAddToOrderButton component */}
                        <SimpleAddToOrderButton menuItem={item} />

                        {/* Direct button for debugging */}
                        <Button
                            onClick={handleDirectAdd}
                            variant="outline"
                            size="sm"
                        >
                            <ShoppingCart size={16} className="mr-1" />
                            Direct Add
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PatronMenuItem