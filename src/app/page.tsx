//var/www/html/nvrs-ts-v1/src/app/page.tsx
"use client"

import { useState, useEffect } from 'react';
import MenuList from '@/ui/components/MenuList';
import Image from 'next/image';
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/VRS_Logo.png"
            alt="Virtual Restaurant Solutions Logo"
            width={500}
            height={200}
            className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] h-auto"
            priority
          />
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