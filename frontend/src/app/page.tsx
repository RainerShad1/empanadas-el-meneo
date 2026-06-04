'use client';
import { useRouter } from 'next/navigation';
import LocationGate from '@/components/LocationGate';

export default function Home() {
  const router = useRouter();

  const handleResolved = (data: {
    lat?: number;
    lng?: number;
    manual?: string;
  }) => {
    // Guardamos la ubicacion provisional; se convertira en Address tras login
    sessionStorage.setItem('pending_location', JSON.stringify(data));
    router.push('/register');
  };

  return (
    <main>
      <div className="bg-gradient-to-b from-primary/20 to-transparent px-5 pt-10 pb-4">
        <h1 className="text-3xl font-extrabold">Super Empanada El Meneo 🥟</h1>
        <p className="text-muted mt-1">Calientes, crujientes, a tu puerta.</p>
      </div>
      <LocationGate onResolved={handleResolved} />
    </main>
  );
}
