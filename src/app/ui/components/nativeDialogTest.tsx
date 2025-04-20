"use client"

import { useRef } from 'react'
import { Button } from '@/ui/button'

export default function NativeDialogTest() {
    const dialogRef = useRef<HTMLDialogElement>(null)

    const openDialog = () => {
        if (dialogRef.current) {
            dialogRef.current.showModal()
        }
    }

    const closeDialog = () => {
        if (dialogRef.current) {
            dialogRef.current.close()
        }
    }

    return (
        <div className="p-4 border rounded mb-8">
            <h3 className="text-lg font-medium mb-4">Native HTML Dialog Test</h3>

            <Button onClick={openDialog}>
                Open Native Dialog
            </Button>

            <dialog
                ref={dialogRef}
                className="p-6 rounded-md backdrop:bg-black/50 backdrop:backdrop-blur-sm"
            >
                <h2 className="text-xl font-bold mb-4">Native HTML Dialog</h2>
                <p className="mb-4">This is a native HTML dialog element.</p>
                <Button onClick={closeDialog}>Close Dialog</Button>
            </dialog>
        </div>
    )
}
