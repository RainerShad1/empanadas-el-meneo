'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Product, Category } from '@/types';
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

// Convierte "23:00" -> "11:00 PM"
function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string>('all'); // 'all' o categoryId
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
      api<Category[]>('/categories'),
    ])
      .then(([p, c, cats]) => {
        setProducts(p);
        setConfig(c);
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filtrado por categoria
  const filtered =
    activeCat === 'all'
      ? products
      : products.filter((p) => p.categoryId === activeCat);

  const showCartButton = hydrated && count > 0 && config?.abiertoAhora;

  return (
    <main className={`px-4 pt-6 ${showCartButton ? 'pb-40' : ''}`}>
      <div className="flex items-center gap-3 mb-5">
        <Logo size={40} />
        <div className="min-w-0">
          <h1 className="text-base font-extrabold leading-tight truncate">
            Super Empanada El Meneo
          </h1>
          {config && (
            <p className="text-xs flex items-center gap-1">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  config.abiertoAhora ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="text-muted">
                {config.abiertoAhora
                  ? `Abierto hasta ${to12h(config.horaCierre)}`
                  : `Cerrado · abre ${to12h(config.horaApertura)}`}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Aviso de cerrado (FASE: horarios) */}
      {config && !config.abiertoAhora && (
        <div className="bg-red-500/15 text-red-300 rounded-xl p-3 mb-4 text-sm">
          Estamos cerrados en este momento. Horario: {config.horaApertura} a{' '}
          {config.horaCierre}. Puedes ver el menu pero no enviar pedidos.
        </div>
      )}

      {/* Pestanas de categorias */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setActiveCat('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCat === 'all'
                ? 'bg-primary text-white'
                : 'bg-card text-muted'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCat === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-center py-10">
          No hay productos en esta categoria.
        </p>
      ) : (
        <div key={activeCat} className="grid grid-cols-2 gap-3 stagger">
          {filtered.map((p) => (
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
