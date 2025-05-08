// /var/www/html/nvrs-ts-v1/src/app/page.tsx
"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import MenuList from '@/ui/components/MenuList';
import Navbar from '@/ui/components/Navbar';
import AddMenuItem from '@/ui/components/AddMenuItem';
import UserInfo from '@/ui/components/UserInfo';
import WelcomeDialog from '@/ui/components/WelcomeDialog';
import { UserRoleProvider, useUserRole, UserRole } from '@/context/UserContext';
import { OrderTrayProvider } from '@/context/OrderTrayContext';
import OrderTrayPanel from '@/ui/components/OrderTrayPanel';

const HomePage = () => {
  const { userRole } = useUserRole();
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);
  const [previousRole, setPreviousRole] = useState<UserRole>('none');
  const [windowWidth, setWindowWidth] = useState(0);

  // Initialize window width and set up listener for resize
  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);

    // Handle resize events
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show welcome dialog when user logs in
  useEffect(() => {
    if (userRole !== 'none' && userRole !== previousRole) {
      setWelcomeDialogOpen(true);
    }
    setPreviousRole(userRole);
  }, [userRole, previousRole]);

  const handleItemAdded = () => {
    // This will refresh the menu list when a new item is added
    window.location.reload();
  };

  // Determine which logo to show based on screen width
  const logoSrc = windowWidth < 768 ? '/VRS_logo_mobile.png' : '/VRS_logo_desktop.png';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-full flex justify-center">
            {windowWidth > 0 && (
              <Image
                src={logoSrc}
                alt="Virtual Restaurant Solutions Logo"
                width={windowWidth < 768 ? 300 : 500}
                height={windowWidth < 768 ? 120 : 200}
                className="w-auto"
                priority
              />
            )}
          </div>
          <Navbar />

          <h1 className="text-4xl font-bold text-center mt-4">
            Virtual Restaurant Solutions
          </h1>

          {userRole !== 'none' && (
            <div className="mt-2 text-lg text-center">
              Logged in as: <span className="font-semibold capitalize">{userRole}</span>
            </div>
          )}
        </div>

        {/* User info section - visible to logged in users */}
        {userRole !== 'none' && <UserInfo />}

        {/* Admin Controls - Only visible to admins */}
        {userRole === 'admin' && (
          <div className="mb-6 flex justify-end">
            <AddMenuItem onItemAdded={handleItemAdded} />
          </div>
        )}

        <MenuList />

        {/* Welcome dialog */}
        <WelcomeDialog
          userRole={userRole}
          isOpen={welcomeDialogOpen}
          onClose={() => setWelcomeDialogOpen(false)}
        />
      </div>
      <OrderTrayPanel />
    </main>
  );
};

export default function Home() {
  return (
    <UserRoleProvider>
      <OrderTrayProvider>
        <HomePage />
      </OrderTrayProvider>
    </UserRoleProvider>
  );
}