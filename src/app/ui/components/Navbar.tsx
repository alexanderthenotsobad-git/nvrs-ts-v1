// /var/www/html/nvrs-ts-v1/src/app/ui/components/Navbar.tsx
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/ui/button'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <nav className="w-full py-4">
            <div className="container mx-auto flex justify-between items-center">
                {/* Menu button - visible on mobile */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden z-20"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>

                {/* Desktop navigation - always visible on larger screens */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="text-gray-800 hover:text-gray-600">
                        Home
                    </Link>
                    <Link href="/menu" className="text-gray-800 hover:text-gray-600">
                        Menu
                    </Link>
                    <Link href="/login" className="text-gray-800 hover:text-gray-600">
                        Login
                    </Link>
                </div>

                {/* Mobile menu - shown/hidden based on state */}
                {isMenuOpen && (
                    <div className="md:hidden fixed inset-0 bg-white z-10 flex flex-col items-center justify-center space-y-8">
                        <Link
                            href="/"
                            className="text-2xl font-medium text-gray-800 hover:text-gray-600"
                            onClick={toggleMenu}
                        >
                            Home
                        </Link>
                        <Link
                            href="/menu"
                            className="text-2xl font-medium text-gray-800 hover:text-gray-600"
                            onClick={toggleMenu}
                        >
                            Menu
                        </Link>
                        <Link
                            href="/login"
                            className="text-2xl font-medium text-gray-800 hover:text-gray-600"
                            onClick={toggleMenu}
                        >
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar