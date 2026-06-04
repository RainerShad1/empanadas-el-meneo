'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/cart';

export default function BottomNav() {
  const path = usePathname();
  const hydrated = useCart((s) => s.hydrated);
  const count = useCart((s) => s.count());
  const items = [
    { href: '/menu', label: 'Menu', icon: '🍽️' },
    { href: '/orders', label: 'Pedidos', icon: '📦' },
    { href: '/perfil', label: 'Perfil', icon: '👤' },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface border-t border-white/10 flex z-40">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`flex-1 py-3 text-center text-sm ${
            path.startsWith(it.href) ? 'text-primary' : 'text-muted'
          }`}
        >
          <div className="text-xl relative inline-block">
            {it.icon}
            {/* Solo mostramos el badge tras la hidratacion para evitar mismatch */}
            {it.href === '/menu' && hydrated && count > 0 && (
              <span
                key={count}
                className="absolute -top-1 -right-3 bg-primary text-white text-[10px] rounded-full px-1.5 animate-pulse-once"
              >
                {count}
              </span>
            )}
          </div>
          <div className="mt-0.5">{it.label}</div>
        </Link>
      ))}
    </nav>
  );
}
