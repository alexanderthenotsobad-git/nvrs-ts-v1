// /var/www/html/nvrs-ts-v1/src/app/ui/components/DeleteMenuItem.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/ui/button'
import AddItemDialog from './AddItemDialog'
import type { MenuItem } from '@/types/menu'

interface DeleteMenuItemProps {
    menuItem: MenuItem;
    onDeleteSuccess: (itemId: number) => void;
}

const DeleteMenuItem = ({ menuItem, onDeleteSuccess }: DeleteMenuItemProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Updated handleDelete function for DeleteMenuItem.tsx
    const handleDelete = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`https://api.alexanderthenotsobad.us/menu/${menuItem.item_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_name: menuItem.item_name
                })
            })

            if (!response.ok) {
                throw new Error('Failed to delete menu item')
            }

            onDeleteSuccess(menuItem.item_id)
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
                    variant="destructive"
                    size="sm"
                >
                    Delete
                </Button>
            }
            title="Delete Menu Item"
            description={`Are you sure you want to delete "${menuItem.item_name}"? This action cannot be undone.`}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
        >
            <div className="space-y-4">
                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete Item"}
                    </Button>
                </div>
            </div>
        </AddItemDialog>
    )
}

export default DeleteMenuItem