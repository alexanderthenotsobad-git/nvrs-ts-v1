// /var/www/html/nvrs-ts-v1/src/app/ui/components/UpdateMenuItem.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/ui/button'
import AddItemDialog from './AddItemDialog'
import type { MenuItem } from '@/types/menu'

interface UpdateMenuItemProps {
    menuItem: MenuItem;
    onUpdateSuccess: (updatedItem: MenuItem) => void;
}

const UpdateMenuItem = ({ menuItem, onUpdateSuccess }: UpdateMenuItemProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [itemName, setItemName] = useState(menuItem.item_name)
    const [itemDesc, setItemDesc] = useState(menuItem.item_desc)
    const [price, setPrice] = useState(menuItem.price.toString())
    const [itemType, setItemType] = useState(menuItem.item_type)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Validate price
            const priceValue = parseFloat(price)
            if (isNaN(priceValue)) {
                throw new Error('Please enter a valid price')
            }

            const updateData = {
                item_name: itemName,
                item_desc: itemDesc,
                price: priceValue,
                item_type: itemType
            }

            const response = await fetch(`https://api.alexanderthenotsobad.us/menu/${menuItem.item_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            })

            if (!response.ok) {
                throw new Error('Failed to update menu item')
            }

            await response.json()

            // Pass the updated item to the parent component
            const updatedItem = {
                ...menuItem,
                item_name: itemName,
                item_desc: itemDesc,
                price: priceValue,
                item_type: itemType
            }

            onUpdateSuccess(updatedItem)
            setIsOpen(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AddItemDialog
            trigger={
                <Button
                    variant="outline"
                    size="sm"
                >
                    Edit Item
                </Button>
            }
            title="Update Menu Item"
            description="Make changes to the menu item details below."
            isOpen={isOpen}
            onOpenChange={setIsOpen}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="itemName" className="text-sm font-medium">
                            Item Name
                        </label>
                        <input
                            id="itemName"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="itemDesc" className="text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            id="itemDesc"
                            value={itemDesc}
                            onChange={(e) => setItemDesc(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="price" className="text-sm font-medium">
                                Price ($)
                            </label>
                            <input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="itemType" className="text-sm font-medium">
                                Item Type
                            </label>
                            <select
                                id="itemType"
                                value={itemType}
                                onChange={(e) => setItemType(e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="appetizer">Appetizer</option>
                                <option value="main">Main Course</option>
                                <option value="dessert">Dessert</option>
                                <option value="drink">Drink</option>
                                <option value="side">Side</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Item"}
                    </Button>
                </div>
            </form>
        </AddItemDialog>
    )
}

export default UpdateMenuItem