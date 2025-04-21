// /var/www/html/nvrs-ts-v1/src/app/ui/components/AddMenuItem.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/ui/button'
import NativeDialog from './AddItemDialog'

interface MenuItemFormData {
    item_name: string;
    item_desc: string;
    price: string;
    item_type: string;
}

const initialFormData: MenuItemFormData = {
    item_name: '',
    item_desc: '',
    price: '',
    item_type: ''
}

interface AddMenuItemProps {
    onItemAdded: () => void;
}

const AddMenuItem = ({ onItemAdded }: AddMenuItemProps) => {
    const [formData, setFormData] = useState<MenuItemFormData>(initialFormData)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            // Validate form data
            if (!formData.item_name.trim()) {
                throw new Error('Menu item name is required')
            }

            if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
                throw new Error('Please enter a valid price')
            }

            // Send data to API
            const response = await fetch('https://api.alexanderthenotsobad.us/createMenuItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price)
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to add menu item')
            }

            // Reset form and close dialog on success
            setFormData(initialFormData)
            setIsDialogOpen(false)
            onItemAdded()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <NativeDialog
            trigger={
                <Button className="mb-4">
                    Add New Menu Item
                </Button>
            }
            title="Add New Menu Item"
            description="Enter the details for the new menu item"
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name
                    </label>
                    <input
                        type="text"
                        id="item_name"
                        name="item_name"
                        value={formData.item_name}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="item_desc" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="item_desc"
                        name="item_desc"
                        value={formData.item_desc}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                    />
                </div>

                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                    </label>
                    <input
                        type="text"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="item_type" className="block text-sm font-medium text-gray-700 mb-1">
                        Item Type
                    </label>
                    <select
                        id="item_type"
                        name="item_type"
                        value={formData.item_type}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select a type</option>
                        <option value="appetizer">Appetizer</option>
                        <option value="entree">Entree</option>
                        <option value="dessert">Dessert</option>
                        <option value="beverage">Beverage</option>
                        <option value="alcohol">Alcohol</option>
                    </select>
                </div>

                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Item'}
                    </Button>
                </div>
            </form>
        </NativeDialog>
    )
}

export default AddMenuItem