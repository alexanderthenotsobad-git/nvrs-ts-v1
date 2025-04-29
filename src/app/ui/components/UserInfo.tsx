// /var/www/html/nvrs-ts-v1/src/app/ui/components/UserInfo.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { useUserRole } from '@/context/UserContext'

const UserInfo = () => {
    const { userRole } = useUserRole()
    const [greeting, setGreeting] = useState<string>('')

    useEffect(() => {
        // Set a greeting based on user role
        if (userRole === 'admin') {
            setGreeting('Welcome, Administrator')
        } else if (userRole === 'patron') {
            setGreeting('Welcome, Valued Customer')
        }
    }, [userRole])

    return (
        <Card className="mb-6 mx-auto max-w-3xl">
            <CardHeader>
                <CardTitle>{greeting}</CardTitle>
            </CardHeader>
            <CardContent>
                {userRole === 'admin' && (
                    <p className="text-gray-600">
                        You have full access to all restaurant management features. You can add, edit,
                        or remove menu items and manage images.
                    </p>
                )}
                {userRole === 'patron' && (
                    <p className="text-gray-600">
                        Explore our menu and discover our delicious offerings.
                        Thank you for visiting our restaurant!
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default UserInfo