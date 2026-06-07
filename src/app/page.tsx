// /var/www/html/nvrs-ts-v1-ai-v1/src/app/page.tsx
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
import FloatingAIChat from '@/components/FloatingAIChat';

const HomePage = () => {
  const { userRole } = useUserRole();
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);
  const [previousRole, setPreviousRole] = useState<UserRole>('none');
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (userRole !== 'none' && userRole !== previousRole) {
      setWelcomeDialogOpen(true);
    }
    setPreviousRole(userRole);
  }, [userRole, previousRole]);

  const handleItemAdded = () => {
    window.location.reload();
  };

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
                width={windowWidth < 768 ? 300 : 350}
                height={windowWidth < 768 ? 300 : 350}
                className="w-auto h-auto"
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

        {userRole !== 'none' && <UserInfo />}

        {userRole === 'admin' && (
          <div className="mb-6 flex justify-end">
            <AddMenuItem onItemAdded={handleItemAdded} />
          </div>
        )}

        <MenuList />
        <WelcomeDialog
          userRole={userRole}
          isOpen={welcomeDialogOpen}
          onClose={() => setWelcomeDialogOpen(false)}
        />
      </div>
      <OrderTrayPanel />
      <FloatingAIChat />
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