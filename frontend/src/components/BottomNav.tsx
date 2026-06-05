'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/store/cart';

export default function BottomNav() {
  const path = usePathname();
  const hydrated = useCart((s) => s.hydrated);
  const count = useCart((s) => s.count());
  const items = [
    { href: '/menu', label: 'Menu', Icon: Home },
    { href: '/orders', label: 'Pedidos', Icon: ShoppingBag },
    { href: '/perfil', label: 'Perfil', Icon: User },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface/80 backdrop-blur-xl border-t border-white/10 flex pb-[env(safe-area-inset-bottom)]">
      {items.map(({ href, label, Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${
              active ? 'text-primary' : 'text-muted'
            }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={active ? 2.6 : 2} />
              {href === '/menu' && hydrated && count > 0 && (
                <span
                  key={count}
                  className="absolute -top-1.5 -right-2.5 bg-primary text-black text-[10px] font-bold rounded-full px-1.5 animate-pulse-once"
                >
                  {count}
                </span>
              )}
            </div>
            <span className={active ? 'font-semibold' : ''}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
