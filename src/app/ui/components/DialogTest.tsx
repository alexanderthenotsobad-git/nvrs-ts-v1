// src/app/ui/components/DialogTest.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/ui/dialog'

const DialogTest = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="p-8 border rounded-md">
            <h2 className="text-xl font-bold mb-4">Dialog Test Component</h2>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => console.log('Button clicked')}>
                        Open Test Dialog
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Test Dialog</DialogTitle>
                        <DialogDescription>
                            This is a test dialog to verify the component works.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>If you can see this, the dialog is working correctly.</p>
                        <Button
                            className="mt-4"
                            onClick={() => {
                                console.log('Close button clicked');
                                setIsOpen(false);
                            }}
                        >
                            Close Dialog
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DialogTest