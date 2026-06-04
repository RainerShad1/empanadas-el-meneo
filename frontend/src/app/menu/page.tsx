'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import CartSheet from '@/components/CartSheet';
import BottomNav from '@/components/BottomNav';
import Logo from '@/components/Logo';
import { useCart } from '@/store/cart';

interface ConfigResp {
  abiertoAhora: boolean;
  horaApertura: string;
  horaCierre: string;
}

export default function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [config, setConfig] = useState<ConfigResp | null>(null);
  const [loading, setLoading] = useState(true);
  const hydrated = useCart((s) => s.hydrated);
  const count = useCart((s) => s.count());
  const total = useCart((s) => s.total());

  useEffect(() => {
    Promise.all([
      api<Product[]>('/products'),
      api<ConfigResp>('/config'),
    ])
      .then(([p, c]) => {
        setProducts(p);
        setConfig(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showCartButton = hydrated && count > 0 && config?.abiertoAhora;

  return (
    <main className={`px-4 pt-6 ${showCartButton ? 'pb-40' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <Logo size={48} />
        <div>
          <h1 className="text-xl font-extrabold leading-tight">
            Super Empanada El Meneo
          </h1>
          <p className="text-muted text-xs">Menu 🥟</p>
        </div>
      </div>

      {/* Aviso de cerrado (FASE: horarios) */}
      {config && !config.abiertoAhora && (
        <div className="bg-red-500/15 text-red-300 rounded-xl p-3 mb-4 text-sm">
          Estamos cerrados en este momento. Horario: {config.horaApertura} a{' '}
          {config.horaCierre}. Puedes ver el menu pero no enviar pedidos.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-52" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 stagger">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {showCartButton && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-24 inset-x-4 btn-primary flex justify-between z-30 animate-fade-in-up shadow-xl shadow-primary/30"
        >
          <span>Ver carrito ({count})</span>
          <span>RD${total.toFixed(2)}</span>
        </button>
      )}

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
      <BottomNav />
    </main>
  );
}
