// /var/www/html/nvrs-ts-v1/src/app/ui/components/NativeDialog.tsx
"use client"

import { useRef, useEffect, ReactNode } from 'react'
import { Button } from '@/ui/button'

interface NativeDialogProps {
    trigger: ReactNode;
    title: string;
    description?: string;
    children: ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const NativeDialog = ({
    trigger,
    title,
    description,
    children,
    isOpen,
    onOpenChange
}: NativeDialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null)

    const handleOpen = () => {
        if (dialogRef.current) {
            dialogRef.current.showModal()
            onOpenChange?.(true)
        }
    }

    const handleClose = () => {
        if (dialogRef.current) {
            dialogRef.current.close()
            onOpenChange?.(false)
        }
    }

    // Handle controlled open state from props
    useEffect(() => {
        if (isOpen === true && dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal()
        } else if (isOpen === false && dialogRef.current && dialogRef.current.open) {
            dialogRef.current.close()
        }
    }, [isOpen])

    return (
        <>
            <div onClick={handleOpen}>
                {trigger}
            </div>

            <dialog
                ref={dialogRef}
                className="p-0 rounded-lg shadow-xl backdrop:bg-black backdrop:bg-opacity-50 open:animate-fade-in"
                onClose={() => onOpenChange?.(false)}
            >
                <div className="w-full max-w-md bg-white p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">{title}</h2>
                            {description && (
                                <p className="text-sm text-gray-500 mt-1">{description}</p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={handleClose}
                        >
                            ✕
                        </Button>
                    </div>

                    <div className="mt-4">
                        {children}
                    </div>
                </div>
            </dialog>
        </>
    )
}

export default NativeDialog