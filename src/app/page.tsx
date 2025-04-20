//var/www/html/nvrs-ts-v1/src/
"use client"

import MenuList from '@/ui/components/MenuList';
import Image from 'next/image';
import Navbar from '@/ui/components/Navbar';
import AddMenuItem from '@/ui/components/AddMenuItem';

export default function Home() {
  // We'll add state management for authentication later
  // For now, let's just pretend the user is an admin
  const isAdmin = true; // This will be dynamic based on authentication

  const handleItemAdded = () => {
    // This will refresh the menu list when a new item is added
    // For now, we'll just use window.location.reload()
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
        </div>
        {/* Admin Controls - Only visible to admins */}
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <AddMenuItem onItemAdded={handleItemAdded} />
          </div>
        )}
        <MenuList />
      </div>
    </main>
  );
}