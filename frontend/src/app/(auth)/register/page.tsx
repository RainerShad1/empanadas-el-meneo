'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import Logo from '@/components/Logo';

export default function Register() {
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const [form, setForm] = useState({
    cedula: '',
    password: '',
    nombre: '',
    telefono: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const upd = (k: string, v: string) => setForm({ ...form, [k]: v });

  // Convierte la ubicacion capturada en la landing en una Address
  const savePendingAddress = async () => {
    const raw = sessionStorage.getItem('pending_location');
    if (!raw) return;
    const loc = JSON.parse(raw);
    await api('/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify({
        etiqueta: 'Principal',
        direccion: loc.manual || 'Ubicacion GPS',
        lat: loc.lat,
        lng: loc.lng,
      }),
    });
    sessionStorage.removeItem('pending_location');
  };

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api<{
        access_token: string;
        role: 'CLIENTE' | 'ADMIN';
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      localStorage.setItem('token', res.access_token);
      const me = await api<{ id: string }>('/users/me');
      setSession(res.access_token, res.role, me.id);
      await savePendingAddress();
      router.push('/menu');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-8 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-6">
        <Logo size={72} />
        <h1 className="text-2xl font-extrabold mt-3">Super Empanada El Meneo</h1>
      </div>
      <h2 className="text-lg font-bold mb-4">Crear cuenta</h2>
      <div className="space-y-3">
        <input
          className="input"
          placeholder="Nombre completo"
          onChange={(e) => upd('nombre', e.target.value)}
        />
        <input
          className="input"
          placeholder="Cedula (000-0000000-0)"
          onChange={(e) => upd('cedula', e.target.value)}
        />
        <input
          className="input"
          placeholder="Telefono (10 digitos)"
          onChange={(e) => upd('telefono', e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Contrasena (min. 8)"
          onChange={(e) => upd('password', e.target.value)}
        />
      </div>
      {error && <p className="text-primary text-sm mt-3">{error}</p>}
      <button onClick={submit} disabled={loading} className="btn-primary mt-6">
        {loading ? 'Creando...' : 'Registrarme'}
      </button>
      <p className="text-muted text-sm text-center mt-4">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
