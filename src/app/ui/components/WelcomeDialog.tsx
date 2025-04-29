// /var/www/html/vnrs-ts-v1/src/app/ui/components/WelcomeDialog.tsx

"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/ui/button'
import { UserRole } from '@/context/UserContext'

interface WelcomeDialogProps {
    userRole: UserRole;
    isOpen: boolean;
    onClose: () => void;
}

const WelcomeDialog = ({ userRole, isOpen, onClose }: WelcomeDialogProps) => {
    const [welcomeMessage, setWelcomeMessage] = useState('')
    const [roleInfo, setRoleInfo] = useState('')
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        if (userRole === 'admin') {
            setWelcomeMessage('Welcome, Administrator!')
            setRoleInfo('You now have access to admin features including adding, editing, and deleting menu items.')
        } else if (userRole === 'patron') {
            setWelcomeMessage('Welcome to Virtual Restaurant Solutions!')
            setRoleInfo('You can now browse the menu and place orders.')
        }
    }, [userRole])

    // Handle controlled open state from props
    useEffect(() => {
        if (isOpen && userRole !== 'none' && dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal()
        } else if (!isOpen && dialogRef.current && dialogRef.current.open) {
            dialogRef.current.close()
        }
    }, [isOpen, userRole])

    const handleClose = () => {
        if (dialogRef.current) {
            dialogRef.current.close()
            onClose()
        }
    }

    return (
        <dialog
            ref={dialogRef}
            className="p-0 rounded-lg shadow-xl backdrop:bg-black backdrop:bg-opacity-50 open:animate-fade-in"
            onClose={onClose}
        >
            <div className="w-full max-w-md bg-white p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">{welcomeMessage}</h2>
                    <p className="text-gray-500 mt-4">
                        {roleInfo}
                    </p>
                    <p className="mt-4">
                        Thank you for visiting our Virtual Restaurant Solutions demo app.
                    </p>
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={handleClose}>
                        Continue
                    </Button>
                </div>
            </div>
        </dialog>
    )
}

export default WelcomeDialog