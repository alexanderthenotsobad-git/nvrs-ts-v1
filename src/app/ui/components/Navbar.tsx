// /var/www/html/nvrs-ts-v1-ai-v1/src/app/ui/components/Navbar.tsx

"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, User } from 'lucide-react'
import { Button } from '@/ui/button'
import { useUserRole } from '../context/UserContext'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const { userRole, setUserRole, currentPatron, login, logout, patrons } = useUserRole()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    // Handle patron selection from dropdown
    const handlePatronSelect = async (patronId: number) => {
        await login(patronId)
        setIsDropdownOpen(false)
        if (isMenuOpen) {
            setIsMenuOpen(false)
        }
    }

    // Handle admin login
    const handleAdminLogin = () => {
        setUserRole('admin')
        logout() // Clear patron when switching to admin
        setIsDropdownOpen(false)
        if (isMenuOpen) {
            setIsMenuOpen(false)
        }
    }

    // Handle logout
    const handleLogout = () => {
        logout()
        setUserRole('none')
        setIsDropdownOpen(false)
    }

    // Get display name for the dropdown trigger
    const getTriggerLabel = () => {
        if (userRole === 'none') return 'Login'
        if (userRole === 'admin') return 'Admin'
        if (currentPatron) return currentPatron.patron_name
        return 'Patron'
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

                    {/* User dropdown */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            className="flex items-center space-x-1"
                            onClick={toggleDropdown}
                        >
                            <User size={18} />
                            <span>{getTriggerLabel()}</span>
                            <ChevronDown size={16} />
                        </Button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border">
                                {/* Admin option */}
                                <button
                                    onClick={handleAdminLogin}
                                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 border-b"
                                >
                                    👑 Admin
                                </button>

                                {/* Patron options */}
                                <div className="px-2 py-1 text-xs text-gray-500 font-semibold">
                                    Patrons
                                </div>
                                {patrons.map((patron) => (
                                    <button
                                        key={patron.patron_id}
                                        onClick={() => handlePatronSelect(patron.patron_id)}
                                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex justify-between items-center"                                    >
                                        <span>{patron.patron_name}</span>
                                        {currentPatron?.patron_id === patron.patron_id && (
                                            <span className="text-green-500">✓</span>
                                        )}
                                    </button>
                                ))}

                                {/* Logout option (only if logged in) */}
                                {userRole !== 'none' && (
                                    <>
                                        <div className="border-t my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
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
                                    {/* Admin option */}
                                    <button
                                        onClick={() => {
                                            handleAdminLogin()
                                            toggleMenu()
                                        }}
                                        className="text-xl font-medium text-gray-800 hover:text-gray-600 px-4 py-3"
                                    >
                                        👑 Admin
                                    </button>

                                    {/* Patron options */}
                                    {patrons.map((patron) => (
                                        <button
                                            key={patron.patron_id}
                                            onClick={() => {
                                                handlePatronSelect(patron.patron_id)
                                                toggleMenu()
                                            }}
                                            className="text-xl font-medium text-gray-800 hover:text-gray-600 px-4 py-3"
                                        >
                                            {patron.patron_name}
                                            {currentPatron?.patron_id === patron.patron_id && ' ✓'}
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div className="flex flex-col items-center space-y-4">
                                    <span className="text-xl font-medium text-gray-800">
                                        Logged in as {getTriggerLabel()}
                                    </span>
                                    <Button onClick={() => {
                                        handleLogout()
                                        toggleMenu()
                                    }}>
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