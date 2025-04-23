// src/app/ui/components/DeleteMenuItem.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/ui/radix-dialog'
import type { MenuItem } from '@/types/menu'

interface DeleteMenuItemProps {
    menuItem: MenuItem;
    onDeleteSuccess: (itemId: number) => void;
}

const DeleteMenuItem = ({ menuItem, onDeleteSuccess }: DeleteMenuItemProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`https://api.alexanderthenotsobad.us/menu/${menuItem.item_id}`, {
                method: 'DELETE',
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
        <>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsOpen(true)}
            >
                Delete
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Menu Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete `{menuItem.item_name}`? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                        <DialogFooter>
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
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default DeleteMenuItem