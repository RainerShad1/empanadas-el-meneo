'use client';
import { useEffect, useState } from 'react';
import { Search, Bell, Clock, ShoppingCart, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, Category } from '@/types';
import { getCategoryIcon } from '@/lib/categoryIcon';
import ProductCard from '@/components/ProductCard';
import CartSheet from '@/components/CartSheet';
import BottomNav from '@/components/BottomNav';
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
  const [activeCat, setActiveCat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [config, setConfig] = useState<ConfigResp | null>(null);
  const [nombre, setNombre] = useState<string>('');
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

    api<{ nombre: string }>('/users/me')
      .then((u) => setNombre(u.nombre?.split(' ')[0] || ''))
      .catch(() => {});
  }, []);

  // Filtrado por categoria + busqueda
  const filtered = products.filter((p) => {
    const matchCat = activeCat === 'all' || p.categoryId === activeCat;
    const matchSearch =
      !search ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const showCartButton = hydrated && count > 0 && config?.abiertoAhora;

  return (
    <main className={`pb-28 ${showCartButton ? 'pb-40' : ''}`}>
      {/* ===== Header ===== */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-muted text-[13px]">Hola,</p>
            <h1 className="text-[22px] font-extrabold leading-tight tracking-tight truncate">
              {nombre ? `${nombre} 👋` : 'Super Empanada El Meneo'}
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-white"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
            <button
              className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-white relative"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
              {/* Badge de notificaciones (pendiente de conectar a backend) */}
            </button>
          </div>
        </div>

        {/* Estado + ETA */}
        {config && (
          <div className="flex items-center gap-3.5 mt-3.5">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: config.abiertoAhora ? 'var(--dot-open, #4ade80)' : '#f87171',
                  boxShadow: config.abiertoAhora
                    ? '0 0 0 3px rgba(74,222,128,0.18)'
                    : '0 0 0 3px rgba(248,113,113,0.18)',
                }}
              />
              {config.abiertoAhora ? 'Abierto ahora' : 'Cerrado'}
            </span>
            {config.abiertoAhora && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                <Clock size={15} /> 25-40 min
              </span>
            )}
          </div>
        )}
      </div>

      {/* ===== Barra de busqueda (siempre visible) ===== */}
      <div className="px-4 pt-2 pb-1">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            className="input pl-11"
            placeholder="Buscar empanadas, batidas…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Aviso de cerrado */}
      {config && !config.abiertoAhora && (
        <div className="mx-4 bg-red-500/15 text-red-300 rounded-xl p-3 my-2 text-sm">
          Estamos cerrados. Horario: {to12h(config.horaApertura)} a{' '}
          {to12h(config.horaCierre)}. Puedes ver el menu pero no enviar pedidos.
        </div>
      )}

      {/* ===== Chips de categorias ===== */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
          <CatChip
            label="Todos"
            Icon={UtensilsCrossed}
            active={activeCat === 'all'}
            onClick={() => setActiveCat('all')}
          />
          {categories.map((cat) => (
            <CatChip
              key={cat.id}
              label={cat.nombre}
              Icon={getCategoryIcon(cat.nombre)}
              active={activeCat === cat.id}
              onClick={() => setActiveCat(cat.id)}
            />
          ))}
        </div>
      )}

      {/* ===== Titulo de seccion (categoria activa) ===== */}
      {!loading && filtered.length > 0 && (
        <h2 className="mx-4 mt-3.5 mb-2.5 text-[17px] font-extrabold">
          {activeCat === 'all'
            ? 'Todo el menú'
            : categories.find((c) => c.id === activeCat)?.nombre || 'Menú'}
        </h2>
      )}

      {/* ===== Grid de productos ===== */}
      <div className="px-4 mt-1">
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-24" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted text-center py-10">
            {search
              ? `Nada por aquí… prueba otra búsqueda.`
              : 'No hay productos en esta categoria.'}
          </p>
        ) : (
          <div
            key={activeCat + search}
            className="flex flex-col gap-2.5 stagger"
          >
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* ===== Carrito flotante (estilo mock) ===== */}
      {showCartButton && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed inset-x-4 h-14 bg-primary text-black rounded-full pl-5 pr-2 flex justify-between items-center z-30 animate-fade-in-up shadow-primary"
          style={{ bottom: 'calc(var(--bottom-nav-h, 64px) + 14px)' }}
        >
          <span className="flex items-center gap-2.5 font-bold text-[15px]">
            <span className="min-w-6 h-6 px-1.5 rounded-full bg-black/[0.18] flex items-center justify-center text-[13px]">
              {count}
            </span>
            Ver mi pedido
          </span>
          <span className="flex items-center gap-2 font-extrabold text-[15px] bg-black/[0.12] rounded-full px-4 py-3">
            RD${total.toFixed(2)}
            <ShoppingCart size={18} strokeWidth={2.4} />
          </span>
        </button>
      )}

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
      <BottomNav />
    </main>
  );
}

// Chip de categoria plano, redondeado (pildora), con icono al lado
function CatChip({
  label,
  Icon,
  active,
  onClick,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
        active
          ? 'bg-primary text-black'
          : 'bg-card text-muted'
      }`}
    >
      <Icon size={14} strokeWidth={2.4} />
      {label}
    </button>
  );
}
