//var/www/html/nvrs-ts-v1/src/
import MenuList from '@/ui/components/MenuList';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <Image
          src="/VRS_Logo.png"
          alt="VRS Logo"
          width={500}
          height={200}
          priority
        />
        <h1 className="text-4xl font-bold text-center text-slate-950">
          Virtual Restaurant Solutions
        </h1>
        <MenuList />
      </div>
    </main>
  );
}