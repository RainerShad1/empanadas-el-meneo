'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Croissant, Bike, Users, BarChart3,
  LogOut, Menu as MenuIcon, X,
} from 'lucide-react';
import { useAuth } from '@/store/auth';
import Logo from '@/components/Logo';

const NAV = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/products', label: 'Productos', Icon: Croissant },
  { href: '/admin/deliverys', label: 'Deliverys', Icon: Bike },
  { href: '/admin/clientes', label: 'Clientes', Icon: Users },
  { href: '/admin/reports', label: 'Reportes', Icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, role, hydrated, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!token || role !== 'ADMIN') router.replace('/login');
  }, [hydrated, token, role, router]);

  // Cerrar el drawer al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [path]);

  if (!hydrated) {
    return <div className="p-6 text-muted">Cargando...</div>;
  }
  if (!token || role !== 'ADMIN') return null;

  const tituloActual =
    NAV.find((n) => n.href === path)?.label ||
    (path.startsWith('/admin/orders') ? 'Pedido' : 'Admin');

  return (
    <div className="min-h-screen">
      {/* Header con hamburguesa */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-white/10 flex items-center gap-3 px-4 h-14">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-white hover:bg-card"
        >
          <MenuIcon size={22} />
        </button>
        <span className="font-extrabold text-base">{tituloActual}</span>
        <div className="ml-auto">
          <Logo size={32} />
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 animate-overlay-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer lateral deslizante */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[270px] bg-surface border-r border-white/10 flex flex-col p-4 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Logo size={40} />
            <div className="font-extrabold text-base leading-tight">
              Empanadas
              <br />
              el Meneo
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                  active
                    ? 'bg-primary text-black'
                    : 'text-muted hover:bg-card'
                }`}
              >
                <Icon size={19} strokeWidth={2.2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="mt-auto px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-card flex items-center gap-3"
        >
          <LogOut size={19} strokeWidth={2.2} />
          Cerrar sesión
        </button>
      </aside>

      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
