'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LocationGate from '@/components/LocationGate';
import { useAuth } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const { token, role, hydrated } = useAuth();

  // Si ya tiene sesion activa, va directo a donde corresponde segun su rol
  // (no tiene sentido volver a pedirle la ubicacion).
  useEffect(() => {
    if (hydrated && token) {
      router.replace(role === 'ADMIN' ? '/admin' : '/menu');
    }
  }, [hydrated, token, role, router]);

  const handleResolved = (data: {
    lat?: number;
    lng?: number;
    manual?: string;
  }) => {
    // Guardamos la ubicacion provisional; se convertira en Address tras login
    sessionStorage.setItem('pending_location', JSON.stringify(data));
    router.push('/register');
  };

  // Mientras decide (rehidratando) o si ya hay sesion, no parpadea la landing
  if (!hydrated || token) {
    return <div className="p-6 text-muted">Cargando...</div>;
  }

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
