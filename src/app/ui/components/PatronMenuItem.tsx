// /var/www/html/nvrs-ts-v1/src/app/ui/components/PatronMenuItem.tsx
"use client"

import { useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import type { MenuItem } from '@/types/menu'
import AddToOrderButton from './AddToOrderButton'
import { useOrderTray } from '@/context/OrderTrayContext'

interface PatronMenuItemProps {
    item: MenuItem;
}

const PatronMenuItem = ({ item }: PatronMenuItemProps) => {
    // Log when component renders
    console.log('PatronMenuItem rendering for item:', item.item_name);

    // Access context directly for testing
    const orderTrayContext = useOrderTray();

    // Debug on mount
    useEffect(() => {
        console.log('PatronMenuItem mounted, context available:', !!orderTrayContext);
    }, [orderTrayContext]);

    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
    }

    return (
        <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle>{item.item_name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 h-32 relative overflow-hidden rounded-md">
                    {item.image_id ? (
                        <Image
                            src={`https://ai.alexanderthenotsobad.us/api/images/${item.image_id}`}
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

                    {/* Use the AddToOrderButton component */}
                    <AddToOrderButton menuItem={item} />
                </div>

                {/* Debug info (invisible in production) */}
                <div className="mt-4 p-2 bg-gray-100 text-xs">
                    <p>Debug: Item ID {item.item_id}</p>
                    <p>Context available: {orderTrayContext ? 'Yes' : 'No'}</p>
                </div>
            </CardContent>
        </Card>
    )
}

export default PatronMenuItem