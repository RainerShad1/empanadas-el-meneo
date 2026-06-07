'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Trash2, Receipt, Bell, Star, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { Address } from '@/types';
import BottomNav from '@/components/BottomNav';

interface Profile {
  id: string;
  cedula: string;
  nombre: string;
  telefono: string;
  addresses: Address[];
}

export default function Perfil() {
  const router = useRouter();
  const { token, hydrated, logout } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ etiqueta: '', direccion: '' });
  const [gps, setGps] = useState<{ lat?: number; lng?: number }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    Promise.all([
      api<Profile>('/users/me'),
      api<Address[]>('/users/me/addresses'),
    ])
      .then(([p, a]) => {
        setProfile(p);
        setAddresses(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace('/login');
      return;
    }
    loadData();
  }, [hydrated, token, router]);

  const captureGps = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError('');
      },
      () => setError('No se pudo obtener tu ubicacion GPS'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const addAddress = async () => {
    setError('');
    if (!form.etiqueta.trim() || !form.direccion.trim()) {
      setError('Completa la etiqueta y la direccion');
      return;
    }
    setSaving(true);
    try {
      await api('/users/me/addresses', {
        method: 'POST',
        body: JSON.stringify({
          etiqueta: form.etiqueta,
          direccion: form.direccion,
          lat: gps.lat,
          lng: gps.lng,
        }),
      });
      setForm({ etiqueta: '', direccion: '' });
      setGps({});
      setShowForm(false);
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    await api(`/users/me/addresses/${id}`, { method: 'DELETE' });
    loadData();
  };

  if (!hydrated || loading) {
    return <div className="p-6 text-muted">Cargando...</div>;
  }

  const inicial = profile?.nombre?.trim()?.[0]?.toUpperCase() || 'U';

  return (
    <main className="pb-28">
      <h1 className="text-2xl font-extrabold tracking-tight px-4 pt-5 pb-1">
        Perfil
      </h1>

      {/* Tarjeta de identidad */}
      {profile && (
        <div className="mx-4 mt-3 bg-card rounded-2xl p-[18px] flex items-center gap-3.5 shadow-card">
          <div className="w-[58px] h-[58px] rounded-full bg-primary text-black flex items-center justify-center text-2xl font-extrabold shrink-0">
            {inicial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-extrabold truncate">{profile.nombre}</p>
            <p className="text-[13px] text-muted mt-0.5 truncate">
              {profile.telefono} · Cédula {profile.cedula}
            </p>
          </div>
        </div>
      )}

      {/* Direcciones */}
      <p className="text-xs font-bold tracking-wider uppercase text-muted px-4 mt-6 mb-2.5">
        Mis direcciones
      </p>
      <div className="flex flex-col gap-2.5 px-4">
        {addresses.map((a, idx) => (
          <div
            key={a.id}
            className="bg-card rounded-2xl p-[15px] flex items-center gap-3 shadow-card"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
              <MapPin size={19} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{a.etiqueta}</span>
                {idx === 0 && (
                  <span className="text-[10px] font-bold text-black bg-primary rounded-full px-2 py-0.5">
                    Principal
                  </span>
                )}
              </div>
              <p className="text-[13px] text-muted mt-0.5 truncate">
                {a.direccion}
              </p>
            </div>
            <button
              onClick={() => removeAddress(a.id)}
              className="text-red-300 p-1 shrink-0"
              aria-label="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {addresses.length === 0 && !showForm && (
          <p className="text-muted text-center py-3 text-sm">
            No tienes direcciones guardadas.
          </p>
        )}

        {/* Formulario nueva direccion */}
        {showForm && (
          <div className="bg-card rounded-2xl p-4 space-y-3">
            <input
              className="input"
              placeholder="Etiqueta (Casa, Trabajo...)"
              value={form.etiqueta}
              onChange={(e) => setForm({ ...form, etiqueta: e.target.value })}
            />
            <input
              className="input"
              placeholder="Calle, número, sector, referencia"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
            <button
              onClick={captureGps}
              className={`w-full rounded-xl py-3 text-sm ${
                gps.lat
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-surface-2 text-muted'
              }`}
            >
              {gps.lat
                ? '✓ Ubicación GPS capturada'
                : '📍 Usar mi ubicación GPS (opcional)'}
            </button>
            {error && <p className="text-accent-red text-sm">{error}</p>}
            <button onClick={addAddress} disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : 'Guardar dirección'}
            </button>
          </div>
        )}

        {/* Boton agregar (punteado, estilo mock) */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl py-3.5 text-sm font-bold text-primary flex items-center justify-center gap-2 border border-dashed border-white/20"
        >
          {showForm ? (
            'Cancelar'
          ) : (
            <>
              <Plus size={18} /> Agregar dirección
            </>
          )}
        </button>
      </div>

      {/* Seccion Cuenta */}
      <p className="text-xs font-bold tracking-wider uppercase text-muted px-4 mt-6 mb-2.5">
        Cuenta
      </p>
      <div className="mx-4 bg-card rounded-2xl overflow-hidden shadow-card">
        <button
          onClick={() => router.push('/orders')}
          className="w-full flex items-center gap-3.5 px-4 py-[15px]"
        >
          <Receipt size={20} className="text-muted" />
          <span className="flex-1 text-left text-[15px]">
            Historial de pedidos
          </span>
          <ChevronRight size={18} className="text-muted" />
        </button>
        {/* Notificaciones y Favoritos: pendientes de conectar a backend */}
        <div className="flex items-center gap-3.5 px-4 py-[15px] border-t border-white/10 opacity-50">
          <Bell size={20} className="text-muted" />
          <span className="flex-1 text-[15px]">Notificaciones</span>
          <span className="text-[10px] text-muted">Pronto</span>
        </div>
        <div className="flex items-center gap-3.5 px-4 py-[15px] border-t border-white/10 opacity-50">
          <Star size={20} className="text-muted" />
          <span className="flex-1 text-[15px]">Mis favoritos</span>
          <span className="text-[10px] text-muted">Pronto</span>
        </div>
      </div>

      {/* Cerrar sesion */}
      <div className="px-4 pt-5">
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="w-full border border-white/10 rounded-xl py-3.5 text-[15px] font-bold"
          style={{ color: 'var(--status-cancel-text, #fca5a5)' }}
        >
          Cerrar sesión
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
