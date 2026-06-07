'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, User } from 'lucide-react';
import { useCart } from '@/store/cart';

export default function BottomNav() {
  const path = usePathname();
  const hydrated = useCart((s) => s.hydrated);
  const count = useCart((s) => s.count());
  const items = [
    { href: '/menu', label: 'Menú', Icon: Home },
    { href: '/orders', label: 'Pedidos', Icon: Receipt },
    { href: '/perfil', label: 'Perfil', Icon: User },
  ];
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex items-stretch border-t border-white/10 shadow-nav pb-[env(safe-area-inset-bottom)]"
      style={{
        height: 'var(--bottom-nav-h, 64px)',
        background: 'rgba(21,21,29,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {items.map(({ href, label, Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
              active ? 'text-primary font-bold' : 'text-muted font-medium'
            }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {href === '/menu' && hydrated && count > 0 && (
                <span
                  key={count}
                  className="absolute -top-1.5 -right-2.5 bg-primary text-black text-[10px] font-bold rounded-full px-1.5 animate-pulse-once"
                >
                  {count}
                </span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
