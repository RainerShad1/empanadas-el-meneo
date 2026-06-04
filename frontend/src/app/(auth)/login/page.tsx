'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import Logo from '@/components/Logo';

export default function Login() {
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api<{
        access_token: string;
        role: 'CLIENTE' | 'ADMIN';
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ cedula, password }),
      });
      localStorage.setItem('token', res.access_token);
      const me = await api<{ id: string }>('/users/me');
      setSession(res.access_token, res.role, me.id);
      router.push(res.role === 'ADMIN' ? '/admin' : '/menu');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-8 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <Logo size={72} />
        <h1 className="text-2xl font-extrabold mt-3">Super Empanada El Meneo</h1>
        <p className="text-muted text-sm">Inicia sesion para continuar</p>
      </div>
      <div className="space-y-3">
        <input
          className="input"
          placeholder="Cedula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-primary text-sm mt-3">{error}</p>}
      <button onClick={submit} disabled={loading} className="btn-primary mt-6">
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
      <p className="text-muted text-sm text-center mt-4">
        No tienes cuenta?{' '}
        <Link href="/register" className="text-primary">
          Registrate
        </Link>
      </p>
    </div>
  );
}
