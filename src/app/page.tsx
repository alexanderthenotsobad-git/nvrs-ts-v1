//var/www/html/nvrs-ts-v1/src/
import MenuList from '@/ui/components/MenuList';
import NativeDialogTest from '@/ui/components/nativeDialogTest';
import Image from 'next/image';

export default function Home() {
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
          <h1 className="text-4xl font-bold text-center mt-4">
            Virtual Restaurant Solutions
          </h1>
        </div>
        {/* Test Dialog Component */}
        <NativeDialogTest />
        <MenuList />
      </div>
    </main>
  );
}