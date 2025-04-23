// src/app/ui/components/Navbar.tsx
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, User } from 'lucide-react'
import { Button } from '@/ui/button'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [userRole, setUserRole] = useState<'none' | 'patron' | 'admin'>('none')

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    const handleLogin = (role: 'patron' | 'admin') => {
        setUserRole(role)
        setIsDropdownOpen(false)
        if (isMenuOpen) {
            setIsMenuOpen(false)
        }
    }

    const handleLogout = () => {
        setUserRole('none')
    }

    return (
        <nav className="w-full py-4">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo or brand name could go here */}
                <div className="flex-1">
                    {/* Empty space for layout */}
                </div>

                {/* Desktop navigation - visible on larger screens */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/" className="text-gray-800 hover:text-gray-600">
                        Home
                    </Link>
                    <Link href="/menu" className="text-gray-800 hover:text-gray-600">
                        Menu
                    </Link>

                    {userRole === 'none' ? (
                        <div className="relative">
                            <Button
                                variant="ghost"
                                className="flex items-center space-x-1"
                                onClick={toggleDropdown}
                            >
                                <User size={18} />
                                <span>Login</span>
                                <ChevronDown size={16} />
                            </Button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <button
                                        onClick={() => handleLogin('patron')}
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                    >
                                        Login as patron
                                    </button>
                                    <button
                                        onClick={() => handleLogin('admin')}
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                    >
                                        Login as admin
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-800">
                                {userRole === 'admin' ? 'Admin' : 'Patron'}
                            </span>
                            <Button variant="ghost" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    )}
                </div>

                {/* Menu button - only visible on mobile */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden z-20"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>

                {/* Mobile menu - only shown when menu is toggled open */}
                {isMenuOpen && (
                    <div className="md:hidden fixed inset-0 bg-white z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center space-y-8 py-8">
                            <Link
                                href="/"
                                className="text-xl font-medium text-gray-800 hover:text-gray-600 px-4 py-3"
                                onClick={toggleMenu}
                            >
                                Home
                            </Link>
                            <Link
                                href="/menu"
                                className="text-xl font-medium text-gray-800 hover:text-gray-600 px-4 py-3"
                                onClick={toggleMenu}
                            >
                                Menu
                            </Link>

                            {userRole === 'none' ? (
                                <>
                                    <button
                                        onClick={() => handleLogin('patron')}
                                        className="text-xl font-medium text-gray-800 hover:text-gray-600 px-4 py-3"
                                    >
                                        Login as patron
                                    </button>
                                    <button
                                        onClick={() => handleLogin('admin')}
                                        className="text-xl font-medium text-gray-800 hover:text-gray-600 px-4 py-3"
                                    >
                                        Login as admin
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center space-y-4">
                                    <span className="text-xl font-medium text-gray-800">
                                        Logged in as {userRole}
                                    </span>
                                    <Button onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar