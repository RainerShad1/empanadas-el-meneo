'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const { token, role, hydrated } = useAuth();
  const [manual, setManual] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && token) {
      router.replace(role === 'ADMIN' ? '/admin' : '/menu');
    }
  }, [hydrated, token, role, router]);

  const resolve = (data: { lat?: number; lng?: number; manual?: string }) => {
    sessionStorage.setItem('pending_location', JSON.stringify(data));
    router.push('/register');
  };

  const askGps = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLoading(false);
        setShowManual(true);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  if (!hydrated || token) {
    return <div className="p-6 text-muted">Cargando...</div>;
  }

  return (
    <main
      className="fixed inset-0 flex flex-col items-center justify-center text-center px-7 animate-fade-in"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, #1a1a24 0%, #0B0B0F 60%)',
      }}
    >
      <div className="animate-fade-in-up flex flex-col items-center">
        <div className="shadow-primary rounded-2xl">
          <Logo size={132} />
        </div>
        <h1 className="text-[26px] font-extrabold mt-7 leading-[1.15] tracking-tight">
          Super Empanada
          <br />
          El Meneo
        </h1>
        <p className="text-muted text-[15px] mt-3 leading-relaxed max-w-[300px]">
          Gracias por preferirnos 🥟
          <br />
          Calientes, crujientes, a tu puerta.
        </p>
      </div>

      <div className="h-10" />

      <div className="w-full max-w-[360px] space-y-3">
        {!showManual ? (
          <>
            <button
              onClick={askGps}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <MapPin size={20} strokeWidth={2.4} />
              {loading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
            </button>
            <button
              onClick={() => setShowManual(true)}
              className="w-full bg-card text-white font-semibold rounded-xl py-4 px-6"
            >
              Ingresar dirección manualmente
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <input
              autoFocus
              className="input text-left"
              placeholder="Calle, número, sector, referencia"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
            />
            <button
              onClick={() => manual.trim() && resolve({ manual })}
              className="btn-primary"
            >
              Continuar
            </button>
          </div>
        )}
      </div>

      <p className="text-muted text-xs mt-6 opacity-70">
        La verdadera empanada · Santo Domingo, RD
      </p>
    </main>
  );
}
