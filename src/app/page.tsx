import MenuList from '@/components/MenuList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Virtual Restaurant Solutions
        </h1>
        <MenuList />
      </div>
    </main>
  );
}